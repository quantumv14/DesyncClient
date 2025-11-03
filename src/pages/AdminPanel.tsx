import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import type { User } from './Auth'
import { api } from '../api/client'
import './AdminPanel.css'

interface InvitationCode {
  code: string
  createdBy: number
  createdAt: string
  expiresAt: string
  used: boolean
  usedBy?: number
  usedAt?: string
  maxUses?: number
  customCode?: string
}

interface AdminPanelProps {
  user: User
  onBack: () => void
  onLogout: () => void
}

type AdminTab = 'overview' | 'users' | 'activity' | 'banned' | 'reports' | 'events'

interface AdminStats {
  users: {
    total: number
    active: number
    banned: number
    newThisWeek: number
  }
  content: {
    threads: number
    posts: number
    newThreadsThisWeek: number
  }
  reports: {
    pending: number
  }
  bannedByCountry: {[country: string]: number}
}

interface Report {
  id: number
  type: string
  targetId: number
  reason: string
  description?: string
  reportedBy: number
  status: string
  createdAt: string
  reviewedBy?: number
  reviewedAt?: string
  action?: string
}

interface InventoryItem {
  id: number
  name: string
  type: 'invite' | 'reward' | 'badge'
  description: string
  expiresAt?: string
  createdAt: string
}

interface Event {
  id: number
  name: string
  description: string
  type: 'invite_wave' | 'reward_drop' | 'special'
  isActive: boolean
  createdAt: string
  executedAt?: string
}

