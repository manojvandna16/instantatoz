# Instantatoz — Official Platform

**On-Demand Hourly Workforce & Local Services Marketplace**  
🌐 https://instantatoz.online  
📧 support@instantatoz.online

---

## Project Structure

```
instantatoz/
├── apps/
│   ├── web/          ← Public website (Next.js 14)
│   └── admin/        ← Admin panel (Next.js 14) [Phase 6]
├── mobile/
│   ├── user-app/     ← Instantatoz User App (Flutter) [Phase 4]
│   └── worker-app/   ← Instantatoz Worker App (Flutter) [Phase 4]
├── backend/          ← NestJS API [Phase 2]
├── firebase/         ← Firebase config, rules, functions
├── packages/
│   ├── types/        ← Shared TypeScript types
│   └── config/       ← Shared configuration
├── docs/             ← Architecture documentation
├── .env.example      ← Environment variable template
├── firebase.json     ← Firebase hosting config
└── .firebaserc       ← Firebase project config
```

---

## Development Phases

| Phase | Component | Status |
|-------|-----------|--------|
| 1 | Public Website | ✅ Active |
| 2 | Firebase + Backend API | 🔜 Next |
| 3 | Worker Registration + Job Matching | 🔜 Planned |
| 4 | Flutter Mobile Apps | 🔜 Planned |
| 5 | Payment Gateway Integration | 🔜 Planned |
| 6 | Admin Panel | 🔜 Planned |
| 7 | Testing + Production Deployment | 🔜 Planned |

---

## Quick Start — Website

```bash
cd apps/web
npm install
cp ../../.env.example .env.local
# Fill in your values in .env.local
npm run dev
```

Visit: http://localhost:3000

## Build for Production

```bash
cd apps/web
npm run build
npm start
```

## Firebase Deployment

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Deploy website
firebase deploy --only hosting
```

---

## Environment Setup

Copy `.env.example` to `.env.local` in `apps/web/`:

```bash
cp .env.example apps/web/.env.local
```

Required variables (minimum for website):
- `NEXT_PUBLIC_APP_URL` — Your domain
- `NEXT_PUBLIC_SUPPORT_EMAIL` — Support email
- Firebase config variables (from Firebase Console)

---

## Legal Disclaimer

All legal pages on this website are editable templates.  
They must be reviewed by a qualified Indian legal professional before production launch.  
Payment gateway integration is not active until merchant onboarding is complete.

---

## License

Copyright © 2024 Instantatoz. All rights reserved.
