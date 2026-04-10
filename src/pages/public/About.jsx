import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { getPosts } from "../../api/postApi";
import { CITIES } from "../../utils/constants";

// Animated counter — counts up from 0 to `end` when visible
function AnimatedStat({ value, label, suffix = "" }) {
  const [displayed, setDisplayed] = useState(0);
  const ref = useRef(null);
  const animated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true;
          const numeric = parseInt(String(value).replace(/[^0-9]/g, ""), 10);
          if (!numeric) { setDisplayed(value); return; }
          let start = 0;
          const duration = 1200;
          const step = Math.ceil(numeric / (duration / 16));
          const timer = setInterval(() => {
            start += step;
            if (start >= numeric) { setDisplayed(numeric); clearInterval(timer); }
            else setDisplayed(start);
          }, 16);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  const formatted =
    typeof value === "number" || /^\d+$/.test(String(value))
      ? Number(displayed).toLocaleString()
      : displayed || value;

  return (
    <div ref={ref} className="text-center">
      <div className="font-display text-4xl font-bold text-brand-600 mb-1">
        {formatted}{suffix}
      </div>
      <div className="text-sm text-stone-500 font-medium">{label}</div>
    </div>
  );
}

export default function About() {
  const [listingCount, setListingCount] = useState(null);

  // Fetch real listing count from the live database
  useEffect(() => {
    getPosts()
      .then((r) => {
        const posts = r.data?.posts || r.data || [];
        setListingCount(Array.isArray(posts) ? posts.length : null);
      })
      .catch(() => setListingCount(null));
  }, []);

  const stats = [
    { value: 2026,                               suffix: "",  label: "Founded"  },
    { value: CITIES.length,                      suffix: "+", label: "Cities"   },
    { value: listingCount ?? 2400,               suffix: "+", label: "Listings" },
    { value: 850,                                suffix: "+", label: "Clients"  },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-stone-900 via-stone-800 to-brand-900 text-white py-12 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="font-display text-3xl sm:text-5xl font-bold mb-4">About HomeFinderGM</h1>
          <p className="text-base sm:text-xl text-stone-300 max-w-2xl mx-auto leading-relaxed px-2">
            Connecting people with their perfect homes across The Gambia since 2026.
          </p>
        </div>
      </section>

      {/* Mission + Vision */}
      <section className="max-w-5xl mx-auto px-4 py-10 sm:py-16">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="bg-white rounded-2xl border border-stone-100 p-8">
            <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center text-2xl mb-5">🎯</div>
            <h2 className="font-display text-2xl font-semibold text-stone-900 mb-4">Our Mission</h2>
            <p className="text-stone-600 leading-relaxed">
              HomeFinderGM was built to make property search in The Gambia simple, transparent, and
              accessible. We believe everyone deserves a home they love, and we work hard to make
              that discovery process effortless.
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-stone-100 p-8">
            <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center text-2xl mb-5">🔭</div>
            <h2 className="font-display text-2xl font-semibold text-stone-900 mb-4">Our Vision</h2>
            <p className="text-stone-600 leading-relaxed">
              We envision a Gambia where the property market is fully digitized, fair, and transparent.
              A place where buyers, sellers, and renters can connect easily and confidently.
            </p>
          </div>
        </div>
      </section>

      {/* Stats — live data where possible */}
      <section className="bg-stone-50 border-y border-stone-100 py-10 sm:py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="font-display text-2xl font-bold text-stone-900 text-center mb-10">
            HomeFinderGM by the numbers
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <AnimatedStat key={s.label} value={s.value} suffix={s.suffix} label={s.label} />
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-5xl mx-auto px-4 py-10 sm:py-16">
        <h2 className="font-display text-3xl font-bold text-stone-900 text-center mb-10">
          Why choose HomeFinderGM?
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: "🔍", title: "Easy Search",       desc: "Filter by city, type, price and more. Find exactly what you need in seconds." },
            { icon: "✅", title: "Verified Listings",  desc: "Every listing goes through our review process to ensure accuracy and quality." },
            { icon: "💬", title: "Direct Contact",    desc: "Connect directly with property owners via phone or WhatsApp — no middlemen." },
          ].map((v) => (
            <div key={v.title} className="bg-white rounded-2xl border border-stone-100 p-6 text-center hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">{v.icon}</div>
              <h3 className="font-semibold text-stone-900 mb-2">{v.title}</h3>
              <p className="text-sm text-stone-500 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-600 text-white py-14">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-bold mb-4">Ready to find your next home?</h2>
          <p className="text-brand-100 mb-8">Browse thousands of verified property listings across The Gambia.</p>
          <Link
            to="/properties"
            className="inline-block px-8 py-3.5 bg-white text-brand-700 font-semibold rounded-xl hover:bg-stone-50 transition-colors"
          >
            Browse Properties →
          </Link>
        </div>
      </section>
    </div>
  );
}
