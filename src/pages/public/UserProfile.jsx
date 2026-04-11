// ============================================================
// src/pages/public/UserProfile.jsx
// Public profile — route: /users/:userId
// Backend: GET /api/profile/:userId → { msg, user, profile, posts }
// ============================================================

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { getPublicProfile } from "../../api/profileApi";
import { createReport } from "../../api/reportApi";
import { getInitials, formatPrice, timeAgo } from "../../utils/helpers";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import Modal from "../../components/common/Modal";

const REPORT_REASONS = ["Spam", "Fake Profile", "Inappropriate Content", "Scam", "Other"];

// Safely get avatar URL from {url, publicId} object or plain string
const avatarSrc = (avatar) => avatar?.url || (typeof avatar === "string" ? avatar : null);

export default function UserProfile() {
  const { userId } = useParams();
  const { user }   = useAuth();

  const [profileData, setProfileData] = useState(null); // { user, profile, posts }
  const [loading,     setLoading]     = useState(true);
  const [notFound,    setNotFound]    = useState(false);

  // Report modal
  const [reportOpen, setReportOpen] = useState(false);
  const [reportForm, setReportForm] = useState({ reason: "Spam", details: "" });
  const [reporting,  setReporting]  = useState(false);

  const myId     = user?._id || user?.id;
  const isMyself = myId && String(myId) === String(userId);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    // Single call — backend returns user + profile + posts all together
    getPublicProfile(userId)
      .then((res) => {
        // Backend: { msg, user, profile, posts }
        const data = res.data;
        const profile = data?.profile;
        const authUser = data?.user;
        const posts    = data?.posts || [];

        // Require at least a user record to show the page
        if (!authUser && !profile) {
          setNotFound(true);
          return;
        }
        setProfileData({ user: authUser, profile, posts });
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleReport = async () => {
    if (!reportForm.details.trim()) { alert("Please describe the issue."); return; }
    setReporting(true);
    try {
      await createReport({
        targetId:   userId,
        targetType: "profile",
        reason:     reportForm.reason,
        details:    reportForm.details,
      });
      setReportOpen(false);
      setReportForm({ reason: "Spam", details: "" });
      alert("Report submitted. Thank you.");
    } catch (e) {
      alert(e.response?.data?.message || "Failed to submit report.");
    } finally { setReporting(false); }
  };

  if (loading) return <Loader />;

  if (notFound) return (
    <div className="max-w-2xl mx-auto px-4 py-12 sm:py-20 text-center">
      <div className="text-4xl sm:text-5xl mb-4">👤</div>
      <h2 className="font-display text-2xl font-bold text-stone-900 mb-2">Profile not found</h2>
      <p className="text-stone-500 mb-6">This user hasn't set up their profile yet.</p>
      <Link to="/properties"><Button variant="outline">Browse Listings</Button></Link>
    </div>
  );

  const { user: ownerUser, profile, posts } = profileData;

  // Build display name: profile fields > user signup fields > email prefix
  const displayName =
    profile?.firstName
      ? `${profile.firstName} ${profile.lastName || ""}`.trim()
      : ownerUser?.firstName
      ? `${ownerUser.firstName} ${ownerUser.lastName || ""}`.trim()
      : profile?.username || ownerUser?.username
      || ownerUser?.email?.split("@")[0]
      || "User";

  const avatarUrl = avatarSrc(profile?.avatar) || avatarSrc(ownerUser?.avatar);
  const phone     = profile?.phone;
  const whatsapp  = profile?.whatsapp || profile?.phone;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-10">

      {/* ── Profile header ── */}
      <div className="bg-white rounded-2xl border border-stone-100 p-6 md:p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">

          {/* Avatar */}
          <div className="flex-shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-brand-100"
                onError={(e) => { e.target.style.display = "none"; }}
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-3xl font-bold select-none">
                {getInitials(displayName)}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-2xl font-bold text-stone-900">{displayName}</h1>

            {(profile?.username || ownerUser?.username) && (
              <p className="text-stone-500 text-sm mt-0.5">
                @{profile?.username || ownerUser?.username}
              </p>
            )}

            {profile?.location && (
              <p className="text-stone-500 text-sm mt-1">📍 {profile.location}</p>
            )}

            {profile?.bio && (
              <p className="text-stone-600 mt-3 text-sm leading-relaxed max-w-xl">{profile.bio}</p>
            )}

            {/* Contact buttons */}
            <div className="flex flex-wrap gap-2 mt-4">
              {phone && (
                <a
                  href={`tel:${phone}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-700 border border-brand-200 rounded-lg text-sm font-medium hover:bg-brand-100 transition-colors"
                >
                  📞 Call
                </a>
              )}
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
                >
                  💬 WhatsApp
                </a>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 flex-shrink-0">
            {isMyself ? (
              <Link to="/dashboard/profile">
                <Button variant="outline" size="sm">Edit Profile</Button>
              </Link>
            ) : user && (
              <button
                onClick={() => setReportOpen(true)}
                className="text-xs text-stone-400 hover:text-red-500 transition-colors"
              >
                🚩 Report Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Listings ── */}
      <div>
        <h2 className="font-display text-xl font-bold text-stone-900 mb-4">
          Listings
          <span className="ml-2 text-stone-400 font-normal text-base">({posts.length})</span>
        </h2>

        {posts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-100 p-10 text-center">
            <div className="text-4xl mb-3">🏠</div>
            <p className="text-stone-500 text-sm">No listings yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
            {posts.map((post) => {
              const img = post.images?.[0]?.url;
              return (
                <Link
                  key={post._id}
                  to={`/properties/${post._id}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-stone-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
                >
                  <div className="h-48 overflow-hidden bg-stone-100 flex-shrink-0">
                    {img ? (
                      <img
                        src={img}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-300 text-4xl">🏠</div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <div className="mb-1.5"><Badge variant="brand">{post.type}</Badge></div>
                    <h3 className="font-semibold text-stone-900 leading-tight line-clamp-1 group-hover:text-brand-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-xs text-stone-500 mt-1">📍 {post.location}</p>
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-stone-100 mt-3">
                      <span className="font-bold text-brand-600">{formatPrice(post.price)}</span>
                      <span className="text-xs text-stone-400">{timeAgo(post.createdAt)}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Report Modal */}
      <Modal isOpen={reportOpen} onClose={() => setReportOpen(false)} title="Report Profile">
        <div className="space-y-4">
          <p className="text-sm text-stone-600">
            Please describe why you're reporting this profile. Our team will review it.
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
              placeholder="Describe the issue…"
              className="px-3 py-2.5 rounded border border-stone-300 text-sm outline-none resize-none"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleReport} loading={reporting} className="flex-1">Submit Report</Button>
            <Button variant="outline" onClick={() => setReportOpen(false)} className="flex-1">Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
