"use strict";
/**
 * Multi-Identifier Login Examples
 *
 * This file demonstrates how users can now login with username, email, or phone number
 * using the updated authentication system.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiLoginExamples = void 0;
const validation_1 = require("../utils/validation");
// ====================================
// LOGIN REQUEST EXAMPLES
// ====================================
/*
Users can now login using any of these formats:

1. LOGIN WITH USERNAME:
POST /api/users/login
{
  "identifier": "johndoe",
  "password": "MySecurePass123!"
}

2. LOGIN WITH EMAIL:
POST /api/users/login
{
  "identifier": "john@example.com",
  "password": "MySecurePass123!"
}

3. LOGIN WITH PHONE:
POST /api/users/login
{
  "identifier": "+1234567890",
  "password": "MySecurePass123!"
}
*/
// ====================================
// REGISTRATION EXAMPLES
// ====================================
/*
User registration now supports optional phone number:

POST /api/users/register
{
  "username": "johndoe",
  "email": "john@example.com",
  "phone": "+1234567890",        // Optional
  "password": "MySecurePass123!",
  "fullName": "John Doe",        // Optional
  "role": "user"                 // Optional, defaults to "user"
}

VALIDATION RULES:
- Username: 3-50 characters, letters/numbers/underscores only
- Email: Valid email format, max 100 characters
- Phone: Optional, international format (+1234567890 or 1234567890)
- Password: Min 8 chars, must contain uppercase, lowercase, number, special char
*/
// ====================================
// RESPONSE EXAMPLES
// ====================================
class MultiLoginExamples {
    // Successful login response (same for all identifier types)
    static successfulLogin(res) {
        const response = validation_1.ApiResponse.success({
            token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            user: {
                id: "123e4567-e89b-12d3-a456-426614174000",
                username: "johndoe",
                email: "john@example.com",
                phone: "+1234567890",
                fullName: "John Doe",
                role: "user",
                isActive: true,
                lastLogin: "2024-01-15T10:30:00.000Z",
                createdAt: "2024-01-01T00:00:00.000Z",
                updatedAt: "2024-01-15T10:30:00.000Z"
            }
        }, 'Login successful');
        return validation_1.ApiResponse.send(res, response);
        /* Response:
        {
          "status": "success",
          "statusCode": 200,
          "message": "Login successful",
          "data": {
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "user": {
              "id": "123e4567-e89b-12d3-a456-426614174000",
              "username": "johndoe",
              "email": "john@example.com",
              "phone": "+1234567890",
              "fullName": "John Doe",
              "role": "user",
              "isActive": true,
              "lastLogin": "2024-01-15T10:30:00.000Z",
              "createdAt": "2024-01-01T00:00:00.000Z",
              "updatedAt": "2024-01-15T10:30:00.000Z"
            }
          },
          "meta": {
            "timestamp": "2024-01-15T10:30:00.000Z"
          }
        }
        */
    }
    // Invalid credentials error (when identifier not found or wrong password)
    static invalidCredentials(res) {
        const response = validation_1.ApiResponse.fail('Invalid credentials', 401);
        return validation_1.ApiResponse.send(res, response);
        /* Response:
        {
          "status": "fail",
          "statusCode": 401,
          "message": "Invalid credentials",
          "meta": {
            "timestamp": "2024-01-15T10:30:00.000Z"
          }
        }
        */
    }
    // Account deactivated error
    static accountDeactivated(res) {
        const response = validation_1.ApiResponse.fail('Account is deactivated', 403);
        return validation_1.ApiResponse.send(res, response);
        /* Response:
        {
          "status": "fail",
          "statusCode": 403,
          "message": "Account is deactivated",
          "meta": {
            "timestamp": "2024-01-15T10:30:00.000Z"
          }
        }
        */
    }
    // Registration validation errors
    static registrationValidationError(res) {
        const response = validation_1.ApiResponse.validationError([
            {
                field: 'phone',
                message: 'Invalid phone number format',
                code: 'invalid_format'
            },
            {
                field: 'password',
                message: 'Password must contain uppercase, lowercase, number, and special character',
                code: 'weak_password'
            }
        ]);
        return validation_1.ApiResponse.send(res, response);
    }
    // Duplicate registration errors
    static duplicateUsername(res) {
        const response = validation_1.ApiResponse.fail('Username already taken', 409);
        return validation_1.ApiResponse.send(res, response);
    }
    static duplicateEmail(res) {
        const response = validation_1.ApiResponse.fail('Email already registered', 409);
        return validation_1.ApiResponse.send(res, response);
    }
    static duplicatePhone(res) {
        const response = validation_1.ApiResponse.fail('Phone number already registered', 409);
        return validation_1.ApiResponse.send(res, response);
    }
}
exports.MultiLoginExamples = MultiLoginExamples;
// ====================================
// USAGE PATTERNS
// ====================================
/*
FRONTEND IMPLEMENTATION EXAMPLES:

1. FLEXIBLE LOGIN FORM:
```javascript
const loginForm = {
  identifier: "", // Single field for username/email/phone
  password: ""
};

// User can enter any of:
// - "johndoe" (username)
// - "john@example.com" (email)
// - "+1234567890" (phone)
```

2. LOGIN VALIDATION:
```javascript
const validateIdentifier = (identifier) => {
  if (!identifier || identifier.trim().length === 0) {
    return "Username, email, or phone is required";
  }
  return null;
};
```

3. SMART PLACEHOLDER TEXT:
```html
<input
  type="text"
  placeholder="Username, email, or phone"
  name="identifier"
/>
```

4. REGISTRATION WITH OPTIONAL PHONE:
```javascript
const registerForm = {
  username: "",
  email: "",
  phone: "",        // Optional
  password: "",
  fullName: "",     // Optional
  role: "user"      // Optional
};
```
*/
// ====================================
// SECURITY CONSIDERATIONS
// ====================================
/*
SECURITY FEATURES:

1. RATE LIMITING: Implement rate limiting on login attempts
2. ACCOUNT LOCKOUT: Lock accounts after multiple failed attempts
3. PHONE VERIFICATION: Consider requiring phone verification for phone logins
4. AUDIT LOGGING: Log all login attempts with identifier type used
5. PASSWORD POLICIES: Enforce strong password requirements
6. TOKEN SECURITY: Use secure JWT tokens with appropriate expiration

BEST PRACTICES:

1. Always hash passwords using bcrypt or similar
2. Use HTTPS for all authentication endpoints
3. Implement proper session management
4. Log security events for monitoring
5. Consider 2FA for enhanced security
6. Validate and sanitize all inputs
7. Use proper error messages that don't reveal user existence
*/
