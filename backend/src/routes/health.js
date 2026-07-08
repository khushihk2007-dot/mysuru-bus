/**
 * src/routes/health.js
 *
 * Health-check route.
 * Mounted at the root level (not under /api/v1) so load balancers and
 * uptime monitors can reach it with a simple GET /health.
 */

import { Router } from 'express';
import { getHealth } from '../controllers/healthController.js';

const router = Router();

/**
 * GET /health
 * Public — no auth, no rate limiting.
 */
router.get('/', getHealth);

export default router;
