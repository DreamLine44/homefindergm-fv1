import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getProfile, createProfile, updateProfile,
  deleteProfile, uploadAvatar, deleteAvatar,
} from "../../api/profileApi";
import { useAuth } from "../../auth/AuthContext";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import { getInitials } from "../../utils/helpers";
import { checkUsernameAvailability } from "../../api/profileApi";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [profile,       setProfile]       = useState(null);
  const [exists,        setExists]        = useState(false);
  const [loading,       setLoading]       = useState(true);
  const [saving,        setSaving]        = useState(false);
  const [deleting,      setDeleting]      = useState(false);
  const [uploading,     setUploading]     = useState(false);
  const [success,       setSuccess]       = useState(false);
  const [error,         setError]         = useState("");
  const [editing,       setEditing]       = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [checkingUser,  setCheckingUser]  = useState(false);
  const debounceRef = useRef(null);

  // Track the originally-saved username so we don't flag it as "taken" for the same user
  const savedUsernameRef = useRef("");

  const [form, setForm] = useState({
    firstName: "", lastName: "", username: "",
    phone: "", whatsapp: "", location: "", bio: "",
  });

  useEffect(() => {
    getProfile()
      .then((r) => {
        const p = r.data?.data || r.data?.profile || r.data;
        if (p && p._id) {
          setProfile(p);
          setExists(true);
          savedUsernameRef.current = p.username || "";
          setForm({
            firstName: p.firstName || user?.firstName || "",
            lastName:  p.lastName  || user?.lastName  || "",
            username:  p.username  || "",
            phone:     p.phone     || "",
            whatsapp:  p.whatsapp  || "",
            location:  p.location  || "",
            bio:       p.bio       || "",
          });
        } else {
          // BUG FIX #1: Profile doesn't exist yet — pre-fill from sign-up data
          setExists(false);
          setEditing(true);
          setForm({
            firstName: user?.firstName || "",
            lastName:  user?.lastName  || "",
            username:  "",
            phone:     "",
            whatsapp:  "",
            location:  "",
            bio:       "",
          });
        }
      })
      .catch(() => {
        setExists(false);
        setEditing(true);
        // BUG FIX #1: Always seed from auth user on error too
        setForm({
          firstName: user?.firstName || "",
          lastName:  user?.lastName  || "",
          username:  "",
          phone:     "",
          whatsapp:  "",
          location:  "",
          bio:       "",
        });
      })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // BUG FIX #4: Only check if the field has actual content AND it differs from the user's own saved username
  const checkUsername = useCallback((value) => {
    clearTimeout(debounceRef.current);
    setUsernameError("");

    const trimmed = value.trim();
    // Don't validate: empty field, or same as their own current username
    if (!trimmed || trimmed === savedUsernameRef.current) return;

    setCheckingUser(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await checkUsernameAvailability(trimmed);
        if (res.data?.taken) setUsernameError("Username is already taken");
      } catch {
        // silently ignore — server will catch on save
      } finally {
        setCheckingUser(false);
      }
    }, 500);
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.firstName.trim()) { setError("First name is required."); return; }
    if (!form.lastName.trim())  { setError("Last name is required.");  return; }
    if (usernameError)          { setError("Please fix the username error before saving."); return; }

    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      let res;
      if (exists) {
        res = await updateProfile(form);
      } else {
        res = await createProfile(form);
        setExists(true);
      }
      const updated = res.data?.data || res.data?.profile || res.data;
      savedUsernameRef.current = updated.username || "";
      setProfile((prev) => ({ ...(prev || {}), ...updated }));
      updateUser({
        firstName: updated.firstName,
        lastName:  updated.lastName,
        username:  updated.username || null,
        profileId: updated._id,
      });
      setUsernameError("");
      setSuccess(true);
      setEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const msg      = err.response?.data?.message || err.response?.data?.msg || "";
      const rawError = err.response?.data?.error   || "";
      const errCode  = err.response?.data?.code;
      const keyPat   = err.response?.data?.keyPattern;
      const isUsernameDupe =
        msg.toLowerCase().includes("username")     ||
        rawError.toLowerCase().includes("username") ||
        rawError.includes("E11000")                ||
        errCode === 11000                          ||
        keyPat?.username;

      if (isUsernameDupe) {
        setUsernameError("Username is already taken");
        setError("Username is already taken. Please choose a different one.");
      } else {
        setError(msg || rawError || "Failed to save profile.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete your profile permanently? This cannot be undone.")) return;
    setDeleting(true);
    setError("");
    try {
      await deleteProfile();
      updateUser({ profile: null, avatar: null, profileId: null });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete profile.");
    } finally {
      setDeleting(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = "";

    if (!exists) {
      try {
        const res = await createProfile({
          firstName: form.firstName || user?.firstName || "User",
          lastName:  form.lastName  || user?.lastName  || "",
        });
        const created = res.data?.data || res.data?.profile || res.data;
        setProfile(created);
        setExists(true);
      } catch {
        setError("Please save your profile first before uploading a photo.");
        return;
      }
    }

    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("avatar", file);
      const res = await uploadAvatar(fd);
      const updated   = res.data?.data || res.data?.profile || res.data;
      const avatarUrl = typeof updated?.avatar === "string"
        ? updated.avatar
        : updated?.avatar?.url || null;
      setProfile((prev) => ({ ...(prev || {}), avatar: avatarUrl }));
      updateUser({ avatar: avatarUrl });
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarDelete = async () => {
    if (!window.confirm("Remove your profile photo?")) return;
    setUploading(true);
    setError("");
    try {
      await deleteAvatar();
      setProfile((prev) => ({ ...(prev || {}), avatar: null }));
      updateUser({ avatar: null });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove photo.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <Loader />;

  const avatarUrl = typeof profile?.avatar === "string"
    ? profile.avatar
    : profile?.avatar?.url || null;

  const displayName = (profile?.firstName || form.firstName)
    ? `${profile?.firstName || form.firstName} ${profile?.lastName || form.lastName || ""}`.trim()
    : user?.email || "User";

  // Username field — only shows error when user has actually typed something different from their own username
  const UsernameField = ({ currentSaved }) => (
    <div className="flex flex-col gap-1">
      <Input
        label="Username"
        value={form.username}
        onChange={(e) => {
          set("username", e.target.value);
          checkUsername(e.target.value);
        }}
        placeholder="e.g. dreamline01"
      />
      {checkingUser  && <p className="text-xs text-stone-400 mt-0.5">Checking availability…</p>}
      {usernameError && <p className="text-xs text-red-500 mt-0.5 font-medium flex items-center gap-1"><span>⚠</span>{usernameError}</p>}
    </div>
  );

  return (
    <div className="max-w-2xl space-y-6 animate-fade-up">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-900 mb-1">
          {exists ? "My Profile" : "Create Your Profile"}
        </h1>
        <p className="text-stone-500 text-sm sm:text-base">
          {exists
            ? "Your public profile and account details"
            : "You haven't created a profile yet. Fill in your details to get started."}
        </p>
      </div>

      {success && (
        <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
          ✓ Profile saved successfully
        </div>
      )}
      {/* BUG FIX: Only show ONE error location — the banner below, not both banner and inline */}
      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ── VIEW CARD ── */}
      {exists && !editing && profile && (
        <div className="bg-white rounded-2xl border border-stone-100 p-4 sm:p-6">
          {/* BUG FIX #2: Avatar is independently clickable/editable at all times */}
          <div className="flex flex-col sm:flex-row items-start gap-5">
            {/* Avatar column */}
            <div className="flex flex-col items-center gap-3 w-full sm:w-auto">
              {/* Clickable avatar — clicking triggers upload */}
              <label className={`relative cursor-pointer group ${uploading ? "pointer-events-none" : ""}`}>
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full object-cover ring-4 ring-brand-100 group-hover:brightness-90 transition-all"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-2xl font-bold select-none group-hover:brightness-90 transition-all">
                    {getInitials(displayName)}
                  </div>
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                  <span className="text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-all">Edit</span>
                </div>
                {uploading && (
                  <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                    <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </div>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
              </label>
              <div className="flex gap-2">
                <label className={`text-xs px-2.5 py-1.5 rounded border border-stone-300 text-stone-700 bg-white hover:bg-stone-50 transition-colors ${uploading ? "opacity-50 pointer-events-none" : "cursor-pointer"}`}>
                  Upload Photo
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
                </label>
                {avatarUrl && (
                  <button
                    onClick={handleAvatarDelete}
                    disabled={uploading}
                    className="text-xs px-2.5 py-1.5 rounded border border-stone-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="text-xs text-stone-400 text-center">JPG, PNG or WEBP</p>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-xl font-bold text-stone-900">{displayName}</h2>
              {profile.username && <p className="text-sm text-brand-600">@{profile.username}</p>}
              <p className="text-sm text-stone-500 mt-0.5">{user?.email}</p>
              {profile.location && <p className="text-sm text-stone-500 mt-2">📍 {profile.location}</p>}
              {profile.phone    && <p className="text-sm text-stone-500">📞 {profile.phone}</p>}
              {profile.whatsapp && <p className="text-sm text-stone-500">💬 {profile.whatsapp}</p>}
              {profile.bio      && <p className="text-sm text-stone-600 mt-3 leading-relaxed">{profile.bio}</p>}
            </div>
          </div>

          <div className="mt-5 pt-5 border-t border-stone-100 flex gap-3 items-center">
            <Button onClick={() => { setEditing(true); setUsernameError(""); setError(""); }} variant="outline">
              Edit Profile
            </Button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-sm text-red-400 hover:text-red-600 transition-colors disabled:opacity-50 ml-auto"
            >
              {deleting ? "Deleting…" : "Delete Profile"}
            </button>
          </div>
        </div>
      )}

      {/* ── CREATE FORM ── */}
      {!exists && (
        <div className="bg-white rounded-2xl border border-stone-100 p-4 sm:p-6">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-stone-100">
            <div className="relative flex-shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover ring-4 ring-brand-100" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xl font-bold select-none">
                  {getInitials(form.firstName ? `${form.firstName} ${form.lastName}` : (user?.email || ""))}
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
              )}
            </div>
            <div>
              <label className={`inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded border border-stone-300 text-stone-700 bg-white hover:bg-stone-50 transition-colors ${uploading ? "opacity-50 pointer-events-none" : "cursor-pointer"}`}>
                Upload Photo
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
              </label>
              <p className="text-xs text-stone-400 mt-1">Optional — you can add this later</p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-stone-900">Personal Information</h2>
          </div>

          {(user?.firstName || user?.email) && (
            <div className="mb-4 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700">
              👋 Your name and email from sign-up are pre-filled below.
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            {/* Responsive: stack on mobile, side-by-side on sm+ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="First Name *" value={form.firstName} onChange={(e) => set("firstName", e.target.value)} placeholder="Hassan" />
              <Input label="Last Name *"  value={form.lastName}  onChange={(e) => set("lastName", e.target.value)}  placeholder="Trawally" />
            </div>
            <UsernameField currentSaved={profile?.username} />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-stone-700">Email Address</label>
              <input value={user?.email || ""} disabled className="px-3 py-2.5 rounded border border-stone-200 text-sm bg-stone-50 text-stone-400 cursor-not-allowed" />
              <p className="text-xs text-stone-400">Email cannot be changed</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Phone"    value={form.phone}    onChange={(e) => set("phone", e.target.value)}    placeholder="2207000000" />
              <Input label="WhatsApp" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="2207000000" />
            </div>
            <Input label="Location" value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Busumbala" />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-stone-700">Bio</label>
              <textarea value={form.bio} onChange={(e) => set("bio", e.target.value)} rows={3} placeholder="Tell us a little about yourself…" className="px-3 py-2.5 rounded border border-stone-300 text-sm outline-none resize-none focus:border-brand-500 focus:ring-1 focus:ring-brand-400" />
            </div>
            <div className="pt-2">
              <Button type="submit" loading={saving} className="w-full sm:w-auto">Create Profile</Button>
            </div>
          </form>
        </div>
      )}

      {/* ── EDIT FORM ── */}
      {exists && editing && (
        <div className="bg-white rounded-2xl border border-stone-100 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-stone-900">Edit Information</h2>
            <button
              onClick={() => { setEditing(false); setError(""); setUsernameError(""); }}
              className="text-sm text-stone-400 hover:text-stone-600 transition-colors"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="First Name *" value={form.firstName} onChange={(e) => set("firstName", e.target.value)} placeholder="Hassan" />
              <Input label="Last Name *"  value={form.lastName}  onChange={(e) => set("lastName", e.target.value)}  placeholder="Trawally" />
            </div>
            <UsernameField currentSaved={profile?.username} />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-stone-700">Email Address</label>
              <input value={user?.email || ""} disabled className="px-3 py-2.5 rounded border border-stone-200 text-sm bg-stone-50 text-stone-400 cursor-not-allowed" />
              <p className="text-xs text-stone-400">Email cannot be changed</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Phone"    value={form.phone}    onChange={(e) => set("phone", e.target.value)}    placeholder="2207000000" />
              <Input label="WhatsApp" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="2207000000" />
            </div>
            <Input label="Location" value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Busumbala" />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-stone-700">Bio</label>
              <textarea value={form.bio} onChange={(e) => set("bio", e.target.value)} rows={3} placeholder="Tell us a little about yourself…" className="px-3 py-2.5 rounded border border-stone-300 text-sm outline-none resize-none focus:border-brand-500 focus:ring-1 focus:ring-brand-400" />
            </div>
            <div className="pt-2">
              <Button type="submit" loading={saving} className="w-full sm:w-auto">Save Changes</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
