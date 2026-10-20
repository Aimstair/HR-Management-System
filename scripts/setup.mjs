#!/usr/bin/env node
/**
 * One-command local setup (macOS, Linux, Windows):
 *
 *   npm run setup            install deps, create server/.env, start Postgres, migrate, seed (if empty)
 *   npm run setup -- --reset re-run the full seed even if the database already has data
 *   npm run setup -- --no-docker   never start docker compose
 *
 * Docker is only used when server/.env points at localhost; with a Supabase URL
 * the script syncs the schema and seeds that database instead (seeding only if empty).
 */
import { execSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const server = join(root, 'server');
const args = new Set(process.argv.slice(2));

const step = (message) => console.log(`\n\x1b[36m▸ ${message}\x1b[0m`);
const run = (command, cwd = root) => execSync(command, { cwd, stdio: 'inherit' });
const capture = (command, cwd = root) => execSync(command, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

const [major] = process.versions.node.split('.').map(Number);
if (major < 20) {
  console.error(`Node.js 20+ is required (found ${process.versions.node}). See .nvmrc.`);
  process.exit(1);
}

step('Installing frontend dependencies');
run('npm install');

step('Installing API dependencies');
run('npm install', server);

const envPath = join(server, '.env');
if (existsSync(envPath)) {
  step('server/.env already exists, leaving it unchanged');
} else {
  step('Creating server/.env from server/.env.example');
  copyFileSync(join(server, '.env.example'), envPath);
  const secret = () => randomBytes(48).toString('hex');
  const env = readFileSync(envPath, 'utf8')
    .replace(/^JWT_ACCESS_SECRET=.*$/m, `JWT_ACCESS_SECRET=${secret()}`)
    .replace(/^JWT_REFRESH_SECRET=.*$/m, `JWT_REFRESH_SECRET=${secret()}`);
  writeFileSync(envPath, env);
}

// A remote database (e.g. Supabase) in server/.env means there is no local Postgres to start.
const databaseUrl = /^DATABASE_URL=(.*)$/m.exec(readFileSync(envPath, 'utf8'))?.[1] ?? '';
const usesLocalDatabase = /@(localhost|127\.0\.0\.1)[:/]/.test(databaseUrl);

if (!usesLocalDatabase) {
  step('server/.env points at a remote database, skipping docker compose');
} else if (!args.has('--no-docker')) {
  step('Starting Postgres (docker compose)');
  try {
    capture('docker info');
  } catch {
    console.error('Docker is not running. Start Docker Desktop and re-run `npm run setup`.');
    process.exit(1);
  }
  run('docker compose up -d --wait');
}

step('Generating Prisma client');
run('npx prisma generate', server);

// The checked-in migration history does not replay cleanly on an empty database
// (see CLAUDE.md), so sync the schema directly. db push refuses data-losing changes.
step('Syncing database schema (prisma db push)');
run('npx prisma db push --skip-generate', server);

const countUsers = () => {
  const output = capture(
    `npx tsx -e "import 'dotenv/config'; import { PrismaClient } from '@prisma/client'; const p = new PrismaClient(); p.user.count().then((n) => { console.log('USERS=' + n); return p.$disconnect(); });"`,
    server,
  );
  return Number(/USERS=(\d+)/.exec(output)?.[1] ?? 0);
};

if (args.has('--reset') || countUsers() === 0) {
  step('Seeding database (full seed: org structure, users, ~30 days of data)');
  run('npm run prisma:seed', server);
} else {
  step('Database already has data, skipping full seed (use --reset to reseed)');
}

step("Adding this week's attendance and requests");
run('npm run seed:week', server);

console.log(`
\x1b[32m✔ Setup complete.\x1b[0m

Start the app in two terminals:
  npm run dev:api     # API  -> http://localhost:4000  (docs: /api/docs)
  npm run dev         # Web  -> http://localhost:3000

Logins (password: Password123!):
  head.hr@school.com, campus.hr.main@school.com, campus.hr.basak@school.com,
  campus.hr.quad@school.com, campus.hr.north@school.com, teach.main.001@school.com
`);
