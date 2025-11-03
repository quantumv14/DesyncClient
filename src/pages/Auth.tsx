import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import './Auth.css'

export interface InventoryItem {
  id: number
  name: string
  type: 'invite' | 'reward' | 'badge'
  description: string
  expiresAt?: string
  createdAt: string
  used: boolean
  usedAt?: string
}

export interface User {
  uid: number
  email: string
  username: string
  password: string
  badge: 'Owner' | 'Admin' | 'Moderator' | 'Support' | 'Premium' | 'Known' | 'Member'
  joinDate: string
  lastSeen: string
  ipAddress: string
  messages: number
  reactionScore: number
  points: number
  banned: boolean
  banReason?: string
  bannedAt?: string
  bannedBy?: number
  aboutMe?: string
  inventory: InventoryItem[]
}

interface AuthProps {
  onBack: () => void
  onLogin: (user: User) => void
}

function Auth({ onBack, onLogin }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    invitationCode: ''
  })
  const [error, setError] = useState('')
  const [bannedInfo, setBannedInfo] = useState({ show: false, reason: '' })

  const validateEmail = (email: string): boolean => {
    const allowedDomains = ['@gmail.com', '@hotmail.com', '@outlook.com']
    return allowedDomains.some(domain => email.toLowerCase().endsWith(domain))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate email domain
    if (!validateEmail(formData.email)) {
      setError('Email must be from Gmail, Hotmail, or Outlook')
      return
    }

    try {
      if (isLogin) {
        const result = await api.login(formData.email, formData.password)
        if (result.success && result.user && result.token) {
          // Store JWT token in localStorage
          localStorage.setItem('token', result.token)
          onLogin(result.user)
        } else if (result.user && result.user.banned) {
          setBannedInfo({ show: true, reason: result.user.banReason || 'No reason provided' })
        } else {
          setError(result.message || 'Invalid email or password')
        }
      } else {
        const result = await api.register(
          formData.email,
          formData.username,
          formData.password,
          formData.invitationCode
        )
        if (result.success && result.user && result.token) {
          // Store JWT token in localStorage
          localStorage.setItem('token', result.token)
          onLogin(result.user)
        } else {
          setError(result.message || 'Registration failed')
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error)
      if (error.message && error.message.includes('Account is banned')) {
        // Try to parse the error response to get ban details
        try {
          const errorResponse = JSON.parse(error.message.split(' - ')[1] || '{}')
          const banReason = errorResponse.user?.banReason || 'No reason provided'
          setBannedInfo({ show: true, reason: banReason })
        } catch {
          setBannedInfo({ show: true, reason: 'Your account has been banned. Contact support for more information.' })
        }
        return
      } else if (error.message && error.message.includes('409')) {
        setError('Email or username already exists')
      } else if (error.message && error.message.includes('400')) {
        setError('Invalid invitation code or missing information')
      } else {
        setError('Network error. Please try again.')
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="auth-page">
      <nav className="navbar">
        <div className="nav-links">
          <Link to="/" className="nav-link">HOME</Link>
          <a href="/#features" className="nav-link">FEATURES</a>
          <a href="/#download" className="nav-link">DOWNLOAD</a>
          <a href="https://discord.gg/desync" className="nav-link" target="_blank" rel="noopener noreferrer">DISCORD</a>
        </div>
        <div className="nav-auth">
          <a href="#" onClick={() => setIsLogin(true)} className="nav-link">Log in</a>
          <a href="#" onClick={() => setIsLogin(false)} className="nav-link">Register</a>
        </div>
      </nav>

      <div className="auth-container">
        <div className="auth-box">
          <h1 className="auth-title">{isLogin ? 'LOGIN' : 'REGISTER'}</h1>
          <p className="auth-subtitle">
            {isLogin ? 'Access your DESYNC account' : 'Create your DESYNC account'}
          </p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">EMAIL</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your email"
                required
              />
            </div>

            {!isLogin && (
              <div className="form-group">
                <label htmlFor="username" className="form-label">USERNAME</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Choose a username"
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="password" className="form-label">PASSWORD</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your password"
                required
              />
            </div>

            {!isLogin && (
              <div className="form-group">
                <label htmlFor="invitationCode" className="form-label">INVITATION CODE</label>
                <input
                  type="text"
                  id="invitationCode"
                  name="invitationCode"
                  value={formData.invitationCode}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter invitation code"
                  required
                />
              </div>
            )}

            <button type="submit" className="btn btn-primary auth-submit">
              {isLogin ? 'LOGIN' : 'CREATE ACCOUNT'}
            </button>
          </form>

          <div className="auth-switch">
            {isLogin ? (
              <p>
                Don't have an account?{' '}
                <a href="#" onClick={() => setIsLogin(false)} className="auth-link">
                  Register here
                </a>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <a href="#" onClick={() => setIsLogin(true)} className="auth-link">
                  Login here
                </a>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Banned User Modal */}
      {bannedInfo.show && (
        <div className="modal-overlay" onClick={() => setBannedInfo({ show: false, reason: '' })}>
          <div className="modal-content banned-modal" onClick={(e) => e.stopPropagation()}>
            <div className="banned-icon">🚫</div>
            <h2 className="banned-title">ACCOUNT BANNED</h2>
            <p className="banned-message">Your account has been permanently banned from Desync.</p>
            <div className="banned-reason-box">
              <div className="banned-reason-label">REASON:</div>
              <div className="banned-reason-text">{bannedInfo.reason}</div>
            </div>
            <button onClick={() => setBannedInfo({ show: false, reason: '' })} className="btn-close-banned">
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Auth
