import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { getPosts, deletePost } from "../../api/postApi";
import { formatPrice, formatDate } from "../../utils/helpers";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";

export default function MyPosts() {
  const { user } = useAuth();
  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    getPosts()
      .then((r) => {
        const all    = r.data?.data || r.data?.posts || r.data || [];
        const userId = user?._id || user?.id;
        const mine   = userId
          ? all.filter((p) => {
              const authorId = p.author?._id || p.userId || p.author;
              return String(authorId) === String(userId);
            })
          : all;
        setPosts(mine);
      })
      .catch(() => setError("Failed to load your listings."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this listing permanently? This cannot be undone.")) return;
    try {
      await deletePost(id);
      setPosts((p) => p.filter((x) => x._id !== id));
    } catch (e) {
      alert(e.response?.data?.message || "Failed to delete listing.");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-900">My Listings</h1>
          <p className="text-stone-500 mt-1">
            {posts.length} listing{posts.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link to="/dashboard/posts/create">
          <Button>+ New Listing</Button>
        </Link>
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      {posts.length === 0 ? (
        <EmptyState
          icon="🏠"
          title="No listings yet"
          description="Create your first property listing to get started."
          action={
            <Link to="/dashboard/posts/create">
              <Button>Create Listing</Button>
            </Link>
          }
        />
      ) : (
        <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
          <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_auto] gap-4 px-5 py-3 bg-stone-50 text-xs font-medium text-stone-500 uppercase tracking-wide border-b border-stone-100">
            <span>Property</span>
            <span>Price</span>
            <span>Listed</span>
            <span>Actions</span>
          </div>

          <div className="divide-y divide-stone-50">
            {posts.map((post) => (
              <div
                key={post._id}
                className="flex flex-col md:grid md:grid-cols-[2fr_1fr_1fr_auto] gap-3 md:gap-4 p-4 md:px-5 md:py-4 items-start md:items-center hover:bg-stone-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                    {post.images?.[0]?.url ? (
                      <img
                        src={post.images[0].url}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-300 text-2xl">🏠</div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-stone-900 truncate">{post.title}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <Badge variant="brand">{post.type}</Badge>
                      <span className="text-xs text-stone-400">{post.location}</span>
                      <Badge variant={post.status === "Available" ? "success" : "default"}>
                        {post.status || "Available"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full md:contents">
                  <div className="font-semibold text-brand-600 text-sm sm:text-base truncate max-w-[200px]">{formatPrice(post.price)}</div>
                  <div className="text-sm text-stone-400 hidden md:block">{formatDate(post.createdAt)}</div>
                  <div className="flex gap-2 items-center">
                    <Link to={`/properties/${post._id}`}>
                      <Button size="sm" variant="outline" className="min-w-[52px]">View</Button>
                    </Link>
                    <Link to={`/dashboard/posts/${post._id}/edit`}>
                      <Button size="sm" variant="secondary" className="min-w-[52px]">Edit</Button>
                    </Link>
                    <Button size="sm" variant="danger" className="min-w-[60px]" onClick={() => handleDelete(post._id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
