// Response helper utilities for standardized API responses
export interface SuccessResponse<T> {
  success: true;
  data: T;
  message: string;
  timestamp: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message: string;
  timestamp: string;
}

// Response validation helpers
export const validateResponseFormat = (response: any): boolean => {
  return (
    typeof response === 'object' &&
    typeof response.success === 'boolean' &&
    typeof response.message === 'string' &&
    typeof response.timestamp === 'string' &&
    (response.success ? 'data' in response : 'error' in response)
  );
};

export const sanitizeResponseData = <T>(data: T): T => {
  if (typeof data === 'object' && data !== null) {
    // Remove sensitive fields that shouldn't be exposed
    const sensitiveFields = ['password', 'token', 'secret', 'key'];
    const sanitized = { ...data } as any;
    
    sensitiveFields.forEach(field => {
      if (field in sanitized) {
        delete sanitized[field];
      }
    });
    
    return sanitized;
  }
  return data;
};

export const createSuccessResponse = <T>(
  data: T, 
  message: string = 'Operation successful'
): SuccessResponse<T> => ({
  success: true,
  data,
  message,
  timestamp: new Date().toISOString()
});

export const createErrorResponse = (
  error: string,
  message: string = 'Operation failed'
): ErrorResponse => ({
  success: false,
  error,
  message,
  timestamp: new Date().toISOString()
});

// HTTP Status Code helpers
export const sendSuccessResponse = <T>(
  res: any,
  data: T,
  message: string = 'Operation successful',
  statusCode: number = 200
) => {
  return res.status(statusCode).json(createSuccessResponse(data, message));
};

export const sendErrorResponse = (
  res: any,
  error: string,
  message: string = 'Operation failed',
  statusCode: number = 500
) => {
  return res.status(statusCode).json(createErrorResponse(error, message));
};

export const sendPaginatedResponse = <T>(
  res: any,
  data: T[],
  pagination: { page: number; limit: number; total: number },
  message: string = 'Data retrieved successfully'
) => {
  return res.status(200).json(createPaginatedResponse(data, pagination, message));
};

export const createPaginatedResponse = <T>(
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  },
  message: string = 'Data retrieved successfully'
): PaginatedResponse<T> => ({
  success: true,
  data,
  pagination: {
    ...pagination,
    totalPages: Math.ceil(pagination.total / pagination.limit)
  },
  message,
  timestamp: new Date().toISOString()
});

// Standard HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500
} as const;