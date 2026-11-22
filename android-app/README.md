# GCC AI — Android Application (`/android-app/`)

**Target Devices:** Android Smartphones & MAXHUB Interactive Digital Board (Android 14)  
**Target Budget:** ₹0 (Capacitor MIT, Google Identity / Firebase Spark free tier, Gemini free quota via Cloud Run Express backend)  
**Languages:** Hindi, English, Bhojpuri

---

## Phase 1 Status (Completed Bridge & Scaffolding)

Phase 1 prepares the shared web + mobile bridge **without duplicating the GCC AI Teacher Assistant UI** and **without breaking the live GCC Coaching Centre website**:

1. **Shared React UI Reuse (`../src`)**
   - `src/components/GccAiTeacherAssistant.tsx` and `src/components/SmartBoardDiagram.tsx` remain the single source of truth.
   - `src/lib/apiConfig.ts` reads `VITE_API_BASE_URL` and routes API calls (`/api/ai/teacher-assistant`, `/api/storage/*`):
     - **Website builds** (`VITE_API_BASE_URL` empty): uses relative same-origin URLs (`/api/...`), zero behavioral change.
     - **Android APK builds** (`VITE_API_BASE_URL=https://<cloud-run-url>`): sends HTTPS requests to the deployed Cloud Run backend (rejects non-HTTPS remote URLs).
   - `src/App.tsx` checks `isAndroidAssistantShell()` (`VITE_APP_TARGET=android-assistant` or `Capacitor.isNativePlatform()`) so Capacitor's root load (`https://localhost/`) launches `<GccAiTeacherAssistant />` directly while the public website continues serving the coaching centre homepage at `/`.

2. **Express Backend Bridge (`../server.ts`)**
   - CORS allowlist updated for `/api/ai/*` and `/api/storage/*` to explicitly permit Capacitor origins (`https://localhost`, `capacitor://localhost`, `http://localhost`) alongside same-origin / Cloud Run web hosts — without wildcard `*` on authenticated endpoints.
   - Firebase Admin token verification (`piyushchandravanshi75440@gmail.com`, `emailVerified === true`) and server-side `GEMINI_API_KEY` / `SUPABASE_SERVICE_ROLE_KEY` boundaries remain strictly enforced on the server.

3. **Firebase Authentication Bridge (`../src/lib/firebaseAuthBridge.ts`)**
   - Web browsers continue calling `signInWithPopup(auth, googleProvider)`.
   - Exposes `window.__GCC_NATIVE_AUTH__` integration hook for Phase 2 native Android Google Sign-In (`@capacitor-firebase/authentication`).

---

## Phase 2 Roadmap (Not Implemented Yet — Requires Approval)

- Install `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`, `@capacitor-firebase/authentication` inside `/android-app/`.
- Wire native Google Sign-In (`FIREBASE_AUTH_PLAN.md`).
- Add Kotlin native voice plugins (`SpeechRecognizer`, `TextToSpeech`, MAXHUB USB mic `AudioManager` enumeration).
- Set up ₹0 GitHub Actions CI APK workflow.
