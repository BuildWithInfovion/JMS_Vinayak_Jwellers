// frontend/src/components/layout/Topbar.jsx
import React from "react";
import { useLocation } from "react-router-dom";

const MenuIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6h16M4 12h16m-7 6h7"
    />
  </svg>
);

// Title shown in the top bar for each screen
const TITLES = {
  "/": "Dashboard",
  "/inventory": "Stock",
  "/pos": "Point of Sale",
  "/reports": "Sales Reports",
  "/gahan": "Gahan (Gold Loans)",
  "/gahan-reports": "Gahan Reports",
  "/debt": "Udhaar (Pending Payments)",
  "/settings": "Settings",
};

const Topbar = ({ onToggleSidebar }) => {
  const { pathname } = useLocation();
  const pageTitle = TITLES[pathname.replace(/\/+$/, "") || "/"] || "";

  return (
    <header className="bg-white shadow p-4 flex items-center justify-between">
      {/* Menu Button - visible only on mobile */}
      <button
        onClick={onToggleSidebar}
        aria-label="Open menu"
        className="text-gray-500 focus:outline-none focus:text-gray-700 md:hidden"
      >
        <MenuIcon />
      </button>

      <h2 className="text-xl font-semibold">{pageTitle}</h2>

      <div></div>
    </header>
  );
};

export default Topbar;
