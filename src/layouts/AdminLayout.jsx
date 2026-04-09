import { useState, useEffect } from "react";
import { Outlet, NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { getInitials } from "../utils/helpers";

const navItems = [
  { to: "/admin",          label: "Dashboard", icon: "📊", exact: true },
  { to: "/admin/posts",    label: "Posts",     icon: "🏠" },
  { to: "/admin/users",    label: "Users",     icon: "👥" },
  { to: "/admin/comments", label: "Comments",  icon: "💬" },
  { to: "/admin/reports",  label: "Reports",   icon: "🚨" },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : user?.email || "Admin";
  const avatarUrl = typeof user?.avatar === "string" ? user.avatar : user?.avatar?.url || null;

  const SidebarContent = () => (
    <>
      <div className="h-16 flex items-center px-4 bg-brand-700 flex-shrink-0">
        <Link to="/" onClick={() => setSidebarOpen(false)}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 56" fill="none" className="h-9">
            <path d="M8 30 L28 10 L48 30" stroke="white" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="13" y1="27" x2="13" y2="48" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
            <line x1="43" y1="27" x2="43" y2="48" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
            <line x1="13" y1="48" x2="43" y2="48" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
            <rect x="21" y="30" width="14" height="10" rx="1.5" fill="#f97316"/>
            <line x1="28" y1="30" x2="28" y2="40" stroke="white" strokeWidth="1.2"/>
            <line x1="21" y1="35" x2="35" y2="35" stroke="white" strokeWidth="1.2"/>
            <path d="M6 52 Q28 47 50 52" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round"/>
            <text x="60" y="40" fontFamily="DM Sans, Arial, sans-serif" fontWeight="800" fontSize="28" fill="white" letterSpacing="-0.8">HomeFinder</text>
            <text x="229" y="40" fontFamily="DM Sans, Arial, sans-serif" fontWeight="900" fontSize="29" fill="#f97316" letterSpacing="-0.5">GM</text>
          </svg>
        </Link>
      </div>

      <div className="px-4 py-2.5 bg-gm-50 border-b border-gm-100 flex items-center gap-2 flex-shrink-0">
        <span className="w-2 h-2 rounded-full bg-gm-500 animate-pulse flex-shrink-0" />
        <span className="text-xs font-bold text-gm-600 uppercase tracking-widest">Admin Panel</span>
      </div>

      <nav className="flex-1 py-3 px-2.5 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-brand-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-brand-50 hover:text-brand-700"
              }`
            }>
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-100 p-3 bg-slate-50 space-y-1 flex-shrink-0">
        <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold flex-shrink-0 overflow-hidden">
            {avatarUrl
              ? <img src={avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
              : getInitials(displayName)}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-700 truncate">{displayName}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
        <Link to="/dashboard"
          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors font-medium">
          ← User Dashboard
        </Link>
        <button onClick={() => { logout(); navigate("/"); }}
          className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium">
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Desktop Sidebar - fixed position */}
      <aside className="hidden md:flex w-60 bg-white border-r border-slate-200 flex-col flex-shrink-0 fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col shadow-2xl md:hidden">
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main content — offset by sidebar on desktop */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-60">
        <header className="h-14 bg-white border-b border-slate-200 flex items-center px-3 sm:px-6 gap-3 shadow-sm flex-shrink-0 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors flex-shrink-0"
            aria-label="Open menu"
          >
            <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-slate-500">Admin Mode</span>
          </div>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <Link to="/properties" target="_blank"
              className="text-xs px-2.5 py-1.5 rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-100 font-semibold transition-colors whitespace-nowrap">
              View Site ↗
            </Link>
            <span className="hidden lg:block text-sm text-slate-400">
              Logged in as <span className="text-slate-700 font-semibold">{displayName}</span>
            </span>
          </div>
        </header>

        <main className="flex-1 p-3 sm:p-5 lg:p-6 overflow-auto min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
