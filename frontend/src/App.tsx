import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import HomePage from '@/pages/Home'
import BracketPage from '@/pages/Bracket'
import StandingsPage from '@/pages/Standings'
import SchedulePage from '@/pages/Schedule'
import KidsSchedulePage from '@/pages/KidsSchedule'
import AdminLogin from '@/pages/admin/Login'
import AdminDashboard from '@/pages/admin/Dashboard'
import AdminTeams from '@/pages/admin/Teams'
import AdminMedia from '@/pages/admin/Media'
import AdminLeagues from '@/pages/admin/Leagues'
import AdminLeagueDetail from '@/pages/admin/LeagueDetail'
import NotFound from '@/pages/NotFound'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }
  
  return <>{children}</>
}

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/standings" element={<StandingsPage />} />
      <Route path="/schedule" element={<SchedulePage />} />
      <Route path="/bracket" element={<BracketPage />} />
      <Route path="/kids-schedule" element={<KidsSchedulePage />} />

      {/* Admin */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/teams" element={<ProtectedRoute><AdminTeams /></ProtectedRoute>} />
      <Route path="/admin/matches" element={<Navigate to="/admin/leagues" replace />} />
      <Route path="/admin/leagues" element={<ProtectedRoute><AdminLeagues /></ProtectedRoute>} />
      <Route path="/admin/leagues/:id" element={<ProtectedRoute><AdminLeagueDetail /></ProtectedRoute>} />
      <Route path="/admin/media" element={<ProtectedRoute><AdminMedia /></ProtectedRoute>} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
