/**
 * src/constants/messages.js
 *
 * Standard user-facing and internal messages.
 * Keeping strings here ensures consistency and makes future i18n easy.
 */

export const MESSAGES = Object.freeze({
  // Generic
  SUCCESS:                 'Operation successful',
  CREATED:                 'Resource created successfully',
  UPDATED:                 'Resource updated successfully',
  DELETED:                 'Resource deleted successfully',
  NOT_FOUND:               'The requested resource was not found',
  VALIDATION_ERROR:        'Validation failed. Please check the submitted data',
  UNAUTHORIZED:            'Authentication is required to access this resource',
  FORBIDDEN:               'You do not have permission to perform this action',
  INTERNAL_ERROR:          'An unexpected error occurred. Please try again later',
  TOO_MANY_REQUESTS:       'Too many requests. Please slow down and try again later',
  BAD_GATEWAY:             'Upstream service is unavailable. Please try again later',

  // Health
  HEALTH_OK:               'Service is healthy and running',
  HEALTH_DEGRADED:         'Service is running in a degraded state',

  // Future transit messages (Phase 2+)
  TRANSIT_NOT_CONFIGURED:  'Transit API is not yet configured in this environment',
});
