# GCC AI — Native Firebase Authentication Integration Plan (Android WebView)

## Why `signInWithPopup` Cannot Be Used in an Android APK WebView

On desktop Chrome and Android Chrome, `signInWithPopup(auth, googleProvider)` opens a secure Google OAuth popup tab and returns credentials via `window.opener`. Inside a Capacitor Android WebView (`https://localhost`):
- Google OAuth blocks embedded WebView sign-in (`disallowed_useragent`) or fails popup communication (`auth/operation-not-supported-in-this-environment`).
- Storing long-lived private tokens or embedding API secrets in the APK violates security rules.

---

## Target Architecture (₹0, Preserving Existing Firebase Project)

| Component | Website (Existing) | GCC AI Android APK (Phase 2) |
|---|---|---|
| **Firebase Project** | `long-airline-bv9wh` | `long-airline-bv9wh` (same project) |
| **Authorized Teacher** | `piyushchandravanshi75440@gmail.com` (`emailVerified: true`) | `piyushchandravanshi75440@gmail.com` (`emailVerified: true`) |
| **Sign-In Trigger** | `signInTeacherWithGoogle()` → `signInWithPopup` | `signInTeacherWithGoogle()` → `window.__GCC_NATIVE_AUTH__` (`@capacitor-firebase/authentication`) |
| **Credential Handshake** | Firebase Auth Web SDK state | Native Google Credential Manager / Play Services → `idToken` → `GoogleAuthProvider.credential(idToken)` → `signInWithCredential(auth, credential)` |
| **Backend Verification** | `Authorization: Bearer <Firebase ID Token>` → `server.ts` `verifyFirebaseAdminToken()` | Exact same `user.getIdToken()` → `https://<cloud-run>/api/ai/teacher-assistant` → exact same `verifyFirebaseAdminToken()` |

---

## Step-by-Step Phase 2 Setup Checklist

1. **Register Android App in Firebase Console (`long-airline-bv9wh`)**
   - Add an Android app with package name: `com.geniuscoaching.gccai`
   - Add debug & release **SHA-1** and **SHA-256** signing certificate fingerprints (generated from the Android debug/release keystore).
   - Enable **Google** sign-in provider in Firebase Authentication (already enabled).
   - Verify the Web Client ID (`oAuthClientId`: `238758018697-4l1nnm6h42v1bssj148jaa0oderuh7q4.apps.googleusercontent.com`) is present in `strings.xml` (`default_web_client_id`) alongside `google-services.json` inside `/android-app/android/app/`. *(Note: `google-services.json` contains standard public Android Firebase identifiers, never private admin service accounts.)*

2. **Install Open-Source Capacitor Firebase Auth Plugin (₹0)**
   - Package: `@capacitor-firebase/authentication` (MIT license, free).
   - Uses Android Credential Manager / Google Play Services natively outside the WebView so Google's OAuth security policies pass cleanly on Android 14 phones and MAXHUB boards.

3. **MAXHUB Board Fallback Note (Devices Without Google Play Services)**
   - Some MAXHUB Android 14 boards ship without Google Play Services (GMS).
   - During Phase 2 hardware verification on MAXHUB:
     - If GMS is installed → `@capacitor-firebase/authentication` signs in directly with one tap.
     - If GMS is absent on the specific MAXHUB firmware → fallback option is opening an **Android Custom Tab** (`@capacitor/browser`) to a verified auth redirect or keeping Chrome PWA/Custom Tab as primary on non-GMS boards, never weakening `verifyFirebaseAdminToken` on `server.ts`.

4. **Frontend Bridge Verification (`src/lib/firebaseAuthBridge.ts`)**
   - Phase 1 has already created `signInTeacherWithGoogle()` and registered the `window.__GCC_NATIVE_AUTH__` interface.
   - In Phase 2, register `window.__GCC_NATIVE_AUTH__` during app startup when `isCapacitorNative()` is true:
     ```ts
     const result = await FirebaseAuthentication.signInWithGoogle();
     return { idToken: result.credential?.idToken || '' };
     ```
   - `GccAiTeacherAssistant.tsx` continues calling `user.getIdToken()` and `isAuthorizedAdmin(user)` with **zero duplicate auth logic**.

5. **Token Security Rules**
   - Firebase ID tokens stay in Firebase JS SDK session memory (short-lived 1-hour JWTs refreshed automatically by Firebase SDK).
   - Never persist raw tokens in plain `localStorage` keys manually or log them in `server.ts` / Android `Logcat`.
   - Backend (`server.ts`) continues verifying the token via Google Identity Toolkit on every `/api/ai/*`, `/api/storage/sign-upload`, and `/api/storage/delete` call.
