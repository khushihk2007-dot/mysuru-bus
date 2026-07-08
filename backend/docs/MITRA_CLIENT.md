# MITRA Client — Developer Guide

> `src/services/mitra/`

The MITRA client is the **only** module in this codebase that communicates with the external KSRTC MITRA backend. No other module is permitted to make HTTP calls to MITRA directly.

---

## Architecture Overview

```
Application Layer
  │
  ▼
repositories/          ← calls mitraClient methods, returns raw payloads
  │
  ▼
services/mitra/
  ├── index.js         ← singleton client + public exports
  ├── MitraClient.js   ← HTTP mechanics, retry, error mapping
  ├── MitraEndpoints.js← path constants + URLSearchParams builders
  ├── MitraErrors.js   ← typed error hierarchy
  ├── MitraConstants.js← all MITRA-specific constants
  └── tests/
      └── integration.js ← real-network test suite
```

**Rule:** Nothing above `repositories/` imports from `services/mitra/` directly.

---

## Quick Start

```js
import {
  mitraClient,
  ENDPOINT,
  buildLiveBusParams,
  buildAllRoutesParams,
} from '../services/mitra/index.js';

// Fetch all routes in Mysore
const response = await mitraClient.post(
  ENDPOINT.ALL_ROUTES,
  buildAllRoutesParams(),
);
console.log(response.data); // raw MITRA JSON — no parsing done here
```

---

## Configuration

All configuration is driven by environment variables:

| Variable | Default | Description |
|---|---|---|
| `MITRA_BASE_URL` | `http://mitra.ksrtc.in/Mysore_commuter_3` | MITRA backend base URL |
| `REQUEST_TIMEOUT` | `10000` | Request timeout in milliseconds |
| `MAX_RETRIES` | `3` | Max retry attempts after the first failure |
| `RETRY_DELAY` | `500` | Base delay (ms) for the first retry — doubles each attempt |

Configuration is **validated with Zod at startup**. The server will fail to start if any value is invalid.

---

## How the Client Works

### 1. Axios Instance

A dedicated Axios instance is created per `MitraClient`. It is **not** the shared app-level `httpClient`.

Key settings:
- `Content-Type: application/x-www-form-urlencoded` — required by MITRA
- `Connection: keep-alive` — reuses TCP connections for polling
- `validateStatus: () => true` — all HTTP statuses are handled by the error mapper, not Axios internals

### 2. Connection Pooling

Two `http.Agent` / `https.Agent` instances maintain a persistent connection pool:

- `maxSockets: 10` — at most 10 concurrent connections to MITRA
- `keepAlive: true` — connections are reused rather than recreated on every request

This is critical for real-time GPS polling (every 15 s on hundreds of routes).

### 3. Request Flow

```
mitraClient.post(endpoint, params)
  │
  ├── _executeWithRetry()
  │     │
  │     ├── attempt 1: _sendRequest()
  │     │     ├── builds Axios config
  │     │     ├── sends HTTP request
  │     │     └── on error → _mapError() → typed MitraError
  │     │
  │     ├── is error retryable? → _isRetryable()
  │     │
  │     ├── wait _backoffDelay(attempt) ms
  │     │
  │     └── attempt 2, 3… → repeat
  │
  └── returns AxiosResponse OR throws typed MitraError
```

### 4. Error Mapping

Raw Axios errors are **never** allowed to escape `MitraClient`. Every error is mapped to a typed class before throwing:

| Condition | Error thrown |
|---|---|
| Invalid env config | `MitraConfigurationError` |
| Request timed out (`ECONNABORTED`, `ERR_CANCELED`) | `MitraTimeoutError` |
| No response received (DNS, ECONNREFUSED, ECONNRESET) | `MitraNetworkError` |
| HTTP 4xx response | `MitraResponseError` |
| HTTP 5xx response | `MitraServerError` |

### 5. Retry Strategy

| Error type | Retried? | Reason |
|---|---|---|
| `MitraTimeoutError` | ✅ Yes | Transient — server may be overloaded |
| `MitraNetworkError` | ✅ Yes | Transient — routing issue |
| `MitraServerError` (5xx) | ✅ Yes | Transient — server fault |
| `MitraResponseError` (4xx) | ❌ No | Our fault — retrying won't help |
| `MitraConfigurationError` | ❌ No | Config bug — fatal |

**Back-off formula:**
```
delay = min(baseDelay × 2^(attempt-1), 30000) × jitter(0.75..1.25)
```
- Attempt 1 failed → wait ~500ms
- Attempt 2 failed → wait ~1000ms
- Attempt 3 failed → wait ~2000ms

---

## Available Endpoints

| Constant | Path | Description |
|---|---|---|
| `ENDPOINT.LIVE_BUS_POSITIONS` | `getLiveBusDetails` | Real-time GPS for all buses on a route |
| `ENDPOINT.ROUTE_TRIPS` | `getRouteDetails` | Scheduled trips for a route |
| `ENDPOINT.ROUTE_STOPS` | `getStopDetails` | Stops on a route+trip combo |
| `ENDPOINT.ALL_ROUTES` | `getAllRoutes` | All routes in the city |
| `ENDPOINT.STOP_SEARCH` | `getStopSearch` | Search stops by name |
| `ENDPOINT.STOP_DETAILS` | `getStopInfo` | Stop details + upcoming arrivals |
| `ENDPOINT.ETA` | `getETA` | ETA of a bus at a stop |
| `ENDPOINT.TRIPS_BY_STOP` | `getTripsByStop` | Trips serving a stop |
| `ENDPOINT.ROUTE_SEARCH` | `getRouteSearch` | Routes between two stops |

---

## How to Add a New Endpoint

### Step 1 — Add the path constant

```js
// MitraEndpoints.js
export const ENDPOINT = Object.freeze({
  // ... existing ...
  NEW_ENDPOINT: 'getNewThing',  // ← add here
});
```

### Step 2 — Add a parameter builder

```js
// MitraEndpoints.js
export function buildNewThingParams({ thingId, cityId = CITY.MYSORE }) {
  requireString(thingId, 'thingId'); // validate inputs
  const p = new URLSearchParams();
  p.set('thing_id', thingId);
  p.set(PARAM.CITY_ID, cityId);
  return p;
}
```

### Step 3 — Export from index.js

```js
// index.js
export { buildNewThingParams } from './MitraEndpoints.js';
```

### Step 4 — Use in a repository

```js
// repositories/thingRepository.js
import { mitraClient, ENDPOINT, buildNewThingParams } from '../services/mitra/index.js';

export async function fetchThing(thingId) {
  const response = await mitraClient.post(
    ENDPOINT.NEW_ENDPOINT,
    buildNewThingParams({ thingId }),
  );
  return response.data; // return raw — let service layer parse
}
```

---

## Error Handling in Consumers

Catch typed errors for precise recovery:

```js
import {
  mitraClient,
  ENDPOINT,
  buildAllRoutesParams,
  MitraTimeoutError,
  MitraNetworkError,
  MitraServerError,
  MitraResponseError,
} from '../services/mitra/index.js';

try {
  const response = await mitraClient.post(ENDPOINT.ALL_ROUTES, buildAllRoutesParams());
  // handle response.data
} catch (err) {
  if (err instanceof MitraTimeoutError) {
    // MITRA is slow — serve cached data
  } else if (err instanceof MitraNetworkError) {
    // MITRA is unreachable — show offline banner
  } else if (err instanceof MitraServerError) {
    // MITRA backend crashed — retry after delay
  } else if (err instanceof MitraResponseError) {
    // Bad request we sent — log and investigate
  }
}
```

---

## Observability

The singleton `mitraClient` accumulates metrics across all requests:

```js
mitraClient.getMetrics();
// {
//   totalRequests:   1042,
//   successRequests: 1035,
//   failedRequests:  7,
//   totalRetries:    12,
//   avgDurationMs:   248
// }
```

These are exposed at `GET /health` under `services.mitra.metrics`.

---

## Running Tests

```bash
# All suites (config validation, retry, network errors, live connectivity)
npm run test:mitra

# Results example:
#   14 passed  0 failed
```

Suites 1–6 are deterministic and network-independent.
Suite 7 (`Live MITRA Connectivity`) requires network access to `mitra.ksrtc.in`.
It gracefully degrades if the host is unreachable.

---

## Graceful Shutdown

The `MitraClient` holds two HTTP keep-alive agents. Destroy them on shutdown:

```js
// server.js — already handled via mitraClient singleton
import { mitraClient } from './services/mitra/index.js';

process.on('SIGTERM', () => {
  mitraClient.destroy(); // frees connection pool
  server.close(() => process.exit(0));
});
```
