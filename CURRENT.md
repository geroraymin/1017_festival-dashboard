# 1017 Festival Dashboard Current State

Last updated: 2026-05-13

## Location

Active project root:

`D:\AI_Workspace\projects\1017_festival-dashboard`

GitHub repository:

`https://github.com/geroraymin/1017_festival-dashboard`

Production URL:

`https://1017-festival-dashboard.pages.dev/`

## Confirmed Stack

- Hono + TypeScript
- Vite build
- Cloudflare Pages / Workers
- Cloudflare D1 database binding: `guestbook-production`

## Current Focus

Initial improvement pass for operational safety:

- CORS and security headers.
- JWT secret hardening.
- Admin login throttling.
- Backup export safety.
- Documentation alignment for default credentials and deployment setup.
- DB deployment diagnostics through `/api/health/db`.
- Auth dependency diagnostics through `/api/health/auth`.

## Verification Notes

Latest local checks:

- `cmd /c npm install`: passed.
- `cmd /c npm run build`: passed.
- `cmd /c npx tsc --noEmit`: failed on pre-existing strict type issues in route and Hono helper typings. The production Vite build still succeeds.
- `cmd /c npm audit --audit-level=high`: failed because the npm audit endpoint returned an error, not because a parsed audit report was produced.

## Production Debug Notes

- `JWT_SECRET` was fixed after setting Cloudflare Production variables and triggering a redeploy.
- Login APIs still returned 500 after JWT and D1 table existence were fixed, so `/api/health/auth` was added to distinguish schema/hash-format issues without exposing secrets.

## Deployment Notes

- Apply `migrations/0004_security_hardening.sql` before relying on admin login throttling.
- Set Cloudflare secrets/vars:
  - `JWT_SECRET`
  - `PUBLIC_URL`
  - `ALLOWED_ORIGINS`
- Keep `ALLOWED_ORIGINS` comma-separated if more than one origin is needed.
