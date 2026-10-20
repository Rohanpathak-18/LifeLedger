# LifeLedger

Every purchase has a history. Never lose it again.

LifeLedger is a MERN monorepo for managing personal products and the records attached to them. This repository starts with the Phase 1 foundation: a responsive React shell, Express API, MongoDB configuration, validated environment, health endpoint, and a secure authentication foundation. Later product workflows build on these boundaries.

## Requirements

- Node.js 20+
- npm 10+
- MongoDB local instance or Atlas connection string

## Quick start

1. Copy `server/.env.example` to `server/.env` and set `MONGODB_URI` and a long random `JWT_ACCESS_SECRET`.
2. Copy `client/.env.example` to `client/.env` if the API is not at its default URL.
3. Run `npm install` from the repository root.
4. Run `npm run dev` to start the API on port 5000 and Vite on port 5173.
5. Open `http://localhost:5173`. Check `http://localhost:5000/api/v1/health` for API/database status.

The server can start without MongoDB configured and reports `database: "disconnected"` from the health endpoint. Registration and other database features require a working MongoDB connection. Never commit real environment files.

## Commands

- `npm run dev` - frontend and backend
- `npm run build` - production frontend build
- `npm run lint` - lint both workspaces

## Current scope

Phase 1 includes the foundation, initial design system, API health, and account registration/login with rotating refresh sessions. The dashboard intentionally shows unavailable metrics until persisted inventory data exists. Product management, private uploads, scheduled reminders, and AI/RAG are subsequent phases and are not represented as working features yet.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/SECURITY.md](docs/SECURITY.md), and [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).
