// frontend/src/pages/DashboardPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { getSales, getProducts } from "../services/api";

// StatCard component remains the same
const StatCard = ({ title, value, isCurrency = false }) => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h4 className="text-sm font-medium text-gray-500 uppercase">{title}</h4>
      <p className="mt-1 text-3xl font-semibold text-gray-900">
        {isCurrency ? `₹${value.toFixed(2)}` : value}
      </p>
    </div>
  );
};

const DashboardPage = () => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]); // <-- State for products
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch both sales and products
        const [salesResponse, productsResponse] = await Promise.all([
          getSales(),
          getProducts(),
        ]);
        setSales(salesResponse.data);
        setProducts(productsResponse.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- UPDATED: Calculate stats ---
  const stats = useMemo(() => {
    const now = new Date();
    const todayStr = now.toDateString(); // For daily comparison

    // Get start of the current week (assuming Sunday is the first day)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Go back to Sunday
    startOfWeek.setHours(0, 0, 0, 0); // Start of the day

    // Get start of the current month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0); // Start of the day

    let revenueToday = 0;
    let salesCountToday = 0;
    let salesCountWeek = 0;
    let salesCountMonth = 0;
    let totalRevenue = 0;

    sales.forEach((sale) => {
      const saleDate = new Date(sale.createdAt);
      const saleAmount = sale.totalAmount || 0;
      totalRevenue += saleAmount; // Add to total revenue

      // Today's stats
      if (saleDate.toDateString() === todayStr) {
        revenueToday += saleAmount;
        salesCountToday++;
      }

      // Weekly stats
      if (saleDate >= startOfWeek) {
        salesCountWeek++;
      }

      // Monthly stats
      if (saleDate >= startOfMonth) {
        salesCountMonth++;
      }
    });

    const totalSalesCount = sales.length; // Keep total count

    return {
      revenueToday,
      salesCountToday,
      salesCountWeek, // New stat
      salesCountMonth, // New stat
      totalRevenue,
      totalSalesCount, // Keep this for potential future use
    };
  }, [sales]);
  // ------------------------------------

  // --- Find out-of-stock items (unchanged) ---
  const outOfStockItems = useMemo(() => {
    return products.filter((product) => product.stock <= 0);
  }, [products]);
  // ------------------------------------

  if (isLoading) {
    return <p>Loading dashboard...</p>;
  }

  return (
    <div>
      <h3 className="text-2xl font-semibold mb-4">Dashboard</h3>

      {/* --- UPDATED Stat Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Revenue Today"
          value={stats.revenueToday}
          isCurrency={true}
        />
        <StatCard title="Sales Today" value={stats.salesCountToday} />
        <StatCard title="Sales This Week" value={stats.salesCountWeek} />{" "}
        {/* New/Replaced */}
        <StatCard title="Sales This Month" value={stats.salesCountMonth} />{" "}
        {/* New */}
        {/* <StatCard title="Total Revenue" value={stats.totalRevenue} isCurrency={true} /> */}
      </div>
      {/* --------------------------- */}

      {/* --- Out of Stock Section (unchanged) --- */}
      <div className="bg-white shadow rounded-lg p-6">
        <h4 className="text-lg font-semibold mb-3 text-red-600">
          Out of Stock Items ({outOfStockItems.length})
        </h4>
        {outOfStockItems.length > 0 ? (
          <ul className="list-disc pl-5 space-y-1 max-h-40 overflow-y-auto">
            {outOfStockItems.map((item) => (
              <li key={item._id} className="text-sm">
                {item.name} ({item.category})
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">
            All items are currently in stock.
          </p>
        )}
      </div>
      {/* ------------------------------- */}
    </div>
  );
};

export default DashboardPage;
