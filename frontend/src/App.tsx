import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import HomePage from '@/pages/Home'
import LiveScoresPage from '@/pages/LiveScores'
import BracketPage from '@/pages/Bracket'
import AdminLogin from '@/pages/admin/Login'
import AdminDashboard from '@/pages/admin/Dashboard'
import AdminTeams from '@/pages/admin/Teams'
import AdminMatches from '@/pages/admin/Matches'
import AdminMedia from '@/pages/admin/Media'

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
      <Route path="/" element={<HomePage />} />
      <Route path="/live-scores" element={<LiveScoresPage />} />
      <Route path="/bracket" element={<BracketPage />} />
      
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/teams"
        element={
          <ProtectedRoute>
            <AdminTeams />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/matches"
        element={
          <ProtectedRoute>
            <AdminMatches />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/media"
        element={
          <ProtectedRoute>
            <AdminMedia />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
