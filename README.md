# Translation Chat — Web

Next.js web client for the real-time translation chat platform. Visitors chat
with a translation specialist instantly — no registration, no configuration.

## Requirements

- Node.js 24+
- pnpm
- The backend (`api/`) running

## Setup

```bash
cp .env.example .env.local
pnpm install
```

## Run

```bash
pnpm dev     # http://localhost:3000
pnpm build
pnpm start
```

## How it works

1. On the first request, `src/middleware.ts` signs a JWT (HS256, shared
   `JWT_SECRET`) and stores it in an HttpOnly `jwt` cookie. The `sub` claim is
   the chat session id.
2. The chat connects to the backend over Socket.IO with `withCredentials`, so
   the cookie authenticates the handshake. The browser never touches the token.
3. Messages, typing signals, and connection state flow through
   `src/services/socket.ts` — components never use Socket.IO directly.

## Structure

```
src/
├── app/          # Next.js app router (layout, page, global styles + design tokens)
├── components/
│   ├── chat/     # chat-window, message-list, chat-message, message-input, typing-indicator
│   ├── feedback/ # connection-status, error-message
│   ├── layout/   # header
│   └── ui/       # button, spinner
├── hooks/        # use-chat — conversation state
├── lib/          # jwt signing/verification (server only)
├── services/     # socket.ts — the only Socket.IO touchpoint
├── types/        # chat domain types
├── utils/        # formatting helpers
└── middleware.ts # issues the session cookie
```

Design tokens (colors, radii, font) live in `src/app/globals.css` and follow
`project/docs/DESIGN_SYSTEM.md`.
