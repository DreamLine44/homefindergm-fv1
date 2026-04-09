import { createContext, useContext, useState, useEffect } from "react";
import { getProfile } from "../api/profileApi";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: restore user from localStorage, then refresh profile from API
  useEffect(() => {
    const token  = localStorage.getItem("token");
    const stored = localStorage.getItem("user");
    if (token && stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        // Silently refresh profile data (avatar, username, etc.) in background
        getProfile()
          .then((r) => {
            const p = r.data?.data || r.data?.profile || r.data;
            if (p && p._id) {
              const avatarUrl = typeof p.avatar === "string"
                ? p.avatar
                : p.avatar?.url || null;
              const merged = {
                ...parsed,
                profileId:  p._id,
                avatar:     avatarUrl,
                username:   p.username  || parsed.username  || null,
                // BUG FIX #1: prefer profile name, but fall back to parsed (from sign-up)
                firstName:  p.firstName || parsed.firstName || null,
                lastName:   p.lastName  || parsed.lastName  || null,
                phone:      p.phone     || parsed.phone     || null,
                location:   p.location  || parsed.location  || null,
              };
              localStorage.setItem("user", JSON.stringify(merged));
              setUser(merged);
            }
          })
          .catch(() => {}); // silently ignore — user still logged in
      } catch {
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  // Called with the full API response: res.data
  // Signup returns user as an array; signin returns user as an object — handle both.
  const login = async (responseData) => {
    const token   = responseData?.data?.token;
    const rawUser = responseData?.data?.user;
    const authUser = Array.isArray(rawUser) ? rawUser[0] : rawUser;
    if (!token || !authUser) return;

    // BUG FIX #1: Store full user including firstName + lastName from sign-up immediately
    const base = { ...authUser, token };
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(base));
    setUser(base);

    // Then fetch profile to get avatar, username, etc.
    try {
      const r = await getProfile();
      const p = r.data?.data || r.data?.profile || r.data;
      if (p && p._id) {
        const avatarUrl = typeof p.avatar === "string"
          ? p.avatar
          : p.avatar?.url || null;
        const enriched = {
          ...base,
          profileId: p._id,
          avatar:    avatarUrl,
          username:  p.username  || null,
          // BUG FIX #1: profile name takes priority; fall back to base (sign-up data)
          firstName: p.firstName || base.firstName || null,
          lastName:  p.lastName  || base.lastName  || null,
          phone:     p.phone     || null,
          location:  p.location  || null,
        };
        localStorage.setItem("user", JSON.stringify(enriched));
        setUser(enriched);
      }
    } catch (_) {}
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const updateUser = (data) => {
    const updated = { ...user, ...data };
    // Resolve avatar to always store as URL string
    if (data.avatar && typeof data.avatar === "object") {
      updated.avatar = data.avatar.url || null;
    }
    localStorage.setItem("user", JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
