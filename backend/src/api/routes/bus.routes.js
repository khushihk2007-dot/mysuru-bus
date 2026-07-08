/**
 * src/api/routes/bus.routes.js
 *
 * REST API bus endpoints.
 */

import { Router } from 'express';
import { z } from 'zod';
import { busController } from '../controllers/index.js';
import { validate } from '../../validators/validate.js';

const router = Router();

// Validation schema for busId path parameter
const busIdParamSchema = z.object({
  params: z.object({
    busId: z.string().trim().min(1, { message: 'Parameter "busId" must be a non-empty string' }),
  }),
});

router.get('/', busController.getBuses);
router.get('/:busId', validate(busIdParamSchema), busController.getBus);

export default router;
