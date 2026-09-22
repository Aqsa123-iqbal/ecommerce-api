// In-memory "database" for products (no external DB needed for this lab).

let products = [
  {
    id: 1,
    title: "Wireless Earbuds Pro",
    price: 4999,
    category: "electronics",
    stock: 120,
    description: "Bluetooth 5.3 earbuds with active noise cancellation and 30hr battery life.",
    vendor: "SoundTech Pvt Ltd",
    rating: 4.5
  },
  {
    id: 2,
    title: "Cotton Kurta - Men",
    price: 1899,
    category: "fashion",
    stock: 60,
    description: "Premium stitched cotton kurta, breathable fabric, summer collection.",
    vendor: "Threadworks",
    rating: 4.1
  },
  {
    id: 3,
    title: "Non-Stick Frying Pan 28cm",
    price: 2450,
    category: "home",
    stock: 35,
    description: "Induction-friendly non-stick frying pan with ergonomic handle.",
    vendor: "HomeCraft Kitchenware",
    rating: 4.3
  },
  {
    id: 4,
    title: "Smartphone Fast Charger 33W",
    price: 1599,
    category: "electronics",
    stock: 200,
    description: "GaN fast charger, compatible with USB-C devices, includes 1m cable.",
    vendor: "ChargeIt",
    rating: 4.6
  },
  {
    id: 5,
    title: "Leather Wallet - Bifold",
    price: 1299,
    category: "fashion",
    stock: 80,
    description: "Genuine leather bifold wallet with RFID blocking.",
    vendor: "Threadworks",
    rating: 4.0
  }
];

let nextId = 6;

function getAll() {
  return products;
}

function getById(id) {
  return products.find((p) => p.id === Number(id));
}

function create(data) {
  const newProduct = { id: nextId++, ...data };
  products.push(newProduct);
  return newProduct;
}

function replace(id, data) {
  const index = products.findIndex((p) => p.id === Number(id));
  if (index === -1) return null;
  products[index] = { id: Number(id), ...data };
  return products[index];
}

function remove(id) {
  const index = products.findIndex((p) => p.id === Number(id));
  if (index === -1) return false;
  products.splice(index, 1);
  return true;
}

module.exports = { getAll, getById, create, replace, remove };
