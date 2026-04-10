import { Outlet, NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { getInitials } from "../utils/helpers";
import { useState, useEffect } from "react";

const navItems = [
  { to: "/dashboard",              label: "Overview",    icon: "📊", exact: true },
  { to: "/dashboard/profile",      label: "Profile",     icon: "👤" },
  { to: "/dashboard/posts",        label: "My Listings", icon: "🏠" },
  { to: "/dashboard/posts/create", label: "New Listing", icon: "➕" },
  { to: "/dashboard/saved",        label: "Saved",       icon: "❤️" },
  { to: "/dashboard/messages",     label: "Messages",    icon: "💬" },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : user?.email || "User";

  const avatarUrl = typeof user?.avatar === "string" ? user.avatar : user?.avatar?.url || null;

  const currentLabel = navItems.find(n =>
    n.exact ? location.pathname === n.to : location.pathname === n.to || location.pathname.startsWith(n.to + "/")
  )?.label || "Dashboard";

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
      isActive ? "bg-brand-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-all ${
      isActive ? "bg-brand-600 text-white shadow-sm" : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
    }`;

  const SidebarNav = ({ mobile = false }) => (
    <nav className={`flex-1 py-4 px-3 space-y-1 overflow-y-auto`}>
      {navItems.map((item) => (
        <NavLink key={item.to} to={item.to} end={item.exact}
          onClick={mobile ? () => setSidebarOpen(false) : undefined}
          className={mobile ? mobileNavLinkClass : navLinkClass}>
          <span className={mobile ? "text-xl" : "text-base"}>{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}
      {user?.role === "admin" && (
        <NavLink to="/admin"
          onClick={mobile ? () => setSidebarOpen(false) : undefined}
          className={mobile ? mobileNavLinkClass : navLinkClass}>
          <span>🛡️</span><span>Admin Panel</span>
        </NavLink>
      )}
    </nav>
  );

  const UserFooter = ({ mobile = false }) => (
    <div className="border-t border-gray-100 p-4 flex-shrink-0">
      <div className={`flex items-center gap-3 mb-3 ${mobile ? "p-3 bg-gray-50 rounded-xl" : ""}`}>
        <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-bold flex-shrink-0 overflow-hidden">
          {avatarUrl
            ? <img src={avatarUrl} alt="" className="w-full h-full rounded-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
            : getInitials(displayName)}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">{displayName}</p>
          {user?.username && <p className="text-xs text-brand-500 truncate">@{user.username}</p>}
          <p className="text-xs text-gray-400 truncate">{user?.email}</p>
        </div>
      </div>
      <button
        onClick={() => { logout(); navigate("/"); }}
        className="w-full text-center text-sm text-red-500 hover:text-red-600 border border-red-100 hover:border-red-200 px-3 py-2 rounded-xl hover:bg-red-50 transition-colors font-medium"
      >
        ↩ Sign out
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 flex overflow-x-hidden">

      {/* ── Desktop Sidebar (fixed) ── */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-100 flex-col shadow-sm flex-shrink-0 fixed inset-y-0 left-0 z-30">
        <div className="h-16 flex items-center px-5 border-b border-gray-100 flex-shrink-0">
          <Link to="/"><img src="/logo.svg" alt="HomeFinderGM" className="h-9 w-auto" /></Link>
        </div>
        <SidebarNav />
        <UserFooter />
      </aside>

      {/* ── Mobile Sidebar Overlay ── */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white border-r border-gray-100 flex flex-col shadow-2xl md:hidden">
            <div className="h-16 flex items-center justify-between px-5 border-b border-gray-100 flex-shrink-0">
              <Link to="/" onClick={() => setSidebarOpen(false)}>
                <img src="/logo.svg" alt="HomeFinderGM" className="h-8 w-auto" />
              </Link>
              <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <SidebarNav mobile />
            <UserFooter mobile />
          </aside>
        </>
      )}

      {/* ── Main Content (offset by sidebar on desktop) ── */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-64">

        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center gap-3 px-4 sm:px-6 sticky top-0 z-20 shadow-sm flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
            aria-label="Open menu"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex-1 min-w-0">
            <span className="text-base font-semibold text-gray-800 truncate block">{currentLabel}</span>
          </div>

          <Link to="/properties" className="text-sm font-medium text-gray-500 hover:text-brand-600 transition-colors whitespace-nowrap flex-shrink-0">
            ← Browse
          </Link>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <div className="max-w-4xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
