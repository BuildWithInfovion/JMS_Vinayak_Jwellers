// "Export for your CA": Tally XML (masters + vouchers) and Excel registers for any period.
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FiDownload, FiBookOpen, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { downloadExport, getExportSummary } from "../../services/api";

const ist = () => new Date(Date.now() + 330 * 60000);
const iso = (d) => d.toISOString().slice(0, 10);

// Preset periods in Indian time; the financial year runs April to March
function preset(kind) {
  const now = ist();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  if (kind === "this-month") return [iso(new Date(Date.UTC(y, m, 1))), iso(now)];
  if (kind === "last-month") return [iso(new Date(Date.UTC(y, m - 1, 1))), iso(new Date(Date.UTC(y, m, 0)))];
  const fyStart = m >= 3 ? y : y - 1;
  if (kind === "this-fy") return [iso(new Date(Date.UTC(fyStart, 3, 1))), iso(now)];
  return [iso(new Date(Date.UTC(fyStart - 1, 3, 1))), iso(new Date(Date.UTC(fyStart, 2, 31)))];
}

const rs = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function CaExportPanel() {
  const [[from, to], setRange] = useState(preset("this-month"));
  const [summary, setSummary] = useState(null);
  const [busy, setBusy] = useState("");
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    let alive = true;
    getExportSummary(from, to)
      .then((r) => alive && setSummary(r.data))
      .catch(() => alive && setSummary(null));
    return () => { alive = false; };
  }, [from, to]);

  const get = async (key, path, params) => {
    setBusy(key);
    try {
      await downloadExport(path, { from, to, ...params });
      toast.success("Downloaded. Send it to your CA.");
    } catch (e) {
      toast.error(e.message || "Export failed.");
    } finally {
      setBusy("");
    }
  };

  const btn = "flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50";

  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-indigo-100 p-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl"><FiBookOpen className="w-6 h-6 text-white" /></div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Export for your CA (Tally)</h2>
            <p className="text-sm text-gray-500">Sales with GST, udhaar receipts and girvi — ready to import into TallyPrime</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {[["this-month", "This month"], ["last-month", "Last month"], ["this-fy", "This FY"], ["last-fy", "Last FY"]].map(([k, l]) => (
            <button key={k} type="button" onClick={() => setRange(preset(k))} className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-indigo-50">{l}</button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
        <label className="text-sm text-gray-600">From
          <input type="date" value={from} max={to} onChange={(e) => setRange([e.target.value, to])} className="mt-1 block w-full border-2 border-gray-200 rounded-xl px-3 py-2" />
        </label>
        <label className="text-sm text-gray-600">To
          <input type="date" value={to} min={from} onChange={(e) => setRange([from, e.target.value])} className="mt-1 block w-full border-2 border-gray-200 rounded-xl px-3 py-2" />
        </label>
        {summary && (
          <div className="col-span-2 text-sm text-gray-700 bg-gray-50 rounded-xl px-4 py-2.5">
            <span className="font-semibold">{summary.invoices}</span> invoices · taxable {rs(summary.taxable)} · GST {rs(summary.cgst + summary.sgst)}
            <span className="block text-xs text-gray-500">Udhaar received {rs(summary.udhaarReceived)} · girvi lent {rs(summary.girviLent)} · interest {rs(summary.girviInterest)}</span>
          </div>
        )}
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-4 gap-3">
        <button type="button" disabled={!!busy} onClick={() => get("m", "tally", { part: "masters" })} className={`${btn} bg-indigo-50 text-indigo-700 hover:bg-indigo-100`}>
          <FiDownload /><span>{busy === "m" ? "Preparing…" : "1. Tally ledgers (XML)"}</span>
        </button>
        <button type="button" disabled={!!busy} onClick={() => get("v", "tally", { part: "vouchers" })} className={`${btn} bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg`}>
          <FiDownload /><span>{busy === "v" ? "Preparing…" : "2. Tally vouchers (XML)"}</span>
        </button>
        <button type="button" disabled={!!busy} onClick={() => get("s", "register", { type: "sales" })} className={`${btn} bg-emerald-50 text-emerald-700 hover:bg-emerald-100`}>
          <FiDownload /><span>{busy === "s" ? "Preparing…" : "Sales register (Excel)"}</span>
        </button>
        <button type="button" disabled={!!busy} onClick={() => get("g", "register", { type: "girvi" })} className={`${btn} bg-amber-50 text-amber-700 hover:bg-amber-100`}>
          <FiDownload /><span>{busy === "g" ? "Preparing…" : "Girvi register (Excel)"}</span>
        </button>
      </div>

      <button type="button" onClick={() => setShowHelp(!showHelp)} className="mt-4 flex items-center space-x-1 text-sm text-indigo-600 font-medium">
        {showHelp ? <FiChevronUp /> : <FiChevronDown />}<span>How your CA imports this into Tally</span>
      </button>
      {showHelp && (
        <ol className="mt-3 text-sm text-gray-700 space-y-1.5 list-decimal pl-5 bg-indigo-50/50 rounded-xl p-4">
          <li>Open the shop's company in TallyPrime (check the ledger names in JMS Settings → Tally ledgers match the CA's books).</li>
          <li>Gateway of Tally → <b>Import → Masters</b> → choose file 1 (ledgers). Choose "Ignore duplicates" for ledgers that already exist.</li>
          <li>Gateway of Tally → <b>Import → Transactions</b> → choose file 2 (vouchers).</li>
          <li>Each sale becomes a Sales voucher with CGST/SGST; cash sales go to the Cash ledger, credit sales to the customer's ledger under Sundry Debtors.</li>
          <li>Advances, udhaar payments and girvi releases come in as Receipts; girvi loans as Payments; girvi interest to the interest income ledger.</li>
          <li>The Excel registers are for checking totals and for GST return work.</li>
        </ol>
      )}
    </div>
  );
}
