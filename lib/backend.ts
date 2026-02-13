/**
 * EduFunds Backend Utilities - Index
 * 
 * Zentrale Exporte für alle Backend-Optimierungs-Module
 */

// Logger
export { 
  createLogger, 
  apiLogger, 
  dbLogger, 
  externalApiLogger, 
  authLogger, 
  businessLogger,
  logRequest,
  withTiming 
} from './logger';

// Error Handling
export { 
  APIError, 
  Errors, 
  withRetry, 
  createErrorResponse, 
  withErrorHandler,
  createCorsHeaders,
  DEFAULT_CORS_HEADERS,
  ERROR_STATUS_CODES,
  USER_MESSAGES,
  type ErrorCode
} from './errors';

// Rate Limiting
export { 
  checkRateLimit, 
  rateLimitMiddleware, 
  createRateLimitResponse,
  withRateLimit,
  getClientIdentifier,
  getClientIP,
  isRedisAvailable,
  getRateLimitStatus,
  RATE_LIMIT_CONFIGS,
  type RateLimitConfig,
  type RateLimitResult 
} from './rate-limit';