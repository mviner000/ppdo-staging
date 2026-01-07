// convex/lib/errors.ts

/**
 * Custom Application Error Class
 * Provides structured error information for better error handling
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
    public details?: any
  ) {
    super(message);
    this.name = "AppError";
  }
}

/**
 * Standard Error Codes
 * Use these constants for consistent error handling across the application
 */
export const ErrorCodes = {
  // Authentication & Authorization
  NOT_AUTHENTICATED: "NOT_AUTHENTICATED",
  NOT_AUTHORIZED: "NOT_AUTHORIZED",
  PERMISSION_DENIED: "PERMISSION_DENIED",
  
  // Resource Errors
  NOT_FOUND: "NOT_FOUND",
  ALREADY_EXISTS: "ALREADY_EXISTS",
  
  // Validation Errors
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_INPUT: "INVALID_INPUT",
  DUPLICATE_ERROR: "DUPLICATE_ERROR",
  
  // Business Logic Errors
  IN_USE_ERROR: "IN_USE_ERROR",
  INACTIVE_ERROR: "INACTIVE_ERROR",
  SYSTEM_DEFAULT_ERROR: "SYSTEM_DEFAULT_ERROR",
  
  // Operation Errors
  CREATE_FAILED: "CREATE_FAILED",
  UPDATE_FAILED: "UPDATE_FAILED",
  DELETE_FAILED: "DELETE_FAILED",
  
  // Internal Errors
  INTERNAL_ERROR: "INTERNAL_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
} as const;

/**
 * Helper Functions for Common Errors
 */
export const ErrorHelpers = {
  notAuthenticated: () => new AppError(
    "Authentication required",
    ErrorCodes.NOT_AUTHENTICATED,
    401
  ),
  
  notAuthorized: (action?: string) => new AppError(
    action ? `Not authorized to ${action}` : "Not authorized",
    ErrorCodes.NOT_AUTHORIZED,
    403
  ),
  
  notFound: (resource: string, id?: string) => new AppError(
    `${resource} not found`,
    ErrorCodes.NOT_FOUND,
    404,
    id ? { id } : undefined
  ),
  
  alreadyExists: (resource: string, field: string, value: string) => new AppError(
    `${resource} with ${field} "${value}" already exists`,
    ErrorCodes.ALREADY_EXISTS,
    409,
    { field, value }
  ),
  
  validationError: (message: string, details?: any) => new AppError(
    message,
    ErrorCodes.VALIDATION_ERROR,
    400,
    details
  ),
  
  inUse: (resource: string, usageCount: number, context?: string) => new AppError(
    `Cannot delete "${resource}" - it is currently used by ${usageCount} ${context || 'record(s)'}`,
    ErrorCodes.IN_USE_ERROR,
    400,
    { usageCount, context }
  ),
  
  inactive: (resource: string, code: string) => new AppError(
    `${resource} "${code}" is inactive and cannot be used`,
    ErrorCodes.INACTIVE_ERROR,
    400,
    { code, suggestion: "Please activate it first" }
  ),
  
  systemDefault: (resource: string, action: string) => new AppError(
    `Cannot ${action} system default ${resource}`,
    ErrorCodes.SYSTEM_DEFAULT_ERROR,
    403
  ),
  
  internalError: (message: string, originalError?: any) => new AppError(
    message,
    ErrorCodes.INTERNAL_ERROR,
    500,
    originalError ? { originalError: originalError.message } : undefined
  ),
};