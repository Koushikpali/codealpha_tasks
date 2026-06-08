import api from "./axios";

export const userAPI = {
  getProfile: (username) => api.get(`/users/${username}`),
  updateProfile: (data) => api.put("/users/profile", data),
  follow: (id) => api.post(`/users/${id}/follow`),
  unfollow: (id) => api.post(`/users/${id}/unfollow`),
  search: (q) => api.get(`/users/search?q=${q}`),
  getSuggestions: () => api.get("/users/suggestions"),
};
