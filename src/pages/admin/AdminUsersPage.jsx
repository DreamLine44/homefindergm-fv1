import { useState, useEffect } from "react";
import { getAllUsers, adminDelete } from "../../api/adminApi";
import { formatDate, getInitials, resolvePersonName } from "../../utils/helpers";

export default function AdminUsersPage() {
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [deleting, setDeleting] = useState(null);
  const [msg,      setMsg]      = useState({ type: "", text: "" });

  useEffect(() => {
    getAllUsers()
      .then((r) => {
        const d = r.data;
        const arr = Array.isArray(d?.users) ? d.users
          : Array.isArray(d?.data) ? d.data
          : Array.isArray(d) ? d : [];
        setUsers(arr);
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const flash = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg({ type: "", text: "" }), 3500); };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"?\n\nThis will permanently remove their account.`)) return;
    setDeleting(id);
    try {
      await adminDelete("user", id);
      setUsers((p) => p.filter((u) => u._id !== id));
      flash("success", `User "${name}" deleted.`);
    } catch (e) {
      flash("error", e.response?.data?.msg || "Failed to delete user.");
    } finally { setDeleting(null); }
  };

  const safeUsers = Array.isArray(users) ? users : [];
  const filtered = search.trim()
    ? safeUsers.filter((u) =>
        [u.firstName, u.lastName, u.email, u.username]
          .some((f) => f?.toLowerCase().includes(search.toLowerCase()))
      )
    : safeUsers;

  return (
    <div className="space-y-4 animate-fade-up">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-800">Users</h1>
        <p className="text-slate-500 text-sm">{safeUsers.length} registered accounts</p>
      </div>

      {msg.text && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium ${msg.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {msg.text}
        </div>
      )}

      <input type="text" placeholder="Search by name, email or username…" value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-200 shadow-sm" />

      {loading ? (
        <div className="bg-white rounded-2xl p-8 text-center text-slate-400 shadow-sm">Loading users…</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
          <div className="text-3xl mb-3">👥</div>
          <p className="text-slate-600 font-medium mb-1">No users found</p>
          <p className="text-slate-400 text-xs">{search ? "Try a different search term." : "No registered users yet."}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Mobile card list */}
          <div className="md:hidden divide-y divide-slate-100">
            {filtered.map((u) => {
              const name = u.firstName
                ? `${u.firstName} ${u.lastName || ""}`.trim()
                : resolvePersonName(u) || "Anonymous";
              const avatarUrl = typeof u.avatar === "string" ? u.avatar : u.avatar?.url || null;
              return (
                <div key={u._id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-bold flex-shrink-0 overflow-hidden">
                    {avatarUrl
                      ? <img src={avatarUrl} alt="" className="w-full h-full rounded-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
                      : getInitials(name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 text-sm truncate">{name}</p>
                        <p className="text-xs text-slate-400 truncate">{u.email}</p>
                      </div>
                      <span className={`flex-shrink-0 inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${u.role === "admin" ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-600"}`}>
                        {u.role || "user"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs text-slate-400">Joined {formatDate(u.createdAt)}</span>
                      <button
                        onClick={() => handleDelete(u._id, name)}
                        disabled={deleting === u._id || u.role === "admin"}
                        className="px-2.5 py-1 text-xs text-red-500 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        {deleting === u._id ? "Deleting…" : "Delete"}
                      </button>
                    </div>
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
                  {["User","Email","Role","Joined","Actions"].map(h => (
                    <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((u) => {
                  const name = u.firstName
                    ? `${u.firstName} ${u.lastName || ""}`.trim()
                    : resolvePersonName(u) || "Anonymous";
                  const avatarUrl = typeof u.avatar === "string" ? u.avatar : u.avatar?.url || null;
                  return (
                    <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold flex-shrink-0 overflow-hidden">
                            {avatarUrl
                              ? <img src={avatarUrl} alt="" className="w-full h-full rounded-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
                              : getInitials(name)}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{name}</p>
                            {u.username && <p className="text-xs text-brand-500">@{u.username}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-500">{u.email}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${u.role === "admin" ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-600"}`}>
                          {u.role || "user"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-400 whitespace-nowrap">{formatDate(u.createdAt)}</td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => handleDelete(u._id, name)}
                          disabled={deleting === u._id || u.role === "admin"}
                          className="px-3 py-1.5 text-xs text-red-500 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          title={u.role === "admin" ? "Cannot delete admin accounts" : "Delete user"}
                        >
                          {deleting === u._id ? "Deleting…" : "Delete"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-400">
            Showing {filtered.length} of {safeUsers.length} users
          </div>
        </div>
      )}
    </div>
  );
}
