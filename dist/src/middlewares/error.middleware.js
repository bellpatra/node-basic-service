"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const zod_1 = require("zod");
const validation_1 = require("../utils/validation");
const errorMiddleware = (error, req, res, next) => {
    // Handle Zod validation errors
    if (error instanceof zod_1.ZodError) {
        const validationErrors = error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code,
        }));
        const response = validation_1.ApiResponse.fail('Validation failed', 400, validationErrors);
        return validation_1.ApiResponse.send(res, response);
    }
    console.error('Error:', error);
    // Handle custom errors with statusCode
    const statusCode = error instanceof Error && error.statusCode ? error.statusCode : 500;
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    // Use fail for client errors (4xx), error for server errors (5xx)
    const response = statusCode >= 400 && statusCode < 500
        ? validation_1.ApiResponse.fail(errorMessage, statusCode)
        : validation_1.ApiResponse.error(errorMessage, statusCode);
    return validation_1.ApiResponse.send(res, response);
};
exports.errorMiddleware = errorMiddleware;
