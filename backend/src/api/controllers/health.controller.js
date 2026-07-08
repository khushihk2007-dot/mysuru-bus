/**
 * src/api/controllers/health.controller.js
 *
 * REST API health controller.
 * Exposes internal metrics, system stats, and reachability.
 */

import { HealthService } from '../../services/domain/index.js';
import { sendApiResponse } from '../responses/apiResponse.js';

const healthService = new HealthService();

/**
 * GET /api/v1/health
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function getHealth(req, res, next) {
  try {
    const details = await healthService.getHealthDetails();
    sendApiResponse(res, 200, details);
  } catch (err) {
    next(err);
  }
}
