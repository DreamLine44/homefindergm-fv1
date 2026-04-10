import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getProfile, createProfile, updateProfile,
  deleteProfile, uploadAvatar, deleteAvatar,
  checkUsernameAvailability,
} from "../../api/profileApi";
import { useAuth } from "../../auth/useAuth";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import { getInitials } from "../../utils/helpers";

/* ─────────────────────────────────────────────
   UsernameField — extracted OUTSIDE render so
   React never unmounts it unexpectedly
───────────────────────────────────────────── */
function UsernameField({ value, onChange, checking, error }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-stone-700">
        Username
        <span className="ml-1 text-stone-400 font-normal text-xs">(optional)</span>
      </label>
      <input
        value={value}
        onChange={onChange}
        placeholder="Choose your own username"
        autoComplete="off"
        spellCheck={false}
        className={`px-3 py-2.5 rounded border text-sm transition-colors outline-none bg-white
          ${error
            ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-300"
            : "border-stone-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-300"
          }`}
      />
      <p className="text-xs text-stone-400">
        This is how others will find and mention you. You can change it anytime.
      </p>
      {checking && (
        <p className="text-xs text-stone-400 flex items-center gap-1">
          <span className="inline-block w-3 h-3 border border-stone-400 border-t-transparent rounded-full animate-spin" />
          Checking availability…
        </p>
      )}
      {error && (
        <p className="text-xs text-red-500 font-medium flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Avatar spinner helper
───────────────────────────────────────────── */
function AvatarSpinner() {
  return (
    <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────
   FormBody — MUST live outside ProfilePage so
   its identity is stable across re-renders.
   If defined inside ProfilePage, React treats
   it as a new component type on every render,
   causing full unmount → input focus lost on
   every keystroke.
───────────────────────────────────────────── */
function FormBody({
  form, set, user,
  handleUsernameChange, checkingUser, usernameError,
  handleSave, saving, exists,
  onCancel,
  submitLabel,
}) {
  return (
    <form onSubmit={handleSave} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="First Name *"
          value={form.firstName}
          onChange={(e) => set("firstName", e.target.value)}
          placeholder="Your first name"
        />
        <Input
          label="Last Name *"
          value={form.lastName}
          onChange={(e) => set("lastName", e.target.value)}
          placeholder="Your last name"
        />
      </div>

      <UsernameField
        value={form.username}
        onChange={handleUsernameChange}
        checking={checkingUser}
        error={usernameError}
      />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-stone-700">Email Address</label>
        <input
          value={user?.email || ""}
          disabled
          className="px-3 py-2.5 rounded border border-stone-200 text-sm bg-stone-50 text-stone-400 cursor-not-allowed"
        />
        <p className="text-xs text-stone-400">Email cannot be changed</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Phone"    value={form.phone}    onChange={(e) => set("phone", e.target.value)}    placeholder="e.g. 2207000000" />
        <Input label="WhatsApp" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="e.g. 2207000000" />
      </div>

      <Input label="Location" value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="e.g. Busumbala, Gambia" />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-stone-700">Bio</label>
        <textarea
          value={form.bio}
          onChange={(e) => set("bio", e.target.value)}
          rows={3}
          placeholder="Tell others a little about yourself…"
          className="px-3 py-2.5 rounded border border-stone-300 text-sm outline-none resize-none focus:border-brand-500 focus:ring-1 focus:ring-brand-300"
        />
      </div>

      <div className="pt-2 flex flex-col sm:flex-row gap-3">
        <Button type="submit" loading={saving}>{submitLabel}</Button>
        {exists && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-stone-500 hover:text-stone-700 transition-colors px-4 py-2 rounded-xl border border-stone-200 hover:bg-stone-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
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

  const debounceRef      = useRef(null);
  const savedUsernameRef = useRef("");

  // Stable empty form — reads user ref once, never changes identity
  const userRef = useRef(user);
  useEffect(() => { userRef.current = user; }, [user]);

  const makeEmptyForm = useCallback(() => ({
    firstName: userRef.current?.firstName || "",
    lastName:  userRef.current?.lastName  || "",
    username:  "",
    phone:     "",
    whatsapp:  "",
    location:  "",
    bio:       "",
  }), []); // no deps — intentionally stable

  const [form, setForm] = useState(makeEmptyForm);

  /* ── Load profile on mount ── */
  useEffect(() => {
    setUsernameError("");
    getProfile()
      .then((r) => {
        const p = r.data?.data || r.data?.profile || r.data;
        if (p && p._id) {
          setProfile(p);
          setExists(true);
          savedUsernameRef.current = p.username || "";
          setForm({
            firstName: p.firstName || userRef.current?.firstName || "",
            lastName:  p.lastName  || userRef.current?.lastName  || "",
            username:  p.username  || "",
            phone:     p.phone     || "",
            whatsapp:  p.whatsapp  || "",
            location:  p.location  || "",
            bio:       p.bio       || "",
          });
        } else {
          setExists(false);
          setEditing(true);
          setForm(makeEmptyForm());
        }
      })
      .catch(() => {
        setExists(false);
        setEditing(true);
        setForm(makeEmptyForm());
      })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = useCallback((k, v) => setForm((f) => ({ ...f, [k]: v })), []);

  /* ── Username availability check ── */
  const handleUsernameChange = useCallback((e) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, username: value }));

    clearTimeout(debounceRef.current);
    setUsernameError("");
    setCheckingUser(false);

    const trimmed = value.trim();

    if (!trimmed || trimmed === savedUsernameRef.current) return;

    if (!/^[a-zA-Z0-9_.-]{3,30}$/.test(trimmed)) {
      setUsernameError("3–30 chars, letters, numbers, _ . - only");
      return;
    }

    setCheckingUser(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await checkUsernameAvailability(trimmed);
        if (res.data?.taken) setUsernameError("That username is already taken — try another");
      } catch {
        // Network error — don't block the user; server will catch on save
      } finally {
        setCheckingUser(false);
      }
    }, 600);
  }, []);

  /* ── Save profile ── */
  const handleSave = useCallback(async (e) => {
    e.preventDefault();
    setError("");

    if (!form.firstName.trim()) { setError("First name is required."); return; }
    if (!form.lastName.trim())  { setError("Last name is required.");  return; }

    if (form.username.trim() && usernameError) {
      setError("Please fix the username before saving."); return;
    }
    if (form.username.trim() && checkingUser) {
      setError("Please wait — still checking username availability."); return;
    }

    const payload = {
      ...form,
      username: form.username.trim() || undefined,
    };

    setSaving(true);
    setSuccess(false);
    try {
      const res = exists
        ? await updateProfile(payload)
        : await createProfile(payload);

      const updated = res.data?.data || res.data?.profile || res.data;
      savedUsernameRef.current = updated.username || "";
      setProfile((prev) => ({ ...(prev || {}), ...updated }));
      updateUser({
        firstName: updated.firstName,
        lastName:  updated.lastName,
        username:  updated.username || null,
        profileId: updated._id,
      });
      if (!exists) setExists(true);
      setUsernameError("");
      setSuccess(true);
      setEditing(false);
      setTimeout(() => setSuccess(false), 3500);
    } catch (err) {
      const msg      = err.response?.data?.message || err.response?.data?.msg || "";
      const rawError = err.response?.data?.error   || "";
      const errCode  = err.response?.data?.code;
      const keyPat   = err.response?.data?.keyPattern;

      const isActualDuplicate =
        errCode === 11000 ||
        rawError.includes("E11000") ||
        keyPat?.username;

      if (isActualDuplicate) {
        setUsernameError("That username is already taken — try another");
        setError("Username is already taken. Please choose a different one.");
      } else {
        setError(msg || rawError || "Failed to save profile. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, exists, usernameError, checkingUser]);

  /* ── Delete profile ── */
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

  /* ── Avatar upload ── */
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    if (!exists) {
      try {
        const res = await createProfile({
          firstName: form.firstName || userRef.current?.firstName || "User",
          lastName:  form.lastName  || userRef.current?.lastName  || "",
        });
        const created = res.data?.data || res.data?.profile || res.data;
        setProfile(created);
        setExists(true);
        savedUsernameRef.current = created.username || "";
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
      setError(err.response?.data?.message || "Upload failed. Please try a smaller image.");
    } finally {
      setUploading(false);
    }
  };

  /* ── Avatar delete ── */
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

  /* ── Start editing ── */
  const startEditing = () => {
    setEditing(true);
    setUsernameError("");
    setError("");
    setCheckingUser(false);
    clearTimeout(debounceRef.current);
  };

  const handleCancelEdit = useCallback(() => {
    setEditing(false);
    setUsernameError("");
    setError("");
  }, []);

  /* ─────────────── RENDER ─────────────── */
  if (loading) return <Loader />;

  const avatarUrl = typeof profile?.avatar === "string"
    ? profile.avatar
    : profile?.avatar?.url || null;

  const displayName = (profile?.firstName || form.firstName)
    ? `${profile?.firstName || form.firstName} ${profile?.lastName || form.lastName || ""}`.trim()
    : user?.email || "User";

  // Shared props passed down to FormBody
  const formBodyProps = {
    form, set, user,
    handleUsernameChange, checkingUser, usernameError,
    handleSave, saving, exists,
    onCancel: handleCancelEdit,
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-up">

      {/* Page heading */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-900 mb-1">
          {exists ? "My Profile" : "Create Your Profile"}
        </h1>
        <p className="text-stone-500 text-sm sm:text-base">
          {exists
            ? "Your public profile and contact details"
            : "Fill in your details to complete your account."}
        </p>
      </div>

      {/* Feedback banners */}
      {success && (
        <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-center gap-2">
          ✓ Profile saved successfully
        </div>
      )}
      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ── VIEW CARD (exists, not editing) ── */}
      {exists && !editing && profile && (
        <div className="bg-white rounded-2xl border border-stone-100 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start gap-5">

            {/* Avatar */}
            <div className="flex flex-col items-center gap-3 flex-shrink-0">
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
                <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/25 transition-all flex items-center justify-center">
                  <span className="text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-all">Change</span>
                </div>
                {uploading && <AvatarSpinner />}
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
              </label>
              <div className="flex gap-2">
                <label className={`text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 text-stone-600 bg-white hover:bg-stone-50 transition-colors ${uploading ? "opacity-50 pointer-events-none" : "cursor-pointer"}`}>
                  Upload Photo
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
                </label>
                {avatarUrl && (
                  <button
                    onClick={handleAvatarDelete}
                    disabled={uploading}
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="text-xs text-stone-400">JPG, PNG or WEBP</p>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-xl font-bold text-stone-900 break-words">{displayName}</h2>
              {profile.username && <p className="text-sm text-brand-600 mt-0.5">@{profile.username}</p>}
              <p className="text-sm text-stone-400 mt-0.5">{user?.email}</p>
              {profile.location && <p className="text-sm text-stone-500 mt-3 flex items-center gap-1.5">📍 {profile.location}</p>}
              {profile.phone    && <p className="text-sm text-stone-500 mt-1 flex items-center gap-1.5">📞 {profile.phone}</p>}
              {profile.whatsapp && <p className="text-sm text-stone-500 mt-1 flex items-center gap-1.5">💬 {profile.whatsapp}</p>}
              {profile.bio      && <p className="text-sm text-stone-600 mt-3 leading-relaxed">{profile.bio}</p>}
              {!profile.username && (
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mt-3 inline-block">
                  💡 No username set — add one so others can find you easily
                </p>
              )}
            </div>
          </div>

          <div className="mt-5 pt-5 border-t border-stone-100 flex gap-3 items-center">
            <Button onClick={startEditing} variant="outline">Edit Profile</Button>
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

      {/* ── CREATE FORM (no profile yet) ── */}
      {!exists && (
        <div className="bg-white rounded-2xl border border-stone-100 p-4 sm:p-6">

          {/* Avatar upload row */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-stone-100">
            <div className="relative flex-shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover ring-4 ring-brand-100" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xl font-bold select-none">
                  {getInitials(form.firstName ? `${form.firstName} ${form.lastName}` : (user?.email || ""))}
                </div>
              )}
              {uploading && <AvatarSpinner />}
            </div>
            <div>
              <label className={`inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-stone-200 text-stone-700 bg-white hover:bg-stone-50 transition-colors ${uploading ? "opacity-50 pointer-events-none" : "cursor-pointer"}`}>
                📷 Upload Photo
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
              </label>
              <p className="text-xs text-stone-400 mt-1.5">Optional — you can add this later</p>
            </div>
          </div>

          {(user?.firstName || user?.email) && (
            <div className="mb-4 px-4 py-3 bg-brand-50 border border-brand-100 rounded-xl text-sm text-brand-700">
              👋 Your name from sign-up is pre-filled. Fill in the rest and choose your username.
            </div>
          )}

          <FormBody {...formBodyProps} submitLabel="Create Profile" />
        </div>
      )}

      {/* ── EDIT FORM ── */}
      {exists && editing && (
        <div className="bg-white rounded-2xl border border-stone-100 p-4 sm:p-6">
          <h2 className="font-semibold text-stone-900 mb-5">Edit Information</h2>
          <FormBody {...formBodyProps} submitLabel="Save Changes" />
        </div>
      )}

    </div>
  );
}
