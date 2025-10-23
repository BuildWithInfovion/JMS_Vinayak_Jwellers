// frontend/src/mocks/products.js
export const mockProducts = [
  {
    id: "G001",
    name: "Gold Ring",
    category: "Gold",
    weight: 5.2, // in grams
    purity: 22, // in carats
    stock: 10,
    pricePerGram: 6500,
  },
  {
    id: "S001",
    name: "Silver Anklet",
    category: "Silver",
    weight: 25.0,
    purity: 92.5, // percentage
    stock: 15,
    pricePerGram: 85,
  },
  {
    id: "G002",
    name: "Gold Chain",
    category: "Gold",
    weight: 10.5,
    purity: 24,
    stock: 5,
    pricePerGram: 6800,
  },
  {
    id: "O001",
    name: "Diamond Earring",
    category: "Others",
    weight: 2.1,
    purity: 18,
    stock: 8,
    pricePerGram: 0, // Price might be per piece for others
    unitPrice: 55000,
  },
];
