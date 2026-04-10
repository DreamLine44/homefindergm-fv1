import { useState, useEffect } from "react";
import { useAuth } from "../../auth/useAuth";
import { Link } from "react-router-dom";
import { getPosts } from "../../api/postApi";
import PostGrid from "../../components/posts/PostGrid";
import Button from "../../components/common/Button";
import { CITIES, PROPERTY_TYPES } from "../../utils/constants";

export default function Home() {
  const { user } = useAuth();
  const [posts,         setPosts]         = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState("");
  const [listingCount,  setListingCount]  = useState(null);

  useEffect(() => {
    getPosts({ limit: 6, sort: "newest" })
      .then((r) => {
        const data = r.data?.posts || r.data || [];
        setPosts(Array.isArray(data) ? data : []);
        // Use total count from API if provided, else count returned posts
        const total = r.data?.total ?? r.data?.count ?? null;
        setListingCount(total);
      })
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  const statItems = [
    { value: listingCount ? `${listingCount}+` : "2,400+", label: "Active Listings"  },
    { value: "850+",                                        label: "Happy Clients"    },
    { value: `${CITIES.length}`,                           label: "Cities Covered"   },
    { value: "98%",                                         label: "Satisfaction Rate" },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-stone-900 via-stone-800 to-brand-900 text-white">
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "url(https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1400&q=80)", backgroundSize: "cover", backgroundPosition: "center" }}
        />
        <div className="relative max-w-5xl mx-auto px-4 py-16 sm:py-28 text-center">
          <span className="inline-block px-3 py-1 bg-brand-500/20 border border-brand-500/30 rounded-full text-brand-300 text-sm font-medium mb-6">
            The Gambia's #1 Property Platform
          </span>
          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-bold leading-tight mb-6">
            Find Your <span className="text-brand-400 italic">Dream</span><br />Home Today
          </h1>
          <p className="text-base sm:text-xl text-stone-300 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-2">
            Browse thousands of verified property listings across The Gambia. Houses, apartments, villas and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") window.location.href = `/search?q=${search}`; }}
              placeholder="Search by location, type..."
              className="flex-1 px-5 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-stone-400 outline-none focus:border-brand-400 backdrop-blur-sm"
            />
            <Link to={`/search?q=${search}`}>
              <Button size="lg" className="w-full sm:w-auto whitespace-nowrap !rounded-xl">
                Search Properties
              </Button>
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {PROPERTY_TYPES.slice(0, 4).map((t) => (
              <Link key={t} to={`/properties?type=${t}`}
                className="px-4 py-1.5 rounded-full border border-white/20 text-sm text-stone-300 hover:bg-white/10 transition-all">
                {t}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Live Stats */}
      <section className="border-b border-stone-100 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {statItems.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display text-3xl font-bold text-brand-600">{s.value}</div>
              <div className="text-sm text-stone-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Listings */}
      <section className="max-w-7xl mx-auto px-4 py-10 sm:py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-brand-600 text-sm font-medium mb-1">Latest Properties</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-stone-900">Featured Listings</h2>
          </div>
          <Link to="/properties">
            <Button variant="outline">View all →</Button>
          </Link>
        </div>
        <PostGrid posts={posts} loading={loading} />
      </section>

      {/* CTA */}
      <section className="bg-brand-600 text-white py-10 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Ready to list your property?</h2>
          <p className="text-brand-100 mb-8 text-lg">Reach thousands of potential buyers and renters across The Gambia.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            {user ? (
              <Link to="/dashboard/posts/create"><Button variant="white" size="lg">List Your Property</Button></Link>
            ) : (
              <Link to="/register"><Button variant="white" size="lg">Create Account</Button></Link>
            )}
            <Link to="/properties">
              <Button variant="outline" size="lg" className="!border-white/30 !text-white hover:!bg-white/10">
                Browse Listings
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
