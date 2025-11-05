// frontend/src/components/layout/Sidebar.jsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import {
  FiHome,
  FiPackage,
  FiShoppingCart,
  FiFileText,
  FiTrendingUp,
  FiBarChart2,
  FiBook,
  FiLogOut,
  FiSettings, // <-- NEW: Import the Settings icon
} from "react-icons/fi";
import buildwithinfovionLogo from "../../assets/buildwithinfovion-logo.svg";

const Sidebar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { to: "/", label: "Dashboard", icon: FiHome, end: true },
    { to: "/inventory", label: "Stock", icon: FiPackage },
    { to: "/pos", label: "POS", icon: FiShoppingCart },
    { to: "/reports", label: "Sales Reports", icon: FiFileText },
    { to: "/gahan", label: "Gahan", icon: FiTrendingUp },
    { to: "/gahan-reports", label: "Gahan Reports", icon: FiBarChart2 },
    { to: "/debt", label: "Debt (Khata)", icon: FiBook },
  ];

  // NEW: Settings Link
  const settingsItem = {
    to: "/settings",
    label: "Settings",
    icon: FiSettings,
  };

  return (
    <aside className="w-64 h-screen flex flex-col relative overflow-hidden">
      {/* Luxury Jewelry Gradient Background - Gold/Amber/Brown */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-900 via-yellow-800 to-orange-900 opacity-90"></div>
      <div className="absolute inset-0 backdrop-blur-xl bg-white/10"></div>

      {/* Content Layer */}
      <div className="relative z-10 flex flex-col h-full text-white p-6">
        {/* Header Section */}
        <div className="mb-8">
          {/* Shop Logo/Name - WITH ACTUAL VJ LOGO */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-14 h-14 bg-white backdrop-blur-lg rounded-xl flex items-center justify-center shadow-lg border-2 border-yellow-300/40 p-1.5 overflow-hidden">
              <img
                src="/VJ.png"
                alt="Vinayak Jewellers"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-amber-50 leading-tight">
                विनायक ज्वेलर्स
              </h1>
              {/* <p className="text-xs text-amber-200/70">गंगाखेड</p> */}
            </div>
          </div>

          {/* User Info Card */}
          {user && (
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-yellow-400/20 shadow-lg">
              <p className="text-xs text-amber-200/80 mb-1">Logged in as</p>
              <p className="text-sm font-semibold text-amber-50 truncate">
                {user.username}
              </p>
              <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-yellow-400/30 text-amber-100 rounded-full border border-yellow-300/40">
                {user.role}
              </span>
            </div>
          )}
        </div>

        {/* Navigation Links - Hidden Scrollbar */}
        <nav
          className="flex-grow overflow-y-auto"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <style>{`
            nav::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                      isActive
                        ? "bg-yellow-400/20 backdrop-blur-lg shadow-lg border border-yellow-300/40 scale-105"
                        : "hover:bg-white/10 hover:scale-105 hover:shadow-lg border border-transparent"
                    }`
                  }
                >
                  <item.icon
                    className="w-5 h-5 transition-transform group-hover:scale-110"
                    strokeWidth={2.5}
                  />
                  <span className="font-medium text-sm">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Separator before Settings and Logout */}
        <div className="mt-6 pt-6 border-t border-amber-400/20 space-y-2">
          {/* NEW: Settings Link */}
          <NavLink
            to={settingsItem.to}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                isActive
                  ? "bg-yellow-400/20 backdrop-blur-lg shadow-lg border border-yellow-300/40 scale-105"
                  : "hover:bg-white/10 hover:scale-105 hover:shadow-lg border border-transparent"
              }`
            }
          >
            <settingsItem.icon
              className="w-5 h-5 transition-transform group-hover:scale-110"
              strokeWidth={2.5}
            />
            <span className="font-medium text-sm">{settingsItem.label}</span>
          </NavLink>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 backdrop-blur-lg border border-red-400/30 hover:border-red-300/50 transition-all duration-300 hover:scale-105 shadow-lg group"
          >
            <FiLogOut
              className="w-5 h-5 transition-transform group-hover:scale-110"
              strokeWidth={2.5}
            />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>

        {/* BuildwithInfovion Branding - WITH LOGO */}
        <div className="mt-6 pt-4 border-t border-amber-400/20">
          <div className="text-center">
            <p className="text-xs text-amber-300/60 mb-2">Powered by</p>
            <div className="flex items-center justify-center space-x-2.5">
              {/* Company Logo - Your SVG Logo */}
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-lg p-1 border border-amber-200/20">
                <img
                  src={buildwithinfovionLogo}
                  alt="BuildwithInfovion"
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-sm font-bold bg-gradient-to-r from-amber-200 to-yellow-200 bg-clip-text text-transparent">
                BuildwithInfovion
              </p>
            </div>
            <p className="text-xs text-amber-300/50 mt-1.5">v1.0.0</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
