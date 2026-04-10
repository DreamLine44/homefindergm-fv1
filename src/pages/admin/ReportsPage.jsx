import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllReports, deleteReport, updateReportStatus } from "../../api/reportApi";
import { formatDate, resolvePersonName } from "../../utils/helpers";
import Badge from "../../components/common/Badge";

const STATUS_TABS = ["", "pending", "reviewed", "resolved", "dismissed"];
const statusVariant = { pending: "warning", reviewed: "info", resolved: "success", dismissed: "default" };

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("");
  const [msg,     setMsg]     = useState({ type: "", text: "" });

  const flash = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg({ type: "", text: "" }), 3000); };

  useEffect(() => {
    getAllReports()
      .then((r) => setReports(r.data?.reports || r.data?.data || r.data || []))
      .catch(() => setReports([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this report permanently?")) return;
    try {
      await deleteReport(id);
      setReports((p) => p.filter((r) => r._id !== id));
      flash("success", "Report deleted.");
    } catch { flash("error", "Failed to delete."); }
  };

  const handleStatus = async (id, status) => {
    try {
      await updateReportStatus(id, { status });
      setReports((p) => p.map((r) => r._id === id ? { ...r, status } : r));
    } catch { flash("error", "Failed to update status."); }
  };

  const filtered = filter ? reports.filter((r) => r.status === filter) : reports;

  return (
    <div className="space-y-4 animate-fade-up">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-800">Reports</h1>
        <p className="text-slate-500 text-sm">Review and moderate user-submitted reports</p>
      </div>

      {msg.text && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium ${msg.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {msg.text}
        </div>
      )}

      {/* Status tabs — scrollable on mobile */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {STATUS_TABS.map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`flex-shrink-0 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === s ? "bg-brand-600 text-white shadow-sm" : "bg-white text-slate-600 border border-slate-200 hover:border-brand-300 hover:text-brand-600"
            }`}>
            {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            <span className="ml-1 text-xs opacity-70">
              ({s === "" ? reports.length : reports.filter(r => r.status === s).length})
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl p-8 text-center text-slate-400 shadow-sm">Loading reports…</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400 shadow-sm">
          No {filter || ""} reports. ✓
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Mobile card list */}
          <div className="md:hidden divide-y divide-slate-100">
            {filtered.map((r) => {
              const name = resolvePersonName(r.reporter) || resolvePersonName(r.reportedBy) || "Anonymous"; // was:
                ? `${r.reporter.firstName} ${r.reporter.lastName || ""}`.trim()
                : resolvePersonName(r.reportedBy) || "Anonymous";
              return (
                <div key={r._id} className="px-4 py-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-700 capitalize">{r.targetType || r.type}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{r.reason}</p>
                    </div>
                    <Badge variant={statusVariant[r.status] || "default"} className="flex-shrink-0">{r.status}</Badge>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-400">{name} · {formatDate(r.createdAt)}</span>
                  </div>
                  {/* Status changer + actions in one row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <select value={r.status} onChange={(e) => handleStatus(r._id, e.target.value)}
                      className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white outline-none focus:border-brand-400 flex-shrink-0">
                      {["pending","reviewed","resolved","dismissed"].map(s => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                    <Link to={`/admin/reports/${r._id}`}
                      className="px-3 py-1.5 text-xs text-brand-600 border border-brand-200 rounded-lg hover:bg-brand-50 transition-colors">
                      View
                    </Link>
                    <button onClick={() => handleDelete(r._id)}
                      className="px-3 py-1.5 text-xs text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide border-b border-slate-100">
                <tr>
                  {["Reporter","Type","Reason","Status","Date","Actions"].map(h => (
                    <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((r) => {
                  const name = resolvePersonName(r.reporter) || resolvePersonName(r.reportedBy) || "Anonymous"; // was:
                    ? `${r.reporter.firstName} ${r.reporter.lastName || ""}`.trim()
                    : resolvePersonName(r.reportedBy) || "Anonymous";
                  return (
                    <tr key={r._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 text-slate-700">{name}</td>
                      <td className="px-5 py-3 text-slate-500 capitalize">{r.targetType || r.type}</td>
                      <td className="px-5 py-3 text-slate-400 max-w-[200px] truncate">{r.reason}</td>
                      <td className="px-5 py-3">
                        <select value={r.status} onChange={(e) => handleStatus(r._id, e.target.value)}
                          className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white outline-none focus:border-brand-400">
                          {["pending","reviewed","resolved","dismissed"].map(s => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-3 text-slate-400 whitespace-nowrap">{formatDate(r.createdAt)}</td>
                      <td className="px-5 py-3">
                        <div className="flex gap-2">
                          <Link to={`/admin/reports/${r._id}`}
                            className="px-3 py-1.5 text-xs text-brand-600 border border-brand-200 rounded-lg hover:bg-brand-50 transition-colors">
                            View
                          </Link>
                          <button onClick={() => handleDelete(r._id)}
                            className="px-3 py-1.5 text-xs text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-400">
            Showing {filtered.length} of {reports.length} reports
          </div>
        </div>
      )}
    </div>
  );
}
