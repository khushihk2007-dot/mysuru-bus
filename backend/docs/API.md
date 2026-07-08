# API Reference

> Mysore Bus Backend — API v1

**Base URL:** `http://localhost:4000`
**API Prefix:** `/api/v1`
**Content-Type:** `application/json`

---

## Standard Response Envelope

Every endpoint returns the same envelope structure:

### Success

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "error": null,
  "timestamp": "2026-07-08T13:30:00.000Z",
  "requestId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

### Error

```json
{
  "success": false,
  "message": "Human-readable error description",
  "data": null,
  "error": {
    "code": "MACHINE_READABLE_CODE",
    "message": "Human-readable error description",
    "details": [ ... ]
  },
  "timestamp": "2026-07-08T13:30:00.000Z",
  "requestId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

> **Note:** `error.details` is only included in non-production environments.
> `error.stack` is only included in `development`.

---

## Error Codes

| Code | HTTP | Description |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Request body/query/params failed validation |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource or route does not exist |
| `CONFLICT` | 409 | Resource state conflict |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `API_ERROR` | 502 | Upstream service error |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server error |

---

## Endpoints

---

### GET /health

Returns the current health and vitals of the service.

**Auth required:** No
**Rate limited:** No

**Response 200:**

```json
{
  "success": true,
  "message": "Service is healthy and running",
  "data": {
    "status": "healthy",
    "application": "Mysore Bus Backend",
    "version": "1.0.0",
    "environment": "development",
    "timestamp": "2026-07-08T13:30:00.000Z",
    "uptime": {
      "seconds": 3721,
      "human": "1h 2m 1s"
    },
    "system": {
      "platform": "linux",
      "nodeVersion": "v22.0.0",
      "memory": {
        "totalMB": 8192,
        "freeMB": 4096,
        "usedMB": 4096,
        "heapUsedMB": 48
      },
      "cpuCount": 8,
      "loadAvg": [0.12, 0.15, 0.18]
    },
    "services": {
      "database": "not configured",
      "redis": "not configured"
    }
  },
  "error": null,
  "timestamp": "2026-07-08T13:30:00.000Z",
  "requestId": "..."
}
```

---

### GET /api/v1

Returns version information and available endpoints.

**Auth required:** No

**Response 200:**

```json
{
  "success": true,
  "message": "Welcome to the Mysore Bus Backend API",
  "data": {
    "api": "Mysore Bus Backend",
    "version": "v1",
    "status": "operational",
    "docs": "/docs/API.md",
    "endpoints": {
      "health": "GET /health",
      "apiRoot": "GET /api/v1"
    }
  }
}
```

---

## Rate Limiting

| Limiter | Window | Max Requests | Applied To |
|---|---|---|---|
| `defaultLimiter` | 15 min | 100 | All routes globally |
| `strictLimiter` | 15 min | 20 | Sensitive endpoints |
| `burstLimiter` | 1 min | 300 | High-frequency polling |

Rate limit headers returned:

```
RateLimit-Limit: 100
RateLimit-Remaining: 99
RateLimit-Reset: 1720447800
```

When exceeded:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please slow down and try again later."
  }
}
```

---

## Request Tracing

Every request receives a unique `X-Request-ID` response header:

```
X-Request-ID: a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

Clients can send their own ID in the request and it will be honoured:

```
X-Request-ID: my-trace-id-123
```

Use this ID when contacting support to correlate with server logs.

---

## Phase 2 Endpoints (Planned)

| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/buses` | All active buses with live positions |
| GET | `/api/v1/buses/:id` | Single bus real-time data |
| GET | `/api/v1/routes` | All transit routes |
| GET | `/api/v1/routes/:id` | Single route with stops |
| GET | `/api/v1/stops` | All bus stops |
| GET | `/api/v1/stops/:id` | Single stop with upcoming buses |
| GET | `/api/v1/eta` | ETA for bus at a stop |
| GET | `/api/v1/search` | Search routes and stops |
