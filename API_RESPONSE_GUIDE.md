# API Response Standards

This document outlines the standardized API response format used across all endpoints in this Node.js service.

## Response Structure

All API responses follow a consistent structure with the following fields:

```typescript
interface IApiResponse<T = any> {
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
```

## Status Types

- **`success`**: Operation completed successfully (2xx status codes)
- **`fail`**: Client error - invalid request, validation failure, etc. (4xx status codes)  
- **`error`**: Server error - internal server issues (5xx status codes)

### Important: Validation Errors Always Use "fail" Status

❌ **WRONG** - Don't use "error" status for validation:
```json
{
  "status": "error",
  "errors": [
    { "field": "password", "message": "Required" }
  ]
}
```

✅ **CORRECT** - Use "fail" status for validation errors:
```json
{
  "status": "fail",
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    { "field": "password", "message": "Required" }
  ],
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

## Basic Usage

### Success Response
```typescript
// Basic success
const response = ApiResponse.success(
  { id: 1, name: 'John Doe' },
  'User retrieved successfully'
);
return ApiResponse.send(res, response);
```

**Output:**
```json
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
```

### Error Response
```typescript
// Client error (4xx)
const response = ApiResponse.fail('Invalid user ID', 400);
return ApiResponse.send(res, response);

// Server error (5xx)
const response = ApiResponse.error('Database connection failed', 500);
return ApiResponse.send(res, response);
```

### Validation Errors
```typescript
// Multiple field validation errors
const response = ApiResponse.validationError([
  { field: 'email', message: 'Invalid email format', code: 'invalid_email' },
  { field: 'password', message: 'Password too short', code: 'min_length' }
]);

// Single field validation error
const response = ApiResponse.singleFieldError('password', 'Required', 'required');

// Manual validation error (also works)
const response = ApiResponse.fail(
  'Validation failed',
  400,
  [
    { field: 'email', message: 'Invalid email format', code: 'invalid_email' }
  ]
);
```

### Paginated Response
```typescript
const response = ApiResponse.paginated(
  users,
  { page: 1, limit: 10, total: 25 },
  'Users retrieved successfully'
);
```

## Convenience Methods

```typescript
// Common response types
ApiResponse.notFound('User not found')
ApiResponse.unauthorized('Authentication required')  
ApiResponse.forbidden('Insufficient permissions')
```

## Using with Try/Catch

The `withTryCatch` method automatically handles errors and formats responses:

```typescript
export class UserController {
  static async getUser(req: Request, res: Response) {
    return ApiResponse.withTryCatch(res, async () => {
      const user = await UserService.getUserById(req.params.id);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    }, 'User retrieved successfully');
  }
}
```

## Adding Metadata

Include additional information in the `meta` field:

```typescript
const response = ApiResponse.success(
  data,
  'Operation successful',
  200,
  {
    requestId: 'req_123456',
    version: '1.0.0',
    executionTime: '45ms'
  }
);
```

## HTTP Status Code Guidelines

- **200**: Success - GET, PUT, PATCH
- **201**: Created - POST  
- **204**: No Content - DELETE
- **400**: Bad Request - Invalid input
- **401**: Unauthorized - Authentication required
- **403**: Forbidden - Access denied
- **404**: Not Found - Resource doesn't exist
- **422**: Unprocessable Entity - Validation errors
- **500**: Internal Server Error - Server issues

## Examples

See `src/examples/api-response-examples.ts` for comprehensive examples of all response types and usage patterns.

## Multi-Identifier Authentication

This API supports flexible user authentication. Users can login using any of the following identifiers:

- **Username**: `johndoe`
- **Email**: `john@example.com` 
- **Phone**: `+1234567890`

### Login Request Format
```json
{
  "identifier": "johndoe",  // Can be username, email, or phone
  "password": "MySecurePass123!"
}
```

### Registration with Phone (Optional)
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "phone": "+1234567890",        // Optional
  "password": "MySecurePass123!",
  "fullName": "John Doe",        // Optional
  "role": "user"                 // Optional, defaults to "user"
}
```

See `src/examples/multi-login-examples.ts` for detailed examples and implementation patterns.
