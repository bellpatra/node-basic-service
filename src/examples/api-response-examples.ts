/**
 * API Response Examples
 * 
 * This file demonstrates how to use the standardized API response format
 * across your Node.js service. All responses follow a consistent structure.
 */

import { Response } from 'express';
import { ApiResponse } from '../utils/validation';

// ====================================
// RESPONSE STRUCTURE
// ====================================
/*
Standard Response Format:
{
  "status": "success" | "error" | "fail",
  "statusCode": number,
  "message": string,
  "data": any (optional),
  "meta": {
    "timestamp": string,
    "requestId": string (optional),
    "pagination": object (optional),
    // ... other metadata
  } (optional),
  "errors": Array<{
    "field": string (optional),
    "message": string,
    "code": string (optional)
  }> (optional)
}
*/

// ====================================
// SUCCESS RESPONSES
// ====================================

export class ApiResponseExamples {
  
  // Basic success response
  static basicSuccess(res: Response) {
    const response = ApiResponse.success(
      { id: 1, name: 'John Doe' },
      'User retrieved successfully'
    );
    return ApiResponse.send(res, response);
    
    /* Response:
    {
      "status": "success",
      "statusCode": 200,
      "message": "User retrieved successfully",
      "data": {
        "id": 1,
        "name": "John Doe"
      },
      "meta": {
        "timestamp": "2024-01-15T10:30:00.000Z"
      }
    }
    */
  }

  // Success with custom status code and metadata
  static successWithMeta(res: Response) {
    const response = ApiResponse.success(
      { id: 1, name: 'John Doe' },
      'User created successfully',
      201,
      {
        requestId: 'req_123456',
        version: '1.0.0'
      }
    );
    return ApiResponse.send(res, response);
    
    /* Response:
    {
      "status": "success",
      "statusCode": 201,
      "message": "User created successfully",
      "data": {
        "id": 1,
        "name": "John Doe"
      },
      "meta": {
        "timestamp": "2024-01-15T10:30:00.000Z",
        "requestId": "req_123456",
        "version": "1.0.0"
      }
    }
    */
  }

  // Success without data
  static successNoData(res: Response) {
    const response = ApiResponse.success(
      undefined,
      'Operation completed successfully'
    );
    return ApiResponse.send(res, response);
    
    /* Response:
    {
      "status": "success",
      "statusCode": 200,
      "message": "Operation completed successfully",
      "meta": {
        "timestamp": "2024-01-15T10:30:00.000Z"
      }
    }
    */
  }

  // Paginated response
  static paginatedResponse(res: Response) {
    const users = [
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Smith' }
    ];
    
    const response = ApiResponse.paginated(
      users,
      {
        page: 1,
        limit: 10,
        total: 25
      },
      'Users retrieved successfully'
    );
    return ApiResponse.send(res, response);
    
    /* Response:
    {
      "status": "success",
      "statusCode": 200,
      "message": "Users retrieved successfully",
      "data": [
        { "id": 1, "name": "John Doe" },
        { "id": 2, "name": "Jane Smith" }
      ],
      "meta": {
        "timestamp": "2024-01-15T10:30:00.000Z",
        "pagination": {
          "page": 1,
          "limit": 10,
          "total": 25,
          "totalPages": 3
        }
      }
    }
    */
  }

  // ====================================
  // ERROR RESPONSES
  // ====================================

  // Client error (4xx) - fail status
  static clientError(res: Response) {
    const response = ApiResponse.fail(
      'Invalid user ID provided',
      400
    );
    return ApiResponse.send(res, response);
    
    /* Response:
    {
      "status": "fail",
      "statusCode": 400,
      "message": "Invalid user ID provided",
      "meta": {
        "timestamp": "2024-01-15T10:30:00.000Z"
      }
    }
    */
  }

  // Server error (5xx) - error status
  static serverError(res: Response) {
    const response = ApiResponse.error(
      'Database connection failed',
      500
    );
    return ApiResponse.send(res, response);
    
    /* Response:
    {
      "status": "error",
      "statusCode": 500,
      "message": "Database connection failed",
      "meta": {
        "timestamp": "2024-01-15T10:30:00.000Z"
      }
    }
    */
  }

