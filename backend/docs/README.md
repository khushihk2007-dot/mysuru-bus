# Mysore Bus Backend

> Production-grade real-time transit intelligence platform — backend API

---

## Overview

This backend powers a premium, real-time transit platform inspired by **FlightRadar24**, **Google Maps**, and **Uber**. It is designed to scale to thousands of concurrent users with real-time GPS updates, WebSocket push, analytics, ETA prediction, and future AI modules.

**Current phase: Infrastructure foundation (Phase 1)**

No transit business logic is implemented yet. This phase establishes the scalable architecture that all future phases build upon.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 22 LTS |
| Framework | Express.js 4 |
| Language | JavaScript (ES Modules) |
| Logging | Pino + pino-http |
| Validation | Zod |
| HTTP Client | Axios |
| Security | Helmet, CORS, express-rate-limit |
| Utilities | uuid, compression, cookie-parser, dotenv |

---

## Project Structure

```
backend/
├── src/
│   ├── config/          # All configuration modules (env, logger, cors, etc.)
│   ├── constants/       # HTTP status codes, messages, app identifiers
│   ├── controllers/     # Route handlers (thin — delegate to services)
│   ├── errors/          # Custom error classes extending AppError
│   ├── helpers/         # Domain-specific helpers (Phase 2)
│   ├── jobs/            # Background cron tasks (Phase 4)
│   ├── logs/            # Log file output directory (gitignored)
│   ├── middleware/      # Express middleware (auth, logging, errors, 404)
│   ├── models/          # Data shape definitions (Phase 3)
│   ├── repositories/    # Data-access layer (Phase 2)
│   ├── routes/          # Route definitions, versioned under v1/
│   ├── services/        # Business logic (Phase 2)
│   ├── sockets/         # WebSocket handlers (Phase 4)
│   ├── utils/           # Generic reusable utilities
│   ├── validators/      # Zod validation middleware factory
│   ├── app.js           # Express app factory
│   └── server.js        # HTTP server + graceful shutdown
├── .env.example         # Environment variable template
├── .gitignore
└── package.json
```

---

## Getting Started

### 1. Prerequisites

- Node.js ≥ 22.0.0
- npm ≥ 10

### 2. Install dependencies

```bash
cd backend
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env — at minimum, set PORT and CLIENT_URL
```

### 4. Start development server

```bash
npm run dev
```

The server starts with `--watch` (Node.js built-in file watcher) — no nodemon required.

### 5. Verify it works

```bash
curl http://localhost:4000/health
```

---

## NPM Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start with Node.js `--watch` (hot-reload) |
| `npm start` | Start in production mode |
| `npm run lint` | Run ESLint |
| `npm test` | Placeholder — test framework TBD |

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Platform health, uptime, memory |
| GET | `/api/v1` | API version info and endpoint index |

See [API.md](./API.md) for the complete reference.

---

## Environment Variables

See [.env.example](../.env.example) for all variables with descriptions.

---

## Architecture Principles

1. **Separation of concerns** — config, middleware, routes, controllers, services, and repositories each have a single responsibility
2. **Fail fast** — required env variables are validated at startup
3. **Centralised error handling** — all errors flow through one handler
4. **Structured logging** — every log line is machine-readable JSON in production
5. **No magic numbers** — HTTP status codes and messages are constants
6. **Testable** — the app factory (`createApp()`) is independently importable

---

## Roadmap

| Phase | Description |
|---|---|
| ✅ Phase 1 | Backend infrastructure (this phase) |
| 🔲 Phase 2 | MITRA API integration, transit routes/buses/stops |
| 🔲 Phase 3 | Database (PostgreSQL), data persistence |
| 🔲 Phase 4 | Redis cache, WebSocket live updates, background jobs |
| 🔲 Phase 5 | ETA prediction, AI modules, analytics |
| 🔲 Phase 6 | Authentication, user accounts |

---

## Contributing

1. Branch from `main`
2. Keep controllers thin — business logic lives in services
3. All responses must go through `sendSuccess()` / `sendError()`
4. All async route handlers must be wrapped with `asyncHandler()`
5. All new endpoints must have a Zod validator
