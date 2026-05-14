<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Commands

```sh
npm run dev          # next dev -p 3030
npm run build        # next build
npm run db:push      # push Prisma schema to PostgreSQL
npm run db:generate  # regenerate Prisma client
npm run db:studio    # prisma studio on port 3031
```

## Key architecture

- **Next.js 16 App Router** — `(auth)` and `(chat)` route groups
- **Prisma 7** — client generated to `src/generated/prisma/client`, requires `@prisma/adapter-pg` and `pg` driver adapter
- **NextAuth v5** — config in `src/lib/auth.ts`, route handler at `app/api/auth/[...nextauth]`
- **OpenRouter proxy** — `app/api/chat/proxy/route.ts` forwards to OpenRouter API server-side (zero client-side popup)
- **shadcn/ui** with Base UI (`@base-ui/react`) instead of Radix — no `asChild` prop, use `render` prop or direct className

## Gotchas

- Port is **3030** (not 3000)
- `.env` is gitignored; copy `.env.example` and fill in `DATABASE_URL` + `OPENROUTER_API_KEY`
- PrismaClient requires `{ adapter: new PrismaPg({ connectionString }) }` — does NOT work with no-arg constructor
- Puter.js SDK (`@heyputer/puter.js`) is uninstalled — all AI calls go through `/api/chat/proxy` server-side
- `node_modules/next/dist/docs/` contains framework docs — read before modifying Next.js APIs
