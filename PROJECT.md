# 1017 Festival Dashboard

Cloudflare Pages / Workers application for a festival digital guestbook system.

## Project Shape

- `src/index.tsx`: Hono app entry, page routes, API route mounting, CORS.
- `src/routes`: API routes for auth, events, booths, participants, stats, queue, email, and backup.
- `src/views`: server-rendered HTML page templates.
- `src/lib`: shared D1, JWT, password, and security helpers.
- `migrations`: Cloudflare D1 schema migrations.
- `public`: static assets and PWA files.

## Runtime

- Frontend and API are served from Cloudflare Pages / Workers.
- Database is Cloudflare D1.
- Authentication uses JWT plus PBKDF2 password hashes for admins.
- Booth operators authenticate with booth codes.

## Priorities

1. Protect participant and operator personal data.
2. Keep deployment simple for festival-day operations.
3. Make admin/operator workflows reliable on mobile and desktop.
4. Keep docs aligned with the actual production deployment.
