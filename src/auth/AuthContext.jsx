import { createContext, useState, useEffect, useRef } from "react";
import { getProfile } from "../api/profileApi";

export const AuthContext = createContext();

/** Build a clean user object from raw auth data + optional profile merge */
function buildUserObject(authUser, token, profile = null) {
  const base = { ...authUser, token };
  if (!profile) return base;

  const avatarUrl =
    typeof profile.avatar === "string"
      ? profile.avatar
      : profile.avatar?.url || null;

  return {
    ...base,
    profileId: profile._id,
    avatar:    avatarUrl,
    username:  profile.username  || base.username  || null,
    firstName: profile.firstName || base.firstName || null,
    lastName:  profile.lastName  || base.lastName  || null,
    phone:     profile.phone     || base.phone     || null,
    location:  profile.location  || base.location  || null,
  };
}

export default function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  // Prevent concurrent profile fetches
  const fetchingProfile = useRef(false);

  /* ── Restore session on mount ── */
  useEffect(() => {
    const token  = localStorage.getItem("token");
    const stored = localStorage.getItem("user");

    if (token && stored) {
      try {
        const parsed = JSON.parse(stored);
        // Restore immediately — no async blocking
        setUser(parsed);

        // Background profile refresh (won't block the session restore)
        if (!fetchingProfile.current) {
          fetchingProfile.current = true;
          getProfile()
            .then((r) => {
              const p = r.data?.data || r.data?.profile || r.data;
              if (p && p._id) {
                const enriched = buildUserObject(parsed, token, p);
                localStorage.setItem("user", JSON.stringify(enriched));
                setUser(enriched);
              }
            })
            .catch(() => {})
            .finally(() => { fetchingProfile.current = false; });
        }
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  /**
   * login() — called after signup or signin with the full API response.
   * setUser() is called SYNCHRONOUSLY before any async work so ProtectedRoute
   * won't bounce the user back to /login.
   * Profile is fetched in the background and merges silently.
   */
  const login = (responseData) => {
    const token    = responseData?.data?.token;
    const rawUser  = responseData?.data?.user;
    const authUser = Array.isArray(rawUser) ? rawUser[0] : rawUser;

    if (!token || !authUser) return;

    // 1. Persist & set user state IMMEDIATELY (synchronous, no awaiting)
    const base = buildUserObject(authUser, token);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(base));
    setUser(base);

    // 2. Background profile fetch — does NOT block the caller
    if (!fetchingProfile.current) {
      fetchingProfile.current = true;
      getProfile()
        .then((r) => {
          const p = r.data?.data || r.data?.profile || r.data;
          if (p && p._id) {
            const enriched = buildUserObject(authUser, token, p);
            localStorage.setItem("user", JSON.stringify(enriched));
            setUser(enriched);
          }
        })
        .catch(() => {
          // New user — no profile yet. That's fine; base is already set.
        })
        .finally(() => { fetchingProfile.current = false; });
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const updateUser = (data) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...data };
      if (data.avatar && typeof data.avatar === "object") {
        updated.avatar = data.avatar.url || null;
      }
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
