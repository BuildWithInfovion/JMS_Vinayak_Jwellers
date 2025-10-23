// frontend/src/components/layout/Topbar.jsx
import React from "react";
// Simple Menu icon (you can replace with an SVG later)
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

// Add onToggleSidebar prop
const Topbar = ({ onToggleSidebar }) => {
  // We'll get the dynamic title later if needed
  const pageTitle = "Dashboard";

  return (
    <header className="bg-white shadow p-4 flex items-center justify-between">
      {/* Menu Button - visible only on mobile */}
      <button
        onClick={onToggleSidebar}
        className="text-gray-500 focus:outline-none focus:text-gray-700 md:hidden"
      >
        <MenuIcon />
      </button>

      <h2 className="text-xl font-semibold">{pageTitle}</h2>

      {/* Placeholder for potential user profile/logout */}
      <div></div>
    </header>
  );
};

export default Topbar;
