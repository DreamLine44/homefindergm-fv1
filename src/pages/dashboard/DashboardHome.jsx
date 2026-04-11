import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { getPosts } from "../../api/postApi";
import { formatPrice, formatPriceCompact } from "../../utils/helpers";
import Button from "../../components/common/Button";

// Image A fix: StatCard is now a clickable Link when `to` prop is provided
function StatCard({ label, value, icon, color, to }) {
  const inner = (
    <div className={`bg-white rounded-2xl border border-stone-100 p-3 sm:p-5 flex items-center gap-3 sm:gap-4 transition-all ${to ? "hover:shadow-md hover:-translate-y-0.5 cursor-pointer" : ""}`}>
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-lg sm:text-xl font-bold font-display text-stone-900 leading-tight truncate">{value}</div>
        <div className="text-xs sm:text-sm text-stone-500">{label}</div>
      </div>
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
}

export default function DashboardHome() {
  const { user } = useAuth();
  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);

  const firstName =
    user?.firstName ||
    user?.name?.split(" ")[0] ||
    "there";

  useEffect(() => {
    getPosts()
      .then((r) => {
        const all = r.data?.data || r.data?.posts || r.data || [];
        const userId = user?._id || user?.id;
        const mine = userId
          ? all.filter((p) => {
              const authorId = p.author?._id || p.userId || p.author;
              return String(authorId) === String(userId);
            })
          : all;
        setPosts(mine);
      })
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  const totalValue = posts.reduce((s, p) => s + (p.price || 0), 0);
  const available  = posts.filter((p) => p.status === "Available").length;

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-900">
            Welcome back, {firstName} 👋
          </h1>
          <p className="text-stone-500 mt-1">Here's what's happening with your listings</p>
        </div>
        <Link to="/dashboard/posts/create">
          <Button size="lg">+ New Listing</Button>
        </Link>
      </div>

      {/* Stats — all cards now clickable and navigate to the right section */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Total Listings" value={loading ? "—" : posts.length}            icon="🏠" color="bg-brand-50"  to="/dashboard/posts" />
        <StatCard label="Available"      value={loading ? "—" : available}               icon="✅" color="bg-green-50" to="/dashboard/posts" />
        <StatCard label="Total Value"    value={loading ? "—" : formatPriceCompact(totalValue)} icon="💰" color="bg-amber-50" />
        <StatCard label="Profile"        value="Complete"                                 icon="👤" color="bg-purple-50" to="/dashboard/profile" />
      </div>

      {/* Recent Listings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold text-stone-900">Recent Listings</h2>
          <Link to="/dashboard/posts" className="text-sm text-brand-600 hover:text-brand-700">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-stone-100 p-4 animate-pulse">
                <div className="h-32 bg-stone-100 rounded-lg mb-3" />
                <div className="h-4 bg-stone-100 rounded w-3/4 mb-2" />
                <div className="h-4 bg-stone-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-100 border-dashed p-12 text-center">
            <div className="text-4xl mb-4">🏠</div>
            <h3 className="font-semibold text-stone-800 mb-2">No listings yet</h3>
            <p className="text-stone-500 text-sm mb-6">
              Start by creating your first property listing.
            </p>
            <Link to="/dashboard/posts/create">
              <Button>Create Your First Listing</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.slice(0, 6).map((post) => (
              <div
                key={post._id}
                className="bg-white rounded-xl border border-stone-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="h-32 bg-stone-100 overflow-hidden">
                  {post.images?.[0]?.url ? (
                    <img
                      src={post.images[0].url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300 text-3xl">🏠</div>
                  )}
                </div>
                <div className="p-4">
                  <p className="font-medium text-stone-900 text-sm line-clamp-1">{post.title}</p>
                  <p className="text-xs text-stone-400 mt-0.5">{post.location}</p>
                  <p className="text-brand-600 font-bold mt-1">{formatPrice(post.price)}</p>
                  <div className="flex gap-2 mt-3">
                    <Link
                      to={`/properties/${post._id}`}
                      className="flex-1 text-center text-xs text-stone-500 hover:text-stone-700 border border-stone-200 px-2 py-1.5 rounded-lg transition-colors"
                    >
                      View
                    </Link>
                    <Link
                      to={`/dashboard/posts/${post._id}/edit`}
                      className="flex-1 text-center text-xs text-stone-500 hover:text-stone-700 border border-stone-200 px-2 py-1.5 rounded-lg transition-colors"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: "➕", title: "New Listing",  desc: "Publish a new property listing",   to: "/dashboard/posts/create" },
          { icon: "👤", title: "Edit Profile", desc: "Update your account and photo",    to: "/dashboard/profile" },
          { icon: "🏠", title: "My Listings",  desc: "Manage and edit your properties", to: "/dashboard/posts" },
        ].map((a) => (
          <Link
            key={a.title}
            to={a.to}
            className="bg-white rounded-2xl border border-stone-100 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all group"
          >
            <div className="text-3xl mb-3">{a.icon}</div>
            <h3 className="font-semibold text-stone-900 mb-1 group-hover:text-brand-600 transition-colors">
              {a.title}
            </h3>
            <p className="text-sm text-stone-500">{a.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
