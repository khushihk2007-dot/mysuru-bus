/**
 * src/api/controllers/bus.controller.js
 *
 * REST API bus controller.
 * Exposes live buses list and detail views.
 */

import { BusService } from '../../services/domain/index.js';
import { sendApiResponse } from '../responses/apiResponse.js';

const busService = new BusService();

/**
 * GET /api/v1/buses
 * Retrieves all active live buses.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function getBuses(req, res, next) {
  try {
    const buses = await busService.getAllLiveBuses();
    sendApiResponse(res, 200, buses);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/buses/:busId
 * Retrieves detailed information for a single live bus.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function getBus(req, res, next) {
  try {
    const { busId } = req.params;
    const bus = await busService.getBus(busId);
    sendApiResponse(res, 200, bus);
  } catch (err) {
    next(err);
  }
}
