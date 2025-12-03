# SecureChat - End-to-End Encrypted Messaging App

A modern, secure real-time chat application with end-to-end encryption, built with React and Node.js.

![SecureChat](https://img.shields.io/badge/SecureChat-E2E%20Encrypted-orange)
![React](https://img.shields.io/badge/React-18.3-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-NeonDB-purple)

## ✨ Features

- **🔐 End-to-End Encryption** - All messages are encrypted using libsodium (X25519 + XSalsa20-Poly1305)
- **💬 Real-time Messaging** - Instant message delivery via WebSocket
- **👤 User Authentication** - Secure JWT-based authentication with email/phone login
- **🚫 Block/Unblock Users** - Control who can message you
- **📱 Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **🗑️ Delete Conversations** - Remove chat history with cascade deletion
- **👥 User Profiles** - Customizable profiles with avatar, bio, and personal info
- **🔍 User Search** - Find users by phone number to start new conversations

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and builds
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **libsodium-wrappers** for client-side encryption
- **React Router** for navigation

### Backend
- **Node.js** with Express.js
- **Prisma ORM** for database operations
- **PostgreSQL** (NeonDB) for data storage
- **WebSocket (ws)** for real-time communication
- **JWT** for authentication
- **bcryptjs** for password hashing

## 📁 Project Structure

```
├── src/                      # Frontend source code
│   ├── components/           # React components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── ChatInterface.tsx
│   │   ├── ChatList.tsx
│   │   ├── ChatSidebar.tsx
│   │   ├── DashboardNav.tsx
│   │   ├── SearchUsers.tsx
│   │   └── UserProfile.tsx
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx
│   ├── lib/                 # Utilities
│   │   └── encryption.ts    # E2E encryption service
│   ├── pages/               # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Login.tsx
│   │   └── Signup.tsx
│   └── services/            # API & WebSocket services
│       ├── api.ts
│       └── websocket.ts
│
├── backend/                  # Backend source code
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Auth middleware
│   │   ├── routes/          # API routes
│   │   └── websocket/       # WebSocket handler
│   └── server.js            # Entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (NeonDB recommended)
- npm or yarn package manager

### Frontend Setup

1. **Navigate to frontend folder:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure API URL:**
   Update the API URL in `src/services/api.ts` and `src/services/websocket.ts`:
   ```typescript
   const API_URL = 'http://localhost:3001/api';  // or your deployed backend URL
   const WS_URL = 'ws://localhost:3001';
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

### Backend Setup

1. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your credentials:
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
   JWT_SECRET="your-super-secret-jwt-key-change-this"
   PORT=3001
   ```

4. **Run database migrations:**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

5. **Start the server:**
   ```bash
   npm run dev
   ```

## 🔒 Security Features

### End-to-End Encryption

All messages are encrypted client-side before transmission using:
- **Key Exchange:** X25519 (Curve25519)
- **Encryption:** XSalsa20-Poly1305 (authenticated encryption)

Each user generates a key pair on signup:
- Public key is stored on the server for other users to encrypt messages
- Private key is stored only in the user's browser (localStorage)

**Important:** If a user clears their browser data, they will lose their private key and cannot decrypt old messages.

### Authentication

- Passwords are hashed using bcrypt with salt rounds
- JWT tokens for session management
- Tokens expire after 7 days

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create new account |
| POST | `/api/auth/login` | Login with email/phone + password |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chat/chats` | Get all user conversations |
| GET | `/api/chat/messages/:userId` | Get messages with a user |
| GET | `/api/chat/search?phoneNumber=xxx` | Search user by phone |
| POST | `/api/chat/block` | Block a user |
| POST | `/api/chat/unblock` | Unblock a user |
| GET | `/api/chat/block-status/:userId` | Check block status |
| DELETE | `/api/chat/conversation/:userId` | Delete conversation |

### User
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Get own profile |
| GET | `/api/user/:userId` | Get user details |
| PUT | `/api/user/profile` | Update profile |
| PUT | `/api/user/password` | Change password |

## 🔌 WebSocket Events

### Client → Server
```json
{
  "type": "send_message",
  "receiverId": "user-uuid",
  "content": "{encrypted-message-json}"
}
```

### Server → Client
```json
// New message received
{
  "type": "new_message",
  "message": { "id": "...", "content": "...", "senderId": "...", ... }
}

// Message sent confirmation
{
  "type": "message_sent",
  "message": { "id": "...", "content": "...", ... }
}

// Error
{
  "type": "error",
  "message": "Error description"
}
```

## 🚢 Deployment

### Frontend
Deploy to any static hosting:
- **Vercel:** Connect GitHub repo
- **Netlify:** Connect GitHub repo

### Backend
Deploy to any Node.js hosting:
- **Railway:** `railway up`
- **Render:** Connect GitHub repo
- **Heroku:** `git push heroku main`
- **VPS:** Use PM2 or Docker

Remember to:
1. Update frontend API/WebSocket URLs to production backend
2. Set environment variables on your hosting platform
3. Run Prisma migrations on the production database

## 📝 Database Schema

```prisma
model User {
  id          String   @id @default(uuid())
  email       String   @unique
  phoneNumber String   @unique
  password    String
  name        String
  publicKey   String?
  profilePic  String?
  dateOfBirth DateTime?
  gender      String?
  bio         String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Message {
  id         String   @id @default(uuid())
  content    String   // Encrypted content
  senderId   String
  receiverId String
  createdAt  DateTime @default(now())
}

model BlockedUser {
  id        String   @id @default(uuid())
  blockerId String
  blockedId String
  createdAt DateTime @default(now())
}

model ChatList {
  id                  String   @id @default(uuid())
  participantOneId    String
  participantTwoId    String
  lastMessage         String?
  lastMessageSenderId String?
  updatedAt           DateTime @updatedAt
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [libsodium](https://libsodium.org/) for cryptographic functions
- [Prisma](https://prisma.io/) for database ORM
- [NeonDB](https://neon.tech/) for serverless PostgreSQL

---

