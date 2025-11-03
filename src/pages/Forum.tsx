import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import type { User } from './Auth';
import { api } from '../api/client';
import ServerStatus from '../components/ServerStatus';
import LiveChat from '../components/LiveChat';
import './Forum.css';

interface ForumCategory {
  id: number;
  name: string;
  description: string;
  icon: string;
}

interface ForumThread {
  id: number;
  categoryId: number;
  title: string;
  authorUid: number;
  createdAt: string;
  lastReplyAt: string;
  lastReplyBy: number;
  replies: number;
  views: number;
  pinned: boolean;
}

interface ForumProps {
  user: User;
  onLogout: () => void;
  onProfile: (userId?: number) => void;
  onThread: (threadId: number) => void;
  onAdminPanel?: () => void;
  onCreateThread?: () => void;
}

interface ChatMessage {
  id: number;
  user: string;
  message: string;
  timestamp: string;
  userId: number;
}

interface ForumCategory {
  id: number
  name: string
  description: string
  icon: string
}

interface ForumThread {
  id: number
  categoryId: number
  title: string
  authorUid: number
  createdAt: string
  lastReplyAt: string
  lastReplyBy: number
  replies: number
  views: number
  pinned: boolean
}

interface ForumProps {
  user: User
  onLogout: () => void
  onProfile: (userId?: number) => void
  onThread: (threadId: number) => void
  onAdminPanel?: () => void
  onCreateThread?: () => void
}

