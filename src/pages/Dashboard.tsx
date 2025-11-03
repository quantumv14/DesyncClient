import type { User } from './Auth'
import ServerStatus from '../components/ServerStatus'
import './Dashboard.css'

interface DashboardProps {
  user: User
  onLogout: () => void
  onAdminPanel: () => void
  onForum?: () => void
}

function Dashboard({ user, onLogout, onAdminPanel, onForum }: DashboardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="dashboard-page">
      <nav className="navbar">
        <div className="nav-links">
          <a href="#" className="nav-link active">DASHBOARD</a>
          <a href="#" className="nav-link">DOWNLOAD</a>
          <a href="#" onClick={onForum} className="nav-link">FORUMS</a>
          <ServerStatus />
          <a href="#" className="nav-link">DISCORD</a>
        </div>
        <div className="nav-auth">
          <span className="nav-user">{user.username}</span>
          {user.badge === 'Owner' && (
            <a href="#" onClick={onAdminPanel} className="nav-link">ADMIN PANEL</a>
          )}
          <a href="#" onClick={onLogout} className="nav-link">LOG OUT</a>
        </div>
      </nav>

      <div className="dashboard-container">
        <div className="profile-section">
          <div className="profile-header">
            <div className="profile-avatar">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="profile-info">
              <h1 className="profile-username">{user.username}</h1>
              <span className={`profile-badge badge-${user.badge.toLowerCase()}`}>
                {user.badge}
              </span>
            </div>
          </div>

          <div className="profile-stats">
            <div className="stat-card">
              <div className="stat-label">USER ID</div>
              <div className="stat-value">#{user.uid}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">JOINED</div>
              <div className="stat-value">{formatDate(user.joinDate)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">LAST SEEN</div>
              <div className="stat-value">{formatDate(user.lastSeen)}</div>
            </div>
          </div>

          <div className="profile-details">
            <div className="detail-row">
              <span className="detail-label">EMAIL</span>
              <span className="detail-value">{user.email}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">STATUS</span>
              <span className="detail-value status-active">● ACTIVE</span>
            </div>
          </div>
        </div>

        <div className="content-section">
          <h2 className="section-title">WELCOME TO DESYNC</h2>
          <p className="section-description">
            Your account is active and ready to use. Download the latest version of DESYNC to get started.
          </p>

          <div className="action-cards">
            <div className="action-card">
              <div className="action-icon">⬇️</div>
              <h3 className="action-title">Download Client</h3>
              <p className="action-description">Get the latest version of DESYNC movement cheat</p>
              <button className="btn btn-primary">DOWNLOAD</button>
            </div>

            <div className="action-card">
              <div className="action-icon">📖</div>
              <h3 className="action-title">Documentation</h3>
              <p className="action-description">Learn how to use DESYNC features effectively</p>
              <button className="btn btn-secondary">READ DOCS</button>
            </div>

            <div className="action-card">
              <div className="action-icon">💬</div>
              <h3 className="action-title">Join Discord</h3>
              <p className="action-description">Connect with the community and get support</p>
              <button className="btn btn-secondary">JOIN NOW</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
