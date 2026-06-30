# مكتبة التعريب — Arabic Game Translations

A mod-sharing site for Arabic game translation files, for games that don't natively support Arabic. Dark-themed with green accents, matching the Nexus Mods aesthetic.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/arabic-mods run dev` — run the frontend (port assigned by workflow)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string (auto-provisioned)
- Required secret: `ADMIN_PASSWORD` — password for the /admin panel

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind + Wouter
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/db/src/schema/mods.ts` — mods table schema
- `artifacts/api-server/src/routes/mods.ts` — all mod API routes
- `artifacts/arabic-mods/src/pages/` — Home, ModDetail, Admin pages
- `artifacts/arabic-mods/src/index.css` — dark theme (near-black bg, green primary)

## Pages

- `/` — Home: 4-column grid of translation mod cards
- `/mod/:id` — Mod detail page with 2 configurable download buttons
- `/admin` — Admin panel (password-gated): add/edit/delete mods, configure download links

## Admin

- Go to `/admin`, enter the `ADMIN_PASSWORD` secret value
- Add mods with title, game name, description, image URL, and two download buttons (label + URL each)
- The 2 download buttons on the mod detail page are configured per-mod in the admin panel

## Architecture decisions

- Admin auth: password sent per-request as `x-admin-password` header; stored in `localStorage` after verify
- View count increments on `GET /api/mods/:id`; download count increments via `POST /api/mods/:id/download`
- No light mode — site is permanently dark to match the gaming aesthetic

## User preferences

_Populate as you build._

## Gotchas

- After changing `lib/db/src/schema/`, run `pnpm --filter @workspace/db run push` then `pnpm run typecheck:libs`
- After changing `lib/api-spec/openapi.yaml`, run `pnpm --filter @workspace/api-spec run codegen`
- Admin routes check `x-admin-password` header against the `ADMIN_PASSWORD` secret
