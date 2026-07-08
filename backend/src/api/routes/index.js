/**
 * src/api/routes/index.js
 *
 * Central REST API router.
 * Mounts all v1 route sub-modules.
 */

import { Router } from 'express';
import healthRoutes from './health.routes.js';
import routeRoutes from './route.routes.js';
import busRoutes from './bus.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/routes', routeRoutes);
router.use('/buses', busRoutes);

export default router;
