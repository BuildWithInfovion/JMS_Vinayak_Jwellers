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
  FiSettings,
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

  const settingsItem = {
    to: "/settings",
    label: "Settings",
    icon: FiSettings,
  };

  return (
    <aside className="w-64 h-screen flex flex-col relative overflow-hidden">
      {/* iOS-Style Glassmorphism Background */}
      <div className="absolute inset-0">
        {/* Base gradient with more depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900 via-yellow-800 to-orange-900"></div>

        {/* Subtle pattern overlay for texture */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        ></div>

        {/* Frosted glass effect - KEY for iOS look */}
        <div className="absolute inset-0 backdrop-blur-2xl bg-white/5"></div>

        {/* Subtle inner glow */}
        <div
          className="absolute inset-0 shadow-inner"
          style={{
            boxShadow: "inset 0 0 60px rgba(255, 255, 255, 0.05)",
          }}
        ></div>
      </div>

      {/* Content Layer with enhanced glass cards */}
      <div className="relative z-10 flex flex-col h-full text-white p-6">
        {/* Header Section */}
        <div className="mb-8">
          {/* Shop Logo/Name - Enhanced Glass Card */}
          <div className="flex items-center space-x-3 mb-4">
            {/* Logo with frosted glass container */}
            <div className="w-14 h-14 bg-white/90 backdrop-blur-xl rounded-xl flex items-center justify-center shadow-2xl border border-white/40 p-1.5 overflow-hidden relative">
              {/* Subtle shine effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
              <img
                src="/VJ.png"
                alt="Vinayak Jewellers"
                className="w-full h-full object-contain relative z-10"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white drop-shadow-lg leading-tight">
                विनायक ज्वेलर्स
              </h1>
            </div>
          </div>

          {/* User Info Card - Frosted Glass */}
          {user && (
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-xl relative overflow-hidden">
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>

              <div className="relative z-10">
                <p className="text-xs text-amber-100/70 mb-1.5 font-medium">
                  Logged in as
                </p>
                <p className="text-sm font-bold text-white truncate drop-shadow-sm">
                  {user.username}
                </p>
                <span className="inline-block mt-2 px-3 py-1 text-xs font-semibold bg-yellow-400/25 backdrop-blur-md text-white rounded-full border border-yellow-300/30 shadow-lg">
                  {user.role}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Links - iOS-style frosted buttons */}
        <nav
          className="flex-grow overflow-y-auto pr-2"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255,255,255,0.3) transparent",
          }}
        >
          <style>{`
            nav::-webkit-scrollbar {
              width: 4px;
            }
            nav::-webkit-scrollbar-track {
              background: transparent;
            }
            nav::-webkit-scrollbar-thumb {
              background: rgba(255,255,255,0.2);
              border-radius: 10px;
            }
            nav::-webkit-scrollbar-thumb:hover {
              background: rgba(255,255,255,0.3);
            }
          `}</style>
          <ul className="space-y-1.5">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                      isActive
                        ? "bg-white/20 backdrop-blur-xl shadow-xl border border-white/30"
                        : "bg-white/5 backdrop-blur-md hover:bg-white/15 hover:shadow-lg border border-white/10 hover:border-white/20"
                    }`
                  }
                >
                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>

                  <item.icon
                    className="w-5 h-5 transition-transform group-hover:scale-110 relative z-10 drop-shadow-sm"
                    strokeWidth={2.5}
                  />
                  <span className="font-medium text-sm relative z-10 drop-shadow-sm">
                    {item.label}
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Separator - Subtle frosted line */}
        <div className="mt-6 pt-6 border-t border-white/15 space-y-2">
          {/* Settings Link - Frosted Glass */}
          <NavLink
            to={settingsItem.to}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                isActive
                  ? "bg-white/20 backdrop-blur-xl shadow-xl border border-white/30"
                  : "bg-white/5 backdrop-blur-md hover:bg-white/15 hover:shadow-lg border border-white/10 hover:border-white/20"
              }`
            }
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>

            <settingsItem.icon
              className="w-5 h-5 transition-transform group-hover:scale-110 relative z-10 drop-shadow-sm"
              strokeWidth={2.5}
            />
            <span className="font-medium text-sm relative z-10 drop-shadow-sm">
              {settingsItem.label}
            </span>
          </NavLink>

          {/* Logout Button - Enhanced Frosted Glass with Red Tint */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl bg-red-500/15 backdrop-blur-xl hover:bg-red-500/25 border border-red-400/25 hover:border-red-300/40 transition-all duration-300 shadow-lg hover:shadow-xl group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>

            <FiLogOut
              className="w-5 h-5 transition-transform group-hover:scale-110 relative z-10 drop-shadow-sm"
              strokeWidth={2.5}
            />
            <span className="font-medium text-sm relative z-10 drop-shadow-sm">
              Logout
            </span>
          </button>
        </div>

        {/* BuildwithInfovion Branding - Frosted Glass Card */}
        <div className="mt-6 pt-4 border-t border-white/15">
          <div className="text-center bg-white/5 backdrop-blur-lg rounded-xl p-3 border border-white/10">
            <p className="text-xs text-amber-200/60 mb-2 font-medium">
              Powered by
            </p>
            <div className="flex items-center justify-center space-x-2.5">
              {/* Company Logo - Frosted container */}
              <div className="w-8 h-8 bg-white/95 backdrop-blur-xl rounded-lg flex items-center justify-center shadow-lg p-1 border border-white/30 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                <img
                  src={buildwithinfovionLogo}
                  alt="BuildwithInfovion"
                  className="w-full h-full object-contain relative z-10"
                />
              </div>
              <p className="text-sm font-bold bg-gradient-to-r from-white to-amber-100 bg-clip-text text-transparent drop-shadow-sm">
                BuildwithInfovion
              </p>
            </div>
            <p className="text-xs text-amber-200/50 mt-1.5 font-medium">
              v1.0.0
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
