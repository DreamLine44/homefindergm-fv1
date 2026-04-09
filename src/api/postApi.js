import instance, { cachedGet, invalidateCache } from "./axios";

// GET /api/posts/
export const getPosts = (params) => cachedGet("/posts/", params);

// GET /api/posts/search
export const searchPosts = (params) => cachedGet("/posts/search", params);

// GET /api/posts/:postId
export const getPost = (id) => cachedGet(`/posts/${id}`);

// POST /api/posts/create
export const createPost = (formData) =>
  instance.post("/posts/create", formData).then((r) => {
    invalidateCache("/posts");
    return r;
  });

// PUT /api/posts/:postId/update
export const updatePost = (id, formData) =>
  instance.put(`/posts/${id}/update`, formData).then((r) => {
    invalidateCache("/posts");
    return r;
  });

// DELETE /api/posts/:postId/delete
export const deletePost = (id) =>
  instance.delete(`/posts/${id}/delete`).then((r) => {
    invalidateCache("/posts");
    return r;
  });

// DELETE /api/posts/:postId/:imageId
export const deletePostImage = (postId, imageId) =>
  instance.delete(`/posts/${postId}/${imageId}`).then((r) => {
    invalidateCache(`/posts/${postId}`);
    return r;
  });

// POST /api/posts/:postId/like
export const likePost = (id) =>
  instance.post(`/posts/${id}/like`);

// DELETE /api/posts/:postId/like
export const unlikePost = (id) =>
  instance.delete(`/posts/${id}/like`);