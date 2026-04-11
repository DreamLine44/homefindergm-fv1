import { useState, useEffect, useCallback } from "react";
import { Outlet, Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { getInitials } from "../utils/helpers";

const NAV_LINKS = [
  { to: "/",           label: "Home",       exact: true },
  { to: "/properties", label: "Properties" },
  { to: "/about",      label: "About" },
  { to: "/contact",    label: "Contact" },
];

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropOpen,    setDropOpen]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [showTop,     setShowTop]     = useState(false);

  useEffect(() => {
    setMobileOpen(false);
    setDropOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : user?.email || "";
  const shortName = user?.username || user?.firstName || user?.email?.split("@")[0] || "User";
  const avatarUrl = typeof user?.avatar === "string" ? user.avatar : user?.avatar?.url || null;

  const handleLogout = useCallback(() => {
    logout();
    setDropOpen(false);
    setMobileOpen(false);
    navigate("/");
  }, [logout, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-warm-50 overflow-x-hidden">
      {/* ── Navbar ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/" className="flex-shrink-0" onClick={() => setMobileOpen(false)}>
            <img src="/logo.svg" alt="HomeFinderGM" className="h-10 w-auto" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {NAV_LINKS.map(({ to, label, exact }) => (
              <NavLink key={to} to={to} end={exact}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "text-brand-700 bg-brand-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Desktop auth */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setDropOpen(!dropOpen)}
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-gray-200 hover:border-brand-300 bg-white transition-all shadow-sm"
                  >
                    <div className="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold overflow-hidden flex-shrink-0">
                      {avatarUrl
                        ? <img src={avatarUrl} alt="" className="w-full h-full rounded-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
                        : getInitials(displayName)}
                    </div>
                    <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">{shortName}</span>
                    <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {dropOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setDropOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-54 bg-white border border-gray-100 rounded-2xl shadow-xl py-1.5 z-50">
                        <div className="px-4 py-3 border-b border-gray-50">
                          <p className="text-sm font-semibold text-gray-900 truncate">{displayName || shortName}</p>
                          {user?.username && <p className="text-xs text-brand-500">@{user.username}</p>}
                          <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                        </div>
                        {[
                          { to: "/dashboard",              icon: "📊", label: "Dashboard" },
                          { to: "/dashboard/profile",      icon: "👤", label: "My Profile" },
                          { to: "/dashboard/posts",        icon: "🏠", label: "My Listings" },
                          { to: "/dashboard/posts/create", icon: "➕", label: "New Listing" },
                        ].map(({ to, icon, label }) => (
                          <Link key={to} to={to} onClick={() => setDropOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <span>{icon}</span>{label}
                          </Link>
                        ))}
                        {user?.role === "admin" && (
                          <Link to="/admin" onClick={() => setDropOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-brand-600 hover:bg-brand-50 transition-colors">
                            <span>🛡️</span>Admin Panel
                          </Link>
                        )}
                        <div className="border-t border-gray-50 mt-1 pt-1">
                          <button onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                            <span>↩</span>Sign out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2">Sign in</Link>
                  <Link to="/register" className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm">
                    Get started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile: compact avatar/sign-in + hamburger */}
            <div className="flex md:hidden items-center gap-2">
              {user ? (
                <Link to="/dashboard" className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold overflow-hidden border-2 border-brand-200">
                  {avatarUrl
                    ? <img src={avatarUrl} alt="" className="w-full h-full rounded-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
                    : getInitials(displayName)}
                </Link>
              ) : (
                <Link to="/login" className="text-sm font-semibold text-brand-600 px-3 py-1.5 rounded-lg border border-brand-200 bg-white">
                  Sign in
                </Link>
              )}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileOpen ? (
                  <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile Menu — sibling to header, fixed below it ── */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 top-16 bg-black/30 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
          <div className="fixed left-0 right-0 top-16 bottom-0 z-40 bg-white md:hidden overflow-y-auto">
            <nav className="px-4 py-3 space-y-1">
                {NAV_LINKS.map(({ to, label, exact }) => (
                  <NavLink key={to} to={to} end={exact}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-3.5 rounded-xl text-base font-medium transition-all ${
                        isActive ? "text-brand-700 bg-brand-50" : "text-gray-700 hover:bg-gray-50"
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                ))}
              </nav>

              <div className="h-px bg-gray-100 mx-4" />

              {user ? (
                <div className="px-4 py-3 space-y-1">
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl mb-2">
                    <div className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center text-sm font-bold overflow-hidden flex-shrink-0">
                      {avatarUrl
                        ? <img src={avatarUrl} alt="" className="w-full h-full rounded-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
                        : getInitials(displayName)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{displayName || shortName}</p>
                      {user?.username && <p className="text-xs text-brand-500">@{user.username}</p>}
                      <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                    </div>
                  </div>
                  {[
                    { to: "/dashboard",              icon: "📊", label: "Dashboard" },
                    { to: "/dashboard/profile",      icon: "👤", label: "My Profile" },
                    { to: "/dashboard/posts",        icon: "🏠", label: "My Listings" },
                    { to: "/dashboard/posts/create", icon: "➕", label: "New Listing" },
                  ].map(({ to, icon, label }) => (
                    <Link key={to} to={to} onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium">
                      <span className="text-base">{icon}</span>{label}
                    </Link>
                  ))}
                  {user?.role === "admin" && (
                    <Link to="/admin" onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm text-brand-600 hover:bg-brand-50 transition-colors font-medium">
                      <span>🛡️</span>Admin Panel
                    </Link>
                  )}
                  <div className="h-px bg-gray-100 my-1" />
                  <button onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors font-medium">
                    <span>↩</span>Sign out
                  </button>
                </div>
              ) : (
                <div className="px-4 py-4">
                  <Link to="/register" onClick={() => setMobileOpen(false)}
                    className="w-full text-center py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors shadow-sm block">
                    Get started
                  </Link>
                </div>
              )}
            </div>
          </>
        )}

      <main className="flex-1 pt-16"><Outlet /></main>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-gray-300 pt-12 pb-8 mt-auto">
        <div className="max-w-7xl mx-auto px-6">

          {/* Main footer grid: brand (left, wider) + Browse + Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-10">

            {/* Brand column */}
            <div className="sm:col-span-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 56" fill="none" className="h-8 mb-4">
                <path d="M8 30 L28 10 L48 30" stroke="white" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="13" y1="27" x2="13" y2="48" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
                <line x1="43" y1="27" x2="43" y2="48" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
                <line x1="13" y1="48" x2="43" y2="48" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
                <rect x="21" y="30" width="14" height="10" rx="1.5" fill="#f97316"/>
                <line x1="28" y1="30" x2="28" y2="40" stroke="white" strokeWidth="1.2"/>
                <line x1="21" y1="35" x2="35" y2="35" stroke="white" strokeWidth="1.2"/>
                <path d="M6 52 Q28 47 50 52" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round"/>
                <text x="60" y="40" fontFamily="DM Sans, Arial, sans-serif" fontWeight="800" fontSize="28" fill="white" letterSpacing="-0.8">HomeFinder</text>
                <text x="229" y="40" fontFamily="DM Sans, Arial, sans-serif" fontWeight="900" fontSize="29" fill="#f97316" letterSpacing="-0.5">GM</text>
              </svg>
              <p className="text-sm text-gray-400 leading-relaxed">
                Premium property listings across The Gambia. Find your perfect home today.
              </p>
            </div>

            {/* Browse column */}
            <div>
              <h4 className="font-semibold text-white mb-4 text-xs uppercase tracking-widest">Browse</h4>
              <ul className="space-y-3 text-sm">
                {[
                  { to: "/properties", label: "All Properties" },
                  { to: "/about",      label: "About Us" },
                  { to: "/contact",    label: "Contact" },
                  { to: "/help",       label: "Help Center" },
                ].map(({ to, label }) => (
                  <li key={to}>
                    <Link to={to} className="text-gray-400 hover:text-white transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact column */}
            <div>
              <h4 className="font-semibold text-white mb-4 text-xs uppercase tracking-widest">Contact</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>📍 Banjul, The Gambia</li>
                <li>📞 +220 353 2423</li>
                <li>✉️ dreamlineking@gmail.com</li>
              </ul>
            </div>

          </div>

          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between gap-2 text-xs text-gray-500">
            <span>© 2026 HomeFinderGM. All rights reserved.</span>
            <span>Built by DreamLine Team</span>
          </div>
        </div>
      </footer>

      {showTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 w-10 h-10 bg-brand-600 hover:bg-brand-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all">
          ↑
        </button>
      )}
    </div>
  );
}
