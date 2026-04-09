import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import ScrollToTop from "../components/common/ScrollToTop";
import Loader from "../components/common/Loader";

// Layouts — loaded immediately (tiny, always needed)
import MainLayout   from "../layouts/MainLayout";
import AuthLayout   from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import AdminLayout  from "../layouts/AdminLayout";

// Route guards
import { ProtectedRoute, AdminRoute, GuestRoute } from "./ProtectedRoute";

// ── PUBLIC pages: lazy-loaded (split from main bundle) ──
const Home           = lazy(() => import("../pages/public/Home"));
const About          = lazy(() => import("../pages/public/About"));
const Contact        = lazy(() => import("../pages/public/Contact"));
const Help           = lazy(() => import("../pages/public/Help"));
const Listings       = lazy(() => import("../pages/public/Listings"));
const PropertyDetails= lazy(() => import("../pages/public/PropertyDetails"));
const Search         = lazy(() => import("../pages/public/Search"));
const UserProfile    = lazy(() => import("../pages/public/UserProfile"));

// ── AUTH pages: lazy-loaded ──
const Login    = lazy(() => import("../pages/auth/Login"));
const Register = lazy(() => import("../pages/auth/Register"));

// ── DASHBOARD pages: lazy-loaded ──
const DashboardHome    = lazy(() => import("../pages/dashboard/DashboardHome"));
const ProfilePage      = lazy(() => import("../pages/dashboard/ProfilePage"));
const MyPosts          = lazy(() => import("../pages/dashboard/MyPosts"));
const CreatePost       = lazy(() => import("../pages/dashboard/CreatePost"));
const EditPost         = lazy(() => import("../pages/dashboard/EditPost"));
const SavedProperties  = lazy(() => import("../pages/dashboard/SavedProperties"));
const Messages         = lazy(() => import("../pages/dashboard/Messages"));

// ── ADMIN pages: lazy-loaded into their own chunk ──
const AdminDashboard   = lazy(() => import("../pages/admin/AdminDashboard"));
const ReportsPage      = lazy(() => import("../pages/admin/ReportsPage"));
const ReportDetails    = lazy(() => import("../pages/admin/ReportDetails"));
const AdminPostsPage   = lazy(() => import("../pages/admin/AdminPostsPage"));
const AdminUsersPage   = lazy(() => import("../pages/admin/AdminUsersPage"));
const AdminCommentsPage= lazy(() => import("../pages/admin/AdminCommentsPage"));

// 404
const NotFound = lazy(() => import("../pages/NotFound"));

// Suspense fallback: the existing Loader component
const PageLoader = () => (
  <div className="flex-1 flex items-center justify-center min-h-[40vh]">
    <Loader />
  </div>
);

export default function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>

          {/* ── Public Routes ── */}
          <Route element={<MainLayout />}>
            <Route path="/"             element={<Home />} />
            <Route path="/about"        element={<About />} />
            <Route path="/contact"      element={<Contact />} />
            <Route path="/help"         element={<Help />} />
            <Route path="/properties"   element={<Listings />} />
            <Route path="/properties/:id" element={<PropertyDetails />} />
            <Route path="/search"       element={<Search />} />
            <Route path="/users/:userId" element={<UserProfile />} />
          </Route>

          {/* ── Auth Routes (guest only) ── */}
          <Route element={<AuthLayout />}>
            <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
          </Route>

          {/* ── Dashboard Routes (auth required) ── */}
          <Route
            path="/dashboard"
            element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}
          >
            <Route index          element={<DashboardHome />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="posts"   element={<MyPosts />} />
            <Route path="posts/create"     element={<CreatePost />} />
            <Route path="posts/:id/edit"   element={<EditPost />} />
            <Route path="saved"    element={<SavedProperties />} />
            <Route path="messages" element={<Messages />} />
          </Route>

          {/* ── Admin Routes (admin only) ── */}
          <Route
            path="/admin"
            element={<AdminRoute><AdminLayout /></AdminRoute>}
          >
            <Route index             element={<AdminDashboard />} />
            <Route path="reports"    element={<ReportsPage />} />
            <Route path="reports/:id" element={<ReportDetails />} />
            <Route path="posts"      element={<AdminPostsPage />} />
            <Route path="users"      element={<AdminUsersPage />} />
            <Route path="comments"   element={<AdminCommentsPage />} />
          </Route>

          {/* ── 404 ── */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
