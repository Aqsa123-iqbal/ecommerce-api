# E-Commerce API — Enterprise RESTful + GraphQL (CSC337 Lab 03)

A local Node.js/Express API for a product catalog & order system that fixes
three real-world backend problems:

1. **Bad URI design & raw 500 crashes** → clean noun-based REST routes + a
   centralized error handler with a standardized JSON error schema.
2. **Duplicate orders/payments on mobile retry** → `Idempotency-Key` header
   support on order creation.
3. **REST over-fetching** → `?fields=` query param **and** a full `/graphql`
   endpoint, so clients only receive the exact data they ask for.

---

## 🚀 Setup & Run

```bash
git clone <this-repo-url>
cd ecommerce-api
npm install
npm start
```

Server runs at **http://localhost:3000**

- REST base: `http://localhost:3000/api/v1`
- GraphQL endpoint: `http://localhost:3000/graphql`
- GraphQL playground (browser UI): `http://localhost:3000/playground`

> Optional dev mode with auto-reload: `npm run dev` (uses Node's built-in `--watch`)

---

## 📦 Module 1 — RESTful Resource Modeling

All endpoints are noun-based; the HTTP verb defines the action.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/products` | List products (filtering + pagination) |
| GET | `/api/v1/products/:id` | Get single product |
| POST | `/api/v1/products` | Create product → `201 Created` |
| PUT | `/api/v1/products/:id` | **Idempotent** full replace |
| PATCH | `/api/v1/products/:id` | Partial update |
| DELETE | `/api/v1/products/:id` | Delete product |
| POST | `/api/v1/orders` | Create order (requires `Idempotency-Key` header) |
| GET | `/api/v1/orders/:id` | Get single order |

### Filtering & Pagination
```
GET /api/v1/products?category=electronics&min_price=1000&max_price=5000&limit=5&offset=0&sort=price_asc
```

### Idempotent Order Creation (prevents duplicate payments)
```bash
curl -X POST http://localhost:3000/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: 7c9e6679-7425-40de-944b-e07fc1f90ae7" \
  -d '{"product_id": 1, "quantity": 2}'
```
Sending the **same** `Idempotency-Key` again (e.g. a mobile app retry after a
timeout) returns the original order instead of creating a duplicate — the
response includes `"replayed": true`.

---

## ⚠️ Module 2 — Consistent Error Schema

Every error, from every part of the app, has the same shape:

```json
{
  "error": {
    "error_code": "PRODUCT_NOT_FOUND",
    "message": "Product with ID 999 does not exist.",
    "status": 404,
    "timestamp": "2026-09-22T10:15:30Z",
    "path": "/api/v1/products/999"
  }
}
```

| Status | When |
|---|---|
| `201` | Resource created successfully |
| `400` | Client sent invalid data (validation error) |
| `404` | Resource does not exist |
| `500` | Genuine unexpected server error (never used for client mistakes) |

---

## 🎯 Module 3 — Solving Over-Fetching

**Option A — Field selector (REST):**
```
GET /api/v1/products/123?fields=title,price
```
Returns only `{ "data": { "title": "...", "price": 4999 } }` instead of the
full 8-field object.

**Option B — GraphQL:**
```graphql
query {
  product(id: 1) {
    title
    price
  }
}
```
```bash
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ product(id: 1) { title price } }"}'
```
Visit `http://localhost:3000/playground` in a browser for an interactive
query builder.

---

## 🗂 Project Structure
```
ecommerce-api/
├── server.js                  # app entry point
├── src/
│   ├── data/                  # in-memory data stores
│   │   ├── products.js
│   │   └── orders.js
│   ├── routes/
│   │   ├── products.js        # Module 1 CRUD + filtering/pagination
│   │   └── orders.js          # Module 1 + idempotency
│   ├── middleware/
│   │   └── errorHandler.js    # Module 2 centralized error handling
│   ├── graphql/
│   │   └── schema.js          # Module 3 GraphQL schema/resolvers
│   └── utils/
│       ├── AppError.js
│       ├── validateProduct.js
│       └── selectFields.js    # Module 3 ?fields= implementation
└── postman_collection.json
```

## 🧪 Testing
Import `postman_collection.json` into Postman, or use the `curl` examples
above. All endpoints were manually verified for:
- Correct status codes (200/201/400/404)
- Idempotent `PUT` (same input → same output, no duplicate side effects)
- Idempotent `POST /orders` via `Idempotency-Key`
- Field-selector and GraphQL both returning reduced payloads

## 🛠 Tech Stack
Node.js, Express, GraphQL (`graphql` + `graphql-http`), in-memory data store
(no external DB required for this lab).