function AdminPanel({ user, onBack, onLogout }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')
  const [inviteWaveAmount, setInviteWaveAmount] = useState<number>(1)
  const [users, setUsers] = useState<User[]>([])
  const [codes, setCodes] = useState<InvitationCode[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [bannedUsers, setBannedUsers] = useState<User[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [expiryDate, setExpiryDate] = useState('')
  const [expiryTime, setExpiryTime] = useState('23:59')
  const [showBanModal, setShowBanModal] = useState(false)
  const [showRankModal, setShowRankModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [banReason, setBanReason] = useState('')
  const [newRank, setNewRank] = useState('')

  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    if (isLoading) return
    setIsLoading(true)
    
    try {
      // Load different data based on active tab
      switch (activeTab) {
        case 'overview':
          await loadOverviewData()
          break
        case 'users':
          await loadUsersData()
          break
        case 'banned':
          await loadBannedUsersData()
          break
        case 'reports':
          await loadReportsData()
          break
        case 'activity':
          await loadActivityData()
          break
      }
    } catch (error) {
      console.error('Failed to load admin data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadOverviewData = async () => {
    const [statsResponse, codesResponse] = await Promise.all([
      api.getAdminStats(),
      api.getCodes()
    ])
    console.log('Stats Response:', statsResponse)
    console.log('Codes Response:', codesResponse)
    setStats(statsResponse.success ? statsResponse.stats : null)
    setCodes(codesResponse.success ? codesResponse.codes : [])
  }

  const loadUsersData = async () => {
    const usersResponse = await api.getUsers()
    setUsers(usersResponse.success ? usersResponse.users : [])
  }

  const loadBannedUsersData = async () => {
    const usersResponse = await api.getUsers()
    const allUsers = usersResponse.success ? usersResponse.users : []
    setBannedUsers(allUsers.filter((u: User) => u.banned))
  }

  const loadReportsData = async () => {
    const reportsResponse = await api.getReports()
    setReports(reportsResponse.success ? reportsResponse.reports : [])
  }

  const loadActivityData = async () => {
    // Load recent activity data
    const usersResponse = await api.getUsers()
    setUsers(usersResponse.success ? usersResponse.users : [])
  }

  const loadEventsData = async () => {
    try {
      const eventsResponse = await api.getEvents()
      if (eventsResponse.success && eventsResponse.events && eventsResponse.events.length > 0) {
        setEvents(eventsResponse.events)
      } else {
        // Always show invite wave event even if API returns empty
        setEvents([
          {
            id: 1,
            name: 'Invite Wave',
            description: 'Give all users an invite that lasts 2 months',
            type: 'invite_wave',
            isActive: true,
            createdAt: new Date().toISOString()
          }
        ])
      }
    } catch (error) {
      console.error('Failed to load events:', error)
      // Fallback - ALWAYS show invite wave event
      setEvents([
        {
          id: 1,
          name: 'Invite Wave',
          description: 'Give all users an invite that lasts 2 months',
          type: 'invite_wave',
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ])
    }
  }

  const handleGenerateCode = async () => {
    if (!expiryDate) {
      alert('Please select an expiry date')
      return
    }
    
    try {
      const expiresAt = `${expiryDate}T${expiryTime}:00.000Z`
      await api.createCode(expiresAt)
      alert('Invitation code generated successfully!')
      loadOverviewData()
    } catch (error) {
      console.error('Failed to generate code:', error)
      alert('Failed to generate code')
    }
  }

  const handleBanUser = (user: User) => {
    setSelectedUser(user)
    setShowBanModal(true)
  }

  const handleConfirmBan = async () => {
    if (!selectedUser || !banReason.trim()) {
      alert('Please enter a ban reason')
      return
    }
    
    try {
      await api.banUser(selectedUser.uid, banReason, user.uid)
      alert('User banned successfully!')
      setShowBanModal(false)
      setBanReason('')
      setSelectedUser(null)
      loadData()
    } catch (error) {
      console.error('Failed to ban user:', error)
      alert('Failed to ban user')
    }
  }

  const handleUnbanUser = async (uid: number) => {
    try {
      await api.unbanUser(uid)
      alert('User unbanned successfully!')
      loadData()
    } catch (error) {
      console.error('Failed to unban user:', error)
      alert('Failed to unban user')
    }
  }

  const handleChangeRank = (user: User) => {
    setSelectedUser(user)
    setNewRank(user.badge)
    setShowRankModal(true)
  }

  const handleConfirmRankChange = async () => {
    if (!selectedUser || !newRank) {
      alert('Please select a rank')
      return
    }
    
    try {
      await api.changeUserRank(selectedUser.uid, newRank)
      alert('User rank changed successfully!')
      setShowRankModal(false)
      setNewRank('')
      setSelectedUser(null)
      loadData()
    } catch (error) {
      console.error('Failed to change rank:', error)
      alert('Failed to change rank')
    }
  }

  const handleUpdateReport = async (reportId: number, status: string, action?: string) => {
    try {
      await api.updateReport(reportId, status, action)
      alert('Report updated successfully!')
      loadReportsData()
    } catch (error) {
      console.error('Failed to update report:', error)
      alert('Failed to update report')
    }
  }

  const handleInviteWave = async () => {
    if (!confirm('This will give ALL users an invite that expires in 2 months. Continue?')) {
      return
    }
    
    try {
      setIsLoading(true)
      
      // Execute the invite wave via API
      const result = await api.executeInviteWave()
      
      if (result.success) {
        const expiryDate = new Date()
      }
      
      setEvents(prev => [newEvent, ...prev])
      
      alert(`Successfully sent ${inviteWaveAmount} invite${inviteWaveAmount > 1 ? 's' : ''} to all users!`)
    } catch (error) {
      console.error('Error executing invite wave:', error)
      alert('Failed to execute invite wave. Please try again.')
    }
  }

  return (
    <div className="settings-page">
      <nav className="navbar admin-navbar">
        <div className="nav-links">
          <h1 className="admin-header-title">ADMIN PANEL</h1>
        </div>
        <div className="nav-auth">
          <button onClick={onBack} className="btn-back">← BACK</button>
        </div>
      </nav>

      <div className="settings-container">
        <div className="settings-sidebar">
          <h2 className="sidebar-title">ADMIN PANEL</h2>
          <div className="sidebar-menu">
            <button
              className={`menu-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <span className="menu-icon">📊</span>
              Overview
            </button>
            <button
              className={`menu-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <span className="menu-icon">👥</span>
              Users
            </button>
            <button
              className={`menu-item ${activeTab === 'activity' ? 'active' : ''}`}
              onClick={() => setActiveTab('activity')}
            >
              <span className="menu-icon">📈</span>
              Activity
            </button>
            <button
              className={`menu-item ${activeTab === 'banned' ? 'active' : ''}`}
              onClick={() => setActiveTab('banned')}
            >
              <span className="menu-icon">🚫</span>
              Banned Users
            </button>
            <button
              className={`menu-item ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              <span className="menu-icon">🚩</span>
              Reports
              {stats?.reports?.pending && stats.reports.pending > 0 && (
                <span className="notification-badge">{stats.reports.pending}</span>
              )}
            </button>
            <button
              className={`menu-item ${activeTab === 'events' ? 'active' : ''}`}
              onClick={() => setActiveTab('events')}
            >
              <span className="menu-icon">🎉</span>
              Events
            </button>
          </div>
        </div>

        <div className="settings-content">
          {isLoading ? (
            <div className="loading-indicator">
              <div className="loading-spinner"></div>
              <p>Loading...</p>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <OverviewTab stats={stats} codes={codes} onGenerateCode={handleGenerateCode} expiryDate={expiryDate} setExpiryDate={setExpiryDate} expiryTime={expiryTime} setExpiryTime={setExpiryTime} />
              )}
              {activeTab === 'users' && (
                <UsersTab users={users} onBanUser={handleBanUser} onChangeRank={handleChangeRank} />
              )}
              {activeTab === 'activity' && (
                <ActivityTab users={users} />
              )}
              {activeTab === 'banned' && (
                <BannedUsersTab bannedUsers={bannedUsers} stats={stats} onUnbanUser={handleUnbanUser} />
              )}
              {activeTab === 'reports' && (
                <ReportsTab reports={reports} onUpdateReport={handleUpdateReport} />
              )}
              {activeTab === 'events' && (
                <EventsTab 
                  events={events}
                  onInviteWave={handleInviteWave}
                  users={users}
                  inviteWaveAmount={inviteWaveAmount}
                  onInviteWaveAmountChange={setInviteWaveAmount}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {showBanModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowBanModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Ban User: {selectedUser.username}</h2>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Ban Reason</label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  className="form-textarea"
                  placeholder="Enter reason for banning this user..."
                  rows={4}
                  required
                />
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowBanModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleConfirmBan} className="btn btn-danger">
                Ban User
              </button>
            </div>
          </div>
        </div>
      )}

      {showRankModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowRankModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Change Rank: {selectedUser.username}</h2>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">New Rank</label>
                <select
                  value={newRank}
                  onChange={(e) => setNewRank(e.target.value)}
                  className="form-select"
                >
                  <option value="Member">Member</option>
                  <option value="Known">Known</option>
                  <option value="Premium">Premium</option>
                  <option value="Support">Support</option>
                  <option value="Moderator">Moderator</option>
                  <option value="Admin">Admin</option>
                  <option value="Owner">Owner</option>
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowRankModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleConfirmRankChange} className="btn btn-primary">
                Change Rank
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Tab Components
interface OverviewTabProps {
  stats: AdminStats | null
  codes: InvitationCode[]
  onGenerateCode: () => void
  expiryDate: string
  setExpiryDate: (date: string) => void
  expiryTime: string
  setExpiryTime: (time: string) => void
}

function OverviewTab({ stats, codes, onGenerateCode, expiryDate, setExpiryDate, expiryTime, setExpiryTime }: OverviewTabProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="tab-content">
      <h1 className="tab-title">ADMIN OVERVIEW</h1>
      <p className="tab-subtitle">Monitor system statistics and manage invitation codes</p>
      
      {/* Stats Section */}
      <div className="settings-section">
        <h3 className="section-heading">SYSTEM STATISTICS</h3>
        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <div className="stat-number">{stats.users?.total || 0}</div>
                <div className="stat-label">Total Users</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <div className="stat-number">{stats.users?.active || 0}</div>
                <div className="stat-label">Active Users</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🚫</div>
              <div className="stat-info">
                <div className="stat-number">{stats.users?.banned || 0}</div>
                <div className="stat-label">Banned Users</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🚩</div>
              <div className="stat-info">
                <div className="stat-number">{stats.reports?.pending || 0}</div>
                <div className="stat-label">Pending Reports</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Generate Code Section */}
      <div className="settings-section">
        <h3 className="section-heading">GENERATE INVITATION CODE</h3>
        <div className="generate-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">EXPIRY DATE</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="form-input"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="form-group">
              <label className="form-label">EXPIRY TIME</label>
              <input
                type="time"
                value={expiryTime}
                onChange={(e) => setExpiryTime(e.target.value)}
                className="form-input"
              />
            </div>
          </div>
          <button onClick={onGenerateCode} className="btn btn-primary">
            GENERATE CODE
          </button>
        </div>
      </div>

      {/* Invitation Codes */}
      <div className="settings-section">
        <h3 className="section-heading">INVITATION CODES ({codes.length})</h3>
        <div className="codes-list">
          {codes.length === 0 ? (
            <div className="empty-state">No invitation codes generated yet</div>
          ) : (
            codes.map((code: InvitationCode) => (
              <div key={code.code} className="code-item">
                <div className="code-info">
                  <span className="code-value">{code.code}</span>
                  <div className="code-meta">
                    <span className={`code-status ${code.used ? 'used' : 'active'}`}>
                      {code.used ? 'USED' : 'ACTIVE'}
                    </span>
                    <span className="code-expiry">
                      Expires: {formatDate(code.expiresAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

interface UsersTabProps {
  users: User[]
  onBanUser: (user: User) => void
  onChangeRank: (user: User) => void
}

function UsersTab({ users, onBanUser, onChangeRank }: UsersTabProps) {
  return (
    <div className="tab-content">
      <h2 className="tab-title">👥 Users ({users.length})</h2>
      <div className="users-list">
        {users.map((user: User) => (
          <div key={user.uid} className={`user-item ${user.banned ? 'banned-user' : ''}`}>
            <div className="user-info">
              <div className="user-avatar">{user.username.charAt(0)}</div>
              <div className="user-details">
                <div className="user-name">{user.username}</div>
                <div className="user-meta">
                  <span className={`user-badge badge-${user.badge.toLowerCase()}`}>
                    {user.badge}
                  </span>
                  <span className="user-id">ID: {user.uid}</span>
                  <span className="user-email">{user.email}</span>
                </div>
              </div>
            </div>
            <div className="user-actions">
              {!user.banned ? (
                <>
                  <button
                    onClick={() => onBanUser(user)}
                    className="btn btn-danger btn-sm"
                  >
                    Ban
                  </button>
                  <button
                    onClick={() => onChangeRank(user)}
                    className="btn btn-secondary btn-sm"
                  >
                    Change Rank
                  </button>
                </>
              ) : (
                <span className="banned-label">BANNED</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface ActivityTabProps {
  users: User[]
}

function ActivityTab({ users }: ActivityTabProps) {
  const recentUsers = users.slice(0, 10)
  
  return (
    <div className="tab-content">
      <h2 className="tab-title">📈 Recent Activity</h2>
      <div className="activity-section">
        <h3 className="section-title">Recent User Registrations</h3>
        <div className="activity-list">
          {recentUsers.map((user: User) => (
            <div key={user.uid} className="activity-item">
              <div className="activity-icon">👤</div>
              <div className="activity-info">
                <div className="activity-text">
                  <strong>{user.username}</strong> joined the forum
                </div>
                <div className="activity-time">
                  {new Date(user.joinDate).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

interface BannedUsersTabProps {
  bannedUsers: User[]
  stats: AdminStats | null
  onUnbanUser: (uid: number) => void
}

function BannedUsersTab({ bannedUsers, stats, onUnbanUser }: BannedUsersTabProps) {
  return (
    <div className="tab-content">
      <h2 className="tab-title">🚫 Banned Users ({bannedUsers.length})</h2>
      
      {/* Country Statistics */}
      {stats && stats.bannedByCountry && Object.keys(stats.bannedByCountry).length > 0 && (
        <div className="admin-section">
          <h3 className="section-title">Bans by Country</h3>
          <div className="country-stats">
            {Object.entries(stats.bannedByCountry).map(([country, count]: [string, number]) => (
              <div key={country} className="country-item">
                <span className="country-name">{country}</span>
                <span className="country-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Banned Users List */}
      <div className="admin-section">
        <h3 className="section-title">Banned Users</h3>
        <div className="users-list">
          {bannedUsers.map((user: User) => (
            <div key={user.uid} className="user-item banned-user">
              <div className="user-info">
                <div className="user-avatar">{user.username.charAt(0)}</div>
                <div className="user-details">
                  <div className="user-name banned-text">{user.username}</div>
                  <div className="user-meta">
                    <span className="user-id">ID: {user.uid}</span>
                    <span className="ban-reason">Reason: {user.banReason || 'No reason provided'}</span>
                    <span className="ban-date">
                      Banned: {user.bannedAt ? new Date(user.bannedAt).toLocaleString() : 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="user-actions">
                <button
                  onClick={() => onUnbanUser(user.uid)}
                  className="btn btn-success btn-sm"
                >
                  Unban
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

interface ReportsTabProps {
  reports: Report[]
  onUpdateReport: (reportId: number, status: string, action?: string) => void
}

function ReportsTab({ reports, onUpdateReport }: ReportsTabProps) {
  const pendingReports = reports.filter((r: Report) => r.status === 'pending')
  const reviewedReports = reports.filter((r: Report) => r.status !== 'pending')

  return (
    <div className="tab-content">
      <h2 className="tab-title">🚩 Reports ({reports.length})</h2>
      
      {/* Pending Reports */}
      <div className="admin-section">
        <h3 className="section-title">Pending Reports ({pendingReports.length})</h3>
        <div className="reports-list">
          {pendingReports.map((report: Report) => (
            <div key={report.id} className="report-item pending">
              <div className="report-info">
                <div className="report-header">
                  <span className="report-type">{report.type.toUpperCase()}</span>
                  <span className="report-id">#{report.targetId}</span>
                  <span className="report-date">
                    {new Date(report.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="report-reason">
                  <strong>Reason:</strong> {report.reason}
                </div>
                {report.description && (
                  <div className="report-description">
                    <strong>Details:</strong> {report.description}
                  </div>
                )}
              </div>
              <div className="report-actions">
                <button
                  onClick={() => onUpdateReport(report.id, 'resolved', 'Content removed')}
                  className="btn btn-danger btn-sm"
                >
                  Remove Content
                </button>
                <button
                  onClick={() => onUpdateReport(report.id, 'dismissed', 'No action needed')}
                  className="btn btn-secondary btn-sm"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))}
          {pendingReports.length === 0 && (
            <div className="empty-state">No pending reports</div>
          )}
        </div>
      </div>

      {/* Reviewed Reports */}
      <div className="admin-section">
        <h3 className="section-title">Reviewed Reports ({reviewedReports.length})</h3>
        <div className="reports-list">
          {reviewedReports.slice(0, 10).map((report: Report) => (
            <div key={report.id} className={`report-item ${report.status}`}>
              <div className="report-info">
                <div className="report-header">
                  <span className="report-type">{report.type.toUpperCase()}</span>
                  <span className="report-id">#{report.targetId}</span>
                  <span className={`report-status ${report.status}`}>
                    {report.status.toUpperCase()}
                  </span>
                </div>
                <div className="report-reason">
                  <strong>Reason:</strong> {report.reason}
                </div>
                {report.action && (
                  <div className="report-action">
                    <strong>Action:</strong> {report.action}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

interface EventsTabProps {
  events: Event[]
  onInviteWave: () => void
  users: User[]
  inviteWaveAmount: number
  onInviteWaveAmountChange: (amount: number) => void
}

function EventsTab({ events, onInviteWave, users, inviteWaveAmount, onInviteWaveAmountChange }: EventsTabProps) {
  return (
    <div className="tab-content">
      <h2 className="tab-title">🎉 Events ({events.length})</h2>
      
      {/* Event Actions */}
      <div className="admin-section">
        <h3 className="section-title">Available Events</h3>
        <div className="events-list">
          {events.map((event: Event) => (
            <div key={event.id} className="event-item">
              <div className="event-info">
                <div className="event-header">
                  <h4 className="event-name">{event.name}</h4>
                  <span className={`event-status ${event.isActive ? 'active' : 'inactive'}`}>
                    {event.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
                <p className="event-description">{event.description}</p>
                <div className="event-meta">
                  <span className="event-type">Type: {event.type.replace('_', ' ').toUpperCase()}</span>
                  <span className="event-created">Created: {new Date(event.createdAt).toLocaleDateString()}</span>
                  {event.executedAt && (
                    <span className="event-executed">Last executed: {new Date(event.executedAt).toLocaleString()}</span>
                  )}
                </div>
              </div>
              <div className="event-actions">
                {event.type === 'invite_wave' && (
                  <div className="invite-wave-controls">
                    <div className="amount-selector">
                      <button 
                        className="amount-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          onInviteWaveAmountChange(Math.max(1, inviteWaveAmount - 1))
                        }}
                        disabled={inviteWaveAmount <= 1}
                      >
                        -
                      </button>
                      <span className="amount-display">x{inviteWaveAmount}</span>
                      <button 
                        className="amount-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          onInviteWaveAmountChange(inviteWaveAmount + 1)
                        }}
                        disabled={inviteWaveAmount >= 10}
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onInviteWave()
                      }}
                      className="btn btn-primary"
                      disabled={!event.isActive}
                    >
                      Send Invites
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Event Statistics */}
      <div className="admin-section">
        <h3 className="section-title">Event Impact</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <div className="stat-number">{users.length}</div>
              <div className="stat-label">Total Users</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎁</div>
            <div className="stat-info">
              <div className="stat-number">{events.filter((e: Event) => e.executedAt).length}</div>
              <div className="stat-label">Events Executed</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✨</div>
            <div className="stat-info">
              <div className="stat-number">{events.filter((e: Event) => e.isActive).length}</div>
              <div className="stat-label">Active Events</div>
            </div>
          </div>
        </div>
      </div>

      {/* Event History */}
      <div className="admin-section">
        <h3 className="section-title">Recent Event History</h3>
        <div className="event-history">
          {events.filter((e: Event) => e.executedAt).length === 0 ? (
            <div className="empty-state">No events have been executed yet</div>
          ) : (
            events
              .filter((e: Event) => e.executedAt)
              .sort((a: Event, b: Event) => new Date(b.executedAt!).getTime() - new Date(a.executedAt!).getTime())
              .map((event: Event) => (
                <div key={`${event.id}-${event.executedAt}`} className="history-item">
                  <div className="history-icon">🎉</div>
                  <div className="history-info">
                    <div className="history-text">
                      <strong>{event.name}</strong> was executed
                    </div>
                    <div className="history-time">
                      {new Date(event.executedAt!).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminPanel
