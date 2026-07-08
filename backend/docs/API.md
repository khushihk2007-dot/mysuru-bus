# API Reference

> Mysore Bus Backend — REST API v1

**Base URL:** `http://localhost:4000`
**API Prefix:** `/api/v1`
**Content-Type:** `application/json`

---

## Standard Response Envelope

Every endpoint under `/api/v1` returns a standardized response envelope.

### Success (200 OK)

```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-07-08T13:30:00.000Z",
  "requestId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

### Error (4xx / 5xx)

```json
{
  "success": false,
  "error": {
    "code": "ROUTE_NOT_FOUND",
    "message": "Route with ID 999 was not found"
  },
  "timestamp": "2026-07-08T13:30:00.000Z",
  "requestId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

---

## Error Codes

| Code | HTTP | Description |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Request body/query/params failed Zod validation |
| `ROUTE_NOT_FOUND` | 404 | Transit route with specified ID does not exist |
| `BUS_NOT_FOUND` | 404 | Live bus transmitter with specified ID is offline or does not exist |
| `SERVICE_UNAVAILABLE` | 503 | Upstream external transit connection (MITRA) failed or timed out |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected system error |

---

## Endpoints

### Health

#### `GET /api/v1/health`
Returns system metrics, memory, uptime, database connections, and upstream MITRA reachability status.

*   **Auth Required:** No
*   **Response 200 OK:**
    ```json
    {
      "success": true,
      "data": {
        "status": "healthy",
        "application": "mysore-bus-backend",
        "version": "1.0.0",
        "environment": "development",
        "timestamp": "2026-07-08T14:20:00.000Z",
        "uptime": { "seconds": 37, "human": "37s" },
        "system": { "platform": "win32", "memory": { "totalMB": 16384, "freeMB": 8192 } },
        "services": {
          "database": { "status": "not_configured" },
          "redis": { "status": "not_configured" },
          "mitra": { "status": "UP", "reachability": true, "latencyMs": 140 }
        }
      },
      "timestamp": "...",
      "requestId": "..."
    }
    ```

---

### Routes

#### `GET /api/v1/routes`
Returns every available transit route in the system.

*   **Response 200 OK:**
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "201",
          "number": "201",
          "name": "Mysore to Chamundi Hill",
          "source": "Mysore CBS",
          "destination": "Chamundi Hill",
          "direction": 1,
          "totalStops": 10,
          "distanceKm": 12.4
        }
      ],
      "timestamp": "...",
      "requestId": "..."
    }
    ```

#### `GET /api/v1/routes/:routeId`
Returns metadata details of a specific route.

*   **Response 200 OK:**
    ```json
    {
      "success": true,
      "data": {
        "id": "201",
        "number": "201",
        "name": "Mysore to Chamundi Hill"
      },
      "timestamp": "...",
      "requestId": "..."
    }
    ```
*   **Response 404 Not Found:** If the route does not exist.
*   **Response 400 Bad Request:** If parameter validation fails.

#### `GET /api/v1/routes/:routeId/buses`
Returns all live buses currently operating on that route.

*   **Response 200 OK:**
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "101",
          "routeId": "201",
          "registrationNumber": "KA57F-1111",
          "position": { "latitude": 12.3, "longitude": 76.65 },
          "speed": 15,
          "status": { "state": "EARLY", "delayMinutes": -7 }
        }
      ],
      "timestamp": "...",
      "requestId": "..."
    }
    ```

#### `GET /api/v1/routes/:routeId/stops`
Returns every bus stop along the route in the correct sequence.

*   **Response 200 OK:**
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "S1",
          "name": "CBS Stand",
          "sequence": 1,
          "position": { "latitude": 12.31, "longitude": 76.66 }
        }
      ],
      "timestamp": "...",
      "requestId": "..."
    }
    ```

---

### Buses

#### `GET /api/v1/buses`
Returns all active live buses across all routes in the network.

*   **Response 200 OK:**
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "101",
          "routeId": "201",
          "registrationNumber": "KA57F-1111"
        }
      ],
      "timestamp": "...",
      "requestId": "..."
    }
    ```

#### `GET /api/v1/buses/:busId`
Returns real-time data for a single live bus transmitter.

*   **Response 200 OK:**
    ```json
    {
      "success": true,
      "data": {
        "id": "101",
        "routeId": "201",
        "registrationNumber": "KA57F-1111"
      },
      "timestamp": "...",
      "requestId": "..."
    }
    ```
*   **Response 404 Not Found:** If the bus transmitter is offline or not found.
*   **Response 400 Bad Request:** If parameter validation fails.
