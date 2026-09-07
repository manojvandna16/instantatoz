# Plan: Fix Firebase Phone OTP (SMS Not Arriving) in Mobile App

## Goal
Restore OTP delivery for `@react-native-firebase/auth` `signInWithPhoneNumber` in `apps/mobile`. Do **not** replace Firebase Phone Auth with a custom backend. Do **not** introduce any new code yet — first verify Firebase Console configuration and gather evidence, then implement targeted fixes.

## Constraints
- Keep Firebase Phone Auth as the auth provider.
- Keep existing `auth.service.ts`, `phone.tsx`, `otp.tsx` API surface.
- Do not commit secrets / `google-services.json` to git.
- Mobile app is Expo + bare prebuild (`android/` folder is committed).
- Build environment uses JDK 21 (Microsoft jdk-21.0.9.10-hotspot) at `C:\Program Files\Microsoft\jdk-21.0.9.10-hotspot`.

## Current State (verified from code)

### Call chain (confirmed)
1. `apps/mobile/app/(auth)/phone.tsx:23-46` — `handleSendOTP()`
   - Validates `/^[6-9]\d{9}$/`
   - Requires both Terms + Privacy consent
   - Calls `sendOTP('+91' + phone)` then `router.push('/(auth)/otp', { phone, termsVersion, privacyVersion, confirmationResultKey: 'temp' })`
   - Stores confirmation on `global.__otpConfirmation`
2. `apps/mobile/src/services/auth.service.ts:3-6` — `sendOTP()` is one line: `return await auth().signInWithPhoneNumber(phoneNumber)`. No try/catch, no error context.
3. `apps/mobile/app/(auth)/otp.tsx:27-51` — Reads `global.__otpConfirmation` and calls `verifyOTP`. Shows generic "Verification failed" on any non-coded error.
4. `apps/mobile/app/_layout.tsx:36-78` — `NavigationGuard` redirects to `/(customer)/home` after auth state changes (via `useAuth.ts`).

### Firebase config (verified)
- `apps/mobile/google-services.json` (file exists, ~1KB):
  - `project_id: instantatoz`, `mobilesdk_app_id: 1:423176154131:android:c24253ddc5ee7575dae3e6`
  - `package_name: com.instantatoz.app` ✅ matches `app.json` + `build.gradle`
  - `api_key: AIzaSyCoT8znogqt0YJt6Fho5PsP7BTYL7HnTf4` (Android key, unrestricted)
  - **Zero `certificate_hash` entries** — no SHA-1 or SHA-256 fingerprints registered in the file itself
  - Only `client_type: 3` (web OAuth client) — no Android OAuth client
- `apps/mobile/app.json`:
  - `android.package: com.instantatoz.app` ✅
  - `android.googleServicesFile: ./google-services.json` ✅
  - Plugins include `@react-native-firebase/app` and `@react-native-firebase/auth`
- `apps/mobile/android/app/build.gradle:177` — `apply plugin: 'com.google.gms.google-services'` ✅
- `apps/mobile/android/app/src/main/AndroidManifest.xml` — No SHA-256 declarations (none expected, they live in `google-services.json`)
- `apps/mobile/android/app/debug.keystore` — exists (default Android debug keystore, password `android`)

### What's missing
- `google-services.json` does **not** contain any SHA-1 or SHA-256 fingerprints. For production app bundles (Play Store), this is normal because Play App Signing re-signs. For **debug builds** (which is what the user is running based on `hs_err_pid*.log` files and `index.android.bundle` artifacts), the **debug SHA-1 must be registered in the Firebase Console under Project Settings → Your apps → Android app → SHA certificate fingerprints**.
- No `.env` file in `apps/mobile/` (Firebase config is sourced solely from `google-services.json`).
- No structured error logging in `auth.service.ts` — failure reason is lost.

## Root Cause Hypotheses (ranked)

