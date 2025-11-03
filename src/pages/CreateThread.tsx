import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import type { User } from './Auth'
import { api } from '../api/client'
import ServerStatus from '../components/ServerStatus'
import './CreateThread.css'

interface ForumCategory {
  id: number
  name: string
  description: string
  icon: string
}

interface CreateThreadProps {
  user: User
  onBack: () => void
  onLogout: () => void
  onThreadCreated: (threadId: number) => void
  onAdminPanel?: () => void
}

function CreateThread({ user, onBack, onLogout, onThreadCreated, onAdminPanel }: CreateThreadProps) {
  const [categories, setCategories] = useState<ForumCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number>(1)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const response = await api.getCategories()
      setCategories(response.success ? response.categories : [])
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Title is required')
      return
    }

    if (title.length < 5) {
      setError('Title must be at least 5 characters')
      return
    }

    if (!content.trim()) {
      setError('Content is required')
      return
    }

    if (content.length < 20) {
      setError('Content must be at least 20 characters')
      return
    }

    try {
      const response = await api.createThread(selectedCategory, title, content, user.uid)
      if (response.success && response.thread) {
        onThreadCreated(response.thread.id)
      } else {
        setError(response.message || 'Failed to create thread. Please try again.')
      }
    } catch (error) {
      setError('Failed to create thread. Please try again.')
    }
  }

  return (
    <div className="create-thread-page">
      <nav className="navbar">
        <div className="nav-links">
          <Link to="/" className="nav-link">HOME</Link>
          <Link to="/forum" className="nav-link active">FORUMS</Link>
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

      <div className="create-thread-container">
        <div className="create-thread-header">
          <h1 className="create-thread-title">CREATE NEW THREAD</h1>
          <p className="create-thread-subtitle">Share your thoughts with the community</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="create-thread-form">
          <div className="form-group">
            <label htmlFor="category" className="form-label">CATEGORY</label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(Number(e.target.value))}
              className="form-select"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="title" className="form-label">THREAD TITLE</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
              placeholder="Enter a descriptive title..."
              required
            />
            <div className="form-hint">{title.length}/100 characters</div>
          </div>

          <div className="form-group">
            <label htmlFor="content" className="form-label">CONTENT</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="form-textarea"
              placeholder="Write your thread content here..."
              rows={12}
              required
            />
            <div className="form-hint">{content.length} characters (minimum 20)</div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">CREATE THREAD</button>
            <button type="button" onClick={onBack} className="btn btn-secondary">CANCEL</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateThread