# 1017 Festival Dashboard Agent Guide

This project follows the workspace rules in `D:\AI_Workspace\AGENTS.md`.

## Project Entry Points

- `PROJECT.md`: project shape and working conventions.
- `CURRENT.md`: current implementation state and recent checks.
- `SOURCES.md`: repository, deployment, and external service references.
- `README.md`, `MANUAL.md`, `SETUP_GUIDE.md`: user and deployment documentation.

## Engineering Rules

- Treat this as the active project root.
- Keep real secrets out of git. Use `.dev.vars` locally and Cloudflare Pages secrets in production.
- Prefer small, verifiable security and operations improvements over broad rewrites.
- Update `CURRENT.md` when changing behavior, deployment assumptions, or verification status.
