"use strict";
/**
 * API Response Examples
 *
 * This file demonstrates how to use the standardized API response format
 * across your Node.js service. All responses follow a consistent structure.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponseExamples = void 0;
const validation_1 = require("../utils/validation");
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
class ApiResponseExamples {
    // Basic success response
    static basicSuccess(res) {
        const response = validation_1.ApiResponse.success({ id: 1, name: 'John Doe' }, 'User retrieved successfully');
        return validation_1.ApiResponse.send(res, response);
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
    static successWithMeta(res) {
        const response = validation_1.ApiResponse.success({ id: 1, name: 'John Doe' }, 'User created successfully', 201, {
            timestamp: new Date().toISOString(),
            requestId: 'req_123456',
            version: '1.0.0',
        });
        return validation_1.ApiResponse.send(res, response);
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
    static successNoData(res) {
        const response = validation_1.ApiResponse.success(undefined, 'Operation completed successfully');
        return validation_1.ApiResponse.send(res, response);
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
    static paginatedResponse(res) {
        const users = [
            { id: 1, name: 'John Doe' },
            { id: 2, name: 'Jane Smith' },
        ];
        const response = validation_1.ApiResponse.paginated(users, {
            page: 1,
            limit: 10,
            total: 25,
        }, 'Users retrieved successfully');
        return validation_1.ApiResponse.send(res, response);
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
    static clientError(res) {
        const response = validation_1.ApiResponse.fail('Invalid user ID provided', 400);
        return validation_1.ApiResponse.send(res, response);
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
    static serverError(res) {
        const response = validation_1.ApiResponse.error('Database connection failed', 500);
        return validation_1.ApiResponse.send(res, response);
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
    static validationError(res) {
        const response = validation_1.ApiResponse.validationError([
            {
                field: 'email',
                message: 'Invalid email format',
                code: 'invalid_email',
            },
            {
                field: 'password',
                message: 'Password must be at least 8 characters',
                code: 'min_length',
            },
        ]);
        return validation_1.ApiResponse.send(res, response);
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
    static singleFieldValidationError(res) {
        const response = validation_1.ApiResponse.singleFieldError('password', 'Required', 'required');
        return validation_1.ApiResponse.send(res, response);
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
    static notFound(res) {
        const response = validation_1.ApiResponse.notFound('User not found');
        return validation_1.ApiResponse.send(res, response);
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
    static unauthorized(res) {
        const response = validation_1.ApiResponse.unauthorized('Authentication required');
        return validation_1.ApiResponse.send(res, response);
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
    static forbidden(res) {
        const response = validation_1.ApiResponse.forbidden('Insufficient permissions');
        return validation_1.ApiResponse.send(res, response);
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
    static withTryCatchExample(res) {
        return __awaiter(this, void 0, void 0, function* () {
            return validation_1.ApiResponse.withTryCatch(res, () => __awaiter(this, void 0, void 0, function* () {
                // Your business logic here
                const user = yield getUserById(123);
                return user;
            }), 'User retrieved successfully', 200, {
                timestamp: new Date().toISOString(),
                requestId: 'req_123456',
            });
        });
    }
}
exports.ApiResponseExamples = ApiResponseExamples;
// Mock function for example
function getUserById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return { id, name: 'John Doe', email: 'john@example.com' };
    });
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
