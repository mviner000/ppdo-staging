// convex/lib/apiResponse.ts

/**
 * Standardized API Response Structure
 * All mutations should return this format for consistency
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * Create a success response
 * 
 * @param data - The data to return
 * @param message - Optional success message
 * @returns Standardized success response
 */
export function successResponse<T>(
  data: T,
  message?: string
): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
  };
}

/**
 * Create an error response
 * 
 * @param code - Error code (use ErrorCodes constants)
 * @param message - Human-readable error message
 * @param details - Additional error details
 * @returns Standardized error response
 */
export function errorResponse(
  code: string,
  message: string,
  details?: any
): ApiResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };
}

/**
 * Common response messages
 */
export const ResponseMessages = {
  // Create operations
  CREATED: (resource: string) => `${resource} created successfully`,
  
  // Update operations
  UPDATED: (resource: string) => `${resource} updated successfully`,
  
  // Delete operations
  DELETED: (resource: string) => `${resource} deleted successfully`,
  MOVED_TO_TRASH: (resource: string) => `${resource} moved to trash`,
  RESTORED: (resource: string) => `${resource} restored successfully`,
  
  // Bulk operations
  BULK_PROCESSED: (count: number, resource: string) => 
    `Processed ${count} ${resource}(s) successfully`,
  
  // Toggle operations
  ACTIVATED: (resource: string) => `${resource} activated`,
  DEACTIVATED: (resource: string) => `${resource} deactivated`,
  PINNED: (resource: string) => `${resource} pinned`,
  UNPINNED: (resource: string) => `${resource} unpinned`,
  
  // Recalculation
  RECALCULATED: (count: number, resource: string) =>
    `Recalculated ${count} ${resource}(s)`,
};