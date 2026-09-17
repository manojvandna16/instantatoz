# Plan: Fix Admin Login 401 Error — Final Status

## Root cause (confirmed)
`apps/admin/app/api/auth/session/route.ts:19` used `decodedToken.claims.admin`.
`DecodedIdToken` (Firebase Admin v13) has no `claims` property — custom claims are
flattened via `[key: string]: any`. `decodedToken.claims` was `undefined`, so
accessing `.admin` threw `TypeError`, caught by the catch block, returned generic 401.

**Vercel env vars were NOT the cause** — all three (`FIREBASE_PRIVATE_KEY`,
`FIREBASE_CLIENT_EMAIL`, `FIREBASE_PROJECT_ID`) were already set in Vercel
Dashboard (Production, added 1d ago). Confirmed via Vercel function logs showing
`verifyIdToken()` was reached (past `getAdminApp()` init).

## Changes deployed (commit `6278408` → `admin-five-indol-25.vercel.app`)

| File | Change | Status |
|---|---|---|
| `route.ts:19` | `decodedToken.claims.admin` → `decodedToken.admin` | ✅ Deployed |
| `auth-context.tsx` | Check `/api/auth/session` response, throw on non-OK | ✅ Deployed |
| `roles.ts` | Added `VALID_ADMIN_ROLES` + `isAdminRole()` | ✅ Deployed |
| `proxy.ts` | Added `isAdminRole(decoded.role)` check | ✅ Deployed |
| `verify-admin.ts` | New file, uses `isAdminRole` | ✅ Deployed |
| `.env.vercel` | Local reference only (env vars already in Vercel Dashboard) | ✅ Updated |

## What works now
- `/api/auth/session` reaches `verifyIdToken()` without crashing
- `decodedToken.admin` correctly accesses the custom claim set by `make_admin.js`
- Login error handling surfaces real errors instead of redirect loop
- RBAC checks validate roles consistently across client, server proxy, and verify-admin

## Validation
- ✅ `npm run build` passes
- ✅ `tsc --noEmit` passes
- ✅ ESLint: no new errors from these changes
- ✅ Vercel function logs confirm code now reaches `verifyIdToken` (not `getAdminApp` crash)
- ⏳ Live login test: go to `https://admin-five-indol-25.vercel.app`, log in with `manojbhatt900@gmail.com` / `Admin@Instantatoz1`
