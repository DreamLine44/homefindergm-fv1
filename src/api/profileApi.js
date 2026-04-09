import axios from "./axios";

// Create Profile
export const createProfile = (data) =>
  axios.post("/profile/create", data);

// Get Logged-in User Profile
export const getProfile = () =>
  axios.get("/profile/");

// Get Public Profile by userId — GET /api/profile/:userId
export const getPublicProfile = (userId) =>
  axios.get(`/profile/${userId}`);

// Update Profile
export const updateProfile = (data) =>
  axios.put("/profile/update", data);

// Delete Profile
export const deleteProfile = () =>
  axios.delete("/profile/delete");

// Check if a username is taken — GET /api/profile/check-username?username=xyz
// Returns { taken: true | false }
export const checkUsernameAvailability = (username) =>
  axios.get("/profile/check-username", { params: { username } });

// Avatar — MUST NOT set Content-Type manually; browser sets multipart boundary automatically
export const uploadAvatar = (formData) =>
  axios.put("/profile/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteAvatar = () =>
  axios.delete("/profile/avatar");
