import React, { useCallback, useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Lock,
  LogOut,
  Mic,
  MicOff,
  Radio,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Square,
  Trash2,
  Volume2,
} from 'lucide-react';
import { OfficialLogo } from './OfficialLogo';
import { auth, AUTHORIZED_ADMIN_EMAIL, googleProvider, isAuthorizedAdmin } from '../lib/firebase';

interface SpeechRecognitionAlternativeLike {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
}

interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  onend: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  onerror: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionErrorEventLike) => void) | null;
  onresult: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionEventLike) => void) | null;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return win.SpeechRecognition || win.webkitSpeechRecognition || null;
}

function formatMicError(err: unknown): string {
  if (err instanceof DOMException) {
    switch (err.name) {
      case 'NotAllowedError':
      case 'PermissionDeniedError':
        return 'Microphone permission denied. On Android 14 Chrome, tap the lock/tune icon in the address bar → Permissions → Microphone → Allow, and also verify Settings → Apps → Chrome → Permissions → Microphone is enabled.';
      case 'NotFoundError':
      case 'DevicesNotFoundError':
        return 'No microphone hardware was found on this device. If using a MAXHUB smart board, connect a USB/built-in microphone array and tap Refresh Devices.';
      case 'NotReadableError':
      case 'TrackStartError':
        return 'Microphone is currently busy or in use by another Android app (e.g. recorder, video call, or speech service). Close other apps and try again.';
      case 'OverconstrainedError':
        return 'Requested audio settings are not supported by the attached microphone.';
      case 'SecurityError':
        return 'Microphone access blocked because this page is not running in a secure HTTPS context.';
      default:
        return `Microphone error (${err.name}): ${err.message || 'Unable to access microphone.'}`;
    }
  }
  return err instanceof Error ? err.message : 'Unable to access microphone.';
}

function formatSpeechError(code: string): string {
  switch (code) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'Speech recognition permission denied. Allow Microphone access for Chrome in Android 14 settings and site permissions.';
    case 'no-speech':
      return 'No speech detected. Speak closer to the microphone and ensure the mic is not muted.';
    case 'audio-capture':
      return 'Speech service could not capture audio. On some Android devices, tap "Stop Microphone" first before tapping "Start Listening" so Chrome can open the mic exclusively for speech.';
    case 'network':
      return 'Speech recognition network error. Chrome SpeechRecognition requires an active internet connection and Google Voice services.';
    case 'aborted':
      return 'Speech listening stopped.';
    default:
      return `Speech recognition error: ${code}`;
  }
}

