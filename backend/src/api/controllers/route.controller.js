/**
 * src/api/controllers/route.controller.js
 *
 * REST API route controller.
 * Exposes routes, stops sequences, and live buses per route.
 */

import { RouteService, BusService } from '../../services/domain/index.js';
import { sendApiResponse } from '../responses/apiResponse.js';

const routeService = new RouteService();
const busService = new BusService();

/**
 * GET /api/v1/routes
 * Retrieves all available transit routes.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function getRoutes(req, res, next) {
  try {
    const routes = await routeService.getRoutes();
    sendApiResponse(res, 200, routes);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/routes/:routeId
 * Retrieves details for a specific route.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function getRoute(req, res, next) {
  try {
    const { routeId } = req.params;
    const route = await routeService.getRoute(routeId);
    sendApiResponse(res, 200, route);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/routes/:routeId/buses
 * Retrieves all active live buses on a given route.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function getRouteBuses(req, res, next) {
  try {
    const { routeId } = req.params;
    // Verify route exists (throws RouteNotFoundError if not)
    await routeService.getRoute(routeId);
    const buses = await busService.getLiveBuses(routeId);
    sendApiResponse(res, 200, buses);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/routes/:routeId/stops
 * Retrieves stop sequences for a specific route.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function getRouteStops(req, res, next) {
  try {
    const { routeId } = req.params;
    // Verify route exists (throws RouteNotFoundError if not)
    await routeService.getRoute(routeId);
    const stops = await routeService.getRouteStops(routeId);
    sendApiResponse(res, 200, stops);
  } catch (err) {
    next(err);
  }
}
