// frontend/src/App.jsx
import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import DashboardPage from "./pages/DashboardPage";
import InventoryPage from "./pages/InventoryPage";
import PosPage from "./pages/PosPage";
import ReportsPage from "./pages/ReportsPage";
import LoginPage from "./pages/LoginPage"; // <-- Import Login
import ProtectedRoute from "./components/common/ProtectedRoute"; // <-- Import ProtectedRoute
import GahanPage from "./pages/GahanPage"; // <-- Import GahanPage
import GahanReportsPage from "./pages/GahanReportsPage"; // <-- Import Gahan Reports Page

function App() {
  return (
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
        <Route path="gahan-reports" element={<GahanReportsPage />} />{" "}
        {/* <-- Add Gahan Reports route */}
      </Route>
    </Routes>
  );
}

export default App;
