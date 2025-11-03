import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api/client';
import './LiveChat.css';

interface ChatMessage {
  id: number;
  userUid: number;
  username: string;
  userBadge: string;
  content: string;
  createdAt: string;
}

interface LiveChatProps {
  user: {
    uid: number;
    username: string;
    badge: string;
  };
}

function LiveChat({ user }: LiveChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      const chatContainer = messagesEndRef.current.parentElement;
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    // Only scroll if user is near bottom (within 150px) or on first load
    if (messagesEndRef.current) {
      const chatContainer = messagesEndRef.current.parentElement;
      if (chatContainer) {
        const isNearBottom = chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight < 150;
        const isFirstLoad = messages.length > 0 && chatContainer.scrollTop === 0;
        if (isNearBottom || isFirstLoad) {
          setTimeout(() => scrollToBottom(), 0);
        }
      }
    }
  }, [messages]);

  useEffect(() => {
    loadMessages();
    
    // Poll for new messages every 5 seconds
    const interval = setInterval(() => {
      loadMessages();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const loadMessages = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/chat/messages', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || isLoading) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content: newMessage })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setNewMessage('');
        await loadMessages();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getBadgeColor = (badge: string) => {
    const colors: { [key: string]: string } = {
      Owner: '#ff4444',
      Admin: '#ff6b6b',
      Moderator: '#10b981',
      Premium: '#8b5cf6',
      Known: '#6366f1',
      Member: '#6b7280'
    };
    return colors[badge] || '#6b7280';
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="live-chat">
      <div className="chat-header">
        <h3>Live Chat</h3>
        <span className="chat-users-count">{messages.length > 0 ? `${new Set(messages.map(m => m.userUid)).size} online` : 'No users'}</span>
      </div>
      
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <p>No messages yet. Be the first to chat!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`chat-message ${msg.userUid === user.uid ? 'own-message' : ''}`}>
              <div className="message-header">
                <span 
                  className="message-username" 
                  style={{ color: getBadgeColor(msg.userBadge) }}
                >
                  {msg.username}
                </span>
                <span className="message-badge" style={{ backgroundColor: getBadgeColor(msg.userBadge) }}>
                  {msg.userBadge}
                </span>
                <span className="message-time">{formatTime(msg.createdAt)}</span>
              </div>
              <div className="message-content">{msg.content}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form className="chat-input-form" onSubmit={sendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          maxLength={500}
          className="chat-input"
          disabled={isLoading}
        />
        <button 
          type="submit" 
          className="chat-send-btn"
          disabled={isLoading || !newMessage.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default LiveChat;

