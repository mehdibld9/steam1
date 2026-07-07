# Deployment Guide

## Deploy to Vercel + Supabase

### 1. Set up Supabase database

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor → New query** and paste the contents of `supabase_schema.sql`, then run it
3. Go to **Settings → Database → Connection string → URI** and copy the **Transaction pooler** URL:
   ```
   postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```

### 2. Deploy to Vercel

1. Push this repo to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Vercel will auto-detect `vercel.json` — no framework preset needed
4. Add these **Environment Variables** in the Vercel project settings:

   | Variable | Value |
   |---|---|
   | `DATABASE_URL` | Your Supabase connection string (Transaction pooler) |
   | `ADMIN_USERNAME` | Your chosen admin username |
   | `ADMIN_PASSWORD` | Your chosen admin password |

5. Click **Deploy**

### 3. First-time admin setup

After deploying, call the setup endpoint once to store your admin credentials in the database:

```bash
curl -X POST https://your-app.vercel.app/api/admin/setup \
  -H "Content-Type: application/json" \
  -d '{"username": "YOUR_ADMIN_USERNAME", "password": "YOUR_ADMIN_PASSWORD"}'
```

Then visit `https://your-app.vercel.app/admin` and log in.

---

## Architecture

```
vercel.json
├── /api/*          → api/index.ts (serverless, Express app)
└── /*              → artifacts/arabic-mods/dist/public (static React SPA)
```

- **Frontend**: React + Vite, built to `artifacts/arabic-mods/dist/public`
- **Backend**: Express, served as a single Vercel serverless function at `api/index.ts`
- **Database**: PostgreSQL — works with Supabase, Neon, Railway, or any Postgres provider

---

## Local development (Replit)

Both services run in Replit workflows:
- Frontend: `pnpm --filter @workspace/arabic-mods run dev` (Vite dev server with `/api` proxy)
- Backend: `pnpm --filter @workspace/api-server run dev` (Express on port 8080)

`DATABASE_URL` is provided by Replit's built-in PostgreSQL.
