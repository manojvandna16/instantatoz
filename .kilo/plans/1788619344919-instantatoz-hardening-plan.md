# Instantatoz — Hardening & Marketplace-Loop Completion Plan

Saved at: `.kilo/plans/1788619344919-instantatoz-hardening-plan.md`

## 0. Audit verdict (one-line per area)

| Area | Verdict |
|---|---|
| **Core marketplace loop** (search → post → match → OTP → work → pay → rate) | **Not implemented.** 5 of 5 job functions in `firebase/functions/src/jobs.ts` are stubs throwing `unimplemented`. The "Book" button on `/workers/[id]` is disabled. |
| **Security / secrets** | **Critical.** Firebase Admin private key + Supabase service-role key + mobile API key committed in working tree. Admin panel has a hardcoded SUPER_ADMIN fallback. |
| **Auth / RBAC** | **Broken.** Admin proxy only checks cookie existence, not role. Hardcoded email `manojbhatt900@gmail.com` gets auto-SUPER_ADMIN on Firestore timeout. |
| **Data model consistency** | **Divergent.** Three counter schemas (`count` vs `currentCount`), three verification-status enums (`ACTIVE` vs `APPROVED` vs `VERIFIED`), three "create user/worker" code paths. Admin dashboard filters for `APPROVED` but Functions write `ACTIVE` → verification UI never lights up. |
| **Mobile apps** | **Placeholder.** `app/` is "Hello Android!". `mobile/user-app/`, `mobile/worker-app/` are empty. `apps/mobile/` exposes Supabase service-role key client-side. |
| **Hourly-workforce model** | **Marketing only.** `WorkSession`, `BillingCalculation`, `expectedHours` types exist; nothing creates/reads them. No server timer. |
| **Push notifications** | **Half-built.** `registerDeviceToken` saves FCM tokens; no sender function exists. |
| **Payments** | **Half-built.** Razorpay order + verify endpoints exist; verify route has a `TODO` and never writes a `payments` doc. |
| **Storage** | **Split brain.** Vercel Blob (web upload), Supabase (worker photos via NestJS), Firebase Storage (rules only). |
| **Backend (NestJS)** | **One-trick pony.** Only `POST /api/v1/workers/profile/image`. Otherwise unused. |
| **README vs reality** | **Stale.** Claims Next 14, is Next 16.3. Phases labelled "Planned" but admin + functions are built. |

---

## 1. Assumptions (replace any that don't fit)

The user dismissed clarifying questions, so the plan uses these defaults. Flag any to change before implementation:

- **A1** Scope = P0 security + the P1 items required to ship the core marketplace loop. Storage consolidation, RBAC, push notifications, and the NestJS image proxy are next-tier.
- **A2** Job matching = **broadcast + first-accept**: `createJobRequest` FCM-pushes to N nearest `ACTIVE + isOnline` workers whose `skills` match; first `respondToJobRequest` wins; others auto-cancel.
- **A3** Admin auth = **Firebase Custom Claims** (`admin: true`, `role: <granular>`). Set via one-time Admin-SDK script. Proxy/middleware verifies the claim. Remove hardcoded email fallback and SUPER_ADMIN timeout fallback.
- **A4** Storage = **Firebase Storage only** for all user/worker/job media. Migrate worker profile photos off Supabase. NestJS image endpoints get removed (backend collapses to empty or gets removed entirely).
- **A5** Single source of truth for user/worker creation = **Firebase Functions** (`createUserProfile`, `registerWorker`). Web Server Actions and `/api/mobile` get removed; mobile already calls Functions.
- **A6** Status enums unified in `packages/types/index.ts`. Renamed: `verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'`. Worker runtime status: `ONLINE | OFFLINE | BUSY | ON_JOB`. Same names used everywhere.
- **A7** "Hourly" model = **OTP-gated server timer** (`verifyJobOTP` starts `WorkSession`, `completeJob` ends it, billable minutes = server delta).
- **A8** Geo-restricted to Uttarkashi stays as-is (data already hardcoded); only abstracted enough that adding a new district = one config entry, not a code change.

---

## 2. The plan — ordered task list

