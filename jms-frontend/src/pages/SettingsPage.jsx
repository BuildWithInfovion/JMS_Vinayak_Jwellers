import React, { useState, useEffect, useCallback } from "react";
import { changePassword, getSettings, updateSettings } from "../services/api";
import { useAuth } from "../context/useAuth";
import { toast } from "react-toastify";
import { FiLock, FiShield, FiKey, FiToggleLeft, FiToggleRight, FiSave } from "react-icons/fi";

const SettingsPage = () => {
  const { user } = useAuth();
  const isOwner = user?.role === "owner";

  // --- Password change state ---
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwLoading, setPwLoading] = useState(false);

  // --- GST settings state ---
  const [gstEnabled, setGstEnabled] = useState(false);
  const [gstNumber, setGstNumber] = useState("");
  const [gstLoading, setGstLoading] = useState(false);
  const [gstFetching, setGstFetching] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await getSettings();
      setGstEnabled(res.data.gst_enabled === true || res.data.gst_enabled === "true");
      setGstNumber(res.data.gst_number || "");
    } catch {
      // non-critical; defaults remain
    } finally {
      setGstFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwLoading(true);
    const { oldPassword, newPassword, confirmPassword } = passwords;

    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required.");
      setPwLoading(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New Password and Confirm Password do not match.");
      setPwLoading(false);
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New Password must be at least 6 characters long.");
      setPwLoading(false);
      return;
    }

    try {
      await changePassword(oldPassword, newPassword);
      toast.success("Password updated successfully! Please log in again with your new password.");
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password. Server error.");
    } finally {
      setPwLoading(false);
    }
  };

  const handleGstSave = async () => {
    setGstLoading(true);
    try {
      await updateSettings({ gst_enabled: gstEnabled, gst_number: gstNumber.trim() });
      toast.success("GST settings saved successfully.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save GST settings.");
    } finally {
      setGstLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-gradient-to-br from-slate-600 to-gray-700 p-3 rounded-xl shadow-lg">
            <FiShield className="w-7 h-7 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-700 to-gray-800 bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="text-gray-600">Manage your account and billing settings</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-8">
        {/* GST Settings — owner only */}
        {isOwner && (
          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-3 rounded-xl">
                <FiSave className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">GST Settings</h2>
                <p className="text-sm text-gray-500">
                  Control GST billing for the entire shop
                </p>
              </div>
            </div>

            {gstFetching ? (
              <p className="text-gray-500 text-sm">Loading settings...</p>
            ) : (
              <div className="space-y-6">
                {/* GST Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                  <div>
                    <p className="font-semibold text-gray-800">Enable GST Billing</p>
                    <p className="text-sm text-gray-500">
                      When enabled, GST will be applied to all new invoices by default
                    </p>
                  </div>
                  <button
                    onClick={() => setGstEnabled((prev) => !prev)}
                    className="flex-shrink-0 ml-4"
                    title={gstEnabled ? "Disable GST" : "Enable GST"}
                  >
                    {gstEnabled ? (
                      <FiToggleRight className="w-10 h-10 text-green-500" strokeWidth={2} />
                    ) : (
                      <FiToggleLeft className="w-10 h-10 text-gray-400" strokeWidth={2} />
                    )}
                  </button>
                </div>

                {/* GSTIN field — shown when GST enabled */}
                {gstEnabled && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      GSTIN (GST Number)
                    </label>
                    <input
                      type="text"
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                      maxLength={15}
                      className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all duration-300 font-mono tracking-wider"
                      placeholder="e.g. 27AAAPL1234C1Z5"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      15-character GST Identification Number — printed on every invoice
                    </p>
                  </div>
                )}

                {/* GST Rate info */}
                {gstEnabled && (
                  <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-xl text-sm text-amber-800 space-y-1">
                    <p className="font-bold">Applicable GST rates for jewellery:</p>
                    <p>• Metal value: 3% &nbsp;(1.5% CGST + 1.5% SGST)</p>
                    <p>• Making charges: 5% (2.5% CGST + 2.5% SGST)</p>
                  </div>
                )}

                <button
                  onClick={handleGstSave}
                  disabled={gstLoading}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:from-amber-600 hover:to-orange-700 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {gstLoading ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <FiSave className="w-5 h-5" />
                      <span>Save GST Settings</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Password Change Form */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-gradient-to-br from-slate-500 to-gray-600 p-3 rounded-xl">
              <FiKey className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Change Password</h2>
              <p className="text-sm text-gray-500">Update your password to keep your account secure</p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div>
              <label htmlFor="oldPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                Current Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <FiLock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  name="oldPassword"
                  id="oldPassword"
                  required
                  value={passwords.oldPassword}
                  onChange={handlePasswordChange}
                  className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-all duration-300"
                  placeholder="Enter your current password"
                />
              </div>
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                New Password (Minimum 6 characters)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <FiKey className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  name="newPassword"
                  id="newPassword"
                  required
                  minLength="6"
                  value={passwords.newPassword}
                  onChange={handlePasswordChange}
                  className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-all duration-300"
                  placeholder="Create a strong password"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <FiShield className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  required
                  value={passwords.confirmPassword}
                  onChange={handlePasswordChange}
                  className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-all duration-300"
                  placeholder="Re-enter your new password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={pwLoading}
              className="w-full bg-gradient-to-r from-slate-600 to-gray-700 text-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:from-slate-700 hover:to-gray-800 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {pwLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <FiShield className="w-5 h-5" />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
            <h3 className="text-sm font-bold text-blue-900 mb-2 flex items-center">
              <FiShield className="w-4 h-4 mr-2" />
              Security Tips
            </h3>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Use at least 8 characters with a mix of letters, numbers, and symbols</li>
              <li>• Avoid using personal information or common words</li>
              <li>• Change your password regularly for better security</li>
              <li>• Never share your password with anyone</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
