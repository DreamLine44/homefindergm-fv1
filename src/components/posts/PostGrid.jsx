import { useState, useEffect, memo } from "react";
import { Link } from "react-router-dom";
import PostCard from "./PostCard";
import SkeletonCard from "../common/SkeletonCard";
import EmptyState from "../common/EmptyState";
import Button from "../common/Button";

const INITIAL_BATCH = 9;
const NEXT_BATCH    = 9;

// Performance: memoize PostGrid so it only re-renders when posts/loading/view change
const PostGrid = memo(function PostGrid({ posts, loading, emptyMessage, view = "grid" }) {
  const [visible, setVisible] = useState(INITIAL_BATCH);

  useEffect(() => {
    setVisible(INITIAL_BATCH);
  }, [posts]);

  if (loading) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch">
      {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );

  if (!posts || posts.length === 0) return (
    <EmptyState
      icon="🏠"
      title="No properties found"
      description={emptyMessage || "Try adjusting your search or filters."}
      action={<Link to="/properties"><Button>Browse all properties</Button></Link>}
    />
  );

  // Deduplicate by _id
  const unique  = posts.filter((p, i, arr) => arr.findIndex((x) => x._id === p._id) === i);
  const shown   = unique.slice(0, visible);
  const hasMore = visible < unique.length;

  return (
    <div>
      {view === "list" ? (
        <div className="flex flex-col gap-4">
          {shown.map((post, i) => (
            <PostCard key={post._id} post={post} eager={i < 3} view="list" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch">
          {shown.map((post, i) => (
            <PostCard key={post._id} post={post} eager={i < 3} view="grid" />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="mt-10 text-center">
          <button
            onClick={() => setVisible((v) => v + NEXT_BATCH)}
            className="px-6 py-2.5 bg-white border border-stone-200 rounded-xl text-sm font-medium text-stone-700 hover:bg-stone-50 hover:border-brand-300 transition-all"
          >
            Show more properties
          </button>
        </div>
      )}
    </div>
  );
});

export default PostGrid;
