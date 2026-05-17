// Confif file for JMS
// src/utils/siteConfig.js
export const siteConfig = {
  shopName: import.meta.env.VITE_SHOP_NAME || "Vinayak Jewellers",
  shopAddress: import.meta.env.VITE_SHOP_ADDRESS || "Pune, Maharashtra",
  ownerName: import.meta.env.VITE_OWNER_NAME || "Prop. Vinayak D. Didshere",
  ownerMobile: import.meta.env.VITE_OWNER_MOBILE || "9421462257",
  gstNumber: import.meta.env.VITE_GST_NUMBER || "",
  enableGstBilling: import.meta.env.VITE_ENABLE_GST === "true",
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:5000",
};
