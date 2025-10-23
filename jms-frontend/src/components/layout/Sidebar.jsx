// frontend/src/components/layout/Sidebar.jsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth"; // <-- Import useAuth

const navLinkClasses = "p-2 block rounded";
const activeLinkClasses = "bg-gray-700";
const inactiveLinkClasses = "hover:bg-gray-700";

const Sidebar = () => {
  const { logout, user } = useAuth(); // <-- Get logout function and user
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login"); // Redirect to login page after logout
  };

  return (
    <aside className="w-64 bg-gray-800 text-white p-4 flex flex-col">
      {/* Updated Title */}
      <h1 className="text-2xl font-bold">Vinayak Jewellers</h1>

      {/* Display username */}
      {user && (
        <span className="text-sm mt-2 text-gray-400">
          User: {user.username} ({user.role})
        </span>
      )}

      <nav className="mt-8 flex-grow">
        <ul>
          <li className="mb-2">
            <NavLink
              to="/"
              end // Add 'end' prop for exact match on root path
              className={({ isActive }) =>
                `${navLinkClasses} ${
                  isActive ? activeLinkClasses : inactiveLinkClasses
                }`
              }
            >
              Dashboard
            </NavLink>
          </li>
          <li className="mb-2">
            <NavLink
              to="/inventory"
              className={({ isActive }) =>
                `${navLinkClasses} ${
                  isActive ? activeLinkClasses : inactiveLinkClasses
                }`
              }
            >
              Stock {/* Updated Label */}
            </NavLink>
          </li>
          <li className="mb-2">
            <NavLink
              to="/pos"
              className={({ isActive }) =>
                `${navLinkClasses} ${
                  isActive ? activeLinkClasses : inactiveLinkClasses
                }`
              }
            >
              POS
            </NavLink>
          </li>
          <li className="mb-2">
            <NavLink
              to="/reports"
              className={({ isActive }) =>
                `${navLinkClasses} ${
                  isActive ? activeLinkClasses : inactiveLinkClasses
                }`
              }
            >
              Sales Reports {/* Updated Label */}
            </NavLink>
          </li>
          <li className="mb-2">
            <NavLink
              to="/gahan"
              className={({ isActive }) =>
                `${navLinkClasses} ${
                  isActive ? activeLinkClasses : inactiveLinkClasses
                }`
              }
            >
              Gahan
            </NavLink>
          </li>
          {/* --- ADDED BACK Gahan Reports Link --- */}
          <li className="mb-2">
            <NavLink
              to="/gahan-reports"
              className={({ isActive }) =>
                `${navLinkClasses} ${
                  isActive ? activeLinkClasses : inactiveLinkClasses
                }`
              }
            >
              Gahan Reports
            </NavLink>
          </li>
          {/* ------------------------------------- */}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="mt-auto">
        <button
          onClick={handleLogout}
          className="w-full text-left p-2 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
