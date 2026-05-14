# 1017 Festival Dashboard Current State

Last updated: 2026-05-14

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

Design and day-of-operation usability pass:

- Establish project-level `DESIGN.md`.
- Make booth operator workflows status-first and action-focused.
- Reduce decorative gradient-heavy UI in favor of operational clarity.
- Keep visitor, operator, admin, and display screens separated by job.

## Verification Notes

Latest local checks:

- `cmd /c npm install`: passed.
- `cmd /c npm run build`: passed.
- `cmd /c npx tsc --noEmit`: failed on pre-existing strict type issues in route and Hono helper typings. The production Vite build still succeeds.
- `cmd /c npm audit --audit-level=high`: failed because the npm audit endpoint returned an error, not because a parsed audit report was produced.
- Local Vite background preview did not stay running in this shell session; visual browser verification is still needed before deploying larger UI changes.

## Production Debug Notes

- `JWT_SECRET` was fixed after setting Cloudflare Production variables and triggering a redeploy.
- D1 binding, `login_attempts`, and auth schema were verified.
- Login APIs now return expected 401 responses for invalid credentials instead of 500.
- Temporary public diagnostics `/api/health/db` and `/api/health/auth` were removed after verification.

## Deployment Notes

- Apply `migrations/0004_security_hardening.sql` before relying on admin login throttling.
- Set Cloudflare secrets/vars:
  - `JWT_SECRET`
  - `PUBLIC_URL`
  - `ALLOWED_ORIGINS`
- Keep `ALLOWED_ORIGINS` comma-separated if more than one origin is needed.
