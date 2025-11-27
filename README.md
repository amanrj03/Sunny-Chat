# Private Chat - End-to-End Encrypted Messaging

A modern, secure messaging application featuring end-to-end encryption (E2E) with user authentication and real-time conversations. Built with Next.js, React, and industry-standard cryptographic protocols.

## Features

- **End-to-End Encryption**: All messages are encrypted using ECDH key exchange and AES-GCM
- **User Authentication**: Secure login via NextAuth with Google OAuth
- **Real-time Messaging**: WebSocket support for instant message delivery
- **User Search**: Find and start conversations with other users
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS
- **Modern UI**: shadcn/ui components for a polished user experience
- **Onboarding**: User profile setup with demographic information

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Authentication**: NextAuth.js with Google OAuth
- **Database**: PostgreSQL (via Neon)
- **Encryption**: Web Crypto API (ECDH + AES-GCM)
- **Real-time**: WebSocket (ws)
- **Forms**: React Hook Form, Zod validation

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm (or npm/yarn)
- PostgreSQL database (Neon recommended)
- Google OAuth credentials

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd chatappwithencryption
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   pnpm install
   \`\`\`

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   \`\`\`
   DATABASE_URL=postgresql://user:password@host/database
   NEXTAUTH_SECRET=your-secret-key
   NEXTAUTH_URL=http://localhost:3000
   GOOGLE_ID=your-google-client-id
   GOOGLE_SECRET=your-google-client-secret
   \`\`\`

4. **Initialize the database**
   \`\`\`bash
   pnpm run db:init
   \`\`\`

5. **Start the development server**
   \`\`\`bash
   pnpm run dev
   \`\`\`

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

\`\`\`
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/     # NextAuth configuration
│   │   ├── conversations/          # Conversation endpoints
│   │   ├── messages/               # Message endpoints
│   │   ├── onboarding/            # User onboarding
│   │   └── users/search/          # User search
│   ├── chat/                       # Main chat interface
│   ├── login/                      # Login page
│   ├── onboarding/                # Onboarding page
│   ├── page.tsx                    # Home page
│   └── layout.tsx                  # Root layout
├── components/
│   ├── chat/
│   │   ├── chat-list.tsx          # Conversation list
│   │   ├── chat-window.tsx        # Message view
│   │   └── search-user.tsx        # User search
│   └── ui/                        # shadcn/ui components
├── lib/
│   ├── auth.ts                    # NextAuth configuration
│   ├── crypto.ts                  # Encryption utilities
│   ├── db.ts                      # Database connection
│   └── utils.ts                   # Helper functions
├── types/
│   └── db.ts                      # Database types
├── scripts/
│   ├── server.ts                  # WebSocket server
│   └── sql/
│       └── 001_init.sql          # Database schema
└── public/                        # Static assets
\`\`\`

## How End-to-End Encryption Works

### Key Exchange Process

1. **Identity Key Generation**: Each user generates an ECDH key pair (P-256 curve)
2. **Public Key Storage**: Public keys are stored in the database and shared with other users
3. **Shared Key Derivation**: When starting a conversation:
   - User A derives a shared key using their private key + User B's public key
   - User B derives the same shared key using their private key + User A's public key
   - Both users now have an identical symmetric key without transmitting it

### Message Encryption

1. **Encryption**: Sender encrypts message using AES-GCM with the shared key
2. **IV Generation**: A random 12-byte initialization vector (IV) is generated for each message
3. **Storage**: Ciphertext and IV are stored in the database (not readable by server)
4. **Decryption**: Recipient uses their derived shared key to decrypt messages

### Security Notes

- Private keys are stored in browser localStorage (consider stronger protection for production)
- Messages are encrypted at rest in the database
- The server never has access to plaintext messages or private keys
- Each message uses a unique IV for security

## Database Schema

### Users Table
Stores user profile information and public encryption keys:
\`\`\`sql
- id (primary key)
- email (unique)
- google_id (unique)
- name, age, gender
- mobile (unique)
- public_key (ECDH public key)
\`\`\`

### Conversations Table
Represents chat sessions:
\`\`\`sql
- id (primary key)
- created_at
\`\`\`

### Messages Table
Stores encrypted messages:
\`\`\`sql
- id (primary key)
- conversation_id
- sender_id
- ciphertext (encrypted message)
- iv (initialization vector)
- created_at
\`\`\`

## API Endpoints

### Authentication
- `POST /api/auth/signin` - Sign in with Google
- `POST /api/auth/signout` - Sign out

### Users
- `GET /api/users/search?q=query` - Search users by mobile or name

### Conversations
- `GET /api/conversations` - Get user's conversations
- `POST /api/conversations` - Create new conversation

### Messages
- `GET /api/messages?conversationId=id` - Get messages from conversation
- `POST /api/messages` - Send encrypted message

## Scripts

- `pnpm run dev` - Start development server with hot reload
- `pnpm run build` - Build for production
- `pnpm run start` - Start production server
- `pnpm run lint` - Run ESLint

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Secret key for NextAuth sessions |
| `NEXTAUTH_URL` | Application URL (for OAuth callback) |
| `GOOGLE_ID` | Google OAuth Client ID |
| `GOOGLE_SECRET` | Google OAuth Client Secret |

## Security Considerations

⚠️ **For Production**:
- Implement stronger private key storage (Secure Enclave, HSM, or encrypted storage)
- Use HTTPS/TLS for all connections
- Implement rate limiting on authentication endpoints
- Add CSRF protection
- Consider implementing perfect forward secrecy (PFS)
- Audit encryption implementation regularly

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues or questions, please open an issue on the GitHub repository.

---

**Built with** ❤️ using Next.js, React, and Web Crypto API
