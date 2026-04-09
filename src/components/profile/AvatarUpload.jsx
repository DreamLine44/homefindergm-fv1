import { useState } from "react";
import { uploadAvatar, deleteAvatar } from "../../api/profileApi";
import { useAuth } from "../../auth/AuthContext";
import { getInitials } from "../../utils/helpers";

export default function AvatarUpload({ profile, onUpdate, onBeforeUpload }) {
  const { updateUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [deleting,  setDeleting]  = useState(false);
  const [error,     setError]     = useState("");

  // Resolve avatar URL from either a string or an object with .url
  const resolveUrl = (avatar) => {
    if (!avatar) return null;
    if (typeof avatar === "string") return avatar;
    if (typeof avatar === "object" && avatar.url) return avatar.url;
    return null;
  };

  const avatarUrl = resolveUrl(profile?.avatar);

  const name = profile?.firstName
    ? `${profile.firstName} ${profile.lastName || ""}`.trim()
    : "";

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = "";
    setUploading(true);
    setError("");
    try {
      if (onBeforeUpload) await onBeforeUpload();
      const fd = new FormData();
      fd.append("avatar", file);
      const res = await uploadAvatar(fd);
      const updated = res.data?.data || res.data?.profile || res.data;
      onUpdate(updated);
      // Store resolved URL string in auth context so navbar shows it immediately
      const newAvatarUrl = resolveUrl(updated?.avatar);
      updateUser({ avatar: newAvatarUrl });
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Remove your profile photo?")) return;
    setDeleting(true);
    setError("");
    try {
      await deleteAvatar();
      onUpdate({ ...profile, avatar: null });
      updateUser({ avatar: null });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove photo.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-6">
      {/* Avatar preview */}
      <div className="relative flex-shrink-0">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-24 h-24 rounded-full object-cover ring-4 ring-brand-100"
            onError={(e) => { e.target.style.display = "none"; }}
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-2xl font-bold select-none">
            {getInitials(name) || "?"}
          </div>
        )}
        {(uploading || deleting) && (
          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
            <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="space-y-2">
        <div className="flex gap-2 flex-wrap">
          <label className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-stone-300 text-sm font-medium text-stone-800 bg-white hover:bg-stone-50 transition-colors ${uploading ? "opacity-50 pointer-events-none" : "cursor-pointer"}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            {uploading ? "Uploading…" : "Upload Photo"}
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
          {avatarUrl && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-3 py-1.5 rounded border border-stone-200 text-sm text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors disabled:opacity-50"
            >
              {deleting ? "Removing…" : "Remove"}
            </button>
          )}
        </div>
        <p className="text-xs text-stone-400">JPG, PNG or WEBP. Max 5MB.</p>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
}
