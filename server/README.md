# HR System API (Phase 1)

## Supabase Database Setup

Use two Supabase PostgreSQL URLs:

- `DATABASE_URL`: pooled connection string for app runtime (PgBouncer, usually port `6543`).
- `DIRECT_URL`: direct database connection for Prisma migrations/introspection (usually port `5432`).

Example format:

```bash
DATABASE_URL=postgresql://postgres.your-project-ref:your_password@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require
DIRECT_URL=postgresql://postgres:your_password@db.your-project-ref.supabase.co:5432/postgres?sslmode=require
```

## Setup

1. Copy `.env.example` to `.env`.
2. Update `DATABASE_URL`, `DIRECT_URL`, `JWT_ACCESS_SECRET`, and `JWT_REFRESH_SECRET`.
3. Install dependencies:

```bash
npm install
```

4. Generate Prisma client:

```bash
npm run prisma:generate
```

5. Push schema (development):

```bash
npm run prisma:push
```

6. Seed demo users:

```bash
npm run prisma:seed
```

7. Start API server:

```bash
npm run dev
```

## Auth Endpoints

- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/health`

## Admin Endpoints (Initial)

- `GET /api/admin/dashboard/metrics`
- `GET /api/admin/employees`

## Demo Accounts

All users use password `Password123!` after seeding:

- `head.hr@school.com`
- `campus.hr.main@school.com`
- `campus.hr.north@school.com`
- `employee.teaching@school.com`
- `employee.staff@school.com`

## API Documentation (Swagger)

With the API running, open:

- Swagger UI: `http://localhost:4000/api/docs`
- OpenAPI JSON: `http://localhost:4000/api/openapi.json`

To call protected endpoints from Swagger UI:

1. Login using `POST /api/auth/login`.
2. Copy the `accessToken` from the response.
3. Click **Authorize** and set bearer auth as `Bearer <token>`.
