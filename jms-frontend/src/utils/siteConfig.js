// Shop configuration for JMS — one codebase, one deployment per shop.
// Every value comes from the deployment's environment; the defaults keep the
// original installation (Vinayak Jewellers) looking exactly as before.
export const siteConfig = {
  shopName: import.meta.env.VITE_SHOP_NAME || "Vinayak Jewellers",
  // Name shown in the sidebar, in the shop's own script if it has one (falls back to shopName)
  shopNameLocal: import.meta.env.VITE_SHOP_NAME_LOCAL ?? (import.meta.env.VITE_SHOP_NAME ? "" : "विनायक ज्वेलर्स"),
  shopLogo: import.meta.env.VITE_SHOP_LOGO || "/VJ.png",
  // Line under the shop name on invoices (e.g. "Gold & Silver Merchants"); empty hides it
  shopTagline: import.meta.env.VITE_SHOP_TAGLINE ?? "सोने चांदीचे व्यापारी",
  shopAddress: import.meta.env.VITE_SHOP_ADDRESS || "Pune, Maharashtra",
  ownerName: import.meta.env.VITE_OWNER_NAME || "Prop. Vinayak D. Didshere",
  ownerMobile: import.meta.env.VITE_OWNER_MOBILE || "9421462257",
  gstNumber: import.meta.env.VITE_GST_NUMBER || "",
  enableGstBilling: import.meta.env.VITE_ENABLE_GST === "true",
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:5000",
};

export const displayShopName = () => siteConfig.shopNameLocal || siteConfig.shopName;

export const APP_VERSION = "2.0";
