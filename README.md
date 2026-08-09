# Job Application Tracker

Multi-user full-stack app to track IT job applications. Each person creates an
account and only sees their own companies and tracking data.

Data is stored in **PostgreSQL in the cloud**, so the same login works from any
laptop (as long as the app is running or deployed against that same database).

## Live app

- **Production:** https://isb-job-tracker.vercel.app  
- **Source code:** https://github.com/Abrarsaleem786/job-tracker  

After GitHub is connected to Vercel, every push to `master` redeploys automatically.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- **PostgreSQL** + Prisma ORM
- NextAuth.js (Credentials)
- Recharts + lucide-react + Zod

## Setup

1. Copy env and set your Postgres URL:

```bash
cp .env.example .env
```

2. Put a real `DATABASE_URL` in `.env` (Prisma Postgres, Neon, Supabase, etc.):

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/postgres?sslmode=require"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="long-random-secret"
```

3. Install, migrate, seed, run:

```bash
npm install
npx prisma migrate dev
npm run db:seed   # optional demo user
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Accounts

- **Sign up:** `/signup` — anyone can create an account  
- **Sign in:** `/login`  
- Each user’s companies and statuses are private to them  

Optional demo user after seed:

| Field    | Value                     |
|----------|---------------------------|
| Email    | `admin@jobtracker.local`  |
| Password | `admin123`                |

### Multi-device access

- The database is **remote** (not a file on your disk).  
- Any machine that runs this app with the **same `DATABASE_URL`** sees the same data.  
- For true “open URL from any laptop,” deploy the Next.js app (e.g. Vercel) and set the same env vars there.

### Prisma Postgres claim (if you used `create-db`)

Temporary Prisma Postgres databases expire unless you **claim** them.  
If you have a `CLAIM_URL` in your terminal history / notes, open it and claim the free permanent project so your data is not deleted.

You can also create a free permanent DB on [Neon](https://neon.tech) or [Supabase](https://supabase.com) and paste that URL into `DATABASE_URL`.

## Scripts

| Command             | Description                |
|---------------------|----------------------------|
| `npm run dev`       | Start dev server           |
| `npm run build`     | Production build           |
| `npm run db:migrate`| Run Prisma migrations      |
| `npm run db:seed`   | Seed demo user + companies |
| `npm run db:studio` | Open Prisma Studio         |

## Features (v1)

1. Sign up / login — multi-user, email/password sessions  
2. Per-user company isolation  
3. Dashboard — stats + donut chart  
4. Company table — search, filter, sort, inline status  
5. Company detail — full edit form  
6. Optional import of 50 Islamabad/RWP starter companies  

## Later

- Deploy app to Vercel (point `DATABASE_URL` + `NEXTAUTH_*` at production)
