/**
 * src/config/server.js
 *
 * Express server-level configuration constants.
 * Consumed by app.js when bootstrapping middleware.
 */

import { env } from './env.js';

export const serverConfig = Object.freeze({
  port: env.PORT,
  apiPrefix: '/api/v1',

  // Body parsing
  jsonLimit: env.REQUEST_SIZE_LIMIT,
  urlencodedLimit: env.REQUEST_SIZE_LIMIT,

  // Trust proxies in production (e.g. behind nginx / cloud LB)
  trustProxy: env.isProduction ? 1 : false,
});
