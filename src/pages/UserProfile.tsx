import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ServerStatus from '../components/ServerStatus'
import type { User } from './Auth'
import './UserProfile.css'

interface UserProfileProps {
  user: User
  onBack: () => void
  onLogout: () => void
  onAdminPanel?: () => void
  onSettings?: () => void
}

type ProfileTab = 'posts' | 'activity' | 'postings' | 'about'

function UserProfile({ user, onBack, onLogout, onAdminPanel, onSettings }: UserProfileProps) {
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts')

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="profile-page">
      <nav className="navbar">
        <div className="nav-links">
          <Link to="/" className="nav-link">HOME</Link>
          <Link to="/forum" className="nav-link">FORUMS</Link>
          <a href="#store" className="nav-link">STORE</a>
          <ServerStatus />
          <a href="https://discord.gg/desync" className="nav-link" target="_blank" rel="noopener noreferrer">DISCORD</a>
        </div>
        <div className="nav-auth">
          <div className="nav-user-menu">
            <div className="nav-avatar">{user.username.charAt(0)}</div>
            <span className="nav-username">{user.username}</span>
          </div>
          {(user.badge === 'Owner' || user.badge === 'Admin') && onAdminPanel && (
            <Link to="/admin" className="nav-link">ADMIN PANEL</Link>
          )}
          <Link to="/settings" className="nav-link">SETTINGS</Link>
          <button onClick={onLogout} className="nav-link nav-button">LOG OUT</button>
        </div>
      </nav>

      <div className="profile-container">
        <div className="profile-header-section">
          <div className="profile-avatar-large">{user.username.charAt(0)}</div>
          <div className="profile-header-info">
            <h1 className="profile-username">{user.username}</h1>
            <span className={`profile-badge badge-${user.badge.toLowerCase()}`}>
              {user.badge}
            </span>
            <div className="profile-meta">
              <span>Joined: {formatDate(user.joinDate)}</span>
              <span>Last seen: A moment ago</span>
              <span>Viewing member profile {user.username}</span>
            </div>
          </div>
        </div>

        <div className="profile-tabs">
          <button 
            className={`profile-tab ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            Profile posts
          </button>
          <button 
            className={`profile-tab ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            Latest activity
          </button>
          <button 
            className={`profile-tab ${activeTab === 'postings' ? 'active' : ''}`}
            onClick={() => setActiveTab('postings')}
          >
            Postings
          </button>
          <button 
            className={`profile-tab ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            About
          </button>
        </div>

        <div className="profile-content">
          <div className="profile-main">
            {activeTab === 'posts' && (
              <>
                <div className="profile-stats-grid">
                  <div className="stat-box">
                    <div className="stat-label">Messages</div>
                    <div className="stat-value">{user.messages}</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-label">Reaction score</div>
                    <div className="stat-value">{user.reactionScore}</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-label">Points</div>
                    <div className="stat-value">{user.points}</div>
                  </div>
                </div>

                <div className="profile-status-box">
                  <div className="status-avatar">{user.username.charAt(0)}</div>
                  <input
                    type="text"
                    className="status-input"
                    placeholder="Update your status..."
                    readOnly
                  />
                </div>

                <div className="profile-empty-state">
                  <p>There are no messages on {user.username}'s profile yet.</p>
                </div>
              </>
            )}

            {activeTab === 'activity' && (
              <div className="activity-section">
                <h3 className="section-title">Latest Activity</h3>
                <div className="activity-list">
                  <div className="activity-item">
                    <div className="activity-icon">💬</div>
                    <div className="activity-content">
                      <p className="activity-text">
                        <strong>{user.username}</strong> posted in <a href="#">General Discussion</a>
                      </p>
                      <p className="activity-time">{formatDateTime(user.lastSeen)}</p>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon">👍</div>
                    <div className="activity-content">
                      <p className="activity-text">
                        <strong>{user.username}</strong> received a reaction
                      </p>
                      <p className="activity-time">{formatDateTime(user.lastSeen)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'postings' && (
              <div className="postings-section">
                <h3 className="section-title">Forum Postings</h3>
                <div className="stats-grid">
                  <div className="stat-box">
                    <div className="stat-label">Total Messages</div>
                    <div className="stat-value">{user.messages}</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-label">Threads Started</div>
                    <div className="stat-value">0</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-label">Replies Posted</div>
                    <div className="stat-value">{user.messages}</div>
                  </div>
                </div>
                <div className="empty-state">
                  <p>No recent postings to display</p>
                </div>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="about-section">
                <h3 className="section-title">About {user.username}</h3>
                
                <div className="about-info">
                  <h4 className="info-heading">Profile Information</h4>
                  <div className="info-grid">
                    <div className="info-row">
                      <span className="info-label">Joined</span>
                      <span className="info-value">{formatDate(user.joinDate)}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Last seen</span>
                      <span className="info-value">{formatDateTime(user.lastSeen)}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Messages</span>
                      <span className="info-value">{user.messages}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Reaction score</span>
                      <span className="info-value">{user.reactionScore}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Points</span>
                      <span className="info-value">{user.points}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Badge</span>
                      <span className={`status-badge badge-${user.badge.toLowerCase()}`}>{user.badge}</span>
                    </div>
                  </div>

                  {user.aboutMe && (
                    <>
                      <h4 className="info-heading">About Me</h4>
                      <p className="about-text">{user.aboutMe}</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="profile-sidebar">
            <div className="sidebar-card">
              <h3 className="sidebar-card-title">About</h3>
              <div className="sidebar-info">
                <div className="info-row">
                  <span className="info-label">User ID</span>
                  <span className="info-value">#{user.uid}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Joined</span>
                  <span className="info-value">{formatDateTime(user.joinDate)}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Last seen</span>
                  <span className="info-value">{formatDateTime(user.lastSeen)}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Messages</span>
                  <span className="info-value">{user.messages}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Reaction score</span>
                  <span className="info-value">{user.reactionScore}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Points</span>
                  <span className="info-value">{user.points}</span>
                </div>
              </div>
            </div>

            <div className="sidebar-card">
              <h3 className="sidebar-card-title">Actions</h3>
              <div className="action-buttons">
                {onSettings && (
                  <button onClick={onSettings} className="action-btn action-btn-primary">
                    ⚙️ Settings
                  </button>
                )}
                <button className="action-btn">Send direct message</button>
                <button className="action-btn">Find</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfile
