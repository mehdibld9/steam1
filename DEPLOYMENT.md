# Deployment Guide

## Deploy to Vercel + Supabase (or any Postgres provider)

### 1. Set up a database

You need an external PostgreSQL database. [Supabase](https://supabase.com) is the easiest option:

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor → New query**, paste the contents of `supabase_schema.sql`, and run it
3. Go to **Settings → Database → Connection string → URI** and copy the **Transaction pooler** URL:
   ```
   postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```

Alternatively: [Neon](https://neon.tech), [Railway](https://railway.app), or any standard PostgreSQL provider work fine.

### 2. Deploy to Vercel

1. Push this repo to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Vercel will auto-detect `vercel.json` — no framework preset needed
4. Add these **Environment Variables** in the Vercel project settings:

   | Variable | Value |
   |---|---|
   | `DATABASE_URL` | Your PostgreSQL connection string |

5. Click **Deploy**

### 3. First-time admin setup

After deploying, call the setup endpoint once to store your admin credentials:

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
└── buildCommand: "pnpm -w run vercel:build"
    │
    ├── .vercel/output/static/        ← React + Vite SPA
    └── .vercel/output/functions/
        └── api/index.func/           ← Express app (bundled serverless function)
```

- **Frontend**: React + Vite, built to `.vercel/output/static/`
- **Backend**: Express, bundled with esbuild into `.vercel/output/functions/api/index.func/`
- **Database**: Any PostgreSQL provider — Supabase, Neon, Railway, etc.
- **Build Output API**: The build uses Vercel's [Build Output API v3](https://vercel.com/docs/build-output-api/v3) for full compatibility with Vercel CLI v54+

---

## Local development (Replit)

Both services run as separate Replit workflows:
- Frontend: `pnpm --filter @workspace/arabic-mods run dev` (Vite dev server)
- Backend: `pnpm --filter @workspace/api-server run dev` (Express on port 8080)

`DATABASE_URL` is provided automatically by Replit's built-in PostgreSQL.
