import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (initialized && !user) navigate('/auth', { replace: true })
  }, [user, initialized, navigate])

  if (!initialized) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-brand border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!user) return null

  return <>{children}</>
}
