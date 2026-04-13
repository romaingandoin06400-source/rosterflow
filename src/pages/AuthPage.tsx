import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export default function AuthPage() {
  const navigate = useNavigate()
  const { signIn, signUp, loading } = useAuthStore()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (mode === 'login') {
      const err = await signIn(email, password)
      if (err) setError(err)
      else navigate('/')
    } else {
      const err = await signUp(email, password)
      if (err) setError(err)
      else setSuccess('Check your email to confirm your account.')
    }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="mb-10 flex flex-col items-center gap-2">
        <div className="w-12 h-12 rounded-2xl bg-brand flex items-center justify-center shadow-glow">
          <span className="text-white font-bold text-xl">R</span>
        </div>
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">RosterFlow</h1>
        <p className="text-sm text-text-muted">Your Dating CRM, powered by AI</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-bg-card border border-bg-border rounded-2xl p-6 shadow-card">
        {/* Tab toggle */}
        <div className="flex bg-bg rounded-xl p-1 mb-6">
          {(['login', 'signup'] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(null); setSuccess(null) }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                mode === m
                  ? 'bg-bg-elevated text-text-primary'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {m === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-secondary">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="bg-bg border border-bg-border rounded-xl px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-secondary">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
              className="bg-bg border border-bg-border rounded-xl px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          {success && (
            <p className="text-xs text-accent-green bg-accent-green/10 border border-accent-green/20 rounded-lg px-3 py-2">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-brand hover:bg-brand-dark text-white text-sm font-semibold rounded-xl shadow-glow transition-colors disabled:opacity-50 mt-1"
          >
            {loading ? '...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>

      <p className="mt-6 text-xs text-text-muted text-center max-w-xs">
        By continuing you agree to our terms and privacy policy.
      </p>
    </div>
  )
}
