# RosterFlow – Project Memory

## Project Overview
RosterFlow is a Dating CRM with AI features, built as a PWA.
- **Stack**: React 19, TypeScript, Vite, Tailwind CSS, Zustand, Supabase, Stripe, xAI Grok

## Architecture

```
Frontend (Vercel)           Backend (Supabase)
├─ React 19 + Vite         ├─ PostgreSQL
├─ Tailwind dark UI        ├─ Auth (JWT)
├─ Zustand store           ├─ Edge Functions
├─ PWA (vite-plugin-pwa)   │   ├─ grok-supervisor
└─ Stripe.js               │   ├─ stripe-checkout
                           │   ├─ stripe-webhook
                           │   └─ stripe-portal
```

## Key Files
- `vite.config.ts` – Vite + PWA config, path alias `@` → `src/`
- `tailwind.config.ts` – Tailwind configuration
- `.env.example` – Required environment variables
- `DEPLOY.md` – Full deployment guide

## Environment Variables
| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `VITE_STRIPE_PUBLIC_KEY` | Stripe public key |
| `VITE_STRIPE_PRICE_BASIC` | Stripe price ID for Basic plan (7.99€/mo) |
| `VITE_STRIPE_PRICE_PREMIUM` | Stripe price ID for Premium plan (9.99€/mo) |
| `VITE_STRIPE_PRICE_ANNUAL` | Stripe price ID for Annual Pro plan (99.99€/yr) |

## Development
```bash
cp .env.example .env   # fill in your keys
npm install
npm run dev            # Vite dev server
npm run build          # tsc + vite build
```

## Supabase Edge Functions
Deployed via `npx supabase functions deploy <name>`. Secrets set in Supabase dashboard (not in .env):
- `GROK_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_*`

## Coding Conventions
- Path alias `@/` maps to `src/`
- UI components via Radix UI primitives + Tailwind
- State management: Zustand
- Dark theme throughout
