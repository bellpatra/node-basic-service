import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiResponse } from '../utils/validation';

export const errorMiddleware = (error: Error, req: Request, res: Response, next: NextFunction) => {
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const validationErrors = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    }));

    const response = ApiResponse.fail('Validation failed', 400, validationErrors);

    return ApiResponse.send(res, response);
  }

  console.error('Error:', error);

  // Handle custom errors with statusCode
  const statusCode =
    error instanceof Error && (error as any).statusCode ? (error as any).statusCode : 500;

  const errorMessage = error instanceof Error ? error.message : 'Internal server error';

  // Use fail for client errors (4xx), error for server errors (5xx)
  const response =
    statusCode >= 400 && statusCode < 500
      ? ApiResponse.fail(errorMessage, statusCode)
      : ApiResponse.error(errorMessage, statusCode);

  return ApiResponse.send(res, response);
};
