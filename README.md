# HR Management System

HR and employee portals for a multi-campus school: attendance, requests and appeals, memos, shifts and evaluations.

## Getting started (macOS, Linux or Windows)

Requirements: **Node.js 22** (`nvm use` reads `.nvmrc`) and either **Docker Desktop** (local database) or a **Supabase** project.

```bash
git clone https://github.com/Aimstair/HR-Management-System.git
cd HR-Management-System
git checkout fifty-percent

npm run setup        # installs everything, creates server/.env, prepares and seeds the database
```

Then run the app in two terminals:

```bash
npm run dev:api      # API  -> http://localhost:4000  (Swagger: /api/docs)
npm run dev          # Web  -> http://localhost:3000
```

Log in with any seeded account, password `Password123!`: `head.hr@school.com`, `campus.hr.basak@school.com`, `teach.main.001@school.com`, `employee.main.staff@school.com`.

### Using Supabase instead of Docker

Before running `npm run setup`, create `server/.env` from `server/.env.example` and replace the two database lines with your Supabase connection strings (Project Settings → Database → Connection string):

```
DATABASE_URL=postgresql://postgres.<ref>:<password>@aws-1-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require
DIRECT_URL=postgresql://postgres.<ref>:<password>@aws-1-<region>.pooler.supabase.com:5432/postgres?sslmode=require
```

Setup detects the remote database, skips Docker, syncs the schema, and only seeds if the database is empty. Keep the JWT secrets from the example or set your own (32+ characters).

## Useful commands

| Command | What it does |
|---|---|
| `npm run db:up` / `npm run db:down` | Start/stop the local Postgres container |
| `npm --prefix server run seed:week` | Add attendance and requests for the current week |
| `npm --prefix server run prisma:seed` | Full reseed (deletes and recreates seeded data) |
| `npm run setup -- --reset` | Re-run setup and force a full reseed |

Developer notes (domain rules, database gotchas, open items) are in [CLAUDE.md](CLAUDE.md).
