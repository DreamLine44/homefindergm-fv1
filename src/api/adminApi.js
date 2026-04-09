import axios from "./axios";

// ── Generic admin delete: DELETE /api/admin/:targetType/:targetId ──
// targetType: "post" | "comment" | "user" | "profile"
export const adminDelete = (targetType, targetId) =>
  axios.delete(`/admin/${targetType}/${targetId}`);

// ── Get all users (admin) ──
// Admin route: GET /api/user/all (requires authorize + adminOnly)
export const getAllUsers = () => axios.get("/user/all");

// ── Get all comments for a post ──
export const getCommentsByPost = (postId) => axios.get(`/comments/${postId}`);