1. **Debug SHA-1 not registered in Firebase Console** (highest probability)
   - Symptom matches: `signInWithPhoneNumber` returns a `confirmationResult` (call "succeeds" from the SDK's perspective) but Firebase backend silently rejects the SMS send because the APK's signing certificate is not whitelisted.
   - This is a **known Firebase behavior**: Phone Auth on Android requires the signing certificate fingerprint to be in the Firebase project's allowed list.
   - Affects only debug/EAS internal distribution builds, not Play Store signed builds.

2. **Phone sign-in provider not enabled in Firebase Console**
   - Firebase Console → Authentication → Sign-in method → Phone must be **Enabled**.
   - If disabled, the REST API returns `OPERATION_NOT_ALLOWED` with no SMS.

3. **Billing not enabled on `instantatoz` project (Blaze plan required)**
   - Phone Auth on Firebase requires the Blaze (pay-as-you-go) plan since April 2024.
   - Symptom: SMS is queued but never sent; backend returns a quota error visible only in Firebase logs.

4. **Phone number format / E.164 mismatch**
   - Code uses `'+91' + phone` — correct for 10-digit Indian numbers.
   - `/^[6-9]\d{9}$/` blocks landlines (correct) and is consistent with Indian mobile numbering.
   - Likely **not** the cause.

5. **Outdated cached build**
   - `index.android.bundle.hbc` exists (timestamp 12:15) — bundle is fresh.
   - `google-services.json` mtime 19-08-2026 (older than bundles) — but Expo prebuild regenerates the Android resources from it. Unlikely the cause unless prebuild wasn't re-run after the file was placed.

6. **Insufficient app-level configuration**
   - No reCAPTCHA Enterprise / App Check integration in code. Firebase Phone Auth on Android **does not require** reCAPTCHA (only web requires it). Not a cause.

## Plan

### Phase 1 — Evidence gathering (must do before code changes)
- [ ] **Read debug keystore SHA-1** locally:
  ```
  & "C:\Program Files\Microsoft\jdk-21.0.9.10-hotspot\bin\keytool.exe" -list -v -keystore apps\mobile\android\app\debug.keystore -storepass android -alias androiddebugkey
  ```
  Capture `SHA1:` and `SHA256:` lines.
- [ ] **Verify Firebase Console state** (user must do this in browser; cannot be done from CLI):
  1. Open https://console.firebase.google.com/project/instantatoz
  2. **Authentication → Sign-in method → Phone** — must be **Enabled** (toggle on, save)
  3. **Project settings → General → Your apps → Android app (`com.instantatoz.app`)** — confirm the app is registered
  4. **SHA certificate fingerprints** — paste the debug SHA-1 from step 1, click **Save**
  5. **Project settings → Usage and billing** — confirm **Blaze plan** is active (required for Phone Auth)
  6. **Authentication → Templates** — ensure default SMS template is set; no abuse-limits hit
- [ ] **Capture real error from device** (the silent catch in `auth.service.ts` is the #1 reason we can't diagnose):
  - Wire `adb logcat` to the running device/emulator with filter `ReactNativeJS:* *:S`
  - Retry OTP send
  - Capture the actual `err.code`, `err.message`, `err.stack` from `signInWithPhoneNumber`

### Phase 2 — Minimal code hardening (independent of Firebase Console state)
Even after Firebase Console is fixed, the silent error path is a bug. Add it now to de-risk the next debug cycle.

- [ ] `apps/mobile/src/services/auth.service.ts:3-6` — wrap `signInWithPhoneNumber` in try/catch, log full error (`err.code`, `err.message`, `err.stack`), and re-throw. Do not change return type.
- [ ] `apps/mobile/app/(auth)/phone.tsx:40-44` — surface a short user-facing hint based on `err.code`:
  - `auth/invalid-phone-number` → "Invalid phone number format"
  - `auth/operation-not-allowed` → "Phone login is disabled. Please contact support."
  - `auth/quota-exceeded` → "Too many attempts. Please try again later."
  - `auth/network-request-failed` → "Network error. Check your connection."
  - else → existing generic message
- [ ] `apps/mobile/app/(auth)/otp.tsx:39-47` — same pattern for `verifyOTP` (add `auth/invalid-verification-code`, `auth/code-expired`, `auth/session-expired`, `auth/network-request-failed`).
- [ ] **No new dependencies.** No `react-native-firebase` config changes. No `app.json` plugin changes. No new screens.

### Phase 3 — Validation
- [ ] Rebuild dev client: `cd apps/mobile && npx expo prebuild --platform android --clean` then `npx expo run:android` (or use existing `index.android.bundle` workflow).
- [ ] Confirm SHA-1 from newly installed APK matches the one registered in Firebase Console:
  ```
  & "C:\Program Files\Microsoft\jdk-21.0.9.10-hotspot\bin\keytool.exe" -list -printcert -jarfile apps\mobile\android\app\build\outputs\apk\debug\app-debug.apk
  ```
- [ ] End-to-end test: enter phone → consent → **OTP arrives within 30s** → enter OTP → land on `/(customer)/home` (or consent screen for new user).
- [ ] Verify with two different phone numbers (one personal, one teammate) to rule out carrier-side filtering.
- [ ] Confirm `apps/mobile/index.android.bundle` is rebuilt after any `auth.service.ts` change.

### Phase 4 — Production hardening (deferred until Phase 1-3 pass)
- [ ] Register release SHA-1 **and** SHA-256 once a real release keystore is generated (`apps/mobile/android/app/build.gradle:108-111` currently signs release with the debug keystore — must change before any Play Store submission).
- [ ] Add App Check (recommended for production) — out of scope for the current "OTP not arriving" bug.
- [ ] Switch `consent.tsx:67, 77, 78, 80, 92` to non-emoji icons (uses `?` which renders as `??` in missing-glyph fallback) — cosmetic, separate ticket.

## Files Affected (for implementation agent)
| File | Change |
|---|---|
| `apps/mobile/src/services/auth.service.ts` | Add try/catch + error logging in `sendOTP` and `verifyOTP` |
| `apps/mobile/app/(auth)/phone.tsx` | Map `err.code` → user-facing message |
| `apps/mobile/app/(auth)/otp.tsx` | Map `err.code` → user-facing message |

## Files NOT Touched
- `google-services.json` (must remain the canonical Firebase config; user re-downloads from Console if needed)
- `app.json` (no plugin / config changes)
- `android/app/build.gradle` (no signing change in this phase)
- `apps/admin/**` (separate app, admin login is already fixed)
- `apps/mobile/app/_layout.tsx`, `useAuth.ts`, `authStore.ts` (no auth-flow changes)
- `apps/mobile/src/services/api.ts` (Vercel backend wiring, unrelated)

## Risks
- **Re-downloading `google-services.json`** from Firebase Console will overwrite the current file. Verify the `package_name` stays `com.instantatoz.app` and the `mobilesdk_app_id` matches `1:423176154131:android:c24253ddc5ee7575dae3e6` before committing.
- After registering SHA-1, **`expo prebuild --clean` must be re-run** so `android/app/google-services.json` (the Gradle copy) is regenerated. Otherwise the old copy is bundled.
- Switching to Blaze plan requires a valid billing account on the Firebase project. If billing setup is blocked, Phone Auth will remain broken — there is no code-level workaround.

## Open Questions
1. Is the **Blaze billing plan** enabled on the `instantatoz` Firebase project? (Phone Auth requires it post-April 2024.) If not, this must be enabled in the Firebase Console — code cannot fix it.
2. Was the user running a **debug build** (Expo Go / `expo run:android` with debug keystore) or an **EAS internal distribution APK**? The SHA-1 to register differs between the two.

## Recommendation Order
1. User: enable Phone provider in Firebase Console + verify Blaze billing.
2. User (or agent locally): extract debug SHA-1, register in Firebase Console, save.
3. Agent: apply Phase 2 code hardening.
4. User: rebuild app and retry OTP.
5. If OTP still doesn't arrive, capture `adb logcat` error and re-diagnose based on actual `err.code`.
