import axios from "axios";
import { BASE_URL } from "../utils/constants";

const instance = axios.create({
  baseURL: BASE_URL,
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ── Simple in-memory cache for GET requests ──
// Prevents repeated API calls when navigating back and forth between pages.
// Cache expires after TTL_MS milliseconds.
const cache = new Map();
const TTL_MS = 30_000; // 30 seconds

export function cachedGet(url, params = {}, ttl = TTL_MS) {
  const key = url + JSON.stringify(params);
  const hit  = cache.get(key);
  if (hit && Date.now() - hit.ts < ttl) {
    return Promise.resolve(hit.data);
  }
  return instance.get(url, { params }).then((res) => {
    cache.set(key, { data: res, ts: Date.now() });
    return res;
  });
}

// Invalidate cache for a URL prefix (call after POST/PUT/DELETE)
export function invalidateCache(prefix) {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
}

export default instance;
