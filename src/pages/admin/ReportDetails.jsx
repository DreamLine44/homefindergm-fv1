import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getAllReports, updateReportStatus, deleteReport } from "../../api/reportApi";
import { formatDate } from "../../utils/helpers";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";

const STATUSES = ["pending", "reviewed", "resolved", "dismissed"];
const statusVariant = { pending: "warning", reviewed: "info", resolved: "success", dismissed: "default" };

export default function ReportDetails() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const [report,   setReport]  = useState(null);
  const [loading,  setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error,    setError]   = useState("");

  useEffect(() => {
    getAllReports()
      .then((r) => {
        const list  = r.data?.data || r.data?.reports || r.data || [];
        const found = Array.isArray(list) ? list.find((rep) => rep._id === id) : null;
        if (found) setReport(found);
        else navigate("/admin/reports");
      })
      .catch(() => navigate("/admin/reports"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatus = async (status) => {
    setUpdating(true); setError("");
    try {
      await updateReportStatus(id, { status });
      setReport((r) => ({ ...r, status }));
    } catch (e) { setError(e.response?.data?.message || "Failed to update."); }
    finally { setUpdating(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this report permanently?")) return;
    try { await deleteReport(id); navigate("/admin/reports"); }
    catch (e) { setError(e.response?.data?.message || "Failed to delete."); }
  };

  if (loading) return <Loader />;
  if (!report) return null;

  const reporterName = report.reporter?.firstName
    ? `${report.reporter.firstName} ${report.reporter.lastName || ""}`.trim()
    : report.reporter?.email || "Unknown";

  return (
    <div className="max-w-2xl space-y-5 animate-fade-up">
      <Link to="/admin/reports" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
        ← Back to Reports
      </Link>

      <div className="flex items-center gap-3">
        <h1 className="font-display text-2xl font-bold text-slate-800">Report Details</h1>
        <Badge variant={statusVariant[report.status] || "default"}>{report.status}</Badge>
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>
      )}

      {/* Info card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-50">
        {[
          { label: "Reporter",    value: reporterName },
          { label: "Target Type", value: report.targetType, capitalize: true },
          { label: "Reason",      value: report.reason },
          { label: "Submitted",   value: formatDate(report.createdAt) },
          ...(report.details ? [{ label: "Details", value: report.details }] : []),
          { label: "Target ID",   value: typeof report.targetId === "object" ? report.targetId?._id : report.targetId, mono: true },
        ].map(({ label, value, capitalize, mono }) => (
          <div key={label} className="px-6 py-4">
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">{label}</p>
            <p className={`text-slate-700 ${capitalize ? "capitalize" : ""} ${mono ? "font-mono text-xs text-slate-400 break-all" : ""}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Status update */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <p className="text-sm font-semibold text-slate-700 mb-3">Update Status</p>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button key={s} onClick={() => handleStatus(s)} disabled={report.status === s || updating}
              className={`px-4 py-2 rounded-xl text-sm capitalize font-medium transition-all ${
                report.status === s
                  ? "bg-brand-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-brand-50 hover:text-brand-700 disabled:opacity-40"
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        {report.targetType === "post" && report.targetId && (
          <Link to={`/properties/${typeof report.targetId === "object" ? report.targetId._id : report.targetId}`}>
            <Button variant="outline">View Reported Post ↗</Button>
          </Link>
        )}
        <Button variant="danger" onClick={handleDelete}>Delete Report</Button>
      </div>
    </div>
  );
}