export const GccMicrophoneTest: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  // Environment / API support state
  const isSecureContext = typeof window !== 'undefined' ? window.isSecureContext : true;
  const mediaDevicesSupported =
    typeof navigator !== 'undefined' &&
    Boolean(navigator.mediaDevices) &&
    typeof navigator.mediaDevices.getUserMedia === 'function';
  const enumerateSupported =
    typeof navigator !== 'undefined' &&
    Boolean(navigator.mediaDevices) &&
    typeof navigator.mediaDevices.enumerateDevices === 'function';
  const webAudioSupported =
    typeof window !== 'undefined' &&
    Boolean(
      window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    );
  const speechSupported = Boolean(getSpeechRecognitionConstructor());

  // Microphone & level meter state
  const [micPermissionState, setMicPermissionState] = useState<string>('unknown');
  const [micGranted, setMicGranted] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [micRequesting, setMicRequesting] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioLevel, setAudioLevel] = useState(0); // 0 - 100
  const [peakLevel, setPeakLevel] = useState(0);

  // Speech recognition state
  const [isListening, setIsListening] = useState(false);
  const [speechLang, setSpeechLang] = useState<'en-IN' | 'hi-IN' | 'en-US'>('en-IN');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speechError, setSpeechError] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const authorized = isAuthorizedAdmin(user);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Query initial microphone permission state where Permissions API supports it
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.permissions?.query) return;
    let cancelled = false;
    navigator.permissions
      .query({ name: 'microphone' as PermissionName })
      .then((status) => {
        if (cancelled) return;
        setMicPermissionState(status.state);
        if (status.state === 'granted') {
          setMicGranted(true);
        }
        status.onchange = () => {
          if (!cancelled) {
            setMicPermissionState(status.state);
            if (status.state !== 'granted') {
              setMicGranted(false);
            }
          }
        };
      })
      .catch(() => {
        // Browsers that do not support querying 'microphone' permission safely ignore
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const refreshAudioDevices = useCallback(async () => {
    if (!enumerateSupported) return;
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const inputs = devices.filter((d) => d.kind === 'audioinput');
      setAudioDevices(inputs);
    } catch {
      // Non-fatal
    }
  }, [enumerateSupported]);

  useEffect(() => {
    if (!authorized || !enumerateSupported) return;
    refreshAudioDevices();
    const handler = () => {
      refreshAudioDevices();
    };
    navigator.mediaDevices.addEventListener?.('devicechange', handler);
    return () => {
      navigator.mediaDevices.removeEventListener?.('devicechange', handler);
    };
  }, [authorized, enumerateSupported, refreshAudioDevices]);

  const stopMeterLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setAudioLevel(0);
  }, []);

  const releaseAllMicTracks = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // Ignore track stop errors
        }
      });
      streamRef.current = null;
    }
    stopMeterLoop();
    setMicActive(false);
  }, [stopMeterLoop]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore stop errors
      }
    }
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  const handleStopEverything = useCallback(() => {
    releaseAllMicTracks();
    stopListening();
  }, [releaseAllMicTracks, stopListening]);

  // Cleanup on unmount so microphone tracks never linger
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignore
        }
        recognitionRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => {
          try {
            t.stop();
          } catch {
            // Ignore
          }
        });
        streamRef.current = null;
      }
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  const startLiveLevelMeter = async (stream: MediaStream) => {
    if (!webAudioSupported) return;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.75;
    source.connect(analyser);

    audioContextRef.current = ctx;
    analyserRef.current = analyser;

    const timeData = new Uint8Array(analyser.fftSize);
    const tick = () => {
      if (!analyserRef.current) return;
      analyserRef.current.getByteTimeDomainData(timeData);
      let sumSquares = 0;
      for (let i = 0; i < timeData.length; i++) {
        const normalized = (timeData[i] - 128) / 128;
        sumSquares += normalized * normalized;
      }
      const rms = Math.sqrt(sumSquares / timeData.length);
      // Scale RMS cleanly for speech (typical speaking RMS 0.02 - 0.35)
      const level = Math.min(100, Math.round(rms * 320));
      setAudioLevel(level);
      setPeakLevel((prev) => (level > prev ? level : prev));
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  };

  const handleTestMicrophone = async () => {
    setMicError(null);

    if (!isSecureContext) {
      setMicError(
        'HTTPS is required for microphone access. Open this page via HTTPS before testing.'
      );
      return;
    }

    if (!mediaDevicesSupported) {
      setMicError(
        'navigator.mediaDevices.getUserMedia is not supported in this browser. Please use Google Chrome on Android 14.'
      );
      return;
    }

    // Release any previous active tracks before opening a fresh stream
    releaseAllMicTracks();
    setPeakLevel(0);
    setMicRequesting(true);

    try {
      // Request ONLY microphone audio — never camera or unrelated permissions
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setMicGranted(true);
      setMicPermissionState('granted');
      setMicActive(true);

      await refreshAudioDevices();
      await startLiveLevelMeter(stream);
    } catch (err) {
      setMicGranted(false);
      setMicActive(false);
      setMicError(formatMicError(err));
    } finally {
      setMicRequesting(false);
    }
  };

  const handleStartListening = () => {
    setSpeechError(null);

    if (!isSecureContext) {
      setSpeechError('HTTPS is required for SpeechRecognition.');
      return;
    }

    const RecognitionCtor = getSpeechRecognitionConstructor();
    if (!RecognitionCtor) {
      setSpeechError(
        'SpeechRecognition API is not supported in this browser. Use Google Chrome on Android 14.'
      );
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // Ignore
      }
    }

    try {
      const recognition = new RecognitionCtor();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = speechLang;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event) => {
        let newFinal = '';
        let newInterim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const text = result[0]?.transcript || '';
          if (result.isFinal) {
            newFinal += (newFinal ? ' ' : '') + text.trim();
          } else {
            newInterim += text;
          }
        }
        if (newFinal) {
          setFinalTranscript((prev) => (prev ? `${prev} ${newFinal}` : newFinal));
        }
        setInterimTranscript(newInterim);
      };

      recognition.onerror = (event) => {
        if (event.error !== 'no-speech' || !isListening) {
          setSpeechError(formatSpeechError(event.error));
        }
        if (
          event.error === 'not-allowed' ||
          event.error === 'service-not-allowed' ||
          event.error === 'audio-capture' ||
          event.error === 'network'
        ) {
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setIsListening(false);
      setSpeechError(
        err instanceof Error ? err.message : 'Failed to start speech recognition.'
      );
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setSigningIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google Sign-In failed.';
      setAuthError(msg);
    } finally {
      setSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    handleStopEverything();
    await signOut(auth);
    setAuthError(null);
  };

  // Loading state while Firebase Auth initializes
  if (!authReady) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400 mb-3" />
        <p className="text-sm font-semibold text-slate-300">Verifying teacher session...</p>
      </div>
    );
  }

  // Not Signed In -> Strict Teacher Google Sign-In Gate
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 text-white p-6 text-center border-b border-slate-800">
            <div className="flex justify-center mb-3">
              <OfficialLogo size={64} />
            </div>
            <h1 className="text-xl font-extrabold font-display tracking-tight uppercase">
              GCC Microphone Test
            </h1>
            <p className="text-xs text-amber-400 font-semibold mt-1">
              Temporary Teacher-Only Diagnostic Tool
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-5 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold">
              <Lock className="w-3.5 h-3.5 text-slate-900" />
              <span>Authenticated Teachers Only</span>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Sign in with the authorized Genius Coaching Centre teacher Google account to test microphone permissions and voice input on your MAXHUB board.
            </p>

            {authError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold text-left">
                {authError}
              </div>
            )}

            <button
              type="button"
              disabled={signingIn}
              onClick={handleGoogleSignIn}
              className="w-full min-h-[52px] flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-bold text-base shadow-md transition-all cursor-pointer touch-manipulation disabled:opacity-60"
            >
              {signingIn ? (
                <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-amber-400" />
              )}
              <span>Sign in with Google</span>
            </button>

            <div className="pt-2">
              <a
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Public Website</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Signed in with an unauthorized Google account -> Strict Access Denied
  if (!authorized) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-red-200 overflow-hidden">
          <div className="bg-red-700 text-white p-6 text-center">
            <ShieldAlert className="w-12 h-12 mx-auto mb-2 text-amber-300" />
            <h1 className="text-lg font-extrabold font-display uppercase tracking-tight">
              Access Denied
            </h1>
          </div>

          <div className="p-6 sm:p-8 text-center space-y-5">
            <p className="text-sm font-bold text-slate-900">
              Access Denied. This diagnostic tool is restricted to authorized Genius Coaching Centre teachers.
            </p>
            <p className="text-xs text-slate-500">
              Signed in as: <span className="font-semibold text-slate-700">{user.email}</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleSignOut}
                className="flex-1 min-h-[48px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer touch-manipulation"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
              <a
                href="/"
                className="flex-1 min-h-[48px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Go to Homepage</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Authorized Teacher Microphone Test View
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col touch-manipulation">
      {/* Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <OfficialLogo size={40} />
            <div className="min-w-0">
              <h1 className="font-extrabold text-sm sm:text-lg uppercase tracking-tight font-display truncate">
                GCC Microphone Test
              </h1>
              <p className="text-[11px] text-amber-400 font-semibold truncate">
                Teacher Diagnostic ({AUTHORIZED_ADMIN_EMAIL})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href="/admin/study-material"
              className="min-h-[42px] inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Admin Portal</span>
            </a>
            <button
              type="button"
              onClick={handleSignOut}
              className="min-h-[42px] inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-200 border border-red-500/30 text-xs font-bold transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Privacy & Browser Compatibility Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Device &amp; Browser Readiness (MAXHUB Android 14 Chrome)
            </span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
              No Audio Recorded, Stored, or Uploaded
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-slate-500 font-semibold">HTTPS Context</p>
              <p className={`font-extrabold mt-0.5 ${isSecureContext ? 'text-emerald-700' : 'text-red-700'}`}>
                {isSecureContext ? 'Supported (HTTPS)' : 'Blocked (Not HTTPS)'}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-slate-500 font-semibold">getUserMedia Audio</p>
              <p className={`font-extrabold mt-0.5 ${mediaDevicesSupported ? 'text-emerald-700' : 'text-red-700'}`}>
                {mediaDevicesSupported ? 'Supported' : 'Unsupported'}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-slate-500 font-semibold">Web Audio Meter</p>
              <p className={`font-extrabold mt-0.5 ${webAudioSupported ? 'text-emerald-700' : 'text-red-700'}`}>
                {webAudioSupported ? 'Supported' : 'Unsupported'}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-slate-500 font-semibold">SpeechRecognition</p>
              <p className={`font-extrabold mt-0.5 ${speechSupported ? 'text-emerald-700' : 'text-amber-700'}`}>
                {speechSupported ? 'Supported' : 'Unsupported'}
              </p>
            </div>
          </div>
        </div>

        {/* Section 1: Microphone Permission & Live Level Meter */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Mic className="w-5 h-5 text-amber-400" />
              <h2 className="font-extrabold text-base font-display">
                1. Microphone Permission &amp; Live Input Level
              </h2>
            </div>
            <span
              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold uppercase ${
                micActive
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {micActive ? 'Mic Active' : 'Mic Idle'}
            </span>
          </div>

          <div className="p-5 sm:p-6 space-y-5">
            {/* Large Touch-Friendly Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                disabled={micRequesting}
                onClick={handleTestMicrophone}
                className="flex-1 min-h-[60px] inline-flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 active:scale-[0.99] text-slate-950 font-black text-base sm:text-lg shadow-md transition-all cursor-pointer select-none touch-manipulation disabled:opacity-60"
              >
                {micRequesting ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Mic className="w-6 h-6" />
                )}
                <span>{micActive ? 'Restart Test Microphone' : 'Test Microphone'}</span>
              </button>

              <button
                type="button"
                disabled={!micActive && !isListening}
                onClick={handleStopEverything}
                className="sm:w-56 min-h-[60px] inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white font-extrabold text-base shadow-md transition-all cursor-pointer select-none touch-manipulation disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed"
              >
                <Square className="w-5 h-5 fill-current" />
                <span>Stop</span>
              </button>
            </div>

            {/* Permission Status Message */}
            {micGranted && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3 font-bold text-sm sm:text-base">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <span>Microphone permission granted</span>
              </div>
            )}

            {micError && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-3 font-semibold text-sm">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-extrabold">Microphone Access Issue</p>
                  <p className="mt-1 text-xs sm:text-sm leading-relaxed">{micError}</p>
                </div>
              </div>
            )}

            {/* Live Microphone Level Meter */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-extrabold text-slate-800">
                  <Volume2 className="w-4 h-4 text-slate-700" />
                  <span>Live Microphone Level</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold">
                  <span className="text-slate-500">
                    Peak: <strong className="text-slate-900">{peakLevel}%</strong>
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md ${
                      audioLevel > 5
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {micActive
                      ? audioLevel > 5
                        ? `Signal Detected (${audioLevel}%)`
                        : 'Listening (Speak into mic)...'
                      : `Permission: ${micPermissionState}`}
                  </span>
                </div>
              </div>

              <div className="w-full h-6 bg-slate-200 rounded-full overflow-hidden p-1">
                <div
                  className={`h-full rounded-full transition-all duration-75 ${
                    audioLevel > 70
                      ? 'bg-amber-500'
                      : audioLevel > 10
                      ? 'bg-emerald-500'
                      : 'bg-slate-400'
                  }`}
                  style={{ width: `${Math.max(audioLevel, micActive ? 2 : 0)}%` }}
                />
              </div>
            </div>

            {/* Enumerated Audio Input Devices */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                  Available Audio Input Devices ({audioDevices.length})
                </h3>
                <button
                  type="button"
                  onClick={refreshAudioDevices}
                  className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer touch-manipulation"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Devices</span>
                </button>
              </div>

              {!enumerateSupported ? (
                <p className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
                  navigator.mediaDevices.enumerateDevices() is not supported in this browser.
                </p>
              ) : audioDevices.length === 0 ? (
                <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-3">
                  No audio input devices listed yet. Tap &ldquo;Test Microphone&rdquo; first to reveal device labels.
                </p>
              ) : (
                <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
                  {audioDevices.map((device, index) => (
                    <li
                      key={device.deviceId || `audio-in-${index}`}
                      className="px-4 py-3 flex items-center justify-between gap-3 text-xs sm:text-sm"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Mic className="w-4 h-4 text-slate-700 shrink-0" />
                        <span className="font-bold text-slate-900 truncate">
                          {device.label || `Microphone ${index + 1} (Grant permission to view name)`}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500 shrink-0">
                        {device.deviceId
                          ? device.deviceId === 'default'
                            ? 'default'
                            : `${device.deviceId.slice(0, 10)}…`
                          : 'id-hidden'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        {/* Section 2: Browser SpeechRecognition Voice Input Test */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-900 text-white px-5 py-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Radio className="w-5 h-5 text-amber-400" />
              <h2 className="font-extrabold text-base font-display">
                2. Voice-to-Text SpeechRecognition Test
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="speech-lang" className="text-xs text-slate-300 font-semibold">
                Language:
              </label>
              <select
                id="speech-lang"
                value={speechLang}
                disabled={isListening}
                onChange={(e) =>
                  setSpeechLang(e.target.value as 'en-IN' | 'hi-IN' | 'en-US')
                }
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="en-IN">English (India)</option>
                <option value="hi-IN">Hindi (India)</option>
                <option value="en-US">English (US)</option>
              </select>
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-4">
            {!speechSupported && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm font-semibold flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  The Web SpeechRecognition API is not supported in this browser. The live microphone permission and level meter above still work independently.
                </span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                disabled={!speechSupported || isListening}
                onClick={handleStartListening}
                className="flex-1 min-h-[56px] inline-flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-extrabold text-base shadow-sm transition-all cursor-pointer select-none touch-manipulation disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
              >
                {isListening ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
                    <span>Listening... Speak Now</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5 text-amber-400" />
                    <span>Start Listening</span>
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={!isListening}
                onClick={stopListening}
                className="sm:w-52 min-h-[56px] inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white font-extrabold text-base shadow-sm transition-all cursor-pointer select-none touch-manipulation disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
              >
                <MicOff className="w-5 h-5" />
                <span>Stop Listening</span>
              </button>
            </div>

            {speechError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs sm:text-sm font-semibold flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <span>{speechError}</span>
              </div>
            )}

            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 sm:p-5 min-h-[140px] flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  Recognized Speech Output
                </span>
                {(finalTranscript || interimTranscript) && (
                  <button
                    type="button"
                    onClick={() => {
                      setFinalTranscript('');
                      setInterimTranscript('');
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              <div className="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed min-h-[64px]">
                {finalTranscript || interimTranscript ? (
                  <>
                    <span>{finalTranscript}</span>
                    {interimTranscript && (
                      <span className="text-slate-400 italic">
                        {finalTranscript ? ' ' : ''}
                        {interimTranscript}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-sm text-slate-400 font-normal">
                    Tap &ldquo;Start Listening&rdquo; and speak clearly into the MAXHUB microphone. Recognized words will appear here live.
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default GccMicrophoneTest;
