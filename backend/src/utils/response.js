/**
 * src/utils/response.js
 *
 * Standardised API response formatter.
 *
 * Every endpoint MUST use sendSuccess or sendError so the client
 * receives a consistent envelope regardless of which module handled
 * the request.
 *
 * Envelope shape:
 * {
 *   "success":   boolean,
 *   "message":   string,
 *   "data":      object | null,
 *   "error":     object | null,      ← only on error responses
 *   "timestamp": ISO-8601 string,
 *   "requestId": string
 * }
 */

import { HTTP_STATUS } from '../constants/httpStatus.js';
import { MESSAGES } from '../constants/messages.js';
import { env } from '../config/env.js';

/**
 * Send a success response.
 *
 * @param {import('express').Response} res
 * @param {*}      [data={}]
 * @param {string} [message]
 * @param {number} [statusCode]
 * @param {string} [requestId]
 */
export function sendSuccess(
  res,
  data       = {},
  message    = MESSAGES.SUCCESS,
  statusCode = HTTP_STATUS.OK,
  requestId  = undefined,
) {
  res.status(statusCode).json({
    success:   true,
    message,
    data,
    error:     null,
    timestamp: new Date().toISOString(),
    requestId: requestId ?? res.req?.id ?? null,
  });
}

/**
 * Send an error response.
 *
 * @param {import('express').Response} res
 * @param {import('../errors/AppError.js').AppError | Error} error
 * @param {string} [requestId]
 */
export function sendError(res, error, requestId = undefined) {
  const statusCode  = error.statusCode ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message     = error.isOperational ? error.message : MESSAGES.INTERNAL_ERROR;
  const code        = error.code ?? 'INTERNAL_SERVER_ERROR';

  const errorPayload = {
    code,
    message,
    // Only include details in non-production environments for security
    ...(error.details && !env.isProduction ? { details: error.details } : {}),
    // Only include stack in development
    ...(env.isDevelopment && error.stack ? { stack: error.stack } : {}),
  };

  res.status(statusCode).json({
    success:   false,
    message,
    data:      null,
    error:     errorPayload,
    timestamp: new Date().toISOString(),
    requestId: requestId ?? res.req?.id ?? null,
  });
}

/**
 * Convenience: send 201 Created.
 * @param {import('express').Response} res
 * @param {*} data
 * @param {string} [message]
 */
export function sendCreated(res, data, message = MESSAGES.CREATED) {
  sendSuccess(res, data, message, HTTP_STATUS.CREATED);
}

/**
 * Convenience: send 204 No Content.
 * @param {import('express').Response} res
 */
export function sendNoContent(res) {
  res.status(HTTP_STATUS.NO_CONTENT).end();
}
