import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import type { User } from './Auth'
import { api } from '../api/client'
import ServerStatus from '../components/ServerStatus'
import './ThreadView.css'

interface ForumThread {
  id: number
  categoryId: number
  title: string
  content: string
  authorUid: number
  authorUsername: string
  authorBadge: string
  createdAt: string
  updatedAt: string
  lastActivity: string
  lastPostBy: number | null
  lastPostAt: string | null
  views: number
  replies: number
  locked: boolean
  pinned: boolean
  deleted: boolean
}

interface ForumPost {
  id: number
  threadId: number
  content: string
  authorUid: number
  authorUsername: string
  authorBadge: string
  createdAt: string
  updatedAt: string
  edited: boolean
  editedBy: number | null
  editedAt: string | null
  deleted: boolean
  reactions: any
  reactionCount: number
}

interface ThreadViewProps {
  user: User
  threadId: number
  onBack: () => void
  onLogout: () => void
  onProfile: (uid: number) => void
  onAdminPanel?: () => void
}

function ThreadView({ user, threadId, onBack, onLogout, onProfile, onAdminPanel }: ThreadViewProps) {
  const [thread, setThread] = useState<ForumThread | null>(null)
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [replyContent, setReplyContent] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reactions, setReactions] = useState<{[postId: number]: {[emoji: string]: number}}>({})
  const [postAuthors, setPostAuthors] = useState<Map<number, User>>(new Map())
  const [category, setCategory] = useState<any>(null)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportTarget, setReportTarget] = useState<{type: string, id: number, title?: string} | null>(null)

  useEffect(() => {
    loadThread()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId])

  const loadThread = async () => {
    try {
      const [threadResponse, postsResponse] = await Promise.all([
        api.getThread(threadId),
        api.getPosts(threadId)
      ])

      const threadData = threadResponse.success ? threadResponse.thread : null
      const postsData = postsResponse.success ? postsResponse.posts : []

      setThread(threadData)
      setPosts(postsData)

      // Load reactions for all posts
      if (postsData.length > 0) {
        const reactionPromises = postsData.map(async (post: ForumPost) => {
          try {
            const reactionResponse = await api.getReactions(post.id)
            return {
              postId: post.id,
              reactions: reactionResponse.success ? reactionResponse.reactions : {}
            }
          } catch (error) {
            console.error(`Failed to load reactions for post ${post.id}:`, error)
            return { postId: post.id, reactions: {} }
          }
        })
        
        const reactionResults = await Promise.all(reactionPromises)
        const reactionsMap: {[postId: number]: {[emoji: string]: number}} = {}
        
        reactionResults.forEach(({ postId, reactions }) => {
          reactionsMap[postId] = {}
          Object.entries(reactions).forEach(([emoji, users]) => {
            reactionsMap[postId][emoji] = Array.isArray(users) ? users.length : 0
          })
        })
        
        setReactions(reactionsMap)
      }

      // Load post authors (including thread author)
      const allAuthorIds = new Set<number>()
      if (threadData) {
        allAuthorIds.add(threadData.authorUid)
      }
      postsData.forEach((p: ForumPost) => {
        allAuthorIds.add(p.authorUid)
      })
      
      if (allAuthorIds.size > 0) {
        const authors = await Promise.all(
          Array.from(allAuthorIds).map(async (uid) => {
            try {
              const response = await api.getUser(uid)
              return response.success ? response.user : null
            } catch (error) {
              console.error(`Failed to load user ${uid}:`, error)
              return null
            }
          })
        )
        const authorsMap = new Map<number, User>()
        authors.forEach((author: User | null, index: number) => {
          if (author) {
            const uid = Array.from(allAuthorIds)[index]
            authorsMap.set(uid, author)
          }
        })
        setPostAuthors(authorsMap)
      }

      // Load category
      if (threadData) {
        const categoriesResponse = await api.getCategories()
        const categories = categoriesResponse.success ? categoriesResponse.categories : []
        const categoryData = categories.find((c: any) => c.id === threadData.categoryId)
        setCategory(categoryData)
      }
    } catch (error) {
      console.error('Failed to load thread:', error)
    }
  }

  const handleReaction = async (postId: number, emoji: string) => {
    try {
      const response = await api.addReaction(postId, emoji)
      if (response.success) {
        // Update local reactions state with actual server response
        const updatedReactions: {[emoji: string]: number} = {}
        Object.entries(response.reactions).forEach(([emojiKey, users]) => {
          updatedReactions[emojiKey] = Array.isArray(users) ? users.length : 0
        })
        
        setReactions(prev => ({
          ...prev,
          [postId]: updatedReactions
        }))
      }
    } catch (error) {
      console.error('Failed to add reaction:', error)
    }
  }

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    if (!replyContent.trim()) {
      setError('Reply cannot be empty')
      setIsSubmitting(false)
      return
    }

    if (replyContent.length < 10) {
      setError('Reply must be at least 10 characters')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await api.createPost(threadId, replyContent, user.uid)
      if (response.success) {
        setReplyContent('')
        loadThread()
      } else {
        setError(response.message || 'Failed to post reply. Please try again.')
      }
    } catch (error) {
      setError('Failed to post reply. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReport = (type: 'thread' | 'post', id: number, title?: string) => {
    setReportTarget({ type, id, title })
    setShowReportModal(true)
  }

  const submitReport = async (reason: string, description: string) => {
    if (!reportTarget) return
    
    try {
      await api.createReport(reportTarget.type, reportTarget.id, reason, description)
      alert('Report submitted successfully!')
      setShowReportModal(false)
      setReportTarget(null)
    } catch (error) {
      console.error('Failed to submit report:', error)
      alert('Failed to submit report. Please try again.')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!thread) {
    return (
      <div className="thread-page">
        <div className="thread-error">Thread not found</div>
        <button onClick={onBack} className="btn btn-primary">Back to Forum</button>
      </div>
    )
  }

  return (
    <div className="thread-page">
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

      <div className="thread-container">
        <div className="thread-breadcrumb">
          <Link to="/forum" className="breadcrumb-link">Forums</Link>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">{category?.name}</span>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">{thread.title}</span>
        </div>

        <div className="thread-header">
          <h1 className="thread-title">{thread.title}</h1>
          <div className="thread-meta">
            <span className="thread-views">👁 {thread.views} views</span>
            <span className="thread-replies">💬 {thread.replies} replies</span>
          </div>
        </div>

        <div className="posts-list">
          {/* Thread starter post */}
          {thread && (
            <div className="post-card">
              <div className="post-sidebar">
                <div className="post-avatar">{thread.authorUsername.charAt(0)}</div>
                <div className="post-author-name" onClick={() => onProfile(thread.authorUid)} style={{cursor: 'pointer'}}>{thread.authorUsername}</div>
                <div className={`post-badge badge-${thread.authorBadge.toLowerCase()}`}>
                  {thread.authorBadge}
                </div>
                <div className="post-author-stats">
                  {postAuthors.get(thread.authorUid) && (
                    <>
                      <div className="stat-item">
                        <span className="stat-label">Messages</span>
                        <span className="stat-value">{postAuthors.get(thread.authorUid)?.messages || 0}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Reactions</span>
                        <span className="stat-value">{postAuthors.get(thread.authorUid)?.reactionScore || 0}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Points</span>
                        <span className="stat-value">{postAuthors.get(thread.authorUid)?.points || 0}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="post-content-area">
                <div className="post-header">
                  <span className="post-number">#1 (Original Post)</span>
                  <span className="post-date">{formatDate(thread.createdAt)}</span>
                </div>
                <div className="post-content">{thread.content}</div>
                <div className="post-footer">
                  <div className="reaction-buttons">
                    <button 
                      className="post-action reaction-btn"
                      onClick={() => handleReaction(thread.id, '👍')}
                    >
                      👍 {reactions[thread.id]?.['👍'] || 0}
                    </button>
                    <button 
                      className="post-action reaction-btn"
                      onClick={() => handleReaction(thread.id, '❤️')}
                    >
                      ❤️ {reactions[thread.id]?.['❤️'] || 0}
                    </button>
                    <button 
                      className="post-action reaction-btn"
                      onClick={() => handleReaction(thread.id, '😂')}
                    >
                      😂 {reactions[thread.id]?.['😂'] || 0}
                    </button>
                    <button 
                      className="post-action reaction-btn"
                      onClick={() => handleReaction(thread.id, '🔥')}
                    >
                      🔥 {reactions[thread.id]?.['🔥'] || 0}
                    </button>
                  </div>
                  <div className="post-actions">
                    <button className="post-action">💬 Quote</button>
                    <button className="post-action">🚩 Report</button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Reply posts */}
          {posts.map((post, index) => (
            <div key={post.id} className="post-card">
              <div className="post-sidebar">
                <div className="post-avatar">{post.authorUsername.charAt(0)}</div>
                <div className="post-author-name" onClick={() => onProfile(post.authorUid)} style={{cursor: 'pointer'}}>{post.authorUsername}</div>
                <div className={`post-badge badge-${post.authorBadge.toLowerCase()}`}>
                  {post.authorBadge}
                </div>
                <div className="post-author-stats">
                  {postAuthors.get(post.authorUid) && (
                    <>
                      <div className="stat-item">
                        <span className="stat-label">Messages</span>
                        <span className="stat-value">{postAuthors.get(post.authorUid)?.messages || 0}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Reactions</span>
                        <span className="stat-value">{postAuthors.get(post.authorUid)?.reactionScore || 0}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Points</span>
                        <span className="stat-value">{postAuthors.get(post.authorUid)?.points || 0}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="post-content-area">
                <div className="post-header">
                  <span className="post-number">#{index + 2}</span>
                  <span className="post-date">{formatDate(post.createdAt)}</span>
                  {post.edited && post.editedAt && (
                    <span className="post-edited">(edited {formatDate(post.editedAt)})</span>
                  )}
                </div>
                <div className="post-content">{post.content}</div>
                <div className="post-footer">
                  <div className="reaction-buttons">
                    <button 
                      className="post-action reaction-btn"
                      onClick={() => handleReaction(post.id, '👍')}
                    >
                      👍 {reactions[post.id]?.['👍'] || 0}
                    </button>
                    <button 
                      className="post-action reaction-btn"
                      onClick={() => handleReaction(post.id, '❤️')}
                    >
                      ❤️ {reactions[post.id]?.['❤️'] || 0}
                    </button>
                    <button 
                      className="post-action reaction-btn"
                      onClick={() => handleReaction(post.id, '😂')}
                    >
                      😂 {reactions[post.id]?.['😂'] || 0}
                    </button>
                    <button 
                      className="post-action reaction-btn"
                      onClick={() => handleReaction(post.id, '🔥')}
                    >
                      🔥 {reactions[post.id]?.['🔥'] || 0}
                    </button>
                  </div>
                  <div className="post-actions">
                    <button className="post-action">💬 Quote</button>
                    <button className="post-action">🚩 Report</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="reply-section">
          <h3 className="reply-title">POST REPLY</h3>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmitReply} className="reply-form">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="reply-textarea"
              placeholder="Write your reply here..."
              rows={6}
              required
            />
            <div className="reply-actions">
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'POSTING...' : 'POST REPLY'}
              </button>
              <button type="button" onClick={onBack} className="btn btn-secondary">CANCEL</button>
            </div>
          </form>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && reportTarget && (
        <ReportModal
          target={reportTarget}
          onSubmit={submitReport}
          onClose={() => {
            setShowReportModal(false)
            setReportTarget(null)
          }}
        />
      )}
    </div>
  )
}

// Report Modal Component
interface ReportModalProps {
  target: {type: string, id: number, title?: string}
  onSubmit: (reason: string, description: string) => void
  onClose: () => void
}

function ReportModal({ target, onSubmit, onClose }: ReportModalProps) {
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason.trim()) {
      alert('Please select a reason for reporting')
      return
    }
    onSubmit(reason, description)
  }

  const reportReasons = [
    'Spam or unwanted content',
    'Harassment or bullying', 
    'Inappropriate content',
    'Misinformation',
    'Copyright violation',
    'Other'
  ]

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content report-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Report {target.type === 'thread' ? 'Thread' : 'Post'}</h2>
        {target.title && (
          <p className="report-target">Reporting: "{target.title}"</p>
        )}
        
        <form onSubmit={handleSubmit} className="report-form">
          <div className="form-group">
            <label className="form-label">Reason for reporting:</label>
            <select 
              value={reason} 
              onChange={(e) => setReason(e.target.value)}
              className="form-select"
              required
            >
              <option value="">Select a reason...</option>
              {reportReasons.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Additional details (optional):</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-textarea"
              placeholder="Provide additional context about this report..."
              rows={4}
              maxLength={500}
            />
            <div className="form-hint">{description.length}/500 characters</div>
          </div>
          
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-danger">
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ThreadView