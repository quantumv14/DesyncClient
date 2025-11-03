import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import type { User } from './Auth'
import { api } from '../api/client'
import ServerStatus from '../components/ServerStatus'
import './ProfileSettings.css'

interface Software {
  id: number
  name: string
  type: 'Movement' | 'HvH'
  price: number
  description: string
  features: string[]
}

interface Purchase {
  id: number
  userId: number
  softwareId: number
  purchaseDate: string
  paymentMethod: 'Crypto' | 'Card'
  amount: number
  status: 'Completed' | 'Pending' | 'Failed'
}

interface InventoryItem {
  id: number
  name: string
  type: 'invite' | 'reward' | 'badge'
  description: string
  expiresAt?: string
  createdAt: string
}

interface ProfileSettingsProps {
  user: User
  onBack: () => void
  onLogout: () => void
  onAdminPanel?: () => void
}

type Tab = 'account' | 'security' | 'software' | 'inventory'
type PaymentMethod = 'Crypto' | 'Card' | null

function ProfileSettings({ user, onBack, onLogout, onAdminPanel }: ProfileSettingsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('account')
  const [software, setSoftware] = useState<Software[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedSoftware, setSelectedSoftware] = useState<Software | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null)
  const [processing, setProcessing] = useState(false)

  // Account tab state
  const [newUsername, setNewUsername] = useState(user.username)
  const [newEmail, setNewEmail] = useState(user.email)
  const [aboutMe, setAboutMe] = useState(user.aboutMe || '')

  // Security tab state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [softwareResponse, purchasesResponse, inventoryResponse] = await Promise.all([
        api.getSoftware().catch(err => ({ success: false, software: [], error: err })),
        api.getUserPurchases(user.uid).catch(err => ({ success: false, purchases: [], error: err })),
        api.getUserInventory(user.uid).catch(err => ({ success: false, inventory: [], error: err }))
      ])
      
      // Handle software data
      if (softwareResponse && softwareResponse.success && softwareResponse.software) {
        setSoftware(softwareResponse.software)
      } else {
        console.warn('Failed to load software:', softwareResponse?.error)
        setSoftware([])
      }
      
      // Handle purchases data
      if (purchasesResponse && purchasesResponse.success && purchasesResponse.purchases) {
        setPurchases(purchasesResponse.purchases)
      } else {
        console.warn('Failed to load purchases:', purchasesResponse?.error)
        setPurchases([])
      }
      
      // Handle inventory data
      if (inventoryResponse && inventoryResponse.success && inventoryResponse.inventory) {
        setInventory(inventoryResponse.inventory)
      } else {
        console.warn('Failed to load inventory:', inventoryResponse?.error)
        setInventory([])
      }
    } catch (error) {
      console.error('Failed to load data:', error)
      setSoftware([])
      setPurchases([])
      setInventory([])
    }
  }

  const handleBuyClick = (soft: Software) => {
    setSelectedSoftware(soft)
    setPaymentMethod(null)
    setShowPaymentModal(true)
  }

  const handleCompletePurchase = async () => {
    if (!selectedSoftware || !paymentMethod) {
      alert('Please select a payment method')
      return
    }

    setProcessing(true)
    
    // Simulate payment processing
    setTimeout(async () => {
      try {
        await api.createPurchase(user.uid, selectedSoftware.id, paymentMethod)
        const purchasesData = await api.getUserPurchases(user.uid)
        setPurchases(purchasesData)
        setProcessing(false)
        setShowPaymentModal(false)
        alert('Purchase completed successfully!')
      } catch (error) {
        setProcessing(false)
        alert('Purchase failed. Please try again.')
      }
    }, 2000)
  }

  const hasPurchasedSoftware = (softwareId: number) => {
    return purchases.some(p => p.softwareId === softwareId && p.status === 'Completed')
  }

  const handleSaveProfile = async () => {
    try {
      await api.updateUserProfile(user.uid, newUsername, newEmail, aboutMe)
      alert('Profile updated successfully!')
    } catch (error) {
      alert('Failed to update profile. Please try again.')
    }
  }

  return (
    <div className="profile-settings-page">
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
          <button onClick={onLogout} className="nav-link nav-button">LOG OUT</button>
        </div>
      </nav>

      <div className="settings-container">
        <div className="settings-sidebar">
          <h2 className="sidebar-title">SETTINGS</h2>
          <div className="sidebar-menu">
            <button
              className={`menu-item ${activeTab === 'account' ? 'active' : ''}`}
              onClick={() => setActiveTab('account')}
            >
              <span className="menu-icon">👤</span>
              Account
            </button>
            <button
              className={`menu-item ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <span className="menu-icon">🔒</span>
              Security
            </button>
            <button
              className={`menu-item ${activeTab === 'software' ? 'active' : ''}`}
              onClick={() => setActiveTab('software')}
            >
              <span className="menu-icon">💻</span>
              Software
            </button>
            <button
              className={`menu-item ${activeTab === 'inventory' ? 'active' : ''}`}
              onClick={() => setActiveTab('inventory')}
            >
              <span className="menu-icon">📦</span>
              Inventory
            </button>
          </div>
        </div>

        <div className="settings-content">
          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="tab-content">
              <h1 className="tab-title">ACCOUNT SETTINGS</h1>
              <p className="tab-subtitle">Manage your account information</p>

              <div className="settings-section">
                <h3 className="section-heading">PROFILE INFORMATION</h3>
                <div className="form-group">
                  <label className="form-label">USERNAME</label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="form-input"
                    placeholder="Your username"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">EMAIL</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="form-input"
                    placeholder="Your email"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">ABOUT ME</label>
                  <textarea
                    value={aboutMe}
                    onChange={(e) => setAboutMe(e.target.value)}
                    className="form-textarea"
                    placeholder="Tell others about yourself..."
                    rows={4}
                    maxLength={1000}
                  />
                  <div className="form-hint">{aboutMe.length}/1000 characters</div>
                </div>
                <button className="btn btn-primary" onClick={handleSaveProfile}>SAVE CHANGES</button>
              </div>

              <div className="settings-section">
                <h3 className="section-heading">ACCOUNT DETAILS</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">User ID</span>
                    <span className="info-value">#{user.uid}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Badge</span>
                    <span className={`status-badge badge-${user.badge.toLowerCase()}`}>{user.badge}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Join Date</span>
                    <span className="info-value">{new Date(user.joinDate).toLocaleDateString()}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Messages</span>
                    <span className="info-value">{user.messages}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="tab-content">
              <h1 className="tab-title">SECURITY SETTINGS</h1>
              <p className="tab-subtitle">Manage your password and security preferences</p>

              <div className="settings-section">
                <h3 className="section-heading">CHANGE PASSWORD</h3>
                <div className="form-group">
                  <label className="form-label">CURRENT PASSWORD</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="form-input"
                    placeholder="Enter current password"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">NEW PASSWORD</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="form-input"
                    placeholder="Enter new password"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">CONFIRM NEW PASSWORD</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-input"
                    placeholder="Confirm new password"
                  />
                </div>
                <button className="btn btn-primary">UPDATE PASSWORD</button>
              </div>

              <div className="settings-section">
                <h3 className="section-heading">SECURITY INFO</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">IP Address</span>
                    <span className="info-value">{user.ipAddress}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Last Login</span>
                    <span className="info-value">{new Date(user.lastSeen).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Software Tab */}
          {activeTab === 'software' && (
            <div className="tab-content">
              <h1 className="tab-title">SOFTWARE STORE</h1>
              <p className="tab-subtitle">Purchase and manage your Desync software</p>

              <div className="software-grid">
                {software.length === 0 ? (
                  <div className="no-software-message">
                    <h3>No Software Available</h3>
                    <p>Software products will appear here when they become available.</p>
                  </div>
                ) : (
                  software.map((soft) => {
                    const isPurchased = hasPurchasedSoftware(soft.id)
                    return (
                      <div key={soft.id} className={`software-card ${isPurchased ? 'purchased' : ''}`}>
                        <div className="software-header">
                          <div className="software-icon">
                            {soft.type === 'Movement' ? '🎯' : '⚔️'}
                          </div>
                          <div className="software-type">{soft.type}</div>
                        </div>
                        <h3 className="software-name">{soft.name}</h3>
                        <p className="software-description">{soft.description}</p>
                        <div className="software-features">
                          {soft.features.map((feature, idx) => (
                            <div key={idx} className="feature-item">
                              <span className="feature-check">✓</span>
                              {feature}
                            </div>
                          ))}
                        </div>
                        <div className="software-footer">
                          <div className="software-price">${soft.price.toFixed(2)}/mo</div>
                          {isPurchased ? (
                            <button className="btn btn-owned" disabled>
                              OWNED
                            </button>
                          ) : (
                            <button onClick={() => handleBuyClick(soft)} className="btn btn-buy">
                              BUY NOW
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {purchases.length > 0 && (
                <div className="settings-section">
                  <h3 className="section-heading">YOUR PURCHASES</h3>
                  <div className="purchases-list">
                    {purchases.map((purchase) => {
                      const soft = software.find(s => s.id === purchase.softwareId)
                      return (
                        <div key={purchase.id} className="purchase-item">
                          <div className="purchase-info">
                            <div className="purchase-name">{soft?.name}</div>
                            <div className="purchase-date">
                              Purchased on {new Date(purchase.purchaseDate).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="purchase-amount">${purchase.amount.toFixed(2)}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Inventory Tab */}
          {activeTab === 'inventory' && (
            <div className="tab-content">
              <h1 className="tab-title">INVENTORY</h1>
              <p className="tab-subtitle">Manage your items, invites, and rewards</p>

              <div className="settings-section">
                <h3 className="section-heading">YOUR ITEMS</h3>
                
                {inventory.length === 0 ? (
                  <div className="empty-state">
                    <p>No items in your inventory yet.</p>
                    <p className="empty-subtitle">Complete challenges and participate in events to earn rewards!</p>
                  </div>
                ) : (
                  <div className="inventory-grid">
                    {inventory.map((item) => (
                      <div key={item.id} className={`inventory-item item-${item.type}`}>
                        <div className="item-header">
                          <span className="item-type">{item.type.toUpperCase()}</span>
                          {item.expiresAt && (
                            <span className="item-expiry">
                              Expires: {new Date(item.expiresAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <h4 className="item-name">{item.name}</h4>
                        <p className="item-description">{item.description}</p>
                        <div className="item-meta">
                          <span>Acquired: {new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                        {item.type === 'invite' && (
                          <button className="btn btn-primary btn-sm">Use Invite</button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="settings-section">
                <h3 className="section-heading">ITEM STATISTICS</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Total Items</span>
                    <span className="info-value">{inventory.length}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Invites</span>
                    <span className="info-value">{inventory.filter(i => i.type === 'invite').length}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Rewards</span>
                    <span className="info-value">{inventory.filter(i => i.type === 'reward').length}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Badges</span>
                    <span className="info-value">{inventory.filter(i => i.type === 'badge').length}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedSoftware && (
        <div className="modal-overlay" onClick={() => !processing && setShowPaymentModal(false)}>
          <div className="modal-content payment-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">PURCHASE {selectedSoftware.name.toUpperCase()}</h2>
            <div className="modal-body">
              <div className="payment-summary">
                <div className="summary-row">
                  <span>Software</span>
                  <span>{selectedSoftware.name}</span>
                </div>
                <div className="summary-row">
                  <span>Type</span>
                  <span>{selectedSoftware.type}</span>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span>${selectedSoftware.price.toFixed(2)}/mo</span>
                </div>
              </div>

              <div className="payment-methods">
                <h3 className="payment-heading">SELECT PAYMENT METHOD</h3>
                <div className="payment-options">
                  <div
                    className={`payment-option ${paymentMethod === 'Crypto' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('Crypto')}
                  >
                    <div className="payment-icon">₿</div>
                    <div className="payment-name">Cryptocurrency</div>
                    <div className="payment-radio">
                      {paymentMethod === 'Crypto' && <div className="radio-dot"></div>}
                    </div>
                  </div>
                  <div
                    className={`payment-option ${paymentMethod === 'Card' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('Card')}
                  >
                    <div className="payment-icon">💳</div>
                    <div className="payment-name">Credit/Debit Card</div>
                    <div className="payment-radio">
                      {paymentMethod === 'Card' && <div className="radio-dot"></div>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="btn btn-secondary"
                disabled={processing}
              >
                CANCEL
              </button>
              <button
                onClick={handleCompletePurchase}
                className="btn btn-primary"
                disabled={!paymentMethod || processing}
              >
                {processing ? 'PROCESSING...' : 'COMPLETE PURCHASE'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfileSettings