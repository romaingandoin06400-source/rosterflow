import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CreditCard, LogOut, User } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'

interface Subscription {
  plan: string
  status: string
  current_period_end: string | null
}

export default function AccountPage() {
  const navigate = useNavigate()
  const { user, signOut } = useAuthStore()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loadingSub, setLoadingSub] = useState(true)
  const [loadingPortal, setLoadingPortal] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase
      .from('subscriptions')
      .select('plan, status, current_period_end')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        setSubscription(data)
        setLoadingSub(false)
      })
  }, [user])

  const handlePortal = async () => {
    setLoadingPortal(true)
    const { data, error } = await supabase.functions.invoke('stripe-portal', {})
    if (!error && data?.url) window.location.href = data.url
    setLoadingPortal(false)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
  }

  const planLabel = subscription?.plan
    ? subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)
    : 'Free'

  const statusColor =
    subscription?.status === 'active'
      ? 'text-accent-green bg-accent-green/10'
      : 'text-text-muted bg-white/5'

  return (
    <div className="min-h-screen bg-bg px-4 py-6">
      <header className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate('/')} className="text-text-muted hover:text-text-secondary transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-semibold text-text-primary">Account</h1>
      </header>

      <div className="max-w-sm mx-auto flex flex-col gap-4">
        {/* Profile */}
        <section className="bg-bg-card border border-bg-border rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center">
              <User size={16} className="text-brand" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">{user?.email}</p>
              <p className="text-xs text-text-muted">Joined {user ? new Date(user.created_at).toLocaleDateString() : ''}</p>
            </div>
          </div>
        </section>

        {/* Subscription */}
        <section className="bg-bg-card border border-bg-border rounded-2xl p-5">
          <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">Subscription</h2>
          {loadingSub ? (
            <div className="h-8 bg-white/5 rounded-lg animate-pulse" />
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-text-primary">{planLabel} Plan</p>
                {subscription?.current_period_end && (
                  <p className="text-xs text-text-muted mt-0.5">
                    Renews {new Date(subscription.current_period_end).toLocaleDateString()}
                  </p>
                )}
              </div>
              {subscription?.status && (
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor}`}>
                  {subscription.status}
                </span>
              )}
            </div>
          )}

          <div className="mt-4 flex flex-col gap-2">
            {!subscription || subscription.status !== 'active' ? (
              <button
                onClick={() => navigate('/pricing')}
                className="w-full py-2.5 bg-brand hover:bg-brand-dark text-white text-sm font-semibold rounded-xl shadow-glow transition-colors"
              >
                Upgrade Plan
              </button>
            ) : (
              <button
                onClick={handlePortal}
                disabled={loadingPortal}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-bg border border-bg-border text-text-primary text-sm font-medium rounded-xl hover:bg-bg-elevated transition-colors disabled:opacity-50"
              >
                <CreditCard size={14} />
                {loadingPortal ? 'Opening...' : 'Manage Billing'}
              </button>
            )}
          </div>
        </section>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="flex items-center justify-center gap-2 w-full py-2.5 text-sm text-red-400/70 hover:text-red-400 border border-red-400/10 hover:border-red-400/30 rounded-xl transition-colors"
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </div>
  )
}
