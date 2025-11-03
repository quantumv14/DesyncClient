import { useState, useEffect } from 'react';
import { api } from '../api/client';
import './ServerStatus.css';

interface ServerStatusProps {
  className?: string;
}

interface ServerData {
  name: string;
  map: string;
  players: {
    current: number;
    max: number;
    list: Array<{
      name: string;
      score: number;
      duration: number;
    }>;
  };
  ping: number;
  statusRate: number;
  online: boolean;
  raw: {
    game: string;
    version: string;
  };
}

function ServerStatus({ className = '' }: ServerStatusProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [serverData, setServerData] = useState<ServerData | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchServerStatus = async () => {
    // Only show loading for initial fetch, not for auto-refresh
    if (!serverData) {
      setLoading(true);
    }
    setError(null);
    try {
      const response = await api.getServerStatus();
      if (response.success && response.server) {
        setServerData(response.server);
        setLastUpdate(new Date());
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Failed to fetch server status:', err);
      // Only clear data on initial fetch failure
      if (!serverData) {
        setServerData(null);
      }
      setError(err instanceof Error ? err.message : 'Failed to fetch server data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchServerStatus();
      // Auto-refresh every 5 seconds when modal is open
      const interval = setInterval(fetchServerStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const getStatusColor = (rate: number) => {
    if (rate >= 80) return '#10b981'; // Green
    if (rate >= 50) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  const formatPing = (ping: number) => {
    if (ping < 0) return 'N/A';
    return `${ping}ms`;
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return '0m';
    const mins = Math.floor(seconds / 60);
    const hours = Math.floor(mins / 60);
    if (hours > 0) return `${hours}h ${mins % 60}m`;
    return `${mins}m`;
  };

  return (
    <>
      <a 
        className={`nav-link ${className}`}
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(true);
        }}
        style={{ cursor: 'pointer' }}
        title="Server Status"
      >
        STATUS
      </a>

      {isOpen && (
        <div className="server-status-overlay" onClick={() => setIsOpen(false)}>
          <div className="server-status-modal" onClick={(e) => e.stopPropagation()}>
            <div className="server-status-header">
              <h2>CS2 Server Status</h2>
              <button className="close-button" onClick={() => setIsOpen(false)}>×</button>
            </div>

            <div className="server-status-content">
              {loading && !serverData ? (
                <div className="loading-container">
                  <div className="spinner"></div>
                  <p>Loading server status...</p>
                </div>
              ) : serverData ? (
                <>
                  <div className="status-summary">
                    <div className="status-item">
                      <span className="status-label">Server Name:</span>
                      <span className="status-value">{serverData.name}</span>
                    </div>
                    <div className="status-item">
                      <span className="status-label">Status:</span>
                      <span 
                        className="status-value status-online"
                        style={{ color: serverData.online ? '#10b981' : '#ef4444' }}
                      >
                        {serverData.online ? 'Online' : 'Offline'}
                      </span>
                    </div>
                    <div className="status-item">
                      <span className="status-label">Map:</span>
                      <span className="status-value">{serverData.map}</span>
                    </div>
                    <div className="status-item">
                      <span className="status-label">Players:</span>
                      <span className="status-value">
                        {serverData.players.current} / {serverData.players.max}
                      </span>
                    </div>
                    <div className="status-item">
                      <span className="status-label">Ping:</span>
                      <span className="status-value">{formatPing(serverData.ping)}</span>
                    </div>
                    <div className="status-item">
                      <span className="status-label">Status Rate:</span>
                      <span 
                        className="status-value status-rate"
                        style={{ color: getStatusColor(serverData.statusRate) }}
                      >
                        {serverData.statusRate}%
                      </span>
                    </div>
                  </div>

                  {serverData.online && serverData.players.list.length > 0 && (
                    <div className="players-list">
                      <h3>Players ({serverData.players.list.length})</h3>
                      <div className="players-table">
                        <div className="players-header">
                          <div>Name</div>
                          <div>Score</div>
                          <div>Time</div>
                        </div>
                        {serverData.players.list.map((player, index) => (
                          <div key={index} className="players-row">
                            <div className="player-name">{player.name}</div>
                            <div className="player-score">{player.score}</div>
                            <div className="player-time">{formatDuration(player.duration)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {lastUpdate && (
                    <div className="last-update">
                      {loading ? (
                        <span className="updating-indicator">
                          <div className="update-spinner"></div>
                          Updating...
                        </span>
                      ) : (
                        <>Last updated: {lastUpdate.toLocaleTimeString()}</>
                      )}
                    </div>
                  )}
                </>
              ) : error ? (
                <div className="error-message">
                  <p>Unable to connect to server status API.</p>
                  <p className="error-details">{error}</p>
                  <p>Please check your connection or try again later.</p>
                </div>
              ) : null}
              
              {serverData && !serverData.online && (
                <div className="server-offline-notice">
                  <p>⚠️ Server is currently offline</p>
                  <p className="offline-subtext">The server may be restarting or under maintenance.</p>
                </div>
              )}

              <div className="server-status-actions">
                <button 
                  className="refresh-button"
                  onClick={fetchServerStatus}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="button-spinner"></div>
                      Refreshing...
                    </>
                  ) : (
                    'Refresh'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ServerStatus;

