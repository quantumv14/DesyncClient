# Desync - CS2 Cheat Community Forum

A private, invite-only community forum for Desync Movement and Desync HvH Counter-Strike 2 cheats.

## Features

- 🔐 **Invite-Only Access** - Registration closed, new accounts by invite codes only
- 💬 **Live Chat** - Real-time chat embedded on the forum home page
- 📧 **Private Messaging** - Persistent PMs with real-time delivery
- 🔔 **Mentions & Notifications** - @username mentions with notifications
- 💰 **Token Economy (Desync$)** - Daily rewards, weekly bonuses, and redemption system
- 🎮 **CS2 Server Status** - Live server monitoring with player count and ping
- 💳 **Stripe Integration** - Purchase software with secure payment processing
- 👥 **Role-Based Permissions** - Owner, Admin, Moderator, Premium, and more
- 📊 **Admin Dashboard** - User management, invitation codes, and statistics

## Tech Stack

### Frontend
- React 18 with TypeScript
- React Router DOM for routing
- Vite for build tooling
- CSS with PostCSS for styling

### Backend
- Node.js with Express
- MongoDB with Mongoose ODM
- JWT authentication
- Stripe for payments
- GameDig for CS2 server status
- bcryptjs for password hashing

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account or local MongoDB instance
- Stripe account (for payment processing)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/desync.git
cd desync
```

2. Install frontend dependencies
```bash
npm install
```

3. Install backend dependencies
```bash
cd server
npm install
```

4. Set up environment variables

Create a `server/.env` file with the following:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/desync
JWT_SECRET=your-secure-jwt-secret-key-here
OWNER_EMAIL=owner@example.com
OWNER_USERNAME=OwnerUsername
OWNER_PASSWORD=SecureOwnerPassword123
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
PORT=5000

# Optional: Stripe Integration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### Running the Application

1. Start the backend server
```bash
cd server
npm start
```

The backend will run on `http://localhost:5000`

2. Start the frontend dev server
```bash
# In the project root directory
npm run dev
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register with invitation code
- `POST /api/auth/login` - Login with credentials
- `GET /api/auth/me` - Get current user

### Forum
- `GET /api/forum/categories` - Get all categories
- `GET /api/forum/threads` - Get threads (with category filter)
- `POST /api/forum/threads` - Create a new thread
- `GET /api/forum/threads/:id` - Get thread details
- `POST /api/forum/posts` - Create a new post

### Users
- `GET /api/users/:uid` - Get user profile
- `PATCH /api/users/:uid` - Update user profile

### Messages
- `GET /api/messages/conversations` - Get user's conversations
- `POST /api/messages/conversations` - Start a new conversation
- `GET /api/messages/:conversationId` - Get messages in conversation
- `POST /api/messages` - Send a message

### Notifications
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications/:id/read` - Mark notification as read
- `PATCH /api/notifications/read-all` - Mark all as read

### Tokens (Desync$)
- `GET /api/tokens/balance` - Get token balance
- `POST /api/tokens/claim-daily` - Claim daily reward
- `POST /api/tokens/redeem` - Redeem tokens for product

### Admin
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/users` - Get all users
- `POST /api/admin/invites/generate` - Generate invite codes
- `POST /api/admin/events/invite-wave` - Send invites to all users
- `PATCH /api/admin/users/:uid/ban` - Ban/unban user
- `PATCH /api/admin/users/:uid/rank` - Change user rank

### Server Status
- `GET /api/server-status` - Get CS2 server status

### Stripe
- `POST /api/stripe/create-checkout-session` - Create checkout session
- `POST /api/stripe/webhook` - Handle Stripe webhooks

## Database Models

- **User** - User accounts with profiles and authentication
- **Category** - Forum categories
- **Thread** - Forum threads
- **Post** - Forum posts/replies
- **InvitationCode** - Invite codes for registration
- **Conversation** - PM conversations
- **Message** - Private messages
- **Mention** - @username mentions
- **Notification** - User notifications
- **Role** - User roles (Admin, Moderator, etc.)
- **UserRole** - User-role assignments
- **Product** - Software products for purchase
- **Purchase** - Purchase records
- **TokenWallet** - User token balances
- **ChatMessage** - Live chat messages

## Token Economy (Desync$)

- 1 Desync$ per active day
- 7 Desync$ weekly bonus for 7-day streak
- Redeem tokens for:
  - Profile name effects
  - 1 week Desync Movement access
  - 1 week Desync HvH access

## Admin Features

- User management (ban, rank changes)
- Invitation code generation
- Invite wave events
- Dashboard statistics
- View all users and their status

## Security

- JWT token authentication
- Password hashing with bcryptjs
- Rate limiting on API endpoints
- CORS protection
- Helmet security headers
- Input validation and sanitization
- Stripe webhook signature verification

## Development

### Frontend Structure
```
src/
├── api/          # API client
├── components/   # React components
├── pages/        # Page components
└── App.tsx       # Main app component
```

### Backend Structure
```
server/
├── models/       # Mongoose models
├── routes/       # API routes
├── middleware/   # Express middleware
├── utils/        # Utility functions
└── index.js      # Server entry point
```

## Testing

### Run Tests
```bash
# Frontend tests
npm test

# Backend tests
cd server && npm test
```

## Deployment

1. Set `NODE_ENV=production` in your environment
2. Update `FRONTEND_URL` to your production domain
3. Configure MongoDB connection for production
4. Set up Stripe webhooks endpoint
5. Build frontend: `npm run build`
6. Deploy backend to your hosting service
7. Serve frontend build from CDN or static hosting

## Contributing

This is a private project. Contact the owner for contribution guidelines.

## License

Proprietary - All rights reserved

## Support

Join our Discord server or contact support through the forum.

## Changelog

### v1.0.0 (2025-11-02)
- Initial release
- Forum with categories, threads, and posts
- Private messaging system
- @username mentions and notifications
- Token economy (Desync$)
- CS2 server status integration
- Stripe payment processing
- Live chat feature
- Admin dashboard
- Invite-only registration

---

**Desync** - Perfecting CS2 Movement & HvH
