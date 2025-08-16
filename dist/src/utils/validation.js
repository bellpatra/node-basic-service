"use strict";
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
exports.ApiResponse = exports.validateRequest = void 0;
const zod_1 = require("zod");
/**
 * Middleware to validate request body against a Zod schema. Returns 400 on validation error.
 */
const validateRequest = (schema) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validatedData = yield schema.parseAsync(req.body);
            req.body = validatedData;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const validationErrors = error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message,
                    code: err.code
                }));
                const response = ApiResponse.fail('Validation failed', 400, validationErrors);
                return ApiResponse.send(res, response);
            }
            next(error);
        }
    });
};
exports.validateRequest = validateRequest;
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
class ApiResponse {
    /**
     * Creates a success response
     */
    static success(data, message = 'Operation successful', statusCode = 200, meta) {
        return Object.assign(Object.assign({ status: 'success', statusCode,
            message }, (data !== undefined && { data })), { meta: Object.assign({ timestamp: new Date().toISOString() }, meta) });
    }
    /**
     * Creates an error response for server errors (5xx)
     */
    static error(message = 'Internal server error', statusCode = 500, meta) {
        return {
            status: 'error',
            statusCode,
            message,
            meta: Object.assign({ timestamp: new Date().toISOString() }, meta)
        };
    }
    /**
     * Creates a fail response for client errors (4xx)
     */
    static fail(message = 'Bad request', statusCode = 400, errors, meta) {
        return Object.assign(Object.assign({ status: 'fail', statusCode,
            message }, (errors && { errors })), { meta: Object.assign({ timestamp: new Date().toISOString() }, meta) });
    }
    /**
     * Creates a paginated success response
     */
    static paginated(data, pagination, message = 'Data retrieved successfully', statusCode = 200, meta) {
        const totalPages = Math.ceil(pagination.total / pagination.limit);
        return {
            status: 'success',
            statusCode,
            message,
            data,
            meta: Object.assign({ timestamp: new Date().toISOString(), pagination: Object.assign(Object.assign({}, pagination), { totalPages }) }, meta)
        };
    }
    /**
     * Sends a standardized response
     */
    static send(res, response) {
        return res.status(response.statusCode).json(response);
    }
    /**
     * Wrapper for handling try/catch logic with standardized responses
     */
    static withTryCatch(res_1, fn_1) {
        return __awaiter(this, arguments, void 0, function* (res, fn, successMessage = 'Operation successful', successStatusCode = 200, meta) {
            try {
                const result = yield fn();
                const response = ApiResponse.success(result, successMessage, successStatusCode, meta);
                return ApiResponse.send(res, response);
            }
            catch (error) {
                console.error('API Error:', error);
                // Handle different error types
                if (error instanceof zod_1.z.ZodError) {
                    const validationErrors = error.errors.map(err => ({
                        field: err.path.join('.'),
                        message: err.message,
                        code: err.code
                    }));
                    const response = ApiResponse.fail('Validation failed', 400, validationErrors, meta);
                    return ApiResponse.send(res, response);
                }
                // Handle custom errors with statusCode
                const statusCode = error instanceof Error && error.statusCode
                    ? error.statusCode
                    : 500;
                const errorMessage = error instanceof Error
                    ? error.message
                    : 'Internal server error';
                // Use fail for client errors (4xx), error for server errors (5xx)
                const response = statusCode >= 400 && statusCode < 500
                    ? ApiResponse.fail(errorMessage, statusCode, undefined, meta)
                    : ApiResponse.error(errorMessage, statusCode, meta);
                return ApiResponse.send(res, response);
            }
        });
    }
    /**
     * Creates a not found response
     */
    static notFound(message = 'Resource not found', meta) {
        return ApiResponse.fail(message, 404, undefined, meta);
    }
    /**
     * Creates an unauthorized response
     */
    static unauthorized(message = 'Unauthorized', meta) {
        return ApiResponse.fail(message, 401, undefined, meta);
    }
    /**
     * Creates a forbidden response
     */
    static forbidden(message = 'Forbidden', meta) {
        return ApiResponse.fail(message, 403, undefined, meta);
    }
    /**
     * Creates a validation error response (always uses 'fail' status)
     */
    static validationError(errors, message = 'Validation failed', meta) {
        return ApiResponse.fail(message, 400, errors, meta);
    }
    /**
     * Creates a validation error response for a single field
     */
    static singleFieldError(field, message, code, meta) {
        return ApiResponse.fail('Validation failed', 400, [{ field, message, code }], meta);
    }
}
exports.ApiResponse = ApiResponse;
