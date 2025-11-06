// frontend/src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
// NEW: Added FaEnvelope (for username) and FaKey (for token)
import {
  FaUser,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaKey,
} from "react-icons/fa";
import buildwithinfovionLogo from "../assets/buildwithinfovion-logo.svg";

// NEW: Import toast for notifications and new API functions
import { toast } from "react-toastify";
import { forgotPassword, resetPassword } from "../services/api";

// --- Reusable Gradient Button Component ---
const GradientButton = ({
  onClick,
  type = "submit",
  loading,
  loadingText,
  children,
  colorGradient,
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={loading}
    className="relative w-full group overflow-hidden rounded-xl"
  >
    <div className={`absolute inset-0 ${colorGradient} rounded-xl`}></div>
    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
    <div className="relative flex items-center justify-center py-4 px-4">
      <span className="text-base font-bold text-gray-900">
        {loading ? (
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
            <span>{loadingText}</span>
          </span>
        ) : (
          children
        )}
      </span>
    </div>
  </button>
);

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // --- NEW STATE for Forgot Password Flow ---
  const [view, setView] = useState("login"); // 'login', 'forgot', 'reset'
  const [resetUsername, setResetUsername] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // ------------------------------------------

  const auth = useAuth();
  const navigate = useNavigate();

  // --- Corrected handleLogin using auth.login() and handling boolean result ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Use AuthContext's login method which returns true on success
      const success = await auth.login(username, password);

      if (success) {
        toast.success("Login successful. Redirecting...");
        navigate("/"); // or "/dashboard" if you prefer
      } else {
        // auth.login already logged out and returned false on failure
        toast.error("Invalid username or password.");
      }
    } catch (err) {
      console.error("Unexpected login error:", err);
      toast.error("Login failed. Check server status.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- NEW HANDLER for Forgot Password ---
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await forgotPassword(resetUsername);
      toast.info(
        "If this username exists, a token has been generated. Check server logs (Dev Only)."
      );

      // Auto-fill token in dev mode for easier testing
      if (data?.dev_token) {
        setResetToken(data.dev_token);
      }

      setView("reset"); // Move to the token entry view
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to initiate reset.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- NEW HANDLER for Reset Password ---
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match.");
      setIsLoading(false);
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      setIsLoading(false);
      return;
    }

    try {
      await resetPassword(resetToken, newPassword);
      toast.success("Password successfully reset! Please log in now.");
      // Reset state and go back to login
      setView("login");
      setResetToken("");
      setNewPassword("");
      setConfirmPassword("");
      setUsername(resetUsername); // Pre-fill username for convenience
      setResetUsername("");
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Password reset failed. Token may be invalid or expired."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // --- RENDER FUNCTION for Login Form ---
  const renderLoginForm = () => (
    <form className="space-y-6" onSubmit={handleLogin}>
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

      {/* Submit Button */}
      <GradientButton
        type="submit"
        loading={isLoading}
        loadingText="Logging in..."
        colorGradient="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500"
      >
        Log In
      </GradientButton>

      {/* Forgot Password Link */}
      <button
        type="button"
        onClick={() => setView("forgot")}
        className="w-full text-sm text-gray-400 hover:text-amber-400 transition duration-150 pt-2"
      >
        Forgot Password?
      </button>
    </form>
  );

  // --- RENDER FUNCTION for Forgot Password Form ---
  const renderForgotPasswordForm = () => (
    <form className="space-y-6" onSubmit={handleForgotPassword}>
      <p className="text-sm text-gray-300 text-center">
        Enter your username to request a password reset token.
      </p>
      {/* Username Input */}
      <div className="relative group">
        <label htmlFor="reset-username" className="sr-only">
          Username
        </label>
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <FaEnvelope className="w-5 h-5 text-gray-400 group-focus-within:text-blue-400 transition-colors duration-300" />
        </div>
        <input
          id="reset-username"
          name="reset-username"
          type="text"
          required
          value={resetUsername}
          onChange={(e) => setResetUsername(e.target.value)}
          placeholder="Enter your username"
          className="block w-full pl-12 pr-4 py-4 bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 backdrop-blur-lg"
        />
      </div>

      {/* Submit Button */}
      <GradientButton
        type="submit"
        loading={isLoading}
        loadingText="Requesting..."
        colorGradient="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600"
      >
        Request Reset
      </GradientButton>

      {/* Back to Login Link */}
      <button
        type="button"
        onClick={() => setView("login")}
        className="w-full text-sm text-gray-400 hover:text-amber-400 transition duration-150 pt-2"
      >
        &larr; Back to Login
      </button>
    </form>
  );

  // --- RENDER FUNCTION for Reset Password Form ---
  const renderResetPasswordForm = () => (
    <form className="space-y-6" onSubmit={handleResetPassword}>
      <p className="text-sm text-gray-300 text-center">
        Check the server log for your token, then set a new password.
      </p>
      {/* Token Input */}
      <div className="relative group">
        <label htmlFor="token" className="sr-only">
          Reset Token
        </label>
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <FaKey className="w-5 h-5 text-gray-400 group-focus-within:text-green-400 transition-colors duration-300" />
        </div>
        <input
          id="token"
          name="token"
          type="text"
          required
          value={resetToken}
          onChange={(e) => setResetToken(e.target.value)}
          placeholder="Paste Token from server log"
          className="block w-full pl-12 pr-4 py-4 bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-300 backdrop-blur-lg"
        />
      </div>

      {/* New Password Input */}
      <div className="relative group">
        <label htmlFor="new-password" className="sr-only">
          New Password
        </label>
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <FaLock className="w-5 h-5 text-gray-400 group-focus-within:text-green-400 transition-colors duration-300" />
        </div>
        <input
          id="new-password"
          name="new-password"
          type="password"
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Enter new password (min 6 chars)"
          className="block w-full pl-12 pr-4 py-4 bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-300 backdrop-blur-lg"
        />
      </div>

      {/* Confirm Password Input */}
      <div className="relative group">
        <label htmlFor="confirm-password" className="sr-only">
          Confirm New Password
        </label>
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <FaLock className="w-5 h-5 text-gray-400 group-focus-within:text-green-400 transition-colors duration-300" />
        </div>
        <input
          id="confirm-password"
          name="confirm-password"
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm new password"
          className="block w-full pl-12 pr-4 py-4 bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-300 backdrop-blur-lg"
        />
      </div>

      {/* Submit Button */}
      <GradientButton
        type="submit"
        loading={isLoading}
        loadingText="Resetting..."
        colorGradient="bg-gradient-to-r from-green-500 via-teal-500 to-emerald-600"
      >
        Set New Password
      </GradientButton>

      {/* Back to Login Link */}
      <button
        type="button"
        onClick={() => setView("login")}
        className="w-full text-sm text-gray-400 hover:text-amber-400 transition duration-150 pt-2"
      >
        &larr; Cancel Reset
      </button>
    </form>
  );

  // --- Main Render Logic ---
  const renderView = () => {
    switch (view) {
      case "forgot":
        return renderForgotPasswordForm();
      case "reset":
        return renderResetPasswordForm();
      case "login":
      default:
        return renderLoginForm();
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
            {/* DYNAMIC SUBTITLE */}
            <p className="text-xs text-gray-400 mt-2">
              {view === "login" && "Owner Portal Login"}
              {view === "forgot" && "Request Password Reset"}
              {view === "reset" && "Set New Password"}
            </p>
          </div>

          {/* Form Area - NOW DYNAMIC */}
          {renderView()}

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
