const AppError = require("../utils/AppError");

/**
 * Module 2 requirement: Standardized JSON error schema for EVERY error,
 * whether it's a client validation issue (400), missing resource (404),
 * or an unexpected server bug (500). Mobile app only ever needs to parse
 * ONE shape: { error: { error_code, message, status, timestamp, path } }
 */
function errorHandler(err, req, res, next) {
  // If it's not one of our known AppErrors, treat it as an unexpected 500
  // and NEVER leak raw stack traces / internals to the client.
  const isAppError = err instanceof AppError;

  const statusCode = isAppError ? err.statusCode : 500;
  const errorCode = isAppError ? err.errorCode : "INTERNAL_SERVER_ERROR";
  const message = isAppError
    ? err.message
    : "Something went wrong on our end. Please try again later.";

  // Log full details internally (never sent to client)
  if (!isAppError) {
    console.error("UNEXPECTED ERROR:", err);
  }

  const payload = {
    error: {
      error_code: errorCode,
      message,
      status: statusCode,
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    }
  };

  if (isAppError && err.fieldErrors) {
    payload.error.field_errors = err.fieldErrors;
  }

  res.status(statusCode).json(payload);
}

// Catches requests to routes that don't exist at all -> 404
function notFoundHandler(req, res, next) {
  const err = new AppError(
    "ROUTE_NOT_FOUND",
    `The route ${req.method} ${req.originalUrl} does not exist.`,
    404
  );
  next(err);
}

module.exports = { errorHandler, notFoundHandler };
