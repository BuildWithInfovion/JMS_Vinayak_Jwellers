import axios from "axios";

const PROD_API_URL = "https://jms-vinayak-jewellers-backend.onrender.com";

// Vite uses import.meta.env, not process.env
const isProduction = import.meta.env.MODE === "production";

const API_BASE_URL = isProduction ? PROD_API_URL : "http://localhost:5001";

// Function to set token in global headers
export const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common["x-auth-token"] = token;
  } else {
    delete axios.defaults.headers.common["x-auth-token"];
  }
};

// --- Auth ---
export const login = (username, password) => {
  return axios.post(`${API_BASE_URL}/api/auth/login`, { username, password });
};

// --- Products ---
export const getProducts = () => {
  return axios.get(`${API_BASE_URL}/api/products`);
};

export const addProduct = (newProduct) => {
  // eslint-disable-next-line no-unused-vars
  const { id, ...productData } = newProduct;
  return axios.post(`${API_BASE_URL}/api/products`, productData);
};

export const updateProduct = (id, updatedData) => {
  return axios.put(`${API_BASE_URL}/api/products/${id}`, updatedData);
};

// --- Sales ---
export const createSale = (saleData) => {
  return axios.post(`${API_BASE_URL}/api/sales`, saleData);
};

export const getSales = () => {
  return axios.get(`${API_BASE_URL}/api/sales`);
};

// --- Gahan ---
export const addGahan = (gahanData) => {
  return axios.post(`${API_BASE_URL}/api/gahan`, gahanData);
};

export const getGahanRecords = () => {
  // Fetches active/overdue records for the Gahan Management page
  return axios.get(`${API_BASE_URL}/api/gahan`);
};

export const releaseGahan = (id) => {
  return axios.put(`${API_BASE_URL}/api/gahan/${id}/release`);
};

// --- NEW Function for Gahan Reports ---
export const getAllGahanRecords = () => {
  // Fetches ALL records (including released) for the Gahan Reports page
  return axios.get(`${API_BASE_URL}/api/gahan/all`);
};
// ------------------------------------
