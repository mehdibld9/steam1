# Arabic Game Translations (مكتبة التعريب)

A library for Arabic game translation mods. Users can browse, search, and download Arabic translations for games. Admins can manage mods via a protected admin panel.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/arabic-mods run dev` — run the frontend (port 23146)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required secrets: `ADMIN_USERNAME`, `ADMIN_PASSWORD` — protect the /admin panel

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS v4, wouter routing, TanStack React Query
- UI: shadcn/ui components, Radix UI primitives, Lucide icons
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (zod/v4), drizzle-zod
- API codegen: Orval (from OpenAPI spec in lib/api-spec/openapi.yaml)
- Build: esbuild (CJS bundle for api-server)

## Where things live

- `artifacts/arabic-mods/src/pages/` — Home, ModDetail, Admin, not-found
- `artifacts/arabic-mods/src/components/layout/Header.tsx` — site header
- `artifacts/arabic-mods/src/index.css` — dark theme tokens, Cairo Arabic font
- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/db/src/schema/mods.ts` — mods table schema
- `artifacts/api-server/src/routes/mods.ts` — all mod CRUD + admin + stats routes

## Architecture decisions

- Dark-only theme (no light mode toggle) — suits gaming audience
- RTL layout (`dir="rtl"`) throughout — Arabic-first design
- Admin auth via HTTP headers (x-admin-username / x-admin-password) — simple credential check
- extraImages stored as JSON string in a text column — avoids a separate images table
- View count incremented on GET /mods/:id — no separate view-tracking endpoint

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- ADMIN_USERNAME and ADMIN_PASSWORD must be set as secrets or the api-server will crash on startup
- Run codegen after any openapi.yaml change before touching frontend code
