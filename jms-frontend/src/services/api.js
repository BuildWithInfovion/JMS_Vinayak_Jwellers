import axios from "axios";

// **********************************************
// UPDATED: Use VITE environment variable for PROD URL
// The fallback is the hardcoded Vinayak Jewellers link.
// The Netlify Demo deploy will set VITE_PROD_API_URL to the Demo Backend URL.
// **********************************************
const FALLBACK_PROD_API_URL =
  "https://jms-vinayak-jewellers-backend.onrender.com";
const PROD_API_URL = import.meta.env.VITE_PROD_API_URL || FALLBACK_PROD_API_URL;
// **********************************************

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

// **********************************************
// NEW FUNCTION: Forgot Password (Request Token)
// **********************************************
export const forgotPassword = (username, recoveryKey) => {
  return axios.post(`${API_BASE_URL}/api/auth/forgot-password`, { username, recoveryKey });
};

// **********************************************
// NEW FUNCTION: Reset Password (Use Token to change password)
// **********************************************
export const resetPassword = (token, newPassword) => {
  return axios.put(`${API_BASE_URL}/api/auth/reset-password/${token}`, {
    newPassword,
  });
};

// **********************************************
// EXISTING FUNCTION: Change Password (Protected)
// **********************************************
export const changePassword = (oldPassword, newPassword) => {
  return axios.post(`${API_BASE_URL}/api/auth/change-password`, {
    oldPassword,
    newPassword,
  });
};
// **********************************************

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

// *** NEW: Add deleteProduct function ***
export const deleteProduct = (id) => {
  return axios.delete(`${API_BASE_URL}/api/products/${id}`);
};
// **************************************

// **********************************************
// NEW FUNCTION: Restock Product
// **********************************************
export const restockProduct = (id, restockData) => {
  // restockData should be { quantityToAdd, weightToAdd }
  return axios.put(`${API_BASE_URL}/api/products/${id}/restock`, restockData);
};
// **********************************************

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

export const releaseGahan = (id, interestReceived) => {
  return axios.put(`${API_BASE_URL}/api/gahan/${id}/release`, { interestReceived });
};

// Interest and amount due today on a pledge
export const getGahanSettlement = (id) => axios.get(`${API_BASE_URL}/api/gahan/${id}/settlement`);

// --- NEW Function for Gahan Reports ---
export const getAllGahanRecords = () => {
  // Fetches ALL records (including released) for the Gahan Reports page
  return axios.get(`${API_BASE_URL}/api/gahan/all`);
};
// ------------------------------------

// --- DEBT (KHATA) ---
export const getActiveDebts = () => {
  return axios.get(`${API_BASE_URL}/api/debt`);
};

export const addDebtPayment = (debtId, paymentAmount, method = "Cash") => {
  return axios.post(`${API_BASE_URL}/api/debt/${debtId}/pay`, {
    paymentAmount,
    method,
  });
};

// --- ADDED: New function to manually create debt ---
export const createDebt = (debtData) => {
  return axios.post(`${API_BASE_URL}/api/debt`, debtData);
};
// ------------------------------------------------

// --- Settings ---
export const getSettings = () => {
  return axios.get(`${API_BASE_URL}/api/settings`);
};

export const updateSettings = (settingsData) => {
  return axios.put(`${API_BASE_URL}/api/settings`, settingsData);
};

// --- Owner: users and passwords ---
export const getUsers = () => axios.get(`${API_BASE_URL}/api/auth/users`);
export const resetUserPassword = (username, newPassword) =>
  axios.post(`${API_BASE_URL}/api/auth/reset-user-password`, { username, newPassword });

// --- Exports for the CA (Tally XML, Excel registers) ---
export const getExportSummary = (from, to) =>
  axios.get(`${API_BASE_URL}/api/exports/summary`, { params: { from, to } });

/** Downloads /api/exports/<path> as a file, keeping the server's file name. */
export const downloadExport = async (path, params) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/exports/${path}`, { params, responseType: "blob" });
    const cd = res.headers["content-disposition"] || "";
    const name = (cd.match(/filename="([^"]+)"/) || [])[1] || `JMS-export-${params.from}-to-${params.to}`;
    const url = URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  } catch (err) {
    let msg = "Export failed.";
    try { msg = JSON.parse(await err.response.data.text()).message || msg; } catch { /* keep default */ }
    throw new Error(msg);
  }
};
