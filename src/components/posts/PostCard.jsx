import { memo } from "react";
import { Link } from "react-router-dom";
import { formatPrice, timeAgo } from "../../utils/helpers";
import Badge from "../common/Badge";

const PLACEHOLDER = "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&q=60";

// Image B fix: supports `view` prop — "grid" (default) or "list"
const PostCard = memo(function PostCard({ post, eager = false, view = "grid" }) {
  const rawUrl = post?.images?.[0]?.url;
  const image  = rawUrl
    ? rawUrl.replace("/upload/", "/upload/w_600,q_auto,f_auto/")
    : PLACEHOLDER;

  // ── LIST VIEW ──
  if (view === "list") {
    return (
      <Link
        to={`/properties/${post._id}`}
        className="group bg-white rounded-2xl overflow-hidden border border-stone-100 hover:shadow-lg transition-all duration-300 flex flex-row"
      >
        <div className="relative w-44 sm:w-56 flex-shrink-0 overflow-hidden bg-stone-100">
          <img
            src={image}
            alt={post.title}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.target.src = PLACEHOLDER; }}
          />
          <div className="absolute top-3 left-3">
            <Badge variant="brand">{post.type || "Property"}</Badge>
          </div>
        </div>
        <div className="p-4 flex flex-col flex-1 min-w-0">
          <h3 className="font-semibold text-stone-900 leading-tight line-clamp-1 group-hover:text-brand-600 transition-colors mb-1">
            {post.title}
          </h3>
          <p className="text-sm text-stone-500 mb-1 flex items-center gap-1">📍 {post.location || "Location TBD"}</p>
          <p className="text-sm text-stone-400 line-clamp-2 flex-1 mb-3 leading-relaxed">{post.description}</p>
          <div className="flex items-center justify-between pt-3 border-t border-stone-100">
            <span className="text-base font-bold text-brand-600 truncate max-w-[65%]">{formatPrice(post.price)}</span>
            <span className="text-xs text-stone-400 bg-stone-50 px-2 py-1 rounded-full flex-shrink-0">{timeAgo(post.createdAt)}</span>
          </div>
        </div>
      </Link>
    );
  }

  // ── GRID VIEW (default) ──
  return (
    <Link
      to={`/properties/${post._id}`}
      className="group bg-white rounded-2xl overflow-hidden border border-stone-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
    >
      <div className="relative h-56 overflow-hidden bg-stone-100 flex-shrink-0">
        <img
          src={image}
          alt={post.title}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.src = PLACEHOLDER; }}
        />
        <div className="absolute top-3 left-3">
          <Badge variant="brand">{post.type || "Property"}</Badge>
        </div>
        {post.images?.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
            +{post.images.length - 1} photos
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-semibold text-stone-900 text-base leading-snug line-clamp-1 group-hover:text-brand-600 transition-colors mb-1.5">
          {post.title}
        </h3>
        <p className="text-sm text-stone-500 flex items-center gap-1 mb-2">
          📍 {post.location || "Location TBD"}
        </p>
        <p className="text-sm text-stone-400 line-clamp-2 mb-4 flex-1 leading-relaxed">{post.description}</p>
        <div className="flex items-center justify-between pt-3 border-t border-stone-100 mt-auto">
          <span className="text-lg font-bold text-brand-600">{formatPrice(post.price)}</span>
          <span className="text-xs text-stone-400 bg-stone-50 px-2 py-1 rounded-full">{timeAgo(post.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}
);

export default PostCard;
