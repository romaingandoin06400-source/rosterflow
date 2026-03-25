# 🚀 Déploiement RosterFlow en 5 minutes

## Prérequis
- Compte [Supabase](https://supabase.com) (gratuit)
- Compte [Vercel](https://vercel.com) (gratuit)
- Compte [Stripe](https://stripe.com) (sandbox d'abord)
- Clé API [xAI Grok](https://console.x.ai)

---

## 1. Supabase Setup (2 min)

```bash
# 1. Crée un nouveau projet sur supabase.com
# 2. Dans SQL Editor, colle le contenu de supabase/migrations/001_initial.sql
# 3. Récupère tes clés : Settings > API
#    - Project URL → VITE_SUPABASE_URL
#    - anon public → VITE_SUPABASE_ANON_KEY
#    - service_role (secret) → pour les Edge Functions

# 4. Deploy les Edge Functions
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase functions deploy grok-supervisor
npx supabase functions deploy stripe-checkout
npx supabase functions deploy stripe-webhook
npx supabase functions deploy stripe-portal

# 5. Set secrets Edge Functions (Supabase Dashboard > Edge Functions > Secrets)
GROK_API_KEY=xai-votre-cle
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_BASIC=price_...
STRIPE_PRICE_PREMIUM=price_...
STRIPE_PRICE_ANNUAL=price_...
```

---

## 2. Stripe Setup (1 min)

```
1. Créer 3 produits dans Stripe Dashboard :
   - Basic       → 7,99€/mois   → copie price_id → VITE_STRIPE_PRICE_BASIC
   - Premium     → 9,99€/mois   → copie price_id → VITE_STRIPE_PRICE_PREMIUM
   - Annual Pro  → 99,99€/an    → copie price_id → VITE_STRIPE_PRICE_ANNUAL

2. Webhook : Stripe Dashboard > Developers > Webhooks
   URL: https://YOUR_PROJECT.supabase.co/functions/v1/stripe-webhook
   Events: customer.subscription.created/updated/deleted
```

---

## 3. Vercel Deploy (1 min)

```bash
# Option A : CLI
npm install -g vercel
vercel --prod

# Option B : GitHub → vercel.com → Import repo

# Variables d'environnement Vercel :
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_STRIPE_PUBLIC_KEY=
VITE_STRIPE_PRICE_BASIC=
VITE_STRIPE_PRICE_PREMIUM=
VITE_STRIPE_PRICE_ANNUAL=
```

---

## 4. Config locale (30 sec)

```bash
cp .env.example .env
# Remplis .env avec tes clés
npm install
npm run dev
```

---

## 5. Activer l'auth Supabase

Dans `src/pages/Auth.tsx`, remplace `handleAuth()` par :
```typescript
const { error } = await supabase.auth.signInWithPassword({ email, password })
// ou pour signup:
const { error } = await supabase.auth.signUp({ email, password })
```

---

## Architecture finale

```
Frontend (Vercel)           Backend (Supabase)
├─ React 19 + Vite         ├─ PostgreSQL (contacts, messages, profiles)
├─ Tailwind dark UI        ├─ Auth (JWT)
├─ Zustand store           ├─ Edge Functions
├─ PWA installable         │   ├─ grok-supervisor (Grok 4.1 Fast)
└─ Stripe.js               │   ├─ stripe-checkout
                           │   ├─ stripe-webhook
                           │   └─ stripe-portal
                           └─ Realtime (optionnel)
```

## Stack des coûts (prod)
- Supabase Free: 0€/mois (500MB DB, 500K edge fn calls)
- Vercel Free: 0€/mois (100GB bandwidth)  
- Grok API: ~$0.0002/token → ≈ 0,01€/user actif/jour
- Stripe: 1,4% + 0,25€ par transaction (EU)

**Break-even : ~10 abonnés Basic couvre l'infra complète.**
