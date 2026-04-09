import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getPosts } from "../../api/postApi";
import { adminDelete } from "../../api/adminApi";
import { formatPrice, formatDate } from "../../utils/helpers";
import Badge from "../../components/common/Badge";

const PLACEHOLDER = "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=80&q=50";
const PAGE_SIZE = 20;

function SkeletonRow() {
  return (
    <tr>
      {[100, 80, 70, 60, 80, 70, 60].map((w, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-slate-100 rounded animate-pulse" style={{ width: `${w}%` }} />
        </td>
      ))}
    </tr>
  );
}

export default function AdminPostsPage() {
  const [posts,    setPosts]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [deleting, setDeleting] = useState(null);
  const [msg,      setMsg]      = useState({ type: "", text: "" });
  const [page,     setPage]     = useState(1);

  const flash = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg({ type: "", text: "" }), 3500); };

  useEffect(() => {
    setLoading(true);
    getPosts()
      .then((r) => setPosts(r.data?.posts || r.data?.data || r.data || []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete listing "${title}"?\nThis will permanently remove all images.`)) return;
    setDeleting(id);
    try {
      await adminDelete("post", id);
      setPosts((p) => p.filter((x) => x._id !== id));
      flash("success", `"${title}" deleted.`);
    } catch (e) {
      flash("error", e.response?.data?.msg || "Failed to delete.");
    } finally { setDeleting(null); }
  };

  const filtered = search.trim()
    ? posts.filter((p) =>
        [p.title, p.location, p.type]
          .some((f) => f?.toLowerCase().includes(search.toLowerCase()))
      )
    : posts;

  const handleSearch = (v) => { setSearch(v); setPage(1); };
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const available  = posts.filter(p => p.status === "Available").length;
  const sold       = posts.filter(p => p.status === "Sold").length;

  return (
    <div className="space-y-4 animate-fade-up">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-800">All Listings</h1>
        <p className="text-slate-500 text-sm">{posts.length} total listings on the platform</p>
      </div>

      {msg.text && (
        <div className={`px-4 py-3 rounded-xl text-sm font-semibold ${msg.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {msg.text}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total",     value: posts.length, cls: "bg-brand-50 text-brand-700 border border-brand-100" },
          { label: "Available", value: available,    cls: "bg-green-50 text-green-700 border border-green-100" },
          { label: "Sold",      value: sold,          cls: "bg-red-50 text-red-700 border border-red-100" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl px-3 py-3 text-center ${s.cls}`}>
            <div className="text-xl sm:text-2xl font-bold">{s.value}</div>
            <div className="text-xs font-semibold uppercase tracking-wide opacity-70">{s.label}</div>
          </div>
        ))}
      </div>

      <input type="text" placeholder="Search by title, location or type…" value={search}
        onChange={(e) => handleSearch(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-brand-400 shadow-sm" />

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {["Listing","Location","Price","Status","Listed","Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}
              </tbody>
            </table>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No listings found.</div>
        ) : (
          <>
            {/* Mobile card list */}
            <div className="md:hidden divide-y divide-slate-100">
              {paginated.map((post) => {
                const thumb = post.images?.[0]?.url || PLACEHOLDER;
                const isDeleting = deleting === post._id;
                return (
                  <div key={post._id} className={`flex items-start gap-3 p-4 ${isDeleting ? "opacity-40" : ""}`}>
                    <img src={thumb} alt="" onError={(e) => { e.target.src = PLACEHOLDER; }}
                      className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-slate-100" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 truncate text-sm">{post.title}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{post.location || "—"} · {post.type}</p>
                        </div>
                        <Badge variant={post.status === "Available" ? "success" : "default"} className="flex-shrink-0">{post.status || "Available"}</Badge>
                      </div>
                      <p className="font-bold text-brand-600 text-sm mt-1">{formatPrice(post.price)}</p>
                      <div className="flex gap-2 mt-2">
                        <Link to={`/properties/${post._id}`} target="_blank"
                          className="px-3 py-1 text-xs font-semibold text-brand-600 border border-brand-200 rounded-lg hover:bg-brand-50 transition-colors">
                          View
                        </Link>
                        <button onClick={() => handleDelete(post._id, post.title)}
                          disabled={isDeleting}
                          className="px-3 py-1 text-xs font-semibold text-red-500 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors">
                          {isDeleting ? "Deleting…" : "Delete"}
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
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {["Listing","Location","Price","Status","Owner","Listed","Actions"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginated.map((post) => {
                    const owner =
                      post.author?.firstName ? `${post.author.firstName} ${post.author.lastName || ""}`.trim() :
                      post.userId?.firstName ? `${post.userId.firstName} ${post.userId.lastName || ""}`.trim() :
                      post.author?.email?.split("@")[0] || post.userId?.email?.split("@")[0] || "—";
                    const thumb = post.images?.[0]?.url || PLACEHOLDER;
                    const isDeleting = deleting === post._id;
                    return (
                      <tr key={post._id} className={`hover:bg-slate-50 transition-colors ${isDeleting ? "opacity-40" : ""}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img src={thumb} alt="" onError={(e) => { e.target.src = PLACEHOLDER; }}
                              className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-slate-100" />
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 truncate max-w-[130px]">{post.title}</p>
                              <Badge variant="brand">{post.type}</Badge>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{post.location || "—"}</td>
                        <td className="px-4 py-3 font-bold text-brand-600 whitespace-nowrap">{formatPrice(post.price)}</td>
                        <td className="px-4 py-3">
                          <Badge variant={post.status === "Available" ? "success" : "default"}>{post.status || "Available"}</Badge>
                        </td>
                        <td className="px-4 py-3 text-slate-500 truncate max-w-[100px]">{owner}</td>
                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{formatDate(post.createdAt)}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Link to={`/properties/${post._id}`} target="_blank"
                              className="px-3 py-1.5 text-xs font-semibold text-brand-600 border border-brand-200 rounded-lg hover:bg-brand-50 transition-colors">
                              View
                            </Link>
                            <button onClick={() => handleDelete(post._id, post.title)}
                              disabled={isDeleting}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-500 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors">
                              {isDeleting
                                ? <><span className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" /> Deleting</>
                                : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
                <span className="text-xs text-slate-500 font-medium">
                  Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                </span>
                <div className="flex gap-1 flex-wrap">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 transition-colors">
                    ← Prev
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const n = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                    return (
                      <button key={n} onClick={() => setPage(n)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${n === page ? "bg-brand-600 text-white" : "border border-slate-200 text-slate-600 hover:bg-white"}`}>
                        {n}
                      </button>
                    );
                  })}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 transition-colors">
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
