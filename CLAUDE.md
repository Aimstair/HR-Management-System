# HR Management System

School HR system with two portals on one React app:
- **HR portal** (`/admin/*`): head HR (all campuses) and campus HR (one campus each: Main, North, Basak, Quad).
- **Employee portal** (`/portal/*`): teaching and non-teaching employees.

`ARCHITECTURE.md` describes the original prototype and is partly out of date; trust the code and this file.

## Stack and layout

- Frontend: React 18 + Vite 8 + TypeScript + Tailwind + shadcn/ui, in `src/`. UI primitives live in the **root** `components/ui/` (not `src/components/ui`); `@/` resolves to `src/`.
- API: Express + Prisma 6 + PostgreSQL + Zod, in `server/` (its own `package.json`). JWT auth with refresh cookie.
- Vite dev server (port 3000) proxies `/api` to the API (port 4000). Swagger at `http://localhost:4000/api/docs`.
- The frontend imports Prisma enum types from `server/node_modules/@prisma/client`, so the server must be installed and `prisma generate` run before the frontend type-checks.

## Commands

```bash
npm run setup          # first run: install both packages, create server/.env, DB, schema, seed
npm run dev:api        # API on :4000 (tsx watch)
npm run dev            # web on :3000
npm run db:up | db:down          # local Postgres via docker-compose.yml (port 5433)
npm --prefix server run seed:week      # add attendance/requests for the current week (idempotent)
npm --prefix server run prisma:seed    # full reseed; DESTRUCTIVE: deletes and recreates seeded data
npx tsc --noEmit -p .              # frontend typecheck (vite build does not typecheck)
npx tsc --noEmit -p server         # API typecheck
```

Test logins (password `Password123!`): `head.hr@school.com`, `campus.hr.{main,north,basak,quad}@school.com`, `teach.main.001@school.com` (teaching), `employee.main.staff@school.com` (non-teaching).

## Database

- `server/.env` (gitignored; template in `server/.env.example`) chooses the database: local Docker Postgres or Supabase (pooled `DATABASE_URL` on :6543 + `DIRECT_URL` on :5432). `npm run setup` skips Docker when the URL is not localhost.
- **Use `prisma db push`, not `prisma migrate deploy`.** The checked-in migration history does not replay on an empty database (a migration references a truncated index name that never existed). Fixing it means squashing into a new baseline migration; until then, schema changes go in `schema.prisma` + `db push`.
- Timezone conventions: `attendanceDate`/`sessionDate` are stored as UTC midnight of the local calendar date. The original seed stored clock times as if UTC (8:55 AM shows as 4:55 PM in PH time); `seed-current-week.ts` and new code use real local instants.

## Domain rules (single sources of truth)

- **HR scoping**: `server/src/lib/scope-filters.ts`. Campus HR sees only rows for its campus (`adminSchoolId` = a Campus id like `SCHOOL-BASAK`); head HR sees all. Every admin query must spread these filters. When combining Prisma filters that each use `OR`, wrap them in `AND: [...]`, since spreading two `OR` keys silently drops one (this caused a scope leak in memo search).
- **Memo visibility**: `server/src/lib/memo-visibility.ts`. Employees see memos addressed to them, or group memos for org/campus/school/department. Acknowledging checks the same rule.
- **Memo acknowledgement**: `server/src/lib/memo-rules.ts` (mirrored in `src/pages/admin/memo/utils.ts`). Only Disciplinary and Policy memos require acknowledgement; the API rejects acknowledging informational memos.
- **Request filing rules**: `server/src/lib/request-rules.ts` (mirrored in `src/pages/employee/requests/requestConfig.ts`):
  - Teaching faculty cannot file OVERTIME or UNDERTIME.
  - Leave/undertime/adjustment dates cannot be weekends (overtime can). The UI uses `RequestDatePicker` with weekends disabled.
  - Maternity leave = 105 calendar days, paternity = 7, counted from the start date (inclusive); the API recomputes the end date.
  - Work from home (WFH) was retired. The enum value and old rows still exist in the DB but are filtered out of every query (`RETIRED_REQUEST_TYPES`).
- **Attendance appeals**: `server/src/lib/attendance-appeals.ts`. An appeal is a `TIME_ADJUSTMENT` request whose `description` is JSON with `kind: "ATTENDANCE_APPEAL"` and the attendance id. Approving it (single or bulk, in the HR request routes) marks the attendance PRESENT in the same transaction.
- Employee-portal requests store their form fields as JSON in `RequestRecord.description`; `src/pages/admin/requests/utils.ts` turns that into readable notes for HR.

## Conventions and gotchas

- Match surrounding code style; files mix CRLF/LF on the Windows side, git stores LF.
- npm only (`.npmrc` sets `legacy-peer-deps` because `@vitejs/plugin-react` 4.x declares a peer of vite <=7 but works with the pinned vite 8).
- `npx tsc` on the frontend reports some pre-existing errors in `src/pages/admin/reports/**` (missing `../attendance/types` module) and the memo mapping in `EmployeePortalProvider`; they predate the current work.
- `server/uploads/` holds uploaded memo attachments and is gitignored; the GitHub repo is public, so never commit `.env` files, database dumps or uploads.

## Open items

- HR Requests search: "Teacher001 MAIN" finds nothing because the API matches the whole phrase against each name field separately. Fix: split into words and require each word to match some field (`server/src/routes/admin-requests.ts`, list route).
- Decide whether to delete legacy WFH rows and drop `WFH` from the `RequestType` enum.
- Squash the Prisma migration history into a working baseline.
