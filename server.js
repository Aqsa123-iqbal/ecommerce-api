const express = require("express");
const cors = require("cors");
const { createHandler } = require("graphql-http/lib/use/express");
const { ruruHTML } = require("ruru/server");

const schema = require("./src/graphql/schema");
const productRoutes = require("./src/routes/products");
const orderRoutes = require("./src/routes/orders");
const { errorHandler, notFoundHandler } = require("./src/middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- Module 1: RESTful noun-based resource routes ---
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/orders", orderRoutes);

// --- Module 3: GraphQL endpoint (alternative fix for over-fetching) ---
app.all("/graphql", createHandler({ schema }));

// Simple browser-based GraphQL playground (Ruru), so you can test queries
// visually at GET /playground instead of only via POST /graphql.
app.get("/playground", (req, res) => {
  res.type("html").send(ruruHTML({ endpoint: "/graphql" }));
});

app.get("/", (req, res) => {
  res.status(200).json({
    message: "E-Commerce API is running.",
    docs: {
      rest_products: "/api/v1/products",
      rest_orders: "/api/v1/orders",
      graphql_endpoint: "/graphql",
      graphql_playground: "/playground"
    }
  });
});

// Unknown routes -> standardized 404
app.use(notFoundHandler);

// --- Module 2: centralized error handler (always last) ---
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 E-Commerce API running at http://localhost:${PORT}`);
  console.log(`📊 GraphQL endpoint at http://localhost:${PORT}/graphql`);
  console.log(`🧪 GraphQL playground at http://localhost:${PORT}/playground`);
});
