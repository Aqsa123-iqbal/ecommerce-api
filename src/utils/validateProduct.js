const AppError = require("./AppError");

/**
 * Validates the request body for creating/updating a product.
 * Throws AppError (400) with field-level details if invalid.
 */
function validateProduct(body, { partial = false } = {}) {
  const fieldErrors = [];
  const required = ["title", "price", "category", "stock"];

  if (!partial) {
    required.forEach((field) => {
      if (body[field] === undefined || body[field] === null || body[field] === "") {
        fieldErrors.push({ field, issue: "is required" });
      }
    });
  }

  if (body.title !== undefined && typeof body.title !== "string") {
    fieldErrors.push({ field: "title", issue: "must be a string" });
  }

  if (body.price !== undefined) {
    if (typeof body.price !== "number" || body.price <= 0) {
      fieldErrors.push({ field: "price", issue: "must be a positive number" });
    }
  }

  if (body.stock !== undefined) {
    if (typeof body.stock !== "number" || body.stock < 0 || !Number.isInteger(body.stock)) {
      fieldErrors.push({ field: "stock", issue: "must be a non-negative integer" });
    }
  }

  if (body.category !== undefined && typeof body.category !== "string") {
    fieldErrors.push({ field: "category", issue: "must be a string" });
  }

  if (fieldErrors.length > 0) {
    throw new AppError(
      "VALIDATION_ERROR",
      "One or more fields failed validation.",
      400,
      fieldErrors
    );
  }
}

module.exports = validateProduct;
