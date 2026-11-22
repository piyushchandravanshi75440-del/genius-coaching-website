import React, { useCallback, useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Calculator,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eraser,
  HelpCircle,
  Loader2,
  Lock,
  LogOut,
  Mic,
  MicOff,
  Play,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Square,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { OfficialLogo } from './OfficialLogo';
import SmartBoardDiagram, { DiagramPayload } from './SmartBoardDiagram';
import { auth, AUTHORIZED_ADMIN_EMAIL, isAuthorizedAdmin } from '../lib/firebase';
import { buildApiUrl, getFetchCredentialsMode } from '../lib/apiConfig';
import { signInTeacherWithGoogle } from '../lib/firebaseAuthBridge';

type AssistantPhase = 'idle' | 'listening' | 'thinking' | 'speaking';
type SpeechLanguage = 'hi-IN' | 'en-IN';

interface LessonSlide {
  heading: string;
  keyPoints: string[];
  example?: string;
  voiceSummary?: string;
}

interface LessonBoardData {
  classLevel: string;
  board?: string;
  subject: string;
  chapter: string;
  title: string;
  slides: LessonSlide[];
}

interface FormulaBoardData {
  title: string;
  subject: string;
  formula: string;
  variables: Array<{ symbol: string; meaning: string }>;
  solvedExample: {
    question: string;
    steps: string[];
    answer: string;
  };
}

interface McqQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface McqBoardData {
  title: string;
  classLevel?: string;
  subject: string;
  chapter?: string;
  questions: McqQuestion[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  executedActions?: string[];
  timestamp: string;
}

interface BoardActionItem {
  name: string;
  args: Record<string, unknown>;
}

interface SpeechRecognitionAlternativeLike {
  transcript: string;
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

function getSpeechRecognitionCtor(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return win.SpeechRecognition || win.webkitSpeechRecognition || null;
}

const ALLOWED_CLIENT_ACTIONS = new Set([
  'show_lesson',
  'show_formula',
  'show_diagram',
  'create_mcq',
  'next_slide',
  'previous_slide',
  'clear_board_content',
]);

const QUICK_PROMPTS = [
  'Aaj Class 10 Science padhaao',
  'Class 10 Trigonometry formula aur example dikhao',
  "Ohm's Law ka diagram aur 3 MCQ banao",
  'Bhojpuri me Light Reflection samjhao',
];

function extractWakeCommand(transcript: string): { matched: boolean; command: string } {
  const lower = transcript.toLowerCase();
  const wakePatterns = [
    /hello\s+gcc[\s,:-]*/i,
    /hey\s+gcc[\s,:-]*/i,
    /hello\s+jcc[\s,:-]*/i,
    /हेलो\s+जीसीसी[\s,।:-]*/i,
    /नमस्ते\s+जीसीसी[\s,।:-]*/i,
  ];
  for (const regex of wakePatterns) {
    const match = regex.exec(transcript);
    if (match) {
      const after = transcript.slice(match.index + match[0].length).trim();
      return { matched: true, command: after };
    }
  }
  if (lower.includes('hello gcc') || lower.includes('हेलो जीसीसी')) {
    return { matched: true, command: '' };
  }
  return { matched: false, command: '' };
}

export const GccAiTeacherAssistant: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  // Assistant state
  const [assistantActive, setAssistantActive] = useState(false);
  const [phase, setPhase] = useState<AssistantPhase>('idle');
  const [language, setLanguage] = useState<SpeechLanguage>('hi-IN');
  const [muted, setMuted] = useState(false);
  const [wakePhraseEnabled, setWakePhraseEnabled] = useState(false);
  const [wakeAwaitingCommand, setWakeAwaitingCommand] = useState(false);

  const [interimTranscript, setInterimTranscript] = useState('');
  const [textInput, setTextInput] = useState('');
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Smart Board State (Controlled ONLY by allowlisted Board Action Engine)
  const [activeView, setActiveView] = useState<'empty' | 'lesson' | 'formula' | 'diagram' | 'mcq'>(
    'empty'
  );
  const [lessonData, setLessonData] = useState<LessonBoardData | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [formulaData, setFormulaData] = useState<FormulaBoardData | null>(null);
  const [diagramData, setDiagramData] = useState<DiagramPayload | null>(null);
  const [mcqData, setMcqData] = useState<McqBoardData | null>(null);
  const [selectedMcqAnswers, setSelectedMcqAnswers] = useState<Record<number, number>>({});
  const [pendingClearConfirm, setPendingClearConfirm] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const assistantActiveRef = useRef(false);
  const phaseRef = useRef<AssistantPhase>('idle');
  const mutedRef = useRef(false);
  const languageRef = useRef<SpeechLanguage>('hi-IN');
  const wakeEnabledRef = useRef(false);
  const wakeAwaitingRef = useRef(false);
  const submittingRef = useRef(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Keep refs synchronized for async SpeechRecognition & TTS callbacks
  assistantActiveRef.current = assistantActive;
  phaseRef.current = phase;
  mutedRef.current = muted;
  languageRef.current = language;
  wakeEnabledRef.current = wakePhraseEnabled;
  wakeAwaitingRef.current = wakeAwaitingCommand;

  const speechRecSupported = Boolean(getSpeechRecognitionCtor());
  const speechSynthSupported =
    typeof window !== 'undefined' && 'speechSynthesis' in window;
  const authorized = isAuthorizedAdmin(user);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, phase]);

  const stopSpeechOutput = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore TTS cancel errors
      }
    }
  }, []);

  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
      } catch {
        // Ignore
      }
      recognitionRef.current = null;
    }
    setInterimTranscript('');
  }, []);

  const handleStopAssistant = useCallback(() => {
    setAssistantActive(false);
    setWakeAwaitingCommand(false);
    assistantActiveRef.current = false;
    stopRecognition();
    stopSpeechOutput();
    setPhase('idle');
  }, [stopRecognition, stopSpeechOutput]);

  useEffect(() => {
    return () => {
      stopRecognition();
      stopSpeechOutput();
    };
  }, [stopRecognition, stopSpeechOutput]);

  const speakResponse = useCallback(
    (text: string, onDone?: () => void) => {
      if (mutedRef.current || !speechSynthSupported || !text.trim()) {
        onDone?.();
        return;
      }

      try {
        window.speechSynthesis.cancel();
        const cleaned = text.replace(/[*_`#]/g, '').trim();
        const utterance = new SpeechSynthesisUtterance(cleaned);
        utterance.lang = languageRef.current;
        utterance.rate = 0.98;
        utterance.pitch = 1.0;

        const voices = window.speechSynthesis.getVoices();
        const exactVoice = voices.find((v) =>
          v.lang.toLowerCase().startsWith(languageRef.current.toLowerCase())
        );
        const langPrefixVoice = voices.find((v) =>
          v.lang.toLowerCase().startsWith(languageRef.current.split('-')[0])
        );
        if (exactVoice || langPrefixVoice) {
          utterance.voice = exactVoice || langPrefixVoice || null;
        }

        let finished = false;
        const finishOnce = () => {
          if (finished) return;
          finished = true;
          onDone?.();
        };

        utterance.onstart = () => setPhase('speaking');
        utterance.onend = finishOnce;
        utterance.onerror = finishOnce;

        // Safety fallback if Android Chrome WebView stalls TTS onend
        const estDurationMs = Math.min(30000, Math.max(4000, cleaned.length * 85));
        window.setTimeout(finishOnce, estDurationMs);

        setPhase('speaking');
        window.speechSynthesis.speak(utterance);
      } catch {
        onDone?.();
      }
    },
    [speechSynthSupported]
  );

  // Execute verified board actions strictly inside the GCC website allowlist
  const executeBoardActions = useCallback(
    (actions: BoardActionItem[]): string[] => {
      const executed: string[] = [];

      for (const action of actions) {
        if (!ALLOWED_CLIENT_ACTIONS.has(action.name)) continue;

        if (action.name === 'show_lesson') {
          const args = action.args as unknown as LessonBoardData;
          if (args && Array.isArray(args.slides) && args.slides.length > 0) {
            setLessonData({
              classLevel: String(args.classLevel || 'Class 10'),
              board: String(args.board || 'BSEB & CBSE'),
              subject: String(args.subject || 'Science'),
              chapter: String(args.chapter || ''),
              title: String(args.title || args.chapter || 'Lesson'),
              slides: args.slides.map((s) => ({
                heading: String(s.heading || 'Topic'),
                keyPoints: Array.isArray(s.keyPoints) ? s.keyPoints.map(String) : [],
                example: s.example ? String(s.example) : undefined,
                voiceSummary: s.voiceSummary ? String(s.voiceSummary) : undefined,
              })),
            });
            setSlideIndex(0);
            setActiveView('lesson');
            setPendingClearConfirm(null);
            executed.push('show_lesson');
          }
        } else if (action.name === 'show_formula') {
          const args = action.args as unknown as FormulaBoardData;
          if (args && args.formula) {
            setFormulaData({
              title: String(args.title || 'Formula'),
              subject: String(args.subject || 'Mathematics'),
              formula: String(args.formula),
              variables: Array.isArray(args.variables) ? args.variables : [],
              solvedExample: args.solvedExample || { question: '', steps: [], answer: '' },
            });
            setActiveView('formula');
            setPendingClearConfirm(null);
            executed.push('show_formula');
          }
        } else if (action.name === 'show_diagram') {
          const args = action.args as unknown as DiagramPayload;
          if (args && args.title) {
            setDiagramData({
              title: String(args.title),
              caption: String(args.caption || ''),
              preset: String(args.preset || 'concept_flowchart'),
              labels: Array.isArray(args.labels) ? args.labels.map(String) : [],
              steps: Array.isArray(args.steps) ? args.steps.map(String) : [],
            });
            setActiveView('diagram');
            setPendingClearConfirm(null);
            executed.push('show_diagram');
          }
        } else if (action.name === 'create_mcq') {
          const args = action.args as unknown as McqBoardData;
          if (args && Array.isArray(args.questions) && args.questions.length > 0) {
            setMcqData({
              title: String(args.title || 'Practice MCQs'),
              classLevel: String(args.classLevel || 'Class 10'),
              subject: String(args.subject || 'Science'),
              chapter: args.chapter ? String(args.chapter) : undefined,
              questions: args.questions.map((q) => ({
                question: String(q.question || ''),
                options: Array.isArray(q.options) ? q.options.map(String).slice(0, 4) : [],
                correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
                explanation: String(q.explanation || ''),
              })),
            });
            setSelectedMcqAnswers({});
            setActiveView('mcq');
            setPendingClearConfirm(null);
            executed.push('create_mcq');
          }
        } else if (action.name === 'next_slide') {
          if (lessonData && slideIndex + 1 < lessonData.slides.length) {
            setSlideIndex((prev) => prev + 1);
            setActiveView('lesson');
            executed.push('next_slide');
          }
        } else if (action.name === 'previous_slide') {
          if (lessonData && slideIndex > 0) {
            setSlideIndex((prev) => prev - 1);
            setActiveView('lesson');
            executed.push('previous_slide');
          }
        } else if (action.name === 'clear_board_content') {
          const reason = String(action.args?.reason || 'Clear the GCC Smart Board display?');
          setPendingClearConfirm(reason);
          executed.push('clear_board_content (awaiting confirmation)');
        }
      }

      return executed;
    },
    [lessonData, slideIndex]
  );

  const confirmClearBoard = () => {
    setLessonData(null);
    setFormulaData(null);
    setDiagramData(null);
    setMcqData(null);
    setSlideIndex(0);
    setSelectedMcqAnswers({});
    setActiveView('empty');
    setPendingClearConfirm(null);
  };

  // Forward reference so SpeechRecognition & text submit share one unified turn runner
  const startListeningLoopRef = useRef<() => void>(() => {});

  const sendTeacherCommand = useCallback(
    async (rawCommand: string) => {
      const command = rawCommand.trim();
      if (!command || !user || !authorized || submittingRef.current) return;

      submittingRef.current = true;
      setApiError(null);
      stopRecognition();
      stopSpeechOutput();
      setPhase('thinking');

      const userMsg: ChatMessage = {
        id: `u_${Date.now()}`,
        role: 'user',
        text: command,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, userMsg]);

      try {
        const idToken = await user.getIdToken();
        const historyPayload = messages.slice(-10).map((m) => ({
          role: m.role,
          text: m.text,
        }));

        const boardContext = {
          activeView,
          lessonTitle: lessonData?.title,
          chapter: lessonData?.chapter || mcqData?.chapter,
          subject: lessonData?.subject || formulaData?.subject || mcqData?.subject,
          classLevel: lessonData?.classLevel || mcqData?.classLevel,
          currentSlideIndex: slideIndex,
          totalSlides: lessonData?.slides.length || 0,
        };

        const response = await fetch(buildApiUrl('/api/ai/teacher-assistant'), {
          method: 'POST',
          credentials: getFetchCredentialsMode(),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
            'x-firebase-token': idToken,
          },
          body: JSON.stringify({
            message: command,
            language,
            history: historyPayload,
            boardContext,
          }),
        });

        const data = (await response.json()) as {
          reply?: string;
          actions?: BoardActionItem[];
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error || `Assistant error (HTTP ${response.status})`);
        }

        const executed = Array.isArray(data.actions) ? executeBoardActions(data.actions) : [];
        const replyText = data.reply || 'Done.';

        const aiMsg: ChatMessage = {
          id: `m_${Date.now()}`,
          role: 'model',
          text: replyText,
          executedActions: executed.length > 0 ? executed : undefined,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);

        speakResponse(replyText, () => {
          if (assistantActiveRef.current) {
            startListeningLoopRef.current();
          } else {
            setPhase('idle');
          }
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unable to reach Gemini backend.';
        setApiError(msg);
        setPhase('idle');
      } finally {
        submittingRef.current = false;
      }
    },
    [
      user,
      authorized,
      messages,
      activeView,
      lessonData,
      mcqData,
      formulaData,
      slideIndex,
      language,
      executeBoardActions,
      speakResponse,
      stopRecognition,
      stopSpeechOutput,
    ]
  );

  const startListeningLoop = useCallback(() => {
    setVoiceNotice(null);
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setVoiceNotice(
        'Browser SpeechRecognition is unavailable on this browser. Please type commands in the Text Fallback bar below.'
      );
      setPhase('idle');
      setAssistantActive(false);
      return;
    }

    stopRecognition();
    stopSpeechOutput();

    try {
      const rec = new Ctor();
      rec.continuous = wakeEnabledRef.current;
      rec.interimResults = true;
      rec.lang = languageRef.current;
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        setPhase('listening');
        setVoiceNotice(null);
      };

      rec.onresult = (event) => {
        let finalChunk = '';
        let interimChunk = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          const text = res[0]?.transcript || '';
          if (res.isFinal) {
            finalChunk += (finalChunk ? ' ' : '') + text.trim();
          } else {
            interimChunk += text;
          }
        }
        setInterimTranscript(interimChunk);

        if (finalChunk.trim()) {
          setInterimTranscript('');
          if (wakeEnabledRef.current) {
            const { matched, command } = extractWakeCommand(finalChunk);
            if (matched) {
              if (command) {
                setWakeAwaitingCommand(false);
                sendTeacherCommand(command);
              } else {
                setWakeAwaitingCommand(true);
                speakResponse(
                  languageRef.current === 'hi-IN'
                    ? 'Haan Sir, boliye?'
                    : 'Yes Sir, listening.',
                  () => {
                    if (assistantActiveRef.current) startListeningLoopRef.current();
                  }
                );
              }
            } else if (wakeAwaitingRef.current) {
              setWakeAwaitingCommand(false);
              sendTeacherCommand(finalChunk);
            }
          } else {
            sendTeacherCommand(finalChunk);
          }
        }
      };

      rec.onerror = (event) => {
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setVoiceNotice(
            'Microphone access was denied. Enable Microphone in Android 14 Chrome permissions or use Text Command below.'
          );
          setAssistantActive(false);
          setPhase('idle');
        } else if (event.error === 'audio-capture') {
          setVoiceNotice(
            'No working microphone detected on this board. You can connect a USB mic or use the Text Command fallback below.'
          );
          setAssistantActive(false);
          setPhase('idle');
        } else if (event.error === 'network') {
          setVoiceNotice(
            'Voice recognition requires internet connectivity for Chrome SpeechRecognition. Text commands remain active.'
          );
          setAssistantActive(false);
          setPhase('idle');
        }
      };

      rec.onend = () => {
        setInterimTranscript('');
        if (
          assistantActiveRef.current &&
          phaseRef.current === 'listening' &&
          !submittingRef.current
        ) {
          // Restart cleanly while assistant is active (active-page only)
          window.setTimeout(() => {
            if (assistantActiveRef.current && phaseRef.current === 'listening') {
              startListeningLoopRef.current();
            }
          }, 250);
        } else if (phaseRef.current === 'listening') {
          setPhase('idle');
        }
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      setVoiceNotice(
        err instanceof Error
          ? err.message
          : 'Unable to start voice recognition. Use the text command input below.'
      );
      setAssistantActive(false);
      setPhase('idle');
    }
  }, [sendTeacherCommand, speakResponse, stopRecognition, stopSpeechOutput]);

  startListeningLoopRef.current = startListeningLoop;

  const handleStartAssistant = () => {
    setAssistantActive(true);
    assistantActiveRef.current = true;
    startListeningLoop();
  };

  const handleSingleMicTap = () => {
    if (phase === 'listening') {
      handleStopAssistant();
    } else if (phase === 'speaking') {
      stopSpeechOutput();
      setAssistantActive(true);
      assistantActiveRef.current = true;
      startListeningLoop();
    } else {
      handleStartAssistant();
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    const msg = textInput;
    setTextInput('');
    sendTeacherCommand(msg);
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setSigningIn(true);
    try {
      await signInTeacherWithGoogle();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google Sign-In failed.';
      setAuthError(msg);
    } finally {
      setSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    handleStopAssistant();
    await signOut(auth);
  };

  if (!authReady) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400 mb-3" />
        <p className="text-sm font-semibold text-slate-300">Verifying teacher session...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 text-white p-6 text-center border-b border-slate-800">
            <div className="flex justify-center mb-3">
              <OfficialLogo size={64} />
            </div>
            <h1 className="text-xl font-extrabold font-display tracking-tight uppercase">
              GCC AI Teacher Assistant
            </h1>
            <p className="text-xs text-amber-400 font-semibold mt-1">
              MAXHUB Smart Classroom Teaching Copilot
            </p>
          </div>
          <div className="p-6 sm:p-8 space-y-5 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold">
              <Lock className="w-3.5 h-3.5 text-slate-900" />
              <span>Authenticated Teachers Only</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Sign in with the authorized Genius Coaching Centre Google account to launch the AI Teacher Assistant.
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
              className="w-full min-h-[54px] flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-base shadow-md transition-all cursor-pointer touch-manipulation disabled:opacity-60"
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
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900"
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
              Access Denied. Only the authorized Genius Coaching Centre teacher can use the AI Assistant.
            </p>
            <p className="text-xs text-slate-500">
              Signed in as: <span className="font-semibold text-slate-700">{user.email}</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleSignOut}
                className="flex-1 min-h-[48px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
              <a
                href="/"
                className="flex-1 min-h-[48px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
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

  const currentSlide =
    lessonData && lessonData.slides[slideIndex] ? lessonData.slides[slideIndex] : null;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col touch-manipulation select-none sm:select-text">
      {/* Top MAXHUB Header Bar */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto px-3 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Branding + Live Phase Indicator */}
          <div className="flex items-center gap-3 min-w-0">
            <OfficialLogo size={42} />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-extrabold text-sm sm:text-lg uppercase tracking-tight font-display truncate">
                  GCC AI Teacher Assistant
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-extrabold uppercase tracking-wider ${
                    phase === 'listening'
                      ? 'bg-emerald-500 text-slate-950 animate-pulse'
                      : phase === 'thinking'
                      ? 'bg-amber-400 text-slate-950 animate-pulse'
                      : phase === 'speaking'
                      ? 'bg-blue-500 text-white animate-pulse'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {phase === 'listening' && (wakePhraseEnabled && !wakeAwaitingCommand ? 'Wake Ready ("Hello GCC")' : 'Listening')}
                  {phase === 'thinking' && 'Thinking...'}
                  {phase === 'speaking' && 'Speaking'}
                  {phase === 'idle' && 'Idle'}
                </span>
              </div>
              <p className="text-[11px] text-amber-400 font-semibold truncate">
                Class 9 &amp; 10 (BSEB &amp; CBSE) • {AUTHORIZED_ADMIN_EMAIL}
              </p>
            </div>
          </div>

          {/* Touchscreen Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Language Toggle */}
            <div className="inline-flex rounded-xl bg-slate-800 p-1 border border-slate-700">
              <button
                type="button"
                onClick={() => setLanguage('hi-IN')}
                className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer transition-colors ${
                  language === 'hi-IN'
                    ? 'bg-amber-400 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                हिंदी
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en-IN')}
                className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer transition-colors ${
                  language === 'en-IN'
                    ? 'bg-amber-400 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                English
              </button>
            </div>

            {/* Mute Voice Toggle */}
            <button
              type="button"
              onClick={() => {
                const next = !muted;
                setMuted(next);
                if (next) {
                  stopSpeechOutput();
                  if (phase === 'speaking') setPhase(assistantActive ? 'listening' : 'idle');
                }
              }}
              className={`min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold border transition-colors cursor-pointer ${
                muted
                  ? 'bg-red-600/20 border-red-500/40 text-red-200'
                  : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
              }`}
            >
              {muted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
              <span>{muted ? 'Voice Muted' : 'Voice On'}</span>
            </button>

            <a
              href="/admin/microphone-test"
              className="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700"
            >
              <Mic className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Mic Test</span>
            </a>

            <a
              href="/admin/study-material"
              className="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Materials</span>
            </a>

            <button
              type="button"
              onClick={handleSignOut}
              className="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-200 border border-red-500/30 text-xs font-bold cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Split MAXHUB Smart Classroom Layout */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-3 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        {/* LEFT: SMART BOARD DISPLAY STAGE (7 Columns) */}
        <section className="lg:col-span-7 bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden min-h-[480px]">
          {/* Smart Board Header */}
          <div className="bg-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span className="font-extrabold text-sm sm:text-base font-display uppercase tracking-wide">
                GCC Smart Board Canvas
              </span>
            </div>

            {activeView !== 'empty' && (
              <button
                type="button"
                onClick={() =>
                  setPendingClearConfirm('Clear the current GCC Smart Board teaching display?')
                }
                className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-200 hover:text-white text-xs font-bold transition-colors cursor-pointer"
              >
                <Eraser className="w-3.5 h-3.5" />
                <span>Clear Board</span>
              </button>
            )}
          </div>

          {/* Clear Board Confirmation Guard */}
          {pendingClearConfirm && (
            <div className="bg-amber-50 border-b border-amber-300 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-amber-950 text-xs sm:text-sm font-bold">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>Confirm clearing Smart Board? ({pendingClearConfirm})</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPendingClearConfirm(null)}
                  className="min-h-[40px] px-4 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs font-extrabold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmClearBoard}
                  className="min-h-[40px] px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold cursor-pointer"
                >
                  Yes, Clear Board
                </button>
              </div>
            </div>
          )}

          {/* Smart Board Body */}
          <div className="flex-1 p-5 sm:p-7 overflow-y-auto">
            {activeView === 'empty' && (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto py-8 space-y-5">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center shadow-lg">
                  <BookOpen className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black font-display text-slate-900">
                    Ready for Classroom Teaching
                  </h2>
                  <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
                    Tap <strong>Start Assistant</strong> or tap one of the quick commands below to display Class 9 &amp; 10 lessons, formulas, diagrams, and MCQs right here on the MAXHUB screen.
                  </p>
                </div>

                <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => sendTeacherCommand(prompt)}
                      className="min-h-[52px] text-left px-4 py-3 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-400 text-xs sm:text-sm font-bold text-slate-800 transition-colors cursor-pointer"
                    >
                      &ldquo;{prompt}&rdquo;
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* VIEW 1: LESSON SLIDES */}
            {activeView === 'lesson' && lessonData && currentSlide && (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-slate-900 text-white text-xs font-extrabold">
                      {lessonData.classLevel}
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-amber-400 text-slate-950 text-xs font-extrabold">
                      {lessonData.subject}
                    </span>
                    {lessonData.board && (
                      <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold">
                        {lessonData.board}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-extrabold text-slate-500">
                    Slide {slideIndex + 1} of {lessonData.slides.length}
                  </span>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {lessonData.chapter}
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-display mt-0.5">
                    {currentSlide.heading}
                  </h2>
                </div>

                <ul className="space-y-3 bg-slate-50 border border-slate-200 rounded-2xl p-5">
                  {currentSlide.keyPoints.map((pt, i) => (
                    <li key={i} className="flex items-start gap-3 text-base sm:text-lg font-semibold text-slate-800">
                      <span className="w-7 h-7 rounded-lg bg-slate-900 text-amber-400 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>

                {currentSlide.example && (
                  <div className="bg-amber-50 border-l-4 border-amber-500 rounded-r-2xl p-4 sm:p-5">
                    <p className="text-xs font-extrabold uppercase tracking-wider text-amber-800 mb-1">
                      Classroom Example
                    </p>
                    <p className="text-sm sm:text-base font-bold text-slate-900">
                      {currentSlide.example}
                    </p>
                  </div>
                )}

                {/* Big Touch Slide Navigation */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    disabled={slideIndex <= 0}
                    onClick={() => setSlideIndex((i) => Math.max(0, i - 1))}
                    className="min-h-[50px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-extrabold text-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    <span>Previous Slide</span>
                  </button>

                  <button
                    type="button"
                    disabled={slideIndex + 1 >= lessonData.slides.length}
                    onClick={() =>
                      setSlideIndex((i) => Math.min(lessonData.slides.length - 1, i + 1))
                    }
                    className="min-h-[50px] inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-extrabold text-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span>Next Slide</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* VIEW 2: FORMULA BOARD */}
            {activeView === 'formula' && formulaData && (
              <div className="space-y-5">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-900 text-amber-400 text-xs font-extrabold">
                    <Calculator className="w-4 h-4" />
                    <span>{formulaData.subject} Formula</span>
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black font-display text-slate-900">
                  {formulaData.title}
                </h2>

                <div className="bg-slate-900 text-amber-300 rounded-2xl p-6 text-center shadow-lg">
                  <p className="text-2xl sm:text-4xl font-black tracking-wide font-mono">
                    {formulaData.formula}
                  </p>
                </div>

                {formulaData.variables.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {formulaData.variables.map((v, i) => (
                      <div
                        key={i}
                        className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3"
                      >
                        <span className="px-2.5 py-1 rounded-md bg-amber-400 text-slate-950 font-black text-sm">
                          {v.symbol}
                        </span>
                        <span className="text-sm font-bold text-slate-800">{v.meaning}</span>
                      </div>
                    ))}
                  </div>
                )}

                {formulaData.solvedExample?.question && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-2.5">
                    <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">
                      Solved Classroom Example
                    </p>
                    <p className="text-base font-extrabold text-slate-900">
                      Q: {formulaData.solvedExample.question}
                    </p>
                    <ol className="space-y-1 list-decimal list-inside text-sm font-semibold text-slate-800">
                      {formulaData.solvedExample.steps?.map((st, i) => (
                        <li key={i}>{st}</li>
                      ))}
                    </ol>
                    <p className="text-base font-black text-emerald-800 pt-1">
                      Answer: {formulaData.solvedExample.answer}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* VIEW 3: DIAGRAM BOARD */}
            {activeView === 'diagram' && diagramData && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black font-display text-slate-900">
                    {diagramData.title}
                  </h2>
                  <p className="text-sm text-slate-600 font-semibold mt-1">{diagramData.caption}</p>
                </div>
                <SmartBoardDiagram diagram={diagramData} />
              </div>
            )}

            {/* VIEW 4: INTERACTIVE BOARD MCQs */}
            {activeView === 'mcq' && mcqData && (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 text-amber-400 text-xs font-extrabold mb-1.5">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>
                        {mcqData.classLevel || 'Class 10'} • {mcqData.subject}
                      </span>
                    </span>
                    <h2 className="text-2xl font-black font-display text-slate-900">
                      {mcqData.title}
                    </h2>
                  </div>
                </div>

                <div className="space-y-4">
                  {mcqData.questions.map((q, qIdx) => {
                    const chosen = selectedMcqAnswers[qIdx];
                    const hasAnswered = typeof chosen === 'number';
                    return (
                      <div
                        key={qIdx}
                        className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3"
                      >
                        <p className="text-base font-extrabold text-slate-900">
                          Q{qIdx + 1}. {q.question}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {q.options.map((opt, oIdx) => {
                            const isCorrect = oIdx === q.correctIndex;
                            const isChosen = chosen === oIdx;
                            let btnStyle =
                              'bg-white border-slate-300 text-slate-900 hover:border-slate-900';
                            if (hasAnswered) {
                              if (isCorrect) {
                                btnStyle = 'bg-emerald-100 border-emerald-600 text-emerald-950';
                              } else if (isChosen) {
                                btnStyle = 'bg-red-100 border-red-500 text-red-950';
                              }
                            }
                            return (
                              <button
                                key={oIdx}
                                type="button"
                                onClick={() =>
                                  setSelectedMcqAnswers((prev) => ({ ...prev, [qIdx]: oIdx }))
                                }
                                className={`min-h-[48px] text-left px-4 py-2.5 rounded-xl border-2 text-sm font-bold transition-colors cursor-pointer ${btnStyle}`}
                              >
                                <span className="font-black mr-2">
                                  {String.fromCharCode(65 + oIdx)}.
                                </span>
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                        {hasAnswered && q.explanation && (
                          <p className="text-xs sm:text-sm font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2">
                            Explanation: {q.explanation}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* RIGHT: VOICE CONTROL & CONVERSATION DOCK (5 Columns) */}
        <section className="lg:col-span-5 bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden min-h-[480px]">
          {/* Animated Microphone & Session Controls */}
          <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 space-y-4">
            <div className="flex items-center gap-4">
              {/* Large Animated Mic Button */}
              <button
                type="button"
                onClick={handleSingleMicTap}
                aria-label="Toggle GCC Voice Microphone"
                className={`relative w-20 h-20 rounded-full flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-xl ${
                  phase === 'listening'
                    ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-400/40 scale-105'
                    : phase === 'thinking'
                    ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-300/40'
                    : phase === 'speaking'
                    ? 'bg-blue-500 text-white ring-4 ring-blue-400/40'
                    : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                }`}
              >
                {phase === 'listening' && (
                  <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-30" />
                )}
                {phase === 'thinking' ? (
                  <Loader2 className="w-9 h-9 animate-spin" />
                ) : phase === 'listening' ? (
                  <Mic className="w-9 h-9 relative z-10" />
                ) : (
                  <Mic className="w-9 h-9" />
                )}
              </button>

              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={assistantActive && phase === 'listening'}
                    onClick={handleStartAssistant}
                    className="flex-1 min-h-[48px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm cursor-pointer disabled:opacity-50"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Start Assistant</span>
                  </button>

                  <button
                    type="button"
                    disabled={!assistantActive && phase === 'idle'}
                    onClick={handleStopAssistant}
                    className="flex-1 min-h-[48px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs sm:text-sm cursor-pointer disabled:bg-slate-800 disabled:text-slate-500"
                  >
                    <Square className="w-4 h-4 fill-current" />
                    <span>Stop Assistant</span>
                  </button>
                </div>

                {/* Active-Page Wake Phrase Toggle */}
                <label className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs cursor-pointer">
                  <span className="font-semibold text-slate-200">
                    Wake phrase &ldquo;Hello GCC&rdquo;{' '}
                    <span className="text-slate-400 font-normal">(active page only)</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={wakePhraseEnabled}
                    onChange={(e) => {
                      setWakePhraseEnabled(e.target.checked);
                      setWakeAwaitingCommand(false);
                    }}
                    className="w-4 h-4 accent-amber-400"
                  />
                </label>
              </div>
            </div>

            {interimTranscript && (
              <div className="px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-amber-300 font-semibold italic">
                Hearing: &ldquo;{interimTranscript}&rdquo;
              </div>
            )}

            {voiceNotice && (
              <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-200 text-xs font-semibold flex items-start gap-2">
                <MicOff className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{voiceNotice}</span>
              </div>
            )}

            {!speechRecSupported && !voiceNotice && (
              <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-200 text-xs font-semibold">
                SpeechRecognition is not supported in this browser. Type your commands below — Gemini &amp; Smart Board actions remain 100% active.
              </div>
            )}

            {apiError && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-400/40 text-red-200 text-xs font-semibold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{apiError}</span>
              </div>
            )}
          </div>

          {/* Conversation History */}
          <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[380px] lg:max-h-none">
            {messages.length === 0 ? (
              <div className="text-center py-8 px-4 space-y-2">
                <p className="text-sm font-bold text-slate-300">
                  Namaste Prince Sir! GCC AI Teaching Assistant taiyaar hai.
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Boliye ya neeche type kijiye: &ldquo;Aaj Class 10 Science padhaao&rdquo;, &ldquo;Quadratic Equation formula dikhao&rdquo;, ya &ldquo;Class 9 Motion MCQ banao&rdquo;.
                </p>
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-amber-400 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-100 border border-slate-700 font-medium'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.text}</p>
                    {m.executedActions && m.executedActions.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-700 flex flex-wrap gap-1.5">
                        {m.executedActions.map((act, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[11px] font-bold"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Executed: {act}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 px-1">{m.timestamp}</span>
                </div>
              ))
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Text Command Fallback Input */}
          <form
            onSubmit={handleTextSubmit}
            className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/60 flex items-center gap-2"
          >
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={
                language === 'hi-IN'
                  ? 'Type command (e.g. Aaj Class 10 Science padhaao)...'
                  : 'Type teaching command or question...'
              }
              className="flex-1 min-h-[50px] px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
              type="submit"
              disabled={!textInput.trim() || phase === 'thinking'}
              className="min-h-[50px] min-w-[54px] inline-flex items-center justify-center px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black cursor-pointer disabled:opacity-40"
              aria-label="Send command"
            >
              {phase === 'thinking' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default GccAiTeacherAssistant;