function Forum({ user, onLogout, onProfile, onThread, onAdminPanel, onCreateThread }: ForumProps) {
  const [categories, setCategories] = useState<ForumCategory[]>([])
  const [threads, setThreads] = useState<ForumThread[]>([])
  const [onlineUsers, setOnlineUsers] = useState<User[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [newChatMessage, setNewChatMessage] = useState('')
  const [isChatCollapsed, setIsChatCollapsed] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  
  // Mock chat messages (replace with real data)
  useEffect(() => {
    const mockMessages: ChatMessage[] = [
      {
        id: 1,
        user: 'Admin',
        message: 'Welcome to the forum chat!',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        userId: 1
      },
      {
        id: 2,
        user: 'Moderator',
        message: 'Please keep the chat civil and on-topic.',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        userId: 2
      }
    ]
    setChatMessages(mockMessages)
  }, [])
  
  // Removed auto-scroll - causes page scrolling issues
  
  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newChatMessage.trim()) return
    
    const message: ChatMessage = {
      id: chatMessages.length + 1,
      user: user.username,
      message: newChatMessage,
      timestamp: new Date().toISOString(),
      userId: user.uid
    }
    
    setChatMessages(prev => [...prev, message])
    setNewChatMessage('')
  }
  
  const formatChatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  useEffect(() => {
    loadData()
  }, [selectedCategory])

  const loadData = async () => {
    if (isLoading) return // Prevent multiple simultaneous calls
    
    setIsLoading(true)
    try {
      const [categoriesResponse, threadsResponse, usersResponse] = await Promise.all([
        api.getCategories(),
        api.getThreads(selectedCategory || undefined),
        api.getUsers()
      ])
      setCategories(categoriesResponse.success ? categoriesResponse.categories : [])
      setThreads(threadsResponse.success ? threadsResponse.threads : [])
      // Filter out banned users from online users display
      const allUsers = usersResponse.success ? usersResponse.users : []
      const nonBannedUsers = allUsers.filter((user: User) => !user.banned)
      setOnlineUsers(nonBannedUsers)
    } catch (error) {
      console.error('Failed to load forum data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getThreadsForCategory = (categoryId: number) => {
    return threads.filter(t => t.categoryId === categoryId)
  }

  const getLatestThread = (categoryId: number) => {
    const categoryThreads = getThreadsForCategory(categoryId)
    if (categoryThreads.length === 0) return null
    return categoryThreads[0]
  }

  const getThreadAuthor = (uid: number) => {
    return onlineUsers.find(u => u.uid === uid)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const handleCategoryClick = (categoryId: number) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId)
  }

  const filteredThreads = searchQuery
    ? threads.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : threads

  return (
    <div className="forum-page">
      <nav className="navbar">
        <div className="nav-links">
          <Link to="/" className="nav-link">HOME</Link>
          <Link to="/forum" className="nav-link active">FORUMS</Link>
          <a href="#store" className="nav-link">STORE</a>
          <ServerStatus />
          <a href="https://discord.gg/desync" className="nav-link" target="_blank" rel="noopener noreferrer">DISCORD</a>
        </div>
        <div className="nav-auth">
          <div className="nav-user-menu" onClick={() => onProfile(user.uid)}>
            <div className="nav-avatar">{user.username.charAt(0)}</div>
            <span className="nav-username">{user.username}</span>
          </div>
          {(user.badge === 'Owner' || user.badge === 'Admin') && onAdminPanel && (
            <Link to="/admin" className="nav-link">ADMIN PANEL</Link>
          )}
          <button onClick={onLogout} className="nav-link nav-button">LOG OUT</button>
        </div>
      </nav>

      <div className="forum-container">
        <div className="forum-main">
          {/* Live Chat Section */}
          <LiveChat user={user} />
          
          {/* Forum Content */}
          <div className="forum-header">
            <div className="forum-header-content">
              <h2 className="forum-section-title">
                {selectedCategory ? categories.find(c => c.id === selectedCategory)?.name.toUpperCase() : 'PUBLIC'}
              </h2>
              <div className="forum-actions">
                <input
                  type="text"
                  placeholder="Search threads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="forum-search"
                />
                {onCreateThread && (
                  <button onClick={onCreateThread} className="btn-create-thread">
                    + CREATE THREAD
                  </button>
                )}
              </div>
            </div>
            {selectedCategory && (
              <button onClick={() => setSelectedCategory(null)} className="btn-back-to-all">
                ← Back to All Categories
              </button>
            )}
          </div>

          {!selectedCategory ? (
            categories.map((category) => {
              const categoryThreads = getThreadsForCategory(category.id)
              const latestThread = getLatestThread(category.id)
              const latestAuthor = latestThread ? getThreadAuthor(latestThread.lastReplyBy) : null
              const totalMessages = categoryThreads.reduce((sum, t) => sum + t.replies + 1, 0)

              return (
                <div
                  key={category.id}
                  className="forum-category"
                  onClick={() => handleCategoryClick(category.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="category-icon" data-icon={category.icon}></div>
                  <div className="category-info">
                    <h3 className="category-name">{category.name}</h3>
                    <p className="category-description">{category.description}</p>
                  </div>
                  <div className="category-stats">
                    <div className="stat">
                      <span className="stat-label">Threads</span>
                      <span className="stat-value">{categoryThreads.length}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Messages</span>
                      <span className="stat-value">{totalMessages}</span>
                    </div>
                  </div>
                  <div className="category-latest">
                    {latestThread && latestAuthor ? (
                      <>
                        <div className="latest-avatar">{latestAuthor.username.charAt(0)}</div>
                        <div className="latest-info">
                          <a
                            href="#"
                            onClick={(e) => {
                              e.stopPropagation()
                              onThread(latestThread.id)
                            }}
                            className="latest-title"
                          >
                            {latestThread.title}
                          </a>
                          <div className="latest-meta">
                            {formatDate(latestThread.lastReplyAt)} • <span className="latest-author">{latestAuthor.username}</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="latest-empty">No threads yet</div>
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="threads-list">
              {filteredThreads.length > 0 ? (
                filteredThreads.map((thread) => {
                  const author = getThreadAuthor(thread.authorUid)
                  const lastReplyAuthor = getThreadAuthor(thread.lastReplyBy)
                  return (
                    <div key={thread.id} className="thread-item" onClick={() => onThread(thread.id)}>
                      <div className="thread-item-icon">
                        {thread.pinned && <span className="pin-icon">📌</span>}
                        <div className="thread-avatar">{author?.username.charAt(0)}</div>
                      </div>
                      <div className="thread-item-content">
                        <h4 className="thread-item-title">{thread.title}</h4>
                        <div className="thread-item-meta">
                          Started by <span 
                            className="thread-author" 
                            onClick={(e) => {
                              e.stopPropagation()
                              if (author) onProfile(author.uid)
                            }}
                            style={{cursor: 'pointer'}}
                          >{author?.username}</span> • {formatDate(thread.createdAt)}
                        </div>
                      </div>
                      <div className="thread-item-stats">
                        <div className="thread-stat">
                          <span className="stat-icon">💬</span>
                          <span>{thread.replies}</span>
                        </div>
                        <div className="thread-stat">
                          <span className="stat-icon">👁</span>
                          <span>{thread.views}</span>
                        </div>
                      </div>
                      <div className="thread-item-latest">
                        {lastReplyAuthor && (
                          <>
                            <div className="latest-reply-avatar">{lastReplyAuthor.username.charAt(0)}</div>
                            <div className="latest-reply-info">
                              <div className="latest-reply-author">{lastReplyAuthor.username}</div>
                              <div className="latest-reply-time">{formatDate(thread.lastReplyAt)}</div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="empty-state">No threads found</div>
              )}
            </div>
          )}
        </div>

        <div className="forum-sidebar">
          <div className="sidebar-section">
            <h3 className="sidebar-title">STAFF ONLINE</h3>
            <div className="online-users">
              {onlineUsers.filter(u => u.badge === 'Owner' || u.badge === 'Admin').map((u) => (
                <div key={u.uid} className="online-user">
                  <div className="online-indicator">●</div>
                  <div className="online-avatar">{u.username.charAt(0)}</div>
                  <div className="online-info">
                    <div className="online-name">{u.username}</div>
                    <div className={`online-badge badge-${u.badge.toLowerCase()}`}>{u.badge}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">MEMBERS ONLINE</h3>
            <div className="members-list">
              {onlineUsers.map((u) => (
                <span key={u.uid} className="member-name">{u.username}</span>
              ))}
            </div>
            <div className="members-stats">
              <div>Total: {onlineUsers.length} (members: {onlineUsers.filter(u => u.badge === 'Member').length}, guests: 0)</div>
            </div>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">LATEST THREADS</h3>
            <div className="latest-threads">
              {threads.slice(0, 5).map((thread) => {
                const author = getThreadAuthor(thread.authorUid)
                return (
                  <div key={thread.id} className="latest-thread-item">
                    <a href="#" onClick={() => onThread(thread.id)} className="thread-link">
                      {thread.title}
                    </a>
                    <div className="thread-meta">
                      Started by {author?.username} • {formatDate(thread.createdAt)}
                    </div>
                  </div>
                )
              })}
              {threads.length === 0 && (
                <div className="empty-state">No threads yet</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Forum
