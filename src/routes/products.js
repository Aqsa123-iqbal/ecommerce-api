const express = require("express");
const router = express.Router();
const store = require("../data/products");
const AppError = require("../utils/AppError");
const validateProduct = require("../utils/validateProduct");
const selectFields = require("../utils/selectFields");

/**
 * GET /api/v1/products
 * Supports: ?category=  ?min_price=  ?max_price=  ?limit=  ?offset=  ?sort=  ?fields=
 */
router.get("/", (req, res) => {
  let results = store.getAll();

  const { category, min_price, max_price, sort, fields } = req.query;
  let limit = parseInt(req.query.limit, 10);
  let offset = parseInt(req.query.offset, 10);

  if (category) {
    results = results.filter(
      (p) => p.category.toLowerCase() === String(category).toLowerCase()
    );
  }
  if (min_price) {
    results = results.filter((p) => p.price >= Number(min_price));
  }
  if (max_price) {
    results = results.filter((p) => p.price <= Number(max_price));
  }

  if (sort === "price_asc") results.sort((a, b) => a.price - b.price);
  if (sort === "price_desc") results.sort((a, b) => b.price - a.price);

  const totalItems = results.length;

  if (isNaN(limit) || limit <= 0) limit = 20;
  if (limit > 100) limit = 100; // cap to protect the server
  if (isNaN(offset) || offset < 0) offset = 0;

  const paginated = results.slice(offset, offset + limit);
  const data = selectFields(paginated, fields);

  res.status(200).json({
    data,
    pagination: {
      total_items: totalItems,
      limit,
      offset,
      next_offset: offset + limit < totalItems ? offset + limit : null
    }
  });
});

/**
 * GET /api/v1/products/:id
 * Supports ?fields=title,price to fix over-fetching (Module 3).
 */
router.get("/:id", (req, res) => {
  const product = store.getById(req.params.id);
  if (!product) {
    throw new AppError(
      "PRODUCT_NOT_FOUND",
      `Product with ID ${req.params.id} does not exist.`,
      404
    );
  }
  const data = selectFields(product, req.query.fields);
  res.status(200).json({ data });
});

/**
 * POST /api/v1/products
 * 201 Created on success, 400 on validation failure.
 */
router.post("/", (req, res) => {
  validateProduct(req.body);
  const created = store.create(req.body);
  res.status(201).json({
    data: created,
    message: "Product created successfully"
  });
});

/**
 * PUT /api/v1/products/:id
 * Idempotent full replace. Same request repeated -> same final state.
 */
router.put("/:id", (req, res) => {
  const existing = store.getById(req.params.id);
  if (!existing) {
    throw new AppError(
      "PRODUCT_NOT_FOUND",
      `Product with ID ${req.params.id} does not exist.`,
      404
    );
  }
  validateProduct(req.body); // full replace requires all fields
  const updated = store.replace(req.params.id, req.body);
  res.status(200).json({
    data: updated,
    message: "Product updated successfully"
  });
});

/**
 * PATCH /api/v1/products/:id
 * Partial update (not required by rubric but included for completeness).
 */
router.patch("/:id", (req, res) => {
  const existing = store.getById(req.params.id);
  if (!existing) {
    throw new AppError(
      "PRODUCT_NOT_FOUND",
      `Product with ID ${req.params.id} does not exist.`,
      404
    );
  }
  validateProduct(req.body, { partial: true });
  const merged = { ...existing, ...req.body };
  const updated = store.replace(req.params.id, merged);
  res.status(200).json({ data: updated, message: "Product patched successfully" });
});

/**
 * DELETE /api/v1/products/:id
 */
router.delete("/:id", (req, res) => {
  const deleted = store.remove(req.params.id);
  if (!deleted) {
    throw new AppError(
      "PRODUCT_NOT_FOUND",
      `Product with ID ${req.params.id} does not exist.`,
      404
    );
  }
  res.status(200).json({ message: `Product ${req.params.id} deleted successfully` });
});

module.exports = router;
