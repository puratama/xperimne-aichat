# PRD: Xperimne Chatbot

## Executive Summary

Xperimne Chatbot is a general-purpose AI chat application that leverages Puter.js to provide free GPT-powered conversations with personalized chat history. Users can sign up via email or social OAuth, have persistent conversations stored in PostgreSQL via Prisma, and enjoy a seamless ChatGPT-like experience — all without API key costs.

---

## Problem Statement

- Existing AI chat platforms (ChatGPT, Claude, Gemini) require paid subscriptions for reliable usage or impose strict rate limits
- Setting up an AI chatbot with a custom backend requires managing API keys, billing, and infrastructure
- Users want a **free**, **personalized** chat experience where their conversation history persists across sessions
- Most free chat apps lack user authentication and history persistence

---

## Goals & Success Metrics

| Goal | Metric |
|------|--------|
| Free AI chat without rate limits | Zero API cost per user session |
| User adoption | 100+ registered users in first month |
| Chat history persistence | 90%+ of returning users access past conversations |
| Seamless auth flow | < 30 seconds to sign up and start chatting |
| Response reliability | 99%+ uptime for Puter.js AI service |

---

## Target Users / Personas

### Primary: Casual Chat Users
- **Profile**: Individuals who want free AI chat for daily queries, brainstorming, learning
- **Pain Point**: Paid tiers on ChatGPT/Claude are expensive for casual use
- **Use Case**: Ask questions, get explanations, draft content

### Secondary: Power Users
- **Profile**: Users who need persistent chat history for reference
- **Pain Point**: Losing conversation context when switching devices or clearing cache
- **Use Case**: Long-running research sessions, project planning with AI

### Tertiary: Developers
- **Profile**: Developers evaluating Puter.js AI capabilities
- **Pain Point**: Need a reference implementation of Puter.js with auth + persistence
- **Use Case**: Testing Puter.js integration patterns

---

## Core Features & Requirements

### Must-Have (MVP)

#### 1. AI Chat via Puter.js
- **Description**: Real-time chat interface powered by Puter.js free GPT models
- **User Benefit**: Free, unlimited AI conversations — no API keys, no billing
- **Acceptance Criteria**:
  - User sends a message and receives AI response within 5 seconds
  - Supports multi-turn conversation context
  - Fallback model if primary model is unavailable
  - Markdown rendering in responses (code blocks, lists, etc.)

#### 2. User Authentication (Combined)
- **Description**: Register/login via email/password OR Google/GitHub OAuth
- **User Benefit**: One-click social login or traditional email signup
- **Acceptance Criteria**:
  - Email/password registration with verification
  - Google OAuth login
  - GitHub OAuth login
  - Session persists across browser restarts
  - "Forgot password" flow

#### 3. Chat History Persistence
- **Description**: All conversations saved to PostgreSQL via Prisma, tied to user account
- **User Benefit**: Never lose a conversation; pick up where you left off
- **Acceptance Criteria**:
  - Every message (user + AI) saved in real-time
  - Chat history loads on login
  - User can view list of past conversations
  - User can delete individual conversations

#### 4. Conversation Management
- **Description**: Sidebar with list of past conversations; create, rename, delete
- **User Benefit**: Organize chats by topic
- **Acceptance Criteria**:
  - Auto-generated title from first message
  - Manual rename option
  - Delete with confirmation dialog
  - Search/filter conversations by title

### Should-Have (Phase 2)

#### 5. Dark Mode / Theme Toggle
- Light/dark/system theme support, persisted in user preferences

#### 6. Message Streaming
- Real-time streaming of AI responses (token-by-token) via Puter.js streaming API

#### 7. Export Chat
- Export conversation as Markdown, JSON, or TXT

### Nice-to-Have (Future)

- AI personality selection (different Puter.js models)
- Shared/public chat links
- Prompt templates / saved prompts
- Rate limiting fairness system

### Anti-Features (Intentionally Excluded)
- No ads or paid tiers (core value = free)
- No data mining / reselling of conversations
- No file upload/image analysis (would increase complexity)

---

## Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| Performance | Chat response < 5s (Puter.js latency dependent) |
| Security | All auth via NextAuth.js; session tokens HTTP-only; passwords hashed (bcrypt) |
| Privacy | Conversations are private per user; never shared or logged externally |
| Scalability | PostgreSQL + Prisma connection pooling for concurrent users |
| Accessibility | WCAG 2.1 AA compliant (keyboard nav, screen reader, color contrast) |
| Responsiveness | Works on mobile, tablet, desktop (Tailwind responsive design) |

