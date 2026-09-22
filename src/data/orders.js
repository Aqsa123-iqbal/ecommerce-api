// In-memory order store + idempotency-key cache (Module 2 requirement:
// prevent duplicate order creation on mobile app retry).

let orders = [];
let nextOrderId = 1;

// Maps Idempotency-Key -> { statusCode, body } of the original response
const idempotencyCache = new Map();

function findByIdempotencyKey(key) {
  return idempotencyCache.get(key);
}

function saveIdempotentResponse(key, statusCode, body) {
  idempotencyCache.set(key, { statusCode, body });
}

function createOrder(data) {
  const order = {
    id: nextOrderId++,
    ...data,
    status: "confirmed",
    createdAt: new Date().toISOString()
  };
  orders.push(order);
  return order;
}

function getById(id) {
  return orders.find((o) => o.id === Number(id));
}

module.exports = {
  createOrder,
  getById,
  findByIdempotencyKey,
  saveIdempotentResponse
};
