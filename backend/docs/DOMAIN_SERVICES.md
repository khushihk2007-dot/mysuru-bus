# Domain Service Layer — Developer Guide

> `src/services/domain/`

The Domain Service Layer encapsulates the core business logic of the Mysore Bus application. It serves as a bridge between the **Response Normalization Layer (Anti-Corruption Layer)** and future execution interfaces (Express Controllers, scheduled jobs, WebSocket gateways, and CLI tasks).

---

## Architectural Context

```
   Express Controller / Job / Socket
                 │
                 ▼
         Domain Services
   (Bus, Route, Stop, Statistics, Health)
                 │
                 ▼
     Response Normalizers (ACL)
                 │
                 ▼
            MitraClient
                 │
                 ▼
            KSRTC MITRA
```

---

## Services & APIs

### 1. `BusService`
Handles active GPS trackers, fleet statuses, and vehicle aggregations.

*   `getLiveBuses(routeId, filters, sortBy)`: Gets all normalized active buses for a given route.
*   `getAllLiveBuses(filters, sortBy)`: Polls all routes in parallel, de-duplicates buses by vehicle ID, and returns the active fleet.
*   `getBus(busId)`: Finds a single active bus.
*   `getBusesByDepot(depot, sortBy)`: Filters buses by operating depot.
*   `getBusesByStatus(status, sortBy)`: Filters buses by early/late/on-time status.
*   `getMovingBuses(sortBy)`: Gets buses with speed > 0.
*   `getStoppedBuses(sortBy)`: Gets idle buses.
*   `countActiveBuses()` / `countDelayedBuses()`: Active counts.
*   `getFleetSummary()`: Retrieves a unified summary object with counts and averages.
*   `watchRoute(routeId)`: Placeholder for future real-time feeds.

---

### 2. `RouteService`
Manages route networks, geometries, and stop structures.

*   `getRoutes()`: Lists all routes.
*   `getRoute(routeId)`: Gets a single route profile.
*   `routeExists(routeId)`: Safe existence probe.
*   `getRouteGeometry(routeId)`: Returns GeoJSON shapes (Phase 4 placeholder).
*   `getRouteStops(routeId)`: Discovers stop sequences. It fetches the scheduled trips list first, resolves the active `tripId`, and retrieves the corresponding stop order.

---

### 3. `StopService`
Manages stop information, locations, and search functionality.

*   `getStops(routeId)`: Lists stops for a route.
*   `getStop(stopId)`: Fetches stop details and location.
*   `searchStops(query)`: Performs text-based searches for stops.
*   `countStops(routeId)`: Total stops.
*   `nearestStop(lat, lon)`: Nearest stop search (future placeholder).

---

### 4. `StatisticsService`
Calculates analytics and metrics from active fleet positions.

*   `averageSpeed()`: Mean fleet velocity.
*   `averageDelay()`: Mean fleet schedule offset.
*   `busesPerDepot()`: Counts grouped by depot.
*   `fleetUtilization()`: Utilization percentage (moving vs. stopped).
*   `routeStatistics()`: Aggregates counts, average delays, and speeds grouped by route.
*   `systemStatistics()`: Complete system-wide overview.

---

### 5. `HealthService`
Monures system operational diagnostics.

*   `checkMitraReachability()`: Probes the external MITRA base URL and calculates response latency.
*   `getHealthDetails()`: Aggregates runtime platform info, system memory states, external service states, and API call counters/averages.

---

## Service-Level Errors

All service errors extend `AppError` from `src/errors/AppError.js` to ensure the platform's global error handler translates them to standardized client-facing JSON structure automatically:

1.  **`BusNotFoundError`**: Thrown when a bus ID does not match any active transmitter. (404)
2.  **`RouteNotFoundError`**: Thrown when a route ID does not exist in the system. (404)
3.  **`StopNotFoundError`**: Thrown when a stop is missing or invalid. (404)
4.  **`ServiceUnavailableError`**: Wraps upstream network timeouts/errors, informing the caller that MITRA is down. (503)
5.  **`InvalidRouteError`**: Thrown when a route query is malformed. (400)
6.  **`DataIntegrityError`**: Thrown when critical transit structures are missing or broken. (500)

---

## Dependency Injection & Mocking

All services support dependency injection (DI) via constructor options:

```javascript
import { BusService } from './BusService.js';
import { MockMitraClient } from './tests/unit.js';

// Inject custom client for testing
const testService = new BusService({ mitraClient: new MockMitraClient() });
```

---

## Unit Testing

Run unit tests:
```bash
npm run test:domain
```
Tests cover:
*   Mocking MITRA client endpoints.
*   Sorting & filtering mechanics.
*   Error wrapping and boundary propagation.
*   Immutability guarantees.
