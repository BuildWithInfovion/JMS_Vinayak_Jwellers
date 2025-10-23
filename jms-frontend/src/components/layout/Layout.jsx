// frontend/src/components/layout/Layout.jsx
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar"; // We'll update Topbar to include a toggle button

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default closed on mobile

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {" "}
      {/* Added overflow-hidden */}
      {/* Sidebar - Conditionally rendered for mobile */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-800 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:block`}
      >
        <Sidebar />
      </div>
      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black opacity-50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-x-hidden">
        {" "}
        {/* Added overflow-x-hidden */}
        <Topbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />{" "}
        {/* Pass toggle function */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {" "}
          {/* Adjusted padding */}
          <Outlet /> {/* Child routes will be rendered here */}
        </main>
      </div>
    </div>
  );
};

export default Layout;
