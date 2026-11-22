import { GoogleAuthProvider, signInWithCredential, UserCredential } from 'firebase/auth';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import { isCapacitorNative } from './apiConfig';

/**
 * Phase 2 extension hook shape for native Capacitor Google Sign-In
 * (e.g. @capacitor-firebase/authentication). Not implemented in Phase 1.
 */
export interface NativeGoogleAuthBridge {
  signInWithGoogleIdToken: () => Promise<{ idToken: string }>;
}

declare global {
  interface Window {
    __GCC_NATIVE_AUTH__?: NativeGoogleAuthBridge;
  }
}

/**
 * Authenticates the GCC teacher using Google Sign-In.
 *
 * - On web browsers (desktop, mobile Chrome, MAXHUB Chrome): preserves the exact
 *   existing Firebase `signInWithPopup(auth, googleProvider)` flow.
 * - Inside a Capacitor Android WebView (Phase 2): delegates to the native Google
 *   Sign-In bridge to obtain a Google ID token and completes `signInWithCredential`
 *   so Firebase Auth sessions and backend ID-token verification remain identical.
 */
export async function signInTeacherWithGoogle(): Promise<UserCredential> {
  if (!isCapacitorNative()) {
    return signInWithPopup(auth, googleProvider);
  }

  const nativeBridge = typeof window !== 'undefined' ? window.__GCC_NATIVE_AUTH__ : undefined;
  if (!nativeBridge || typeof nativeBridge.signInWithGoogleIdToken !== 'function') {
    throw new Error(
      'Native Android Google Sign-In is scheduled for Phase 2 (@capacitor-firebase/authentication). Standard browser popups are blocked inside Android WebViews.'
    );
  }

  const { idToken } = await nativeBridge.signInWithGoogleIdToken();
  if (!idToken) {
    throw new Error('Native Google Sign-In did not return an ID token.');
  }

  const credential = GoogleAuthProvider.credential(idToken);
  return signInWithCredential(auth, credential);
}
