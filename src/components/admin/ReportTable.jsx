import { formatDate } from "../../utils/helpers";
import Badge from "../common/Badge";
import { Link } from "react-router-dom";
import Button from "../common/Button";

const statusVariant = { pending: "warning", reviewed: "info", resolved: "success", dismissed: "default" };

export default function ReportTable({ reports, onStatusChange, onDelete }) {
  if (!reports || reports.length === 0) return (
    <p className="text-stone-400 text-sm py-8 text-center">No reports found.</p>
  );
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-stone-800/50">
          <tr className="text-stone-400">
            <th className="px-5 py-3 text-left font-medium">Reporter</th>
            <th className="px-5 py-3 text-left font-medium">Type</th>
            <th className="px-5 py-3 text-left font-medium">Reason</th>
            <th className="px-5 py-3 text-left font-medium">Status</th>
            <th className="px-5 py-3 text-left font-medium">Date</th>
            <th className="px-5 py-3 text-left font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-800">
          {reports.map((r) => {
            const reporterName = r.reporter?.firstName
              ? `${r.reporter.firstName} ${r.reporter.lastName || ""}`.trim()
              : r.reporter?.email || r.reporter?.name || "Unknown";
            return (
              <tr key={r._id} className="hover:bg-stone-800/30 transition-colors">
                <td className="px-5 py-3 text-stone-300">{reporterName}</td>
                <td className="px-5 py-3 text-stone-300 capitalize">{r.targetType || r.type}</td>
                <td className="px-5 py-3 text-stone-400 max-w-[180px] truncate">{r.reason}</td>
                <td className="px-5 py-3">
                  <Badge variant={statusVariant[r.status] || "default"}>{r.status}</Badge>
                </td>
                <td className="px-5 py-3 text-stone-400">{formatDate(r.createdAt)}</td>
                <td className="px-5 py-3">
                  <div className="flex gap-2">
                    <Link to={`/admin/reports/${r._id}`}>
                      <Button size="sm" variant="outline">View</Button>
                    </Link>
                    <Button size="sm" variant="danger" onClick={() => onDelete(r._id)}>Delete</Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
