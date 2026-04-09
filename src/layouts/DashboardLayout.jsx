import { Outlet, NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
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

  // Close sidebar on navigation
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : user?.email || "User";

  const avatarUrl = typeof user?.avatar === "string" ? user.avatar : user?.avatar?.url || null;

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-gray-100 flex-shrink-0">
        <Link to="/" onClick={() => setSidebarOpen(false)}>
          <img src="/logo.svg" alt="HomeFinderGM" className="h-9 w-auto" />
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-brand-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`
            }>
            <span>{item.icon}</span><span>{item.label}</span>
          </NavLink>
        ))}
        {user?.role === "admin" && (
          <NavLink to="/admin"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive ? "bg-brand-600 text-white" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`
            }>
            <span>🛡️</span><span>Admin Panel</span>
          </NavLink>
        )}
      </nav>

      {/* User footer */}
      <div className="border-t border-gray-100 p-4 flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
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
          className="w-full text-left text-sm text-red-500 hover:text-red-600 px-2 py-1.5 rounded-lg hover:bg-red-50 transition-colors font-medium"
        >
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-warm-50 flex">

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-100 flex-col shadow-sm flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* ── Mobile Sidebar Overlay ── */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 flex flex-col shadow-2xl md:hidden">
            <SidebarContent />
          </aside>
        </>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center gap-3 px-4 sm:px-6 sticky top-0 z-30 shadow-sm">
          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Open menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Page title area — show current section on mobile */}
          <div className="flex-1 min-w-0">
            <span className="text-sm font-semibold text-gray-700 md:hidden truncate block">
              {navItems.find(n => location.pathname === n.to || (!n.exact && location.pathname.startsWith(n.to + "/")))?.label || "Dashboard"}
            </span>
          </div>

          <Link to="/properties" className="text-sm font-medium text-gray-500 hover:text-brand-600 transition-colors whitespace-nowrap">
            ← Browse Listings
          </Link>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