  // Validation error with field details
  static validationError(res: Response) {
    const response = ApiResponse.validationError([
      {
        field: 'email',
        message: 'Invalid email format',
        code: 'invalid_email'
      },
      {
        field: 'password',
        message: 'Password must be at least 8 characters',
        code: 'min_length'
      }
    ]);
    return ApiResponse.send(res, response);
    
    /* Response:
    {
      "status": "fail",
      "statusCode": 400,
      "message": "Validation failed",
      "errors": [
        {
          "field": "email",
          "message": "Invalid email format",
          "code": "invalid_email"
        },
        {
          "field": "password",
          "message": "Password must be at least 8 characters",
          "code": "min_length"
        }
      ],
      "meta": {
        "timestamp": "2024-01-15T10:30:00.000Z"
      }
    }
    */
  }

  // Single field validation error
  static singleFieldValidationError(res: Response) {
    const response = ApiResponse.singleFieldError(
      'password',
      'Required',
      'required'
    );
    return ApiResponse.send(res, response);
    
    /* Response:
    {
      "status": "fail",
      "statusCode": 400,
      "message": "Validation failed",
      "errors": [
        {
          "field": "password",
          "message": "Required",
          "code": "required"
        }
      ],
      "meta": {
        "timestamp": "2024-01-15T10:30:00.000Z"
      }
    }
    */
  }

  // ====================================
  // CONVENIENCE METHODS
  // ====================================

  // Not found
  static notFound(res: Response) {
    const response = ApiResponse.notFound('User not found');
    return ApiResponse.send(res, response);
    
    /* Response:
    {
      "status": "fail",
      "statusCode": 404,
      "message": "User not found",
      "meta": {
        "timestamp": "2024-01-15T10:30:00.000Z"
      }
    }
    */
  }

  // Unauthorized
  static unauthorized(res: Response) {
    const response = ApiResponse.unauthorized('Authentication required');
    return ApiResponse.send(res, response);
    
    /* Response:
    {
      "status": "fail",
      "statusCode": 401,
      "message": "Authentication required",
      "meta": {
        "timestamp": "2024-01-15T10:30:00.000Z"
      }
    }
    */
  }

  // Forbidden
  static forbidden(res: Response) {
    const response = ApiResponse.forbidden('Insufficient permissions');
    return ApiResponse.send(res, response);
    
    /* Response:
    {
      "status": "fail",
      "statusCode": 403,
      "message": "Insufficient permissions",
      "meta": {
        "timestamp": "2024-01-15T10:30:00.000Z"
      }
    }
    */
  }

  // ====================================
  // USING WITH TRY/CATCH
  // ====================================

  // Automatic error handling
  static async withTryCatchExample(res: Response) {
    return ApiResponse.withTryCatch(
      res,
      async () => {
        // Your business logic here
        const user = await getUserById(123);
        return user;
      },
      'User retrieved successfully',
      200,
      {
        requestId: 'req_123456'
      }
    );
  }
}

// Mock function for example
async function getUserById(id: number) {
  return { id, name: 'John Doe', email: 'john@example.com' };
}

// ====================================
// USAGE IN CONTROLLERS
// ====================================

/*
Example Controller Implementation:

export class UserController {
  static async getUser(req: Request, res: Response) {
    return ApiResponse.withTryCatch(res, async () => {
      const userId = parseInt(req.params.id);
      const user = await UserService.getUserById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return user;
    }, 'User retrieved successfully');
  }

  static async createUser(req: Request, res: Response) {
    return ApiResponse.withTryCatch(res, async () => {
      const user = await UserService.createUser(req.body);
      return user;
    }, 'User created successfully', 201);
  }

  static async getUsers(req: Request, res: Response) {
    return ApiResponse.withTryCatch(res, async () => {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const { users, total } = await UserService.getUsers(page, limit);
      
      const response = ApiResponse.paginated(
        users,
        { page, limit, total },
        'Users retrieved successfully'
      );
      
      return ApiResponse.send(res, response);
    });
  }
}
*/