Tasks within a phase can be parallelized across files. Phases are sequential because of dependencies.

### Phase A — Stop the bleeding (P0, security)

1. **Rotate every exposed secret.** Treat all as compromised (git history retains them).
   - Generate new Firebase Admin private key in Firebase Console → overwrite `instantatoz-firebase-adminsdk-fbsvc-60c7a0a02c.json` locally only.
   - New Supabase service-role key; if Supabase is being kept, rotate; if A4 holds, delete project.
   - New Razorpay key pair.
   - Move all to env vars loaded by Firebase Functions / Next.js / NestJS — never in client bundles.

2. **Strip the hardcoded SUPER_ADMIN fallback.**
   - File: `apps/admin/lib/auth-context.tsx:49,53,75,80`.
   - Replace with: claim-based check; on timeout → unauthenticated, never admin.
   - Remove the `manojbhatt900@gmail.com` email check.
   - Add a one-time script `firebase/functions/src/scripts/setAdminClaims.ts` that sets `admin: true, role: <role>` for a curated UID list.

3. **Fix Supabase service-role key in client.**
   - File: `apps/mobile/src/services/supabase.ts:6`.
   - If A4 holds, delete the file. Otherwise replace the call with a Firebase Function that proxies the operation server-side.

4. **Enforce secret hygiene going forward.**
   - Verify `.gitignore` covers `*.json` containing `private_key` (in addition to existing `*-adminsdk-*.json` pattern).
   - Add a CI step: `gitleaks` or `git-secrets` pre-commit hook.
   - Move service-account JSON out of repo entirely; use `GOOGLE_APPLICATION_CREDENTIALS` env var pointing to a path provisioned at deploy time.

5. **Close the worker-online bypass.**
   - File: `apps/web/src/app/become-a-worker/dashboard/page.tsx:124`.
   - Stop writing `isOnline` directly to Firestore from the client. Call the existing `updateWorkerOnlineStatus` Firebase Function (which already checks `verificationStatus === 'ACTIVE'`).
   - Add a Firestore rule: `allow update on /workers/{id}` only if the diff doesn't change `isOnline`, `verificationStatus`, `rating`, or `stats`. (Forces all privileged writes through Functions.)

6. **Enforce RBAC in admin proxy.**
   - File: `apps/admin/proxy.ts`.
   - After cookie verify, call `getUser(uid)` or decode claims; reject if `admin !== true`. Add per-route permission check using `hasPermission()` from `apps/admin/lib/roles.ts`.

### Phase B — Unify the data model (P1, prerequisites for everything else)

7. **Promote `packages/types/index.ts` to the single source of truth.**
   - Re-export all enums (`WorkerVerificationStatus`, `WorkerRuntimeStatus`, `JobStatus`, `UserRole`).
   - Update `apps/admin/types/index.ts` to re-export from packages, not redeclare.
   - Update Firebase Functions, web server actions, web client code to import from `@/packages/types`.

8. **Standardize counters and ID format.**
   - Single counter doc per collection: `/counters/users` and `/counters/workers`, field `value` (not `currentCount`, not `count`).
   - Migration script to rename existing fields.
   - New `genUserId()` / `genWorkerId()` helper in `packages/types/index.ts` (or `packages/types/ids.ts`) used by Functions only.

9. **Delete the duplicate paths.**
   - Delete `apps/web/src/app/api/mobile/route.ts` (lines 24–60 and 64–105 cover what Functions already do).
   - Keep `apps/web/src/app/become-a-worker/actions.ts` only as a thin client wrapper around the Function call, not a parallel implementation.

10. **Migrate existing data (if any in Firestore).**
    - `verificationStatus: 'ACTIVE'` → `'APPROVED'`.
    - `status: 'OFFLINE'` → keep as runtime status; remove `status` from worker doc where it duplicates `isOnline`.
    - Counter `currentCount` → `value`.
    - Run once with a `firebase/functions/src/scripts/migrate.ts` Admin-SDK script. Idempotent.

### Phase C — Complete the marketplace loop (P1, the actual product)

