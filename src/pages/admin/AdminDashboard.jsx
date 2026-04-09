import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllReports } from "../../api/reportApi";
import { getPosts } from "../../api/postApi";
import { getAllUsers } from "../../api/adminApi";
import { formatDate } from "../../utils/helpers";
import Badge from "../../components/common/Badge";

const statusVariant = { pending: "warning", reviewed: "info", resolved: "success", dismissed: "default" };

function StatCard({ label, value, icon, bg, to, loading }) {
  const inner = (
    <div className={`rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 text-white ${bg}`}>
      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl bg-white/20 flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-2xl sm:text-3xl font-bold font-display leading-tight">
          {loading ? "—" : value}
        </div>
        <div className="text-xs sm:text-sm text-white/80 font-medium">{label}</div>
      </div>
    </div>
  );
  return to ? <Link to={to} className="block">{inner}</Link> : inner;
}

export default function AdminDashboard() {
  const [data, setData] = useState({ reports: [], posts: 0, users: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([getAllReports(), getPosts({ limit: 1 }), getAllUsers()])
      .then(([r, p, u]) => {
        const reports = r.status === "fulfilled"
          ? (r.value.data?.reports || r.value.data?.data || r.value.data || [])
          : [];
        const posts = p.status === "fulfilled"
          ? (p.value.data?.total ?? p.value.data?.count ?? (Array.isArray(p.value.data?.posts) ? p.value.data.posts.length : (Array.isArray(p.value.data) ? p.value.data.length : 0)))
          : 0;
        const users = u.status === "fulfilled"
          ? (Array.isArray(u.value.data?.users) ? u.value.data.users.length : (Array.isArray(u.value.data) ? u.value.data.length : 0))
          : 0;
        setData({ reports, posts, users });
      })
      .finally(() => setLoading(false));
  }, []);

  const { reports, posts, users } = data;
  const pending  = reports.filter(r => r.status === "pending").length;
  const resolved = reports.filter(r => r.status === "resolved").length;

  const quickActions = [
    { to: "/admin/posts",    icon: "🏠", label: "Manage Posts",    bg: "bg-blue-500 hover:bg-blue-600" },
    { to: "/admin/users",    icon: "👥", label: "Manage Users",    bg: "bg-orange-500 hover:bg-orange-600" },
    { to: "/admin/comments", icon: "💬", label: "Manage Comments", bg: "bg-slate-600 hover:bg-slate-700" },
    { to: "/admin/reports",  icon: "🚨", label: "Manage Reports",  bg: "bg-red-500 hover:bg-red-600" },
  ];

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-800 mb-1">Admin Dashboard</h1>
        <p className="text-slate-500 text-sm">Platform overview and moderation control</p>
      </div>

      {/* Stats — 2-col on mobile, 4-col on lg */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Posts"      value={posts}    icon="🏠" bg="bg-gradient-to-br from-blue-500 to-blue-600"    to="/admin/posts"   loading={loading} />
        <StatCard label="Registered Users" value={users}    icon="👥" bg="bg-gradient-to-br from-orange-400 to-orange-500" to="/admin/users"   loading={loading} />
        <StatCard label="Pending Reports"  value={pending}  icon="⏳" bg="bg-gradient-to-br from-amber-400 to-yellow-500"  to="/admin/reports" loading={loading} />
        <StatCard label="Resolved"         value={resolved} icon="✅" bg="bg-gradient-to-br from-green-400 to-green-500"   to="/admin/reports" loading={loading} />
      </div>

      {/* Quick Actions — 2-col on mobile, 4-col on lg */}
      <div>
        <h2 className="font-semibold text-slate-700 mb-3 text-xs uppercase tracking-wider">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((a) => (
            <Link key={a.to} to={a.to}
              className={`${a.bg} text-white rounded-xl p-4 transition-all hover:-translate-y-0.5 shadow-sm hover:shadow-md flex items-center gap-3`}>
              <span className="text-2xl flex-shrink-0">{a.icon}</span>
              <span className="font-semibold text-sm leading-tight">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Recent Reports</h2>
          <Link to="/admin/reports" className="text-sm text-brand-600 hover:text-brand-700 font-medium whitespace-nowrap">View all →</Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading…</div>
        ) : reports.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No reports yet ✓</div>
        ) : (
          <>
            {/* Mobile card list (hidden on md+) */}
            <div className="md:hidden divide-y divide-slate-100">
              {reports.slice(0, 5).map((r) => {
                const name = r.reporter?.firstName
                  ? `${r.reporter.firstName} ${r.reporter.lastName || ""}`.trim()
                  : r.reporter?.email || "—";
                return (
                  <div key={r._id} className="px-4 py-3 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-slate-700 capitalize">{r.targetType} — {r.reason}</span>
                      <Badge variant={statusVariant[r.status] || "default"}>{r.status}</Badge>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-400">{name} · {formatDate(r.createdAt)}</span>
                      <Link to={`/admin/reports/${r._id}`} className="text-xs text-brand-600 font-semibold hover:underline">Review →</Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop table (hidden on mobile) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide border-b border-slate-100">
                  <tr>
                    {["Reporter", "Type", "Reason", "Status", "Date", ""].map(h => (
                      <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {reports.slice(0, 5).map((r) => {
                    const name = r.reporter?.firstName
                      ? `${r.reporter.firstName} ${r.reporter.lastName || ""}`.trim()
                      : r.reporter?.email || "—";
                    return (
                      <tr key={r._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3 text-slate-700 font-medium">{name}</td>
                        <td className="px-5 py-3 text-slate-500 capitalize">{r.targetType}</td>
                        <td className="px-5 py-3 text-slate-500 max-w-[160px] truncate">{r.reason}</td>
                        <td className="px-5 py-3"><Badge variant={statusVariant[r.status] || "default"}>{r.status}</Badge></td>
                        <td className="px-5 py-3 text-slate-400 whitespace-nowrap">{formatDate(r.createdAt)}</td>
                        <td className="px-5 py-3">
                          <Link to={`/admin/reports/${r._id}`} className="text-brand-600 hover:underline text-xs font-semibold">Review →</Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
