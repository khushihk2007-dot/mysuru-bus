/**
 * src/services/domain/index.js
 *
 * Domain Service Layer Barrel Exports.
 *
 * This file serves as the unified entry point for all services and domain error classes.
 * Code outside the domain services should only import from here.
 */

// ── Services ─────────────────────────────────────────────────────────────────
export { BusService } from './BusService.js';
export { RouteService } from './RouteService.js';
export { StopService } from './StopService.js';
export { StatisticsService } from './StatisticsService.js';
export { HealthService } from './HealthService.js';

// ── Domain Errors ────────────────────────────────────────────────────────────
export {
  BusNotFoundError,
  RouteNotFoundError,
  StopNotFoundError,
  ServiceUnavailableError,
  InvalidRouteError,
  DataIntegrityError,
} from './errors/DomainErrors.js';
