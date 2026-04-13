import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import AuthGuard from '@/components/AuthGuard'
import AuthPage from '@/pages/AuthPage'
import RosterPage from '@/pages/RosterPage'
import ProfilePage from '@/pages/ProfilePage'
import PricingPage from '@/pages/PricingPage'
import AccountPage from '@/pages/AccountPage'

export default function App() {
  const initialize = useAuthStore((s) => s.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route
        path="/"
        element={
          <AuthGuard>
            <RosterPage />
          </AuthGuard>
        }
      />
      <Route
        path="/contacts/:id"
        element={
          <AuthGuard>
            <ProfilePage />
          </AuthGuard>
        }
      />
      <Route
        path="/pricing"
        element={
          <AuthGuard>
            <PricingPage />
          </AuthGuard>
        }
      />
      <Route
        path="/account"
        element={
          <AuthGuard>
            <AccountPage />
          </AuthGuard>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
