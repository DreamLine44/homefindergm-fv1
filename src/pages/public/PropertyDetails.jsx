import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getPost, deletePost } from "../../api/postApi";
import { getPublicProfile } from "../../api/profileApi";
import { useAuth } from "../../auth/useAuth";
import ImageGallery from "../../components/posts/ImageGallery";
import CommentList from "../../components/comments/CommentList";
import { formatPrice, formatDate, getInitials } from "../../utils/helpers";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import Modal from "../../components/common/Modal";
import { createReport } from "../../api/reportApi";

const REPORT_REASONS = ["Spam", "Fake Listing", "Inappropriate Content", "Scam", "Other"];

export default function PropertyDetails() {
  const { id }      = useParams();
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const [post, setPost]             = useState(null);
  const [authorProfile, setAuthorProfile] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportForm, setReportForm] = useState({ reason: "Spam", details: "" });
  const [reporting, setReporting]   = useState(false);

  useEffect(() => {
    // Scroll to top immediately and again after data settles
    window.scrollTo({ top: 0, behavior: "instant" });
    getPost(id)
      .then((r) => {
        const data = r.data?.data || r.data?.post || r.data;
        setPost(data);
        // Fetch public profile to get real name + avatar
        // New backend: GET /api/profile/:userId → { msg, user, profile, posts }
        const aid = data?.author?._id
          || (typeof data?.author === "string" ? data.author : null)
          || data?.userId?._id
          || data?.userId;
        if (aid) {
          getPublicProfile(aid)
            .then((pr) => {
              // New response: { user, profile, posts }
              const p = pr.data?.profile || pr.data?.data || pr.data;
              const u = pr.data?.user;
              // Merge profile + user so we always get firstName regardless of which has it
              if (p && p._id) {
                setAuthorProfile({ ...u, ...p });
              } else if (u) {
                setAuthorProfile(u);
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => navigate("/properties"))
      .finally(() => {
        setLoading(false);
        // Second scroll after content renders — ensures we're truly at top
        requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "instant" }));
      });
  }, [id]);

  if (loading) return <Loader />;
  if (!post)   return null;

  // Backend populates post.userId as the full user object.
  // post.author may also be set depending on the backend version — check both.
  const authorObj = (post.userId && typeof post.userId === "object" ? post.userId : null)
    || post.author || {};

  const authorId = authorObj?._id || post.userId || post.author;
  const userId   = user?._id || user?.id;
  const isOwner  = user && String(userId) === String(authorId);

  const handleDelete = async () => {
    if (!window.confirm("Delete this listing permanently?")) return;
    try { await deletePost(id); navigate("/properties"); }
    catch(e) { alert("Failed to delete listing."); }
  };

  const handleReport = async () => {
    if (!reportForm.details.trim()) {
      alert("Please describe the issue.");
      return;
    }
    setReporting(true);
    try {
      await createReport({
        targetId:   id,
        targetType: "post",
        reason:     reportForm.reason,
        details:    reportForm.details,
      });
      setReportOpen(false);
      setReportForm({ reason: "Spam", details: "" });
      alert("Report submitted. Thank you.");
    } catch(e) {
      alert(e.response?.data?.message || "Failed to submit report.");
    } finally { setReporting(false); }
  };

  const features = typeof post.features === "string"
    ? post.features.split(",").map((f) => f.trim()).filter(Boolean)
    : post.features || [];

  // Build author display name: public profile > populated userId > fallback
  const authorName = authorProfile?.firstName
    ? `${authorProfile.firstName} ${authorProfile.lastName || ""}`.trim()
    : authorObj?.firstName
    ? `${authorObj.firstName} ${authorObj.lastName || ""}`.trim()
    : authorProfile?.username || authorObj?.username
    || authorObj?.email?.split("@")[0]
    || "Owner";

  const authorAvatarUrl =
    (typeof authorProfile?.avatar === "string" ? authorProfile.avatar : authorProfile?.avatar?.url) ||
    (typeof authorObj?.avatar === "string" ? authorObj.avatar : authorObj?.avatar?.url) ||
    null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8">

      {/* ── Back navigation ── */}
      <div className="mb-6">
        {isOwner ? (
          <Link
            to="/dashboard/posts"
            className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-brand-600 transition-colors font-medium"
          >
            ← Back to My Listings
          </Link>
        ) : (
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-brand-600 transition-colors font-medium"
          >
            ← Back to Properties
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">

        {/* ── Main content ── */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          <ImageGallery images={post.images} />

          <div>
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-start sm:justify-between gap-3 mb-4">
              <div className="min-w-0">
                <Badge variant="brand" className="mb-2">{post.type}</Badge>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-900 break-words">{post.title}</h1>
                <p className="text-stone-500 flex items-center gap-1 mt-1 text-sm sm:text-base">
                  📍 {post.location}{post.addressDetails ? ` · ${post.addressDetails}` : ""}
                </p>
              </div>
              <div className="sm:text-right">
                <div className="font-display text-2xl sm:text-3xl font-bold text-brand-600 break-all">
                  {formatPrice(post.price)}
                </div>
                <div className="mt-1">
                  <Badge variant={post.status === "Available" ? "success" : "default"}>
                    {post.status || "Available"}
                  </Badge>
                </div>
                <div className="text-sm text-stone-400 mt-1">
                  Listed {formatDate(post.createdAt)}
                </div>
              </div>
            </div>

            <p className="text-stone-600 leading-relaxed">{post.description}</p>

            {features.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-stone-900 mb-3">Features</h3>
                <div className="flex flex-wrap gap-2">
                  {features.map((f) => <Badge key={f}>{f}</Badge>)}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-stone-100 pt-8">
            <CommentList postId={id} />
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div>
          <div className="bg-white rounded-2xl border border-stone-100 p-5 sticky top-24 space-y-4">

            {/* Listed by {name} */}
            <h3 className="font-semibold text-stone-900">
              Listed by {authorName}
            </h3>

            {/* Avatar + name row — clickable to public profile */}
            <Link to={`/users/${authorId}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold overflow-hidden flex-shrink-0">
                {authorAvatarUrl
                  ? <img src={authorAvatarUrl} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
                  : getInitials(authorName)}
              </div>
              <div>
                <div className="font-medium text-stone-900">{authorName}</div>
                <div className="text-sm text-brand-600 hover:underline">View Profile →</div>
              </div>
            </Link>

            {/* Clickable phone — opens dialler */}
            {post.contactPhone && (
              <a href={`tel:${post.contactPhone}`}
                className="flex items-center gap-2 text-sm text-stone-600 hover:text-brand-600 transition-colors">
                📞 {post.contactPhone}
              </a>
            )}

            {/* WhatsApp — if phone available, open WhatsApp chat */}
            {post.contactPhone && (
              <a href={`https://wa.me/${post.contactPhone.replace(/\D/g, "")}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 transition-colors">
                💬 Chat on WhatsApp
              </a>
            )}

            {isOwner ? (
              <div className="space-y-2 pt-2">
                <Link to={`/dashboard/posts/${id}/edit`} className="block">
                  <Button className="w-full" variant="outline">Edit Listing</Button>
                </Link>
                <Button className="w-full" variant="danger" onClick={handleDelete}>
                  Delete Listing
                </Button>
              </div>
            ) : (
              <div className="space-y-2 pt-2">
                <a href={`tel:${post.contactPhone || ""}`}
                  className="block w-full py-3 px-4 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors text-center">
                  Contact Owner
                </a>
                {/* Only non-owners who are logged in can report */}
                {user && (
                  <button onClick={() => setReportOpen(true)}
                    className="w-full py-2 text-sm text-stone-400 hover:text-red-600 transition-colors">
                    🚩 Report this listing
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Modal */}
      <Modal isOpen={reportOpen} onClose={() => setReportOpen(false)} title="Report Listing">
        <div className="space-y-4">
          <p className="text-sm text-stone-600">
            Please describe why you're reporting this listing. Our team will review it.
          </p>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-stone-700">Reason</label>
            <select
              value={reportForm.reason}
              onChange={(e) => setReportForm((f) => ({ ...f, reason: e.target.value }))}
              className="px-3 py-2.5 rounded border border-stone-300 text-sm outline-none bg-white"
            >
              {REPORT_REASONS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-stone-700">Details</label>
            <textarea
              value={reportForm.details}
              onChange={(e) => setReportForm((f) => ({ ...f, details: e.target.value }))}
              rows={4}
              placeholder="e.g. This post contains fake rental listings."
              className="px-3 py-2.5 rounded border border-stone-300 text-sm outline-none resize-none"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleReport} loading={reporting} className="flex-1">
              Submit Report
            </Button>
            <Button variant="outline" onClick={() => setReportOpen(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
