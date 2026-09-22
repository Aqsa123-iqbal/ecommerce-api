/**
 * Custom application error class.
 * Every intentional/known error thrown in the app should be an AppError
 * so the centralized error handler can format it consistently.
 */
class AppError extends Error {
  constructor(errorCode, message, statusCode, fieldErrors = null) {
    super(message);
    this.errorCode = errorCode;   // e.g. "PRODUCT_NOT_FOUND"
    this.statusCode = statusCode; // e.g. 404
    this.fieldErrors = fieldErrors; // optional array for validation details
    this.isOperational = true;    // distinguishes expected errors from bugs
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
