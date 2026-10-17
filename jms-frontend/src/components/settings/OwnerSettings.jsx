// Owner-only settings: Tally ledger names for the CA export, and resetting staff passwords.
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FiBookOpen, FiUsers, FiSave } from "react-icons/fi";
import { getSettings, updateSettings, getUsers, resetUserPassword } from "../../services/api";

const LEDGERS = [
  ["tally_company", "Company name in Tally", "Exactly as it appears in TallyPrime (optional)"],
  ["tally_sales_ledger", "Sales ledger", "Under Sales Accounts"],
  ["tally_cgst_ledger", "CGST output ledger", "Under Duties & Taxes"],
  ["tally_sgst_ledger", "SGST output ledger", "Under Duties & Taxes"],
  ["tally_cash_ledger", "Cash ledger", "Usually “Cash”"],
  ["tally_bank_ledger", "Bank / UPI ledger", "Where UPI and card payments go"],
  ["tally_roundoff_ledger", "Round-off ledger", "Paise differences"],
  ["tally_discount_ledger", "Discount ledger", "Only for invoices made before v2"],
  ["tally_girvi_ledger", "Girvi loans ledger", "Under Loans & Advances (Asset)"],
  ["tally_interest_ledger", "Girvi interest ledger", "Under Indirect Incomes"],
];

const card = "bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-8";
const input = "block w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500";

export function TallySettings() {
  const [values, setValues] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettings().then((r) => setValues(Object.fromEntries(LEDGERS.map(([k]) => [k, r.data[k] ?? ""])))).catch(() => setValues({}));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings(values);
      toast.success("Tally ledger names saved.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={card}>
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl"><FiBookOpen className="w-6 h-6 text-white" /></div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Tally ledgers</h2>
          <p className="text-sm text-gray-500">Ask your CA for the ledger names used in your Tally company</p>
        </div>
      </div>
      {!values ? <p className="text-sm text-gray-500">Loading…</p> : (
        <form onSubmit={save} className="space-y-4">
          {LEDGERS.map(([k, label, hint]) => (
            <label key={k} className="block">
              <span className="text-sm font-semibold text-gray-700">{label}</span>
              <input className={`${input} mt-1`} value={values[k] || ""} onChange={(e) => setValues({ ...values, [k]: e.target.value })} />
              <span className="text-xs text-gray-400">{hint}</span>
            </label>
          ))}
          <button type="submit" disabled={saving} className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50">
            <FiSave /><span>{saving ? "Saving…" : "Save ledger names"}</span>
          </button>
        </form>
      )}
    </div>
  );
}

export function StaffPasswords() {
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { getUsers().then((r) => setUsers(r.data)).catch(() => {}); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (pw.length < 6) { toast.error("Use at least 6 characters."); return; }
    setBusy(true);
    try {
      const r = await resetUserPassword(username, pw);
      toast.success(r.data.message);
      setPw("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not reset the password.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={card}>
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-gradient-to-br from-rose-500 to-pink-600 p-3 rounded-xl"><FiUsers className="w-6 h-6 text-white" /></div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Staff passwords</h2>
          <p className="text-sm text-gray-500">Set a new password when a staff member forgets theirs</p>
        </div>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <label className="block">
          <span className="text-sm font-semibold text-gray-700">User</span>
          <select required className={`${input} mt-1`} value={username} onChange={(e) => setUsername(e.target.value)}>
            <option value="">Choose a user</option>
            {users.map((u) => <option key={u._id} value={u.username}>{u.username} ({u.role})</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-gray-700">New password</span>
          <input type="password" autoComplete="new-password" className={`${input} mt-1`} value={pw} onChange={(e) => setPw(e.target.value)} />
        </label>
        <button type="submit" disabled={busy || !username} className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50">
          {busy ? "Saving…" : "Set new password"}
        </button>
      </form>
    </div>
  );
}
