# Plan: Fix admin custom claim access in session route

## Root cause confirmed
`apps/admin/node_modules/firebase-admin/lib/auth/token-verifier.d.ts` shows `DecodedIdToken` has no `claims` property. Custom claims are flattened into the decoded token object via `[key: string]: any`.

Current code in `apps/admin/app/api/auth/session/route.ts:19-20`:
```typescript
const claims = decodedToken.claims;
if (claims.admin !== true) {
```

At runtime `decodedToken.claims` is `undefined`, so `claims.admin` throws `TypeError`. The catch block catches it and returns generic 401, which surfaces as the login failure.

## Fix
Replace lines 19-20 with direct claim access:
```typescript
if (decodedToken.admin !== true) {
```

Remove the unused `claims` variable.

## Scope
- Only `apps/admin/app/api/auth/session/route.ts` is modified.
- No Firebase config changes.
- No auth-context changes.
- No Firestore changes.
- No Vercel env changes.

## Validation
1. Run `npm run lint` in `apps/admin`.
2. Run `npm run build` in `apps/admin` or verify `next build` succeeds.
3. Confirm the route still returns 403 for non-admin and sets session cookie for admin.