11. **Implement `firebase/functions/src/jobs.ts`.**
    - `createJobRequest({ category, skills, location, expectedHours, scheduledFor? })`
      - Validate caller is `USER` role.
      - Find up to 20 nearest `APPROVED + isOnline + skills ⊇ requested` workers via `getNearbyWorkers` (already implemented).
      - Write `/jobs/{jobId}` with `status: 'BROADCASTING'`, `customerId`, `expiresAt = now + 10 min`.
      - FCM-push each worker a `job_offered` notification with jobId.
    - `respondToJobRequest({ jobId, accept: boolean })`
      - Transactional: if `status === 'BROADCASTING'`, set `status = 'ACCEPTED'`, `workerId`. Else reject (someone else got it).
      - On accept: FCM-cancel to all other offered workers, FCM-confirm to customer.
    - `verifyJobOTP({ jobId, otp })`
      - 6-digit OTP generated at job creation, stored in `/jobs/{jobId}.otp` (Firestore rules deny client read).
      - On match: `status = 'IN_PROGRESS'`, create `/workSessions/{jobId}` with `startedAt: serverTimestamp()`.
    - `completeJob({ jobId })`
      - Validates caller is assigned worker.
      - `status = 'AWAITING_PAYMENT'`, `workSessions/{jobId}.endedAt = serverTimestamp()`.
      - Compute `billableMinutes` server-side.
    - `cancelJob({ jobId, reason })`
      - Validates caller is customer or assigned worker; transition rules depend on current state.
      - FCM-notify the other party.

12. **Customer-side: wire the UI.**
    - New page `apps/web/src/app/book/[workerId]/page.tsx` — chooses category, hours, date, address; submits via `createJobRequest`.
    - `apps/web/src/app/jobs/page.tsx` — customer view of active + past jobs, status timeline, OTP reveal after accept.
    - Remove the disabled "Book" button on `/workers/[id]`; replace with "Request Service" linking to `/book/{workerId}`.

13. **Worker-side: implement job-handling UI (web only for now).**
    - `apps/web/src/app/become-a-worker/dashboard/page.tsx` — add "Incoming Jobs" panel that subscribes to `/jobs` where `offeredWorkers` array-contains the worker's UID and `status === 'BROADCASTING'`. Accept/Decline buttons call `respondToJobRequest`.
    - After accept: show OTP-input prompt and work timer.

14. **Payment persistence.**
    - File: `apps/web/src/app/api/verify-payment/route.ts:35`.
    - After signature verification, write `/payments/{paymentId}` with `customerId`, `jobId`, `amount`, `razorpayPaymentId`, `razorpayOrderId`, `status: 'CAPTURED'`, `createdAt: FieldValue.serverTimestamp()`.
    - On success, transition job `AWAITING_PAYMENT` → `COMPLETED`.
    - Trigger `submitRating` availability (already implemented).

15. **Hourly timer / WorkSession billing.**
    - `submitRating` already exists; gate it on `status === 'COMPLETED'`.
    - `completeJob` calculates `billableMinutes = round((endedAt - startedAt) / 60_000)`, `totalAmount = billableMinutes * hourlyRate / 60`, `platformFee = totalAmount * commissionPct`.
    - Write `/payouts/{payoutId}` with `workerId`, `amount`, `status: 'PENDING'` after payment captured.

16. **Push notifications — minimal viable sender.**
    - New file `firebase/functions/src/notifications/send.ts`.
    - On job events (broadcast, accept, cancel, complete), look up FCM tokens from `/users/{uid}/devices` and send.
    - This is intentionally not the "fully featured notification system" — just enough so the loop is usable.

### Phase D — Storage consolidation (P1, after C is shipped)

17. **Move worker profile photos from Supabase to Firebase Storage.**
    - New upload path: signed-URL flow via a Firebase Function `getWorkerPhotoUploadUrl({ workerId })`.
    - One-time migration script copies any existing Supabase images to Firebase Storage and rewrites `photoUrl`.
    - Delete `backend/src/supabase/` module, `apps/mobile/src/services/supabase.ts`, NestJS `WorkersController` image endpoints.
    - Leave Firebase Storage rules (`firebase/storage.rules`) as the canonical ruleset; add the same MIME/size limits for `/workers/{id}/profile/*` (already exists).

