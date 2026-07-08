/**
 * src/api/responses/apiResponse.js
 *
 * REST API standardized response helper.
 * Formats every success and error response to match the target frontend spec.
 */

/**
 * Sends a successful API response.
 *
 * @param {import('express').Response} res
 * @param {number} statusCode
 * @param {*} data
 */
export function sendApiResponse(res, statusCode, data) {
  res.status(statusCode).json({
    success: true,
    data,
    timestamp: new Date().toISOString(),
    requestId: res.req?.id ?? null,
  });
}

/**
 * Sends an API error response.
 *
 * @param {import('express').Response} res
 * @param {number} statusCode
 * @param {string} code
 * @param {string} message
 */
export function sendApiError(res, statusCode, code, message) {
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
    },
    timestamp: new Date().toISOString(),
    requestId: res.req?.id ?? null,
  });
}
