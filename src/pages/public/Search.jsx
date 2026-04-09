import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { searchPosts, getPosts } from "../../api/postApi";
import PostGrid from "../../components/posts/PostGrid";

export default function Search() {
  const [searchParams]  = useSearchParams();
  const navigate        = useNavigate();
  const q               = (searchParams.get("q") || "").trim();

  const [allPosts,  setAllPosts]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [inputVal,  setInputVal]  = useState(q);

  useEffect(() => {
    setInputVal(q);
  }, [q]);

  useEffect(() => {
    if (!q) {
      // No query — load all posts so we can filter client-side
      setLoading(true);
      getPosts()
        .then((r) => setAllPosts(r.data?.posts || r.data || []))
        .catch(() => setAllPosts([]))
        .finally(() => setLoading(false));
      return;
    }

    setLoading(true);

    // Try the real search endpoint first: GET /api/posts/search?q=...
    searchPosts({ q })
      .then((r) => {
        const results = r.data?.results || r.data?.posts || r.data || [];
        // If the backend returned results, great — use them
        if (Array.isArray(results) && results.length > 0) {
          setAllPosts(results);
          setLoading(false);
          return;
        }
        // Backend returned 0 results OR doesn't filter server-side —
        // fall back: fetch all posts and filter client-side
        return getPosts()
          .then((r2) => setAllPosts(r2.data?.posts || r2.data || []));
      })
      .catch(() =>
        // searchPosts failed entirely — fall back to getPosts + client filter
        getPosts()
          .then((r) => setAllPosts(r.data?.posts || r.data || []))
          .catch(() => setAllPosts([]))
      )
      .finally(() => setLoading(false));
  }, [q]);

  // Client-side filter — always run so results are correct even on fallback
  const filtered = useMemo(() => {
    if (!q) return allPosts;
    const lower = q.toLowerCase();
    return allPosts.filter((post) =>
      [
        post.title,
        post.type,
        post.location,
        post.addressDetails,
        post.description,
        post.status,
        post.features,
      ]
        .filter(Boolean)
        .some((field) =>
          String(field).toLowerCase().includes(lower)
        )
    );
  }, [allPosts, q]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputVal.trim()) navigate(`/search?q=${encodeURIComponent(inputVal.trim())}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Search bar — lets user refine without going back to home */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-8 max-w-xl">
        <input
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Search properties…"
          className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-300"
        />
        <button
          type="submit"
          className="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition-colors"
        >
          Search
        </button>
      </form>

      <h1 className="font-display text-3xl font-bold text-stone-900 mb-1">
        Search Results{" "}
        {q && <span className="text-brand-600">for "{q}"</span>}
      </h1>
      <p className="text-stone-500 mb-8">
        {loading ? "Searching…" : `${filtered.length} propert${filtered.length !== 1 ? "ies" : "y"} found`}
      </p>

      <PostGrid
        posts={filtered}
        loading={loading}
        emptyMessage={q ? `No properties found matching "${q}"` : "No properties found."}
      />
    </div>
  );
}
