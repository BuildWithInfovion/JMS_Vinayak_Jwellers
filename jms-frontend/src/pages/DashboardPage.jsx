// frontend/src/pages/DashboardPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { getSales, getProducts } from "../services/api";
import {
  FiDollarSign,
  FiShoppingBag,
  FiTrendingUp,
  FiCalendar,
  FiAlertTriangle,
} from "react-icons/fi";

// Modern StatCard with Glassmorphism
const StatCard = ({
  title,
  value,
  isCurrency = false,
  icon,
  gradient,
  iconBg,
}) => {
  return (
    <div className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105">
      {/* Gradient Background Overlay */}
      <div
        className={`absolute inset-0 ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
      ></div>

      {/* Glass Effect Border */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-white/30 transition-colors duration-500"></div>

      {/* Content */}
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
              {title}
            </p>
            <p className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              {isCurrency
                ? `₹${value.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                : value.toLocaleString()}
            </p>
          </div>

          {/* Animated Icon */}
          <div
            className={`${iconBg} p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-500`}
          >
            {React.createElement(icon, {
              className: "w-6 h-6 text-white",
              strokeWidth: 2.5,
            })}
          </div>
        </div>

        {/* Decorative Line */}
        <div
          className={`h-1 w-0 group-hover:w-full ${gradient} rounded-full transition-all duration-700`}
        ></div>
      </div>
    </div>
  );
};

// Alert Card Component
const AlertCard = ({ items }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl shadow-lg border-2 border-red-200/50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 backdrop-blur-lg rounded-lg">
            <FiAlertTriangle className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h4 className="text-lg font-bold text-white">Out of Stock Alert</h4>
            <p className="text-sm text-white/80">
              {items.length} {items.length === 1 ? "item needs" : "items need"}{" "}
              restocking
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {items.length > 0 ? (
          <div className="max-h-60 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-red-300 scrollbar-track-red-50">
            {items.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.category}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                  {item.type === "bulk_weight"
                    ? `Weight: ${item.weight}g`
                    : `Stock: ${item.stock}`}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-gray-600 font-medium">All items are in stock!</p>
            <p className="text-sm text-gray-500 mt-1">
              Inventory levels are healthy
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
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

  const stats = useMemo(() => {
    const now = new Date();
    const todayStr = now.toDateString();

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    let revenueToday = 0;
    let salesCountToday = 0;
    let salesCountWeek = 0;
    let salesCountMonth = 0;
    let totalRevenue = 0;

    sales.forEach((sale) => {
      const saleDate = new Date(sale.createdAt);
      const saleAmount = sale.totalAmount || 0;
      totalRevenue += saleAmount;

      if (saleDate.toDateString() === todayStr) {
        revenueToday += saleAmount;
        salesCountToday++;
      }

      if (saleDate >= startOfWeek) {
        salesCountWeek++;
      }

      if (saleDate >= startOfMonth) {
        salesCountMonth++;
      }
    });

    const totalSalesCount = sales.length;

    return {
      revenueToday,
      salesCountToday,
      salesCountWeek,
      salesCountMonth,
      totalRevenue,
      totalSalesCount,
    };
  }, [sales]);

  // *** UPDATED: Out of stock logic for both product types ***
  const outOfStockItems = useMemo(() => {
    return products.filter((product) => {
      if (product.type === "standard") {
        return product.stock <= 0;
      } else if (product.type === "bulk_weight") {
        return product.weight <= 0;
      }
      return false;
    });
  }, [products]);
  // *** END OF UPDATE ***

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-teal-50 p-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome back! Here's what's happening with your business today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Revenue Today"
          value={stats.revenueToday}
          isCurrency={true}
          icon={FiDollarSign}
          gradient="bg-gradient-to-br from-green-400 to-emerald-500"
          iconBg="bg-gradient-to-br from-green-500 to-emerald-600"
        />
        <StatCard
          title="Sales Today"
          value={stats.salesCountToday}
          icon={FiShoppingBag}
          gradient="bg-gradient-to-br from-blue-400 to-cyan-500"
          iconBg="bg-gradient-to-br from-blue-500 to-cyan-600"
        />
        <StatCard
          title="Sales This Week"
          value={stats.salesCountWeek}
          icon={FiTrendingUp}
          gradient="bg-gradient-to-br from-purple-400 to-pink-500"
          iconBg="bg-gradient-to-br from-purple-500 to-pink-600"
        />
        <StatCard
          title="Sales This Month"
          value={stats.salesCountMonth}
          icon={FiCalendar}
          gradient="bg-gradient-to-br from-orange-400 to-red-500"
          iconBg="bg-gradient-to-br from-orange-500 to-red-600"
        />
      </div>

      {/* Out of Stock Alert */}
      <AlertCard items={outOfStockItems} />
    </div>
  );
};

export default DashboardPage;