---

## Out of Scope

- Mobile native apps (iOS/Android) — web-only MVP
- Real-time collaboration / multi-user chat rooms
- Custom AI model fine-tuning
- Admin dashboard
- File/image upload & analysis
- Voice input / TTS

---

## Technical Constraints & Considerations

### Architecture
```
[Browser] ←→ [Next.js App (Server)] ←→ [Prisma ORM] ←→ [PostgreSQL]
    ↑                                           
    └── Puter.js SDK (client-side) ──→ [Puter AI API]
```

### Tech Stack
| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | shadcn/ui + Tailwind CSS v4 |
| AI SDK | @heyputer/puter.js (free, no API key) |
| Auth | NextAuth.js (v5) — email + Google OAuth + GitHub OAuth |
| Database ORM | Prisma |
| Database | PostgreSQL (Neon / Supabase free tier) |
| Language | TypeScript |

### Key Considerations
- **Puter.js limitation**: Entirely client-side; AI requests originate from the browser. This means there is no server-side AI call — good for cost but means the client must be trusted
- **Chat storage**: Messages are sent client-side to Puter.js, then both user message and AI response are stored server-side via Next.js API routes + Prisma
- **Rate limiting**: Puter.js has implicit rate limits; implement client-side debounce to prevent abuse
- **Free tier DB**: Use Neon (serverless PostgreSQL free tier — 500MB) or Supabase free (500MB)

---

## Timeline & Phases

| Phase | Duration | Deliverables |
|-------|----------|-------------|
| **Phase 0: Setup** | 1 week | Next.js + shadcn/ui + Prisma + PostgreSQL setup; Puter.js integration test |
| **Phase 1: Auth** | 1 week | NextAuth.js (email + Google + GitHub); login/register pages; session management |
| **Phase 2: Chat** | 2 weeks | Chat UI (shadcn/ui); Puter.js integration; message sending/display; markdown rendering |
| **Phase 3: History** | 1 week | Prisma schema (User, Conversation, Message); save/load chats; sidebar conversation list |
| **Phase 4: Polish** | 1 week | Dark mode; error handling; loading states; responsive design; deployment |
| **Total MVP** | **6 weeks** | |

---

## Risks & Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Puter.js API changes/deprecation | High | Low | Abstract Puter.js behind a service layer; easy to swap to another provider |
| Puter.js rate limiting under load | Medium | Medium | Client-side retry + queue; graceful degradation with "try again" message |
| PostgreSQL free tier storage limit | Medium | Low | Archive old conversations; implement TTL on unused chats |
| OAuth provider outages | Low | Low | Email/password as fallback always available |
| User data privacy regulations | Medium | Medium | Store only essential data; allow full account deletion |

---

## Appendix

### Competitor Landscape

| Product | Free? | Auth? | History? | Cost Model |
|---------|-------|-------|----------|------------|
| ChatGPT | Limited (GPT-3.5) | Yes | Yes | Free tier + $20/mo |
| Claude | Limited | Yes | Yes | Free tier + $20/mo |
| Gemini | Yes (with limits) | Yes | Yes | Free with Google account |
| **Xperimne Chatbot** | **Unlimited (Puter.js)** | **Yes** | **Yes** | **100% free** |

### Puter.js Integration Notes
- Install: `npm install @heyputer/puter.js`
- Import: `import { puter } from '@heyputer/puter.js'`
- Chat call: `puter.ai.chat("message")` returns `{ message: { content: "..." } }`
- No API keys, no backend AI calls — runs entirely client-side
- Sign-in: `puter.auth.signIn()` opens popup; `puter.auth.getUser()` returns user info
- **Note**: Puter.js auth is *separate* from app auth. App uses NextAuth.js; Puter.js handles its own user context for rate limiting

### Prisma Schema (Draft)

```prisma
model User {
  id        String   @id @default(cuid())
  name      String?
  email     String?  @unique
  image     String?
  password  String?  // hashed, null for OAuth users
  accounts  Account[]
  sessions  Session[]
  conversations Conversation[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Conversation {
  id        String    @id @default(cuid())
  title     String?
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  messages  Message[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Message {
  id             String       @id @default(cuid())
  role           String       // "user" | "assistant"
  content        String
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  createdAt      DateTime     @default(now())
}
```

### Auth Providers (NextAuth.js)
- **Email/Password**: Credentials provider with bcrypt password hashing
- **Google**: Google OAuth provider
- **GitHub**: GitHub OAuth provider