18. **Decide NestJS fate.**
    - If everything Functions-driven → delete `backend/`.
    - If we want a long-running service for analytics / reporting → keep, but empty it of worker-image code and add a single new endpoint (TBD). Document the contract in `backend/README.md`.

### Phase E — Cleanup (P2, hygiene)

19. Update `README.md` phase table to reflect actual state. Bump "Next.js 14" to "Next.js 16".
20. Remove auto-generated `apps/web/AGENTS.md` and `apps/admin/AGENTS.md` from tracking.
21. Add a `docs/architecture.md` with: data model, status-enum reference, auth model, where the "source of truth" lives for each collection.
22. Add minimal tests: at least `submitRating`, `genUserId`/`genWorkerId`, the OTP verification function. (Skip e2e until post-launch.)

---

## 3. Risks & how to mitigate

- **OTP leakage via client SDK.** Mitigated by storing `jobs/{id}.otp` in a separate doc the client can't read; verify against it server-side.
- **Broadcast job starvation.** Mitigate with the 10-min `expiresAt` and a 1-min `FIRSTRESPONSE` deadline — auto-rebroadcast to next-nearest if no response.
- **Race in `respondToJobRequest`.** Use a Firestore transaction; double-check the status inside the transaction.
- **Existing data on the dev Firestore.** Phase B's migration script is idempotent and gated by feature flag (`migrations/{name}/enabled` doc) so it can be re-run.
- **Mobile app not in scope** (per A1) means Phase C ship the web loop first; mobile consumes the same Functions with no backend change.
- **Counter drift** if a Function instance crashes mid-transaction. Counter increment is the last step of the transaction; on retry the existing doc check prevents duplicates.

---

## 4. Validation plan (definition of done per phase)

- **Phase A:** `gitleaks` clean; manual attempt to use old key fails; new admin claims work; hardcoded email no longer auto-promoted.
- **Phase B:** TypeScript compile clean across all packages; only `packages/types/index.ts` declares the enums; a script `pnpm run check:enum-drift` (custom) verifies no surface redeclares them.
- **Phase C:** Manual end-to-end test passes:
  1. Worker A registers → admin approves → worker A goes online.
  2. Customer logs in → picks Worker A → submits job.
  3. Worker A receives push → accepts → OTP shown to customer.
  4. Customer shares OTP with Worker A → `verifyJobOTP` → timer starts.
  5. Worker A clicks "Complete" → billable time + amount shown.
  6. Customer pays via Razorpay test mode → payment doc written → status `COMPLETED`.
  7. Both parties rate each other.
- **Phase D:** Existing worker photos still resolve (now from Firebase Storage URL); NestJS `/api/v1/workers/profile/image` returns 404.
- **Phase E:** README matches reality; `docs/architecture.md` exists; tests pass in CI.

---

## 5. Out of scope (explicit)

- Native iOS / Android apps (placeholder `app/` and empty `mobile/*` stay as-is).
- Flutter migration (Phase 4 in README).
- Refund flow, dispute resolution, grievance flow (admin pages exist; data models not).
- Worker KYC document storage (storage rules exist; no upload UI/function).
- Category management / content management (admin pages exist; no CRUD).
- Analytics dashboard (admin page exists; no data wiring).
- Expanding beyond Uttarkashi.
- Multi-currency / internationalization.

---

## 6. Open questions (need user before implementation starts)

These were dismissed when I tried to ask them up front. Confirm or correct:

1. **Scope = P0 + core loop** (assumed). OK to skip storage/RBAC/notifications polish for v1?
2. **Job matching = broadcast + first-accept** (assumed). Or do you want customer-picks-from-list?
3. **Admin auth = Custom Claims** (assumed). Or keep Firestore `/admins` collection?
4. **Storage = Firebase Storage only** (assumed). Or keep Supabase for some assets?
5. **NestJS backend = delete** (assumed) or **keep empty** or **keep for new purpose** (which)?

If any of these is wrong, flag it; the plan updates accordingly.
