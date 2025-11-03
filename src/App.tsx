import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useParams, useLocation } from 'react-router-dom'
import Landing from './pages/Landing'
import Auth, { type User } from './pages/Auth'
import Dashboard from './pages/Dashboard'
import AdminPanel from './pages/AdminPanel'
import Forum from './pages/Forum'
import UserProfile from './pages/UserProfile'
import ThreadView from './pages/ThreadView'
import CreateThread from './pages/CreateThread'
import ProfileSettings from './pages/ProfileSettings'
import './App.css'
import { api } from './api/client'

type Page = 'landing' | 'auth' | 'dashboard' | 'admin' | 'forum' | 'profile' | 'thread' | 'create-thread' | 'settings'

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Something went wrong</h2>
          <button onClick={() => window.location.reload()}>Refresh Page</button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper component to handle routing logic
function AppContent() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation()

  // Clear error and scroll to top when route changes
  useEffect(() => {
    setError(null);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  const handleGetDesync = () => {
    navigate('/auth')
  }

  const handleBackToLanding = () => {
    navigate('/')
    setCurrentUser(null)
  }

  const handleLogin = (user: User) => {
    setCurrentUser(user)
    navigate('/forum')
  }

  const handleLogout = () => {
    // Clear JWT token from localStorage
    localStorage.removeItem('token')
    setCurrentUser(null)
    navigate('/')
  }

  // Check for stored token on app load
  useEffect(() => {
    const checkStoredToken = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const response = await api.verifyToken(token)
          if (response.success && response.user) {
            setCurrentUser(response.user)
            navigate('/forum')
          } else {
            // Invalid token, remove it
            localStorage.removeItem('token')
          }
        } catch (error) {
          console.error('Token verification failed:', error)
          localStorage.removeItem('token')
        }
      }
      setIsLoading(false)
    }

    checkStoredToken()
  }, [])

  const handleAdminPanel = () => {
    navigate('/admin')
  }

  const handleBackToDashboard = () => {
    navigate('/dashboard')
  }

  const handleForum = () => {
    navigate('/forum')
  }

  const handleProfile = (userId?: number) => {
    const id = userId || currentUser?.uid || 1
    navigate(`/profile/${id}`)
  }

  const handleThread = (threadId: number) => {
    navigate(`/thread/${threadId}`)
  }

  const handleBackToForum = () => {
    navigate('/forum')
  }

  const handleCreateThread = () => {
    navigate('/create-thread')
  }

  const handleSettings = () => {
    navigate('/settings')
  }

  // Show error message if any
  if (error) {
    if (isLoading) {
      return (
        <div className="App">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>
            Loading...
          </div>
        </div>
      )
    }

    return (
      <div className="App">
        <div className="error-screen">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => setError(null)}>Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Landing onGetDesync={handleGetDesync} />} />
          <Route path="/auth" element={<Auth onLogin={handleLogin} onBack={handleBackToLanding} />} />
          <Route path="/dashboard" element={
            currentUser ? (
              <Dashboard
                user={currentUser}
                onLogout={handleLogout}
                onAdminPanel={handleAdminPanel}
                onForum={handleForum}
              />
            ) : (
              <Navigate to="/auth" replace />
            )
          } />
          <Route path="/admin" element={
            currentUser ? (
              <AdminPanel
                user={currentUser}
                onBack={handleBackToDashboard}
                onLogout={handleLogout}
              />
            ) : (
              <Navigate to="/auth" replace />
            )
          } />
          <Route path="/forum" element={
            currentUser ? (
              <Forum
                user={currentUser}
                onLogout={handleLogout}
                onProfile={handleProfile}
                onThread={handleThread}
                onAdminPanel={handleAdminPanel}
                onCreateThread={handleCreateThread}
              />
            ) : (
              <Navigate to="/auth" replace />
            )
          } />
          <Route path="/profile/:userId" element={
            currentUser ? (
              <UserProfile
                user={currentUser}
                onBack={handleBackToForum}
                onLogout={handleLogout}
                onAdminPanel={handleAdminPanel}
                onSettings={handleSettings}
              />
            ) : (
              <Navigate to="/auth" replace />
            )
          } />
          <Route path="/thread/:threadId" element={
            currentUser ? (
              <ThreadRoute
                user={currentUser}
                onBack={handleBackToForum}
                onLogout={handleLogout}
                onProfile={handleProfile}
                onAdminPanel={handleAdminPanel}
              />
            ) : (
              <Navigate to="/auth" replace />
            )
          } />
          <Route path="/create-thread" element={
            currentUser ? (
              <CreateThread
                user={currentUser}
                onBack={handleBackToForum}
                onLogout={handleLogout}
                onThreadCreated={handleThread}
                onAdminPanel={handleAdminPanel}
              />
            ) : (
              <Navigate to="/auth" replace />
            )
          } />
          <Route path="/settings" element={
            currentUser ? (
              <ProfileSettings
                user={currentUser}
                onBack={handleProfile}
                onLogout={handleLogout}
                onAdminPanel={handleAdminPanel}
              />
            ) : (
              <Navigate to="/auth" replace />
            )
          } />
        </Routes>
      </ErrorBoundary>
    </div>
  )
}

// Route components to handle URL parameters
function ThreadRoute({ user, onBack, onLogout, onProfile, onAdminPanel }: {
  user: User
  onBack: () => void
  onLogout: () => void
  onProfile: (userId?: number) => void
  onAdminPanel?: () => void
}) {
  const { threadId } = useParams<{ threadId: string }>()
  const threadIdNum = threadId ? parseInt(threadId, 10) : 0
  
  return (
    <ThreadView
      user={user}
      threadId={threadIdNum}
      onBack={onBack}
      onLogout={onLogout}
      onProfile={onProfile}
      onAdminPanel={onAdminPanel}
    />
  )
}

// Main App component with Router
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
