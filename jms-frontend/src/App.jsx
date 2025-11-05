// frontend/src/App.jsx
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify"; // <-- 1. Import ToastContainer
import "react-toastify/dist/ReactToastify.css"; // <-- 2. Import its CSS

import Layout from "./components/layout/Layout";
import DashboardPage from "./pages/DashboardPage";
import InventoryPage from "./pages/InventoryPage";
import PosPage from "./pages/PosPage";
import ReportsPage from "./pages/ReportsPage";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/common/ProtectedRoute";
import GahanPage from "./pages/GahanPage";
import GahanReportsPage from "./pages/GahanReportsPage";
import DebtPage from "./pages/DebtPage";
// NEW IMPORT
import SettingsPage from "./pages/SettingsPage"; // <-- Import the new SettingsPage

function App() {
  return (
    <>
      {/* 3. Add the container for toasts to render */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Application Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="pos" element={<PosPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="gahan" element={<GahanPage />} />
          <Route path="gahan-reports" element={<GahanReportsPage />} />
          <Route path="debt" element={<DebtPage />} />
          {/* NEW ROUTE: Settings Page for Password Change */}
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
