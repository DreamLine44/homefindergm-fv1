import { formatDate } from "../../utils/helpers";
import { resolvePersonName } from "../../utils/helpers";
import Badge from "../common/Badge";
import { Link } from "react-router-dom";
import Button from "../common/Button";

const statusVariant = { pending: "warning", reviewed: "info", resolved: "success", dismissed: "default" };

export default function ReportTable({ reports, onStatusChange, onDelete }) {
  if (!reports || reports.length === 0) return (
    <p className="text-slate-400 text-sm py-8 text-center">No reports found.</p>
  );

  return (
    <div>
      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-slate-100">
        {reports.map((r) => {
          const name = resolvePersonName(r.reporter) || resolvePersonName(r.reportedBy) || "Anonymous";
          return (
            <div key={r._id} className="px-4 py-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-700 capitalize">{r.targetType || r.type} — {r.reason}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{name} · {formatDate(r.createdAt)}</p>
                </div>
                <Badge variant={statusVariant[r.status] || "default"}>{r.status}</Badge>
              </div>
              <div className="flex gap-2">
                <Link to={`/admin/reports/${r._id}`}>
                  <Button size="sm" variant="outline">View</Button>
                </Link>
                <Button size="sm" variant="danger" onClick={() => onDelete(r._id)}>Delete</Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/50">
            <tr className="text-slate-400">
              {["Reporter","Type","Reason","Status","Date","Actions"].map(h => (
                <th key={h} className="px-5 py-3 text-left font-medium text-xs uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {reports.map((r) => {
              const name = resolvePersonName(r.reporter) || resolvePersonName(r.reportedBy) || "Anonymous";
              return (
                <tr key={r._id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-3 text-slate-300 font-medium">{name}</td>
                  <td className="px-5 py-3 text-slate-300 capitalize">{r.targetType || r.type}</td>
                  <td className="px-5 py-3 text-slate-400 max-w-[180px] truncate">{r.reason}</td>
                  <td className="px-5 py-3"><Badge variant={statusVariant[r.status] || "default"}>{r.status}</Badge></td>
                  <td className="px-5 py-3 text-slate-400 whitespace-nowrap">{formatDate(r.createdAt)}</td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <Link to={`/admin/reports/${r._id}`}><Button size="sm" variant="outline">View</Button></Link>
                      <Button size="sm" variant="danger" onClick={() => onDelete(r._id)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
