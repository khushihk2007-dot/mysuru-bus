/**
 * src/routes/v1/index.js
 *
 * API v1 router — the single entry point for all /api/v1/* routes.
 *
 * To add a new resource domain:
 *   1. Create src/routes/v1/buses.js  (or whatever the domain is)
 *   2. Import it here
 *   3. Mount it: router.use('/buses', busRouter)
 *
 * Phase 2 routes to add here:
 *   /buses       — real-time bus positions
 *   /routes      — transit route metadata
 *   /stops       — bus stop data
 *   /eta         — ETA predictions
 *   /search      — route / stop search
 */

import { Router } from 'express';
import { sendSuccess } from '../../utils/response.js';
import { APP } from '../../constants/app.js';

const router = Router();

/**
 * GET /api/v1
 * API index — confirms the API is reachable and returns version info.
 */
router.get('/', (_req, res) => {
  sendSuccess(res, {
    api:     APP.NAME,
    version: APP.API_VERSION,
    status:  'operational',
    docs:    '/docs/API.md',
    endpoints: {
      health:  'GET /health',
      apiRoot: `GET /api/${APP.API_VERSION}`,
      // Phase 2 endpoints will be listed here
    },
  }, `Welcome to the ${APP.NAME} API`);
});

// ── Phase 2 route mounts (uncomment as you build them) ─────────────────────
// import busRouter  from './buses.js';
// import stopRouter from './stops.js';
// router.use('/buses',  busRouter);
// router.use('/stops',  stopRouter);

export default router;
