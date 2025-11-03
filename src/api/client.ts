const API_BASE = import.meta.env.DEV 
  ? 'http://localhost:5000/api' 
  : 'https://isolated-mellie-desynccheats-79e7a6ad.koyeb.app/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

async function apiCall(endpoint: string, options: RequestInit = {}) {
  try {
    const url = `${API_BASE}/${endpoint}`.replace(/([^:]\/)\/+/g, '$1');
    
    const authHeaders = getAuthHeaders();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(authHeaders as Record<string, string>),
      ...(options.headers || {}),
    };
    
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', { status: response.status, error: errorText });
      
      let errorMessage = `API Error: ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('API Call Failed:', { endpoint, error });
    throw error;
  }
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    apiCall('auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (email: string, username: string, password: string, invitationCode: string) =>
    apiCall('auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, username, password, invitationCode }),
    }),

  verifyToken: (token: string) =>
    apiCall('auth/verify-token', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),

  // Users
  getUsers: () => apiCall('users'),
  getUser: (uid: number) => apiCall(`users/${uid}`),
  updateAboutMe: (aboutMe: string) =>
    apiCall('users/about-me', {
      method: 'PUT',
      body: JSON.stringify({ aboutMe }),
    }),
  updateUserProfile: (uid: number, username: string, email: string, aboutMe: string) =>
    apiCall(`users/${uid}/profile`, {
      method: 'PUT',
      body: JSON.stringify({ username, email, aboutMe }),
    }),

  // Private Messages
  sendMessage: (userId: number, subject: string, content: string) =>
    apiCall(`users/${userId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ subject, content }),
    }),
  getMessages: () => apiCall('users/messages'),
  markMessageRead: (messageId: number) =>
    apiCall(`users/messages/${messageId}/read`, {
      method: 'PUT',
    }),

  // Notifications
  getNotifications: () => apiCall('users/notifications'),
  markNotificationRead: (notificationId: number) =>
    apiCall(`users/notifications/${notificationId}/read`, {
      method: 'PUT',
    }),

  // Forum
  getCategories: () => apiCall('forum/categories'),
  getThreads: (categoryId?: number) =>
    apiCall(`forum/threads${categoryId ? `?categoryId=${categoryId}` : ''}`),
  getThread: (threadId: number) => apiCall(`forum/threads/${threadId}`),
  createThread: (categoryId: number, title: string, content: string) =>
    apiCall('forum/threads', {
      method: 'POST',
      body: JSON.stringify({ categoryId, title, content }),
    }),
  getPosts: (threadId: number) => apiCall(`forum/threads/${threadId}/posts`),
  createPost: (threadId: number, content: string) =>
    apiCall('forum/posts', {
      method: 'POST',
      body: JSON.stringify({ threadId, content }),
    }),
  addReaction: (postId: number, emoji: string) =>
    apiCall(`forum/posts/${postId}/reactions`, {
      method: 'POST',
      body: JSON.stringify({ emoji }),
    }),
  getReactions: (postId: number) =>
    apiCall(`forum/posts/${postId}/reactions`),

  // Admin
  getCodes: () => apiCall('admin/codes'),
  createCode: (expiresAt: string, maxUses?: number, customCode?: string) =>
    apiCall('admin/codes/generate', {
      method: 'POST',
      body: JSON.stringify({ expiresAt, maxUses, customCode }),
    }),
  deleteCode: (code: string) =>
    apiCall(`admin/codes/${encodeURIComponent(code)}`, {
      method: 'DELETE',
    }),
  banUser: (uid: number, reason: string, bannedBy: number) =>
    apiCall(`admin/users/${uid}/ban`, {
      method: 'POST',
      body: JSON.stringify({ reason, bannedBy }),
    }),
  unbanUser: (uid: number) =>
    apiCall(`admin/users/${uid}/unban`, {
      method: 'POST',
    }),
  changeUserRank: (uid: number, badge: string) =>
    apiCall(`admin/users/${uid}/rank`, {
      method: 'PUT',
      body: JSON.stringify({ badge }),
    }),
  
  // Reports
  createReport: (type: string, targetId: number, reason: string, description?: string) =>
    apiCall('admin/reports', {
      method: 'POST',
      body: JSON.stringify({ type, targetId, reason, description }),
    }),
  getReports: (status?: string, type?: string) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (type) params.append('type', type);
    return apiCall(`admin/reports${params.toString() ? '?' + params.toString() : ''}`);
  },
  updateReport: (reportId: number, status: string, action?: string) =>
    apiCall(`admin/reports/${reportId}`, {
      method: 'PUT',
      body: JSON.stringify({ status, action }),
    }),
  
  // Admin Stats
  getAdminStats: () => apiCall('admin/stats'),

  // Software & Purchases
  getSoftware: () => apiCall('software'),
  getSoftwareById: (id: number) => apiCall(`software/${id}`),
  createPurchase: (userId: number, softwareId: number, paymentMethod: 'Crypto' | 'Card') =>
    apiCall('purchases', {
      method: 'POST',
      body: JSON.stringify({ userId, softwareId, paymentMethod }),
    }),
  getUserPurchases: (userId: number) => apiCall(`purchases/user/${userId}`),

  // Events & Inventory
  getEvents: () => apiCall('admin/events'),
  executeInviteWave: () =>
    apiCall('admin/events/invite-wave', {
      method: 'POST',
    }),
  addInventoryItem: (userId: number, itemType: string, itemName: string, description: string, expiresAt?: string) =>
    apiCall(`admin/users/${userId}/inventory`, {
      method: 'POST',
      body: JSON.stringify({ itemType, itemName, description, expiresAt }),
    }),
  useInventoryItem: (userId: number, itemId: number) =>
    apiCall(`admin/users/${userId}/inventory/${itemId}/use`, {
      method: 'PUT',
    }),

  // Server Status
  getServerStatus: () => apiCall('server-status'),

  // User Inventory
  getUserInventory: (uid: number) => apiCall(`users/${uid}/inventory`),
}