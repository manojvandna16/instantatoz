# Plan: Add push notification UI controls to admin panel

## Current state
The API endpoint `/api/send-push` (route.ts) already supports:
- `targetUserType`: 'customer' | 'worker' (filter by user type)
- `imageUrl`: image attachment in notification
- `link`: deep-link URL on tap

BUT the admin UI at `apps/admin/app/dashboard/notifications/page.tsx` only sends:
```json
{ "targetUserId", "title", "body", "type": "ADMIN_BROADCAST" }
```

The "Send Push" modal has NO fields for `targetUserType`, `imageUrl`, or `link`. The user cannot access these new backend features from the UI.

## Changes needed

### File: `apps/admin/app/dashboard/notifications/page.tsx`

1. **Notification interface** — add `imageUrl?: string`, `link?: string`, `userType?: string | null`

2. **Send modal state** — add:
   - `targetUserType` state — `'all' | 'customer' | 'worker'`
   - `pushImageUrl` state — optional image URL
   - `pushLink` state — optional deep-link URL

3. **Send modal UI** — add three new inputs:
   - Select dropdown: "Target Audience" → ALL / Customers Only / Workers Only
   - Text input: "Image URL (optional)"
   - Text input: "Deep-link URL (optional)"

4. **handleSendPush** — include new fields in POST body:
   ```json
   {
     "targetUserId": "or-null",
     "targetUserType": "customer|worker",
     "title": "...",
     "body": "...",
     "imageUrl": "https://...",
     "link": "https://...",
     "type": "ADMIN_BROADCAST"
   }
   ```

5. **Reset form** — clear all new fields after successful send

6. **Detail view** — show `imageUrl` (as thumbnail) and `link` (as clickable link) if present on the notification

## Validation
1. `npx tsc --noEmit` in apps/admin — no type errors
2. `npm run build` in apps/admin — builds successfully
3. Redeploy to Vercel production
