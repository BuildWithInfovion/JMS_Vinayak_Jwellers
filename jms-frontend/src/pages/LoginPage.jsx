// frontend/src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import buildwithinfovionLogo from "../assets/buildwithinfovion-logo.svg";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const auth = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const success = await auth.login(username, password);

      if (success) {
        navigate("/");
      } else {
        setError("Invalid username or password.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError("Login failed. Please try again later.");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
      {/* Decorative Background Elements */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl"></div>

      {/* Login Card */}
      <div className="relative w-full max-w-md mx-4">
        {/* Glassmorphism Card */}
        <div className="relative bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 p-8 space-y-8">
          {/* Floating VJ Logo - WITH ACTUAL LOGO */}
          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
            <div className="w-28 h-28 bg-white backdrop-blur-lg rounded-2xl shadow-2xl border-4 border-amber-400/30 p-3 overflow-hidden">
              <img
                src="/VJ.png"
                alt="Vinayak Jewellers"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Header */}
          <div className="text-center pt-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent mb-2">
              Vinayak Jewellers
            </h1>
            <p className="text-sm text-gray-300 font-medium tracking-wide">
              विनायक ज्वेलर्स, गंगाखेड
            </p>
            <p className="text-xs text-gray-400 mt-2">Owner Portal Login</p>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Username Input */}
            <div className="relative group">
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <FaUser className="w-5 h-5 text-gray-400 group-focus-within:text-amber-400 transition-colors duration-300" />
              </div>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="block w-full pl-12 pr-4 py-4 bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 transition-all duration-300 backdrop-blur-lg"
              />
            </div>

            {/* Password Input */}
            <div className="relative group">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <FaLock className="w-5 h-5 text-gray-400 group-focus-within:text-amber-400 transition-colors duration-300" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="block w-full pl-12 pr-12 py-4 bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 transition-all duration-300 backdrop-blur-lg"
              />
              {/* Show/Hide Toggle */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-amber-400 transition-colors duration-300"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <FaEyeSlash className="w-5 h-5" />
                ) : (
                  <FaEye className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 backdrop-blur-lg">
                <p className="text-sm text-red-400 text-center font-medium">
                  {error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="relative w-full group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 rounded-xl"></div>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center py-4 px-4 rounded-xl">
                <span className="text-base font-bold text-gray-900">
                  {isLoading ? (
                    <span className="flex items-center space-x-2">
                      <svg
                        className="animate-spin h-5 w-5 text-gray-900"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Logging in...</span>
                    </span>
                  ) : (
                    "Log In"
                  )}
                </span>
              </div>
            </button>
          </form>

          {/* Footer - BuildwithInfovion Branding WITH LOGO */}
          <div className="pt-6 border-t border-white/10">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">Powered by</p>
              <div className="flex items-center justify-center space-x-2.5">
                {/* Company Logo - Your SVG Logo */}
                <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-md p-1 border border-gray-200/20">
                  <img
                    src={buildwithinfovionLogo}
                    alt="BuildwithInfovion"
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-sm font-bold bg-gradient-to-r from-teal-200 to-blue-200 bg-clip-text text-transparent">
                  BuildwithInfovion
                </p>
              </div>
              <p className="text-xs text-gray-600 mt-1.5">
                Jewelry Management System v1.0
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
