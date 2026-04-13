import { Routes, Route } from 'react-router-dom'
import RosterPage from '@/pages/RosterPage'
import ProfilePage from '@/pages/ProfilePage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RosterPage />} />
      <Route path="/contacts/:id" element={<ProfilePage />} />
    </Routes>
  )
}
