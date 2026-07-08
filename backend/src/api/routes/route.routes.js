/**
 * src/api/routes/route.routes.js
 *
 * REST API route endpoints.
 */

import { Router } from 'express';
import { z } from 'zod';
import { routeController } from '../controllers/index.js';
import { validate } from '../../validators/validate.js';

const router = Router();

// Validation schema for routeId path parameter
const routeIdParamSchema = z.object({
  params: z.object({
    routeId: z.string().trim().min(1, { message: 'Parameter "routeId" must be a non-empty string' }),
  }),
});

router.get('/', routeController.getRoutes);
router.get('/:routeId', validate(routeIdParamSchema), routeController.getRoute);
router.get('/:routeId/buses', validate(routeIdParamSchema), routeController.getRouteBuses);
router.get('/:routeId/stops', validate(routeIdParamSchema), routeController.getRouteStops);

export default router;
