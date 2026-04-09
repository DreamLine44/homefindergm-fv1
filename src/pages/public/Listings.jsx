import { useState, useEffect, useMemo } from "react";
import { getPosts } from "../../api/postApi";
import PostGrid from "../../components/posts/PostGrid";
import { PROPERTY_TYPES, CITIES } from "../../utils/constants";

export default function Listings() {
  const [allPosts, setAllPosts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filters,  setFilters]  = useState({
    type: "", city: "", minPrice: "", maxPrice: "", sort: "newest", search: "",
  });
  // Image B fix: view state is wired through to PostGrid → PostCard
  const [view, setView] = useState("grid");

  useEffect(() => {
    setLoading(true);
    getPosts()
      .then((res) => setAllPosts(res.data?.posts || res.data || []))
      .catch(() => setAllPosts([]))
      .finally(() => setLoading(false));
  }, []);

  const set = (k, v) => setFilters((f) => ({ ...f, [k]: v }));

  const filtered = useMemo(() => {
    let posts = [...allPosts];

    if (filters.type)
      posts = posts.filter((p) => p.type === filters.type);

    if (filters.city)
      posts = posts.filter((p) =>
        p.location?.toLowerCase().includes(filters.city.toLowerCase())
      );

    if (filters.minPrice)
      posts = posts.filter((p) => Number(p.price) >= Number(filters.minPrice));

    if (filters.maxPrice)
      posts = posts.filter((p) => Number(p.price) <= Number(filters.maxPrice));

    if (filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      posts = posts.filter((p) =>
        [p.title, p.description, p.location, p.type, p.addressDetails]
          .some((f) => f?.toLowerCase().includes(q))
      );
    }

    if (filters.sort === "newest")     posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (filters.sort === "oldest")     posts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (filters.sort === "price_asc")  posts.sort((a, b) => Number(a.price) - Number(b.price));
    if (filters.sort === "price_desc") posts.sort((a, b) => Number(b.price) - Number(a.price));

    return posts;
  }, [allPosts, filters]);

  const clearFilters = () =>
    setFilters({ type: "", city: "", minPrice: "", maxPrice: "", sort: "newest", search: "" });

  const hasActiveFilters =
    filters.type || filters.city || filters.minPrice || filters.maxPrice || filters.search;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold text-stone-900 mb-1">All Properties</h1>
        <p className="text-stone-500">
          {loading ? "Loading…" : `${filtered.length} listing${filtered.length !== 1 ? "s" : ""} found`}
          {hasActiveFilters && !loading && (
            <span className="ml-2 text-xs text-brand-600">(filtered from {allPosts.length} total)</span>
          )}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-stone-100 rounded-2xl p-4 mb-6 space-y-3">
        <input
          type="text"
          placeholder="Search by title, location, type…"
          value={filters.search}
          onChange={(e) => set("search", e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-300"
        />
        {/* Mobile-first responsive filter grid */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 items-center">
          <select value={filters.type} onChange={(e) => set("type", e.target.value)} className="px-3 py-2 rounded-lg border border-stone-200 text-sm outline-none bg-white w-full sm:w-auto">
            <option value="">All Types</option>
            {PROPERTY_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
          <select value={filters.city} onChange={(e) => set("city", e.target.value)} className="px-3 py-2 rounded-lg border border-stone-200 text-sm outline-none bg-white w-full sm:w-auto">
            <option value="">All Cities</option>
            {CITIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <input type="number" placeholder="Min Price" value={filters.minPrice} onChange={(e) => set("minPrice", e.target.value)} className="px-3 py-2 rounded-lg border border-stone-200 text-sm outline-none w-full sm:w-32" />
          <input type="number" placeholder="Max Price" value={filters.maxPrice} onChange={(e) => set("maxPrice", e.target.value)} className="px-3 py-2 rounded-lg border border-stone-200 text-sm outline-none w-full sm:w-32" />
          <select value={filters.sort} onChange={(e) => set("sort", e.target.value)} className="col-span-2 sm:col-span-1 px-3 py-2 rounded-lg border border-stone-200 text-sm outline-none bg-white w-full sm:w-auto">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
          </select>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="col-span-2 sm:col-span-1 px-3 py-2 text-sm text-red-500 hover:text-red-700 transition-colors text-left">
              ✕ Clear filters
            </button>
          )}
          <div className="col-span-2 sm:col-span-1 sm:ml-auto flex gap-1 justify-end">
            <button
              onClick={() => setView("grid")}
              title="Grid view"
              className={`p-2 rounded-lg transition-colors ${view === "grid" ? "bg-brand-100 text-brand-700" : "hover:bg-stone-50 text-stone-500"}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setView("list")}
              title="List view"
              className={`p-2 rounded-lg transition-colors ${view === "list" ? "bg-brand-100 text-brand-700" : "hover:bg-stone-50 text-stone-500"}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-5">
          {filters.type     && <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-50 text-brand-700 text-xs rounded-full border border-brand-100">Type: {filters.type}<button onClick={() => set("type", "")} className="ml-1 hover:text-red-500">×</button></span>}
          {filters.city     && <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-50 text-brand-700 text-xs rounded-full border border-brand-100">City: {filters.city}<button onClick={() => set("city", "")} className="ml-1 hover:text-red-500">×</button></span>}
          {filters.minPrice && <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-50 text-brand-700 text-xs rounded-full border border-brand-100">Min: D{filters.minPrice}<button onClick={() => set("minPrice", "")} className="ml-1 hover:text-red-500">×</button></span>}
          {filters.maxPrice && <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-50 text-brand-700 text-xs rounded-full border border-brand-100">Max: D{filters.maxPrice}<button onClick={() => set("maxPrice", "")} className="ml-1 hover:text-red-500">×</button></span>}
          {filters.search   && <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-50 text-brand-700 text-xs rounded-full border border-brand-100">"{filters.search}"<button onClick={() => set("search", "")} className="ml-1 hover:text-red-500">×</button></span>}
        </div>
      )}

      <PostGrid posts={filtered} loading={loading} view={view} />
    </div>
  );
}
