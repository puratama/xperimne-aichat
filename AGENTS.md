# This is NOT the Next.js you know

Next.js 16 has breaking changes. Read `node_modules/next/dist/docs/` before writing any code — it documents the exact installed version.

## Commands

```sh
npm run dev          # next dev -p 3030
npm run build        # next build (includes TS check)
npm run db:push      # push Prisma schema to PostgreSQL
npm run db:generate  # regenerate Prisma client to src/generated/prisma/
npm run db:studio    # prisma studio --port 3031
npm run lint         # ESLint 9 flat config
```

No test framework is installed.

## Architecture

- **Next.js 16 App Router** — route groups `(auth)` and `(chat)`
- **Prisma 7** — client at `src/generated/prisma/client`; requires `@prisma/adapter-pg` driver. `PrismaClient({ adapter: new PrismaPg({ connectionString }) })` — no-arg constructor does NOT work. Prisma config in `prisma.config.ts`
- **NextAuth v5** (`next-auth@5.0.0-beta.31`) — config in `src/lib/auth.ts`, route handler at `app/api/auth/[...nextauth]`. **Must use `PrismaAdapter` from `@auth/prisma-adapter`** so OAuth users are persisted to DB. JWT session strategy.
- **OAuth providers** (Google, GitHub) use `allowDangerousEmailAccountLinking: true`. Credentials provider uses bcrypt. Callback URL path: `/api/auth/callback/{provider}`
- **shadcn/ui** with Base UI (`@base-ui/react`) — no `asChild` prop, use `render` prop or direct className. Component registry is empty; all UI components are custom.
- **Tailwind v4** with `@tailwindcss/postcss` — no `tailwind.config.js`. CSS vars in `src/app/globals.css` via `@theme inline {}`
- **Fonts**: Syne (`--font-heading`), DM Sans (`--font-sans`)
- **next-themes** — `ThemeProvider` with `attribute="class"`, requires `suppressHydrationWarning` on `<html>` in layout
- **All API routes** use server-side `auth()` from `@/lib/auth` and return 401 if no session
- **No tests** exist in the repo

## API routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/chat` | POST | Save message + create conversation, returns `{ conversationId }` |
| `/api/chat/proxy` | POST | Save message + stream OpenRouter response via SSE, saves AI message on stream end |
| `/api/conversations` | GET/POST | List / create conversations |
| `/api/conversations/[id]` | GET/PATCH/DELETE | CRUD single conversation |
| `/api/auth/register` | POST | Create user with bcrypt-hashed password |
| `/api/auth/[...nextauth]` | ALL | NextAuth handler |

Route handlers use `params: Promise<{ id: string }>` syntax (Next.js 16 convention).

## Styling

- `globals.css` sets `button:not(:disabled), [role="button"]:not(:disabled), a { cursor: pointer }` globally — raw `<button>` elements don't need the class
- shadcn/ui uses **Base UI** (not Radix) — no `asChild`, use `render` prop
- Noise texture overlay applied via `.noise-overlay` div in root layout
- Warm terracotta palette (`#c8553d`) — light mode: cream bg, dark mode: near-black bg

## Gotchas

- Port is **3030** (not 3000)
- `.env` is gitignored; copy `.env.example` and fill in `DATABASE_URL` + `OPENROUTER_API_KEY`
- `node_modules/next/dist/docs/` contains framework docs for exact installed version
- `AUTH_URL` in `.env` must be origin-only (no path, no trailing slash), e.g. `http://localhost:3030`
- `AUTH_SECRET` must be a real 32-byte base64 secret, not a placeholder
- PrismaClient requires `{ adapter }` — does NOT work with no-arg constructor
- OpenRouter API key in `.env` as `OPENROUTER_API_KEY` — all AI calls go through server proxy, zero client-side popup
- `@heyputer/puter.js` is uninstalled; do not use
