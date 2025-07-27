import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import PlayerDashboard from './pages/PlayerDashboard'
import StaffDashboard from './pages/StaffDashboard'
import AdminDashboard from './pages/AdminDashboard'
import GoogleDrivePage from './pages/GoogleDrivePage'
import Layout from './components/Layout'
import LoadingSpinner from './components/LoadingSpinner'
import Test from './pages/Test' // 👈 on ajoute ta page de test ici

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return <LoginPage />
  }

  const userRole = user.user_metadata?.role || 'player'

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route 
          path="/dashboard" 
          element={
            userRole === 'admin' ? <AdminDashboard /> :
            userRole === 'staff' ? <StaffDashboard /> :
            <PlayerDashboard />
          } 
        />
        <Route 
          path="/players" 
          element={
            (userRole === 'staff' || userRole === 'admin') ? 
            <StaffDashboard /> : 
            <Navigate to="/dashboard" replace />
          } 
        />
        <Route 
          path="/google-drive" 
          element={
            (userRole === 'staff' || userRole === 'admin') ? 
            <GoogleDrivePage /> : 
            <Navigate to="/dashboard" replace />
          } 
        />
        <Route 
          path="/files" 
          element={
            (userRole === 'staff' || userRole === 'admin') ? 
            <GoogleDrivePage /> : 
            <Navigate to="/dashboard" replace />
          } 
        />
        <Route 
          path="/admin" 
          element={
            userRole === 'admin' ? 
            <AdminDashboard /> : 
            <Navigate to="/dashboard" replace />
          } 
        />

        {/* ✅ Route temporaire de test Supabase */}
        <Route path="/test" element={<Test />} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  )
}

export default App
