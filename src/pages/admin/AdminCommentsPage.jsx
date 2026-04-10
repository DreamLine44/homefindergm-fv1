import { useState, useEffect } from "react";
import { getPosts } from "../../api/postApi";
import { getComments } from "../../api/commentApi";
import { adminDelete } from "../../api/adminApi";
import { timeAgo, getInitials } from "../../utils/helpers";

function resolveAuthorName(comment) {
  // Try all possible populated user object fields
  const obj = (comment.author && typeof comment.author === "object" ? comment.author : null)
    || (comment.user && typeof comment.user === "object" ? comment.user : null)
    || (comment.userId && typeof comment.userId === "object" ? comment.userId : null)
    || (comment.createdBy && typeof comment.createdBy === "object" ? comment.createdBy : null);

  if (obj?.firstName) return `${obj.firstName} ${obj.lastName || ""}`.trim();
  if (obj?.username)  return `@${obj.username}`;
  if (obj?.email)     return obj.email.split("@")[0];

  // Plain string IDs or names
  if (typeof comment.author   === "string" && comment.author.length   > 5 && !comment.author.match(/^[a-f0-9]{24}$/i)) return comment.author;
  if (typeof comment.user     === "string" && comment.user.length     > 5 && !comment.user.match(/^[a-f0-9]{24}$/i))   return comment.user;

  // Last resort: partial ID so it's still unique/identifiable
  const id = (typeof comment.author === "string" ? comment.author : null)
    || (typeof comment.userId === "string" ? comment.userId : null)
    || comment._id;
  if (id && id.length >= 6) return `User #${id.slice(-5)}`;
  return "Anonymous";
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [deleting, setDeleting] = useState(null);
  const [msg,      setMsg]      = useState({ type: "", text: "" });

  const flash = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg({ type: "", text: "" }), 3500); };

  useEffect(() => {
    getPosts()
      .then(async (r) => {
        const posts = r.data?.posts || r.data || [];
        if (!posts.length) { setComments([]); return; }
        const results = await Promise.allSettled(
          posts.slice(0, 60).map((p) =>
            getComments(p._id).then((cr) => {
              const list = cr.data?.comments || cr.data || [];
              return list.map((c) => ({ ...c, postTitle: p.title, postId: p._id }));
            })
          )
        );
        const all = results.filter((r) => r.status === "fulfilled").flatMap((r) => r.value);
        all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setComments(all);
      })
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (commentId, text) => {
    if (!window.confirm(`Delete this comment?\n"${text?.slice(0, 80)}"`)) return;
    setDeleting(commentId);
    try {
      await adminDelete("comment", commentId);
      setComments((p) => p.filter((c) => c._id !== commentId));
      flash("success", "Comment deleted.");
    } catch (e) {
      flash("error", e.response?.data?.msg || "Failed to delete comment.");
    } finally { setDeleting(null); }
  };

  const filtered = search.trim()
    ? comments.filter((c) => {
        const author = resolveAuthorName(c);
        return [c.text, c.content, c.postTitle, author]
          .some((f) => f?.toLowerCase().includes(search.toLowerCase()));
      })
    : comments;

  return (
    <div className="space-y-4 animate-fade-up">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-800">Comments</h1>
        <p className="text-slate-500 text-sm">{comments.length} comments across all listings</p>
      </div>

      {msg.text && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium ${msg.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {msg.text}
        </div>
      )}

      <input type="text" placeholder="Search by content, post, or author…" value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-brand-400 shadow-sm" />

      {loading ? (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
          <div className="inline-block w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-slate-400 text-sm">Loading comments…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-slate-400 shadow-sm">No comments found.</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Mobile card list */}
          <div className="md:hidden divide-y divide-slate-100">
            {filtered.map((c) => {
              const author = resolveAuthorName(c);
              const text   = c.text || c.content || "";
              return (
                <div key={c._id} className="px-4 py-3 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {getInitials(author)}
                      </div>
                      <span className="font-semibold text-sm text-slate-700 truncate">{author}</span>
                    </div>
                    <span className="text-xs text-slate-400 whitespace-nowrap flex-shrink-0">{timeAgo(c.createdAt)}</span>
                  </div>
                  <p className="text-sm text-slate-600 truncate pl-9">{text}</p>
                  <div className="flex items-center justify-between pl-9">
                    <span className="text-xs text-brand-500 font-medium truncate">{c.postTitle || "—"}</span>
                    <button
                      onClick={() => handleDelete(c._id, text)}
                      disabled={deleting === c._id}
                      className="text-xs text-red-500 border border-red-200 rounded-lg px-2.5 py-1 hover:bg-red-50 disabled:opacity-50 transition-colors flex-shrink-0 ml-2"
                    >
                      {deleting === c._id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide border-b border-slate-100">
                <tr>
                  {["Author","Comment","Post","Time","Actions"].map(h => (
                    <th key={h} className="px-5 py-3 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((c) => {
                  const author = resolveAuthorName(c);
                  const text   = c.text || c.content || "";
                  return (
                    <tr key={c._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {getInitials(author)}
                          </div>
                          <span className="font-semibold text-slate-700 whitespace-nowrap">{author}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-600 max-w-[240px] truncate" title={text}>{text}</td>
                      <td className="px-5 py-3">
                        <span className="text-brand-600 text-xs font-medium max-w-[140px] truncate block">{c.postTitle || "—"}</span>
                      </td>
                      <td className="px-5 py-3 text-slate-400 whitespace-nowrap">{timeAgo(c.createdAt)}</td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => handleDelete(c._id, text)}
                          disabled={deleting === c._id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors min-w-[72px] justify-center"
                        >
                          {deleting === c._id ? (
                            <><span className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" /> Deleting</>
                          ) : "Delete"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 font-medium">
            Showing {filtered.length} of {comments.length} comments
          </div>
        </div>
      )}
    </div>
  );
}
