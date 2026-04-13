import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ArrowLeft, Zap } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)

const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: '7.99',
    period: 'month',
    priceEnvKey: 'VITE_STRIPE_PRICE_BASIC',
    description: 'Perfect to get started',
    features: ['Up to 50 contacts', 'Grid, Kanban & List views', 'Contact profiles', 'Manual notes'],
    highlight: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '9.99',
    period: 'month',
    priceEnvKey: 'VITE_STRIPE_PRICE_PREMIUM',
    description: 'For serious daters',
    features: ['Unlimited contacts', 'Everything in Basic', 'AI relationship summaries', 'Priority support'],
    highlight: true,
  },
  {
    id: 'annual',
    name: 'Annual Pro',
    price: '99.99',
    period: 'year',
    priceEnvKey: 'VITE_STRIPE_PRICE_ANNUAL',
    description: 'Best value — 2 months free',
    features: ['Everything in Premium', 'Annual billing (save 16%)', 'Early access to new features'],
    highlight: false,
  },
]

const PRICE_IDS: Record<string, string> = {
  VITE_STRIPE_PRICE_BASIC: import.meta.env.VITE_STRIPE_PRICE_BASIC,
  VITE_STRIPE_PRICE_PREMIUM: import.meta.env.VITE_STRIPE_PRICE_PREMIUM,
  VITE_STRIPE_PRICE_ANNUAL: import.meta.env.VITE_STRIPE_PRICE_ANNUAL,
}

export default function PricingPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  const handleSubscribe = async (plan: typeof PLANS[number]) => {
    if (!user) { navigate('/auth'); return }
    setLoadingPlan(plan.id)

    const priceId = PRICE_IDS[plan.priceEnvKey]
    const { data, error } = await supabase.functions.invoke('stripe-checkout', {
      body: { price_id: priceId },
    })

    if (error || !data?.url) {
      setLoadingPlan(null)
      return
    }

    const stripe = await stripePromise
    if (data.session_id) {
      await stripe?.redirectToCheckout({ sessionId: data.session_id })
    } else {
      window.location.href = data.url
    }
    setLoadingPlan(null)
  }

  return (
    <div className="min-h-screen bg-bg px-4 py-8">
      {/* Back */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-text-muted hover:text-text-secondary transition-colors mb-8 text-sm"
      >
        <ArrowLeft size={16} />
        Back to roster
      </button>

      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-brand/10 border border-brand/20 rounded-full px-3 py-1 mb-4">
          <Zap size={12} className="text-brand" />
          <span className="text-xs font-medium text-brand">Upgrade your game</span>
        </div>
        <h1 className="text-3xl font-semibold text-text-primary mb-2">Simple pricing</h1>
        <p className="text-text-secondary text-sm">Cancel anytime. No hidden fees.</p>
      </div>

      {/* Plans */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative flex flex-col rounded-2xl border p-6 ${
              plan.highlight
                ? 'bg-bg-elevated border-brand/40 shadow-glow'
                : 'bg-bg-card border-bg-border'
            }`}
          >
            {plan.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand text-white text-xs font-semibold px-3 py-1 rounded-full shadow-glow">
                Most Popular
              </div>
            )}

            <div className="mb-5">
              <h2 className="text-base font-semibold text-text-primary mb-1">{plan.name}</h2>
              <p className="text-xs text-text-muted mb-3">{plan.description}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-text-primary">{plan.price}€</span>
                <span className="text-text-muted text-sm">/{plan.period}</span>
              </div>
            </div>

            <ul className="flex flex-col gap-2.5 mb-6 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-text-secondary">
                  <Check size={14} className="text-accent-green mt-0.5 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(plan)}
              disabled={loadingPlan === plan.id}
              className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 ${
                plan.highlight
                  ? 'bg-brand hover:bg-brand-dark text-white shadow-glow'
                  : 'bg-bg border border-bg-border text-text-primary hover:bg-bg-elevated'
              }`}
            >
              {loadingPlan === plan.id ? 'Redirecting...' : 'Get started'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
