import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to validate request body against a Zod schema. Returns 400 on validation error.
 */
export const validateRequest = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = await schema.parseAsync(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        const response = ApiResponse.fail('Validation failed', 400, validationErrors);

        return ApiResponse.send(res, response);
      }
      next(error);
    }
  };
};

/**
 * Interface for standardized API response structure
 */
export interface IApiResponse<T = any> {
  status: 'success' | 'error' | 'fail';
  statusCode: number;
  message: string;
  data?: T;
  meta?: {
    timestamp: string;
    requestId?: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    [key: string]: any;
  };
  errors?: Array<{
    field?: string;
    message: string;
    code?: string;
  }>;
}

/**
 * Utility class for formatting standardized API responses and handling try/catch logic.
 *
 * Response Structure:
 * - status: 'success' | 'error' | 'fail'
 * - statusCode: HTTP status code
 * - message: Human-readable message
 * - data: Response payload (optional)
 * - meta: Additional metadata (optional)
 * - errors: Error details for validation/client errors (optional)
 */
export class ApiResponse {
  /**
   * Creates a success response
   */
  static success<T>(
    data?: T,
    message: string = 'Operation successful',
    statusCode: number = 200,
    meta?: IApiResponse['meta']
  ): IApiResponse<T> {
    return {
      status: 'success',
      statusCode,
      message,
      ...(data !== undefined && { data }),
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    };
  }

  /**
   * Creates an error response for server errors (5xx)
   */
  static error(
    message: string = 'Internal server error',
    statusCode: number = 500,
    meta?: IApiResponse['meta']
  ): IApiResponse {
    return {
      status: 'error',
      statusCode,
      message,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    };
  }

  /**
   * Creates a fail response for client errors (4xx)
   */
  static fail(
    message: string = 'Bad request',
    statusCode: number = 400,
    errors?: IApiResponse['errors'],
    meta?: IApiResponse['meta']
  ): IApiResponse {
    return {
      status: 'fail',
      statusCode,
      message,
      ...(errors && { errors }),
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    };
  }

  /**
   * Creates a paginated success response
   */
  static paginated<T>(
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
    },
    message: string = 'Data retrieved successfully',
    statusCode: number = 200,
    meta?: Omit<IApiResponse['meta'], 'pagination'>
  ): IApiResponse<T[]> {
    const totalPages = Math.ceil(pagination.total / pagination.limit);

    return {
      status: 'success',
      statusCode,
      message,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        pagination: {
          ...pagination,
          totalPages,
        },
        ...meta,
      },
    };
  }

  /**
   * Sends a standardized response
   */
  static send<T>(res: Response, response: IApiResponse<T>): Response {
    return res.status(response.statusCode).json(response);
  }

  /**
   * Wrapper for handling try/catch logic with standardized responses
   */
  static async withTryCatch<T>(
    res: Response,
    fn: () => Promise<T>,
    successMessage: string = 'Operation successful',
    successStatusCode: number = 200,
    meta?: IApiResponse['meta']
  ): Promise<Response> {
    try {
      const result = await fn();
      const response = ApiResponse.success(result, successMessage, successStatusCode, meta);
      return ApiResponse.send(res, response);
    } catch (error) {
      console.error('API Error:', error);

      // Handle different error types
      if (error instanceof z.ZodError) {
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        const response = ApiResponse.fail('Validation failed', 400, validationErrors, meta);
        return ApiResponse.send(res, response);
      }

      // Handle custom errors with statusCode
      const statusCode =
        error instanceof Error && (error as any).statusCode ? (error as any).statusCode : 500;

      const errorMessage = error instanceof Error ? error.message : 'Internal server error';

      // Use fail for client errors (4xx), error for server errors (5xx)
      const response =
        statusCode >= 400 && statusCode < 500
          ? ApiResponse.fail(errorMessage, statusCode, undefined, meta)
          : ApiResponse.error(errorMessage, statusCode, meta);

      return ApiResponse.send(res, response);
    }
  }

  /**
   * Creates a not found response
   */
  static notFound(
    message: string = 'Resource not found',
    meta?: IApiResponse['meta']
  ): IApiResponse {
    return ApiResponse.fail(message, 404, undefined, meta);
  }

  /**
   * Creates an unauthorized response
   */
  static unauthorized(message: string = 'Unauthorized', meta?: IApiResponse['meta']): IApiResponse {
    return ApiResponse.fail(message, 401, undefined, meta);
  }

  /**
   * Creates a forbidden response
   */
  static forbidden(message: string = 'Forbidden', meta?: IApiResponse['meta']): IApiResponse {
    return ApiResponse.fail(message, 403, undefined, meta);
  }

  /**
   * Creates a validation error response (always uses 'fail' status)
   */
  static validationError(
    errors: IApiResponse['errors'],
    message: string = 'Validation failed',
    meta?: IApiResponse['meta']
  ): IApiResponse {
    return ApiResponse.fail(message, 400, errors, meta);
  }

  /**
   * Creates a validation error response for a single field
   */
  static singleFieldError(
    field: string,
    message: string,
    code?: string,
    meta?: IApiResponse['meta']
  ): IApiResponse {
    return ApiResponse.fail('Validation failed', 400, [{ field, message, code }], meta);
  }
}
