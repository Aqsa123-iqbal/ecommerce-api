const express = require("express");
const router = express.Router();
const orderStore = require("../data/orders");
const productStore = require("../data/products");
const AppError = require("../utils/AppError");

/**
 * POST /api/v1/orders
 * Requires header: Idempotency-Key: <uuid>
 *
 * If the same key is sent again (e.g. mobile app retries after a network
 * timeout), we return the ORIGINAL response instead of creating a second
 * order / charging the customer twice.
 */
router.post("/", (req, res) => {
  const idempotencyKey = req.header("Idempotency-Key");

  if (!idempotencyKey) {
    throw new AppError(
      "MISSING_IDEMPOTENCY_KEY",
      "Header 'Idempotency-Key' is required to safely create an order.",
      400
    );
  }

  // Retry detected -> replay the original response, do NOT create a new order
  const cached = orderStore.findByIdempotencyKey(idempotencyKey);
  if (cached) {
    return res.status(cached.statusCode).json({
      ...cached.body,
      replayed: true
    });
  }

  const { product_id, quantity } = req.body;

  if (!product_id || !quantity || quantity <= 0) {
    throw new AppError(
      "VALIDATION_ERROR",
      "'product_id' and a positive 'quantity' are required.",
      400
    );
  }

  const product = productStore.getById(product_id);
  if (!product) {
    throw new AppError(
      "PRODUCT_NOT_FOUND",
      `Product with ID ${product_id} does not exist.`,
      404
    );
  }

  if (product.stock < quantity) {
    throw new AppError(
      "INSUFFICIENT_STOCK",
      `Only ${product.stock} unit(s) of '${product.title}' left in stock.`,
      400
    );
  }

  const order = orderStore.createOrder({
    product_id: product.id,
    product_title: product.title,
    quantity,
    unit_price: product.price,
    total_price: product.price * quantity
  });

  const responseBody = { data: order, message: "Order created successfully" };
  orderStore.saveIdempotentResponse(idempotencyKey, 201, responseBody);

  res.status(201).json(responseBody);
});

/**
 * GET /api/v1/orders/:id
 */
router.get("/:id", (req, res) => {
  const order = orderStore.getById(req.params.id);
  if (!order) {
    throw new AppError(
      "ORDER_NOT_FOUND",
      `Order with ID ${req.params.id} does not exist.`,
      404
    );
  }
  res.status(200).json({ data: order });
});

module.exports = router;
