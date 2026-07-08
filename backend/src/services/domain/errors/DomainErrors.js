/**
 * src/services/domain/errors/DomainErrors.js
 *
 * Domain Service Layer Custom Errors.
 * All these errors extend AppError (operational errors) or subclasses from src/errors/index.js,
 * allowing Express error middleware to catch and serialize them appropriately.
 */

import { AppError, NotFoundError, ApiError } from '../../../errors/index.js';
import { HTTP_STATUS } from '../../../constants/httpStatus.js';

/**
 * Thrown when a requested bus is not active or found.
 */
export class BusNotFoundError extends NotFoundError {
  /**
   * @param {string} busId
   */
  constructor(busId) {
    super(`Bus "${busId}"`);
    this.code = 'BUS_NOT_FOUND';
    this.details = { busId };
  }
}

/**
 * Thrown when a requested route cannot be found in the system.
 */
export class RouteNotFoundError extends NotFoundError {
  /**
   * @param {string} routeId
   */
  constructor(routeId) {
    super(`Route "${routeId}"`);
    this.code = 'ROUTE_NOT_FOUND';
    this.details = { routeId };
  }
}

/**
 * Thrown when a requested stop cannot be found.
 */
export class StopNotFoundError extends NotFoundError {
  /**
   * @param {string} stopId
   */
  constructor(stopId) {
    super(`Stop "${stopId}"`);
    this.code = 'STOP_NOT_FOUND';
    this.details = { stopId };
  }
}

/**
 * Thrown when the external MITRA system is unavailable, offline, or returns transport errors.
 */
export class ServiceUnavailableError extends ApiError {
  /**
   * @param {string} message
   * @param {*} [cause]  Original lower-level error (e.g. MitraServerError)
   */
  constructor(message = 'Upstream transit service is temporarily unavailable', cause = null) {
    super(message, HTTP_STATUS.SERVICE_UNAVAILABLE, cause);
    this.code = 'SERVICE_UNAVAILABLE';
  }
}

/**
 * Thrown when an invalid route or route ID format is provided.
 */
export class InvalidRouteError extends AppError {
  /**
   * @param {string} routeId
   * @param {string} [reason]
   */
  constructor(routeId, reason = 'Invalid route identifier') {
    super(`${reason}: "${routeId}"`, HTTP_STATUS.BAD_REQUEST, 'INVALID_ROUTE', { routeId });
  }
}

/**
 * Thrown when data received from upstream violates domain validation or integrity constraints.
 */
export class DataIntegrityError extends AppError {
  /**
   * @param {string} message
   * @param {*} [details]
   */
  constructor(message, details = null) {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'DATA_INTEGRITY_ERROR', details);
    this.isOperational = false; // Flag as internal server concern
  }
}
