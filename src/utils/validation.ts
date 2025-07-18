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
        return res.status(400).json({
          status: 'error',
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
};

/**
 * Utility class for formatting API responses and handling try/catch logic.
 */
export class ApiResponse {
  static success<T>(data: T, message = 'Success', statusCode = 200) {
    return {
      status: 'success',
      statusCode,
      message,
      data
    };
  }

  static error(message: string, statusCode = 400) {
    return {
      status: 'error',
      statusCode,
      message
    };
  }

  static async withTryCatch<T>(
    res: Response,
    fn: () => Promise<T>,
    successMessage = 'Operation successful',
    successStatusCode = 200
  ) {
    try {
      const result = await fn();
      return res.status(successStatusCode).json(ApiResponse.success(result, successMessage, successStatusCode));
    } catch (error) {
      console.error('API Error:', error);
      const errorStatusCode = error instanceof Error && (error as any).statusCode ? (error as any).statusCode : 500;
      return res.status(errorStatusCode).json(
        ApiResponse.error(
          error instanceof Error ? error.message : 'Internal server error',
          errorStatusCode
        )
      );
    }
  }
}