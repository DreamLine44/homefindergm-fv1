import axios from "./axios";

// field name is "text" not "content"
export const getComments   = (postId) => axios.get(`/comments/${postId}`);
export const createComment = (postId, data) =>
  axios.post(`/comments/${postId}/create`, data);            // { text: "..." }
export const replyComment  = (postId, commentId, data) =>
  axios.post(`/comments/${postId}/create/${commentId}`, data); // { text: "..." }
export const updateComment = (postId, commentId, data) =>
  axios.put(`/comments/${postId}/${commentId}/update`, data);
export const deleteComment = (postId, commentId) =>
  axios.delete(`/comments/${postId}/${commentId}/delete`);
export const likeComment   = (commentId) =>
  axios.post(`/comments/${commentId}/like`);
export const unlikeComment = (commentId) =>
  axios.delete(`/comments/${commentId}/like`);
