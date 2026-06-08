import api from "./axios";

export const postAPI = {
  getAll: (page = 1) => api.get(`/posts?page=${page}`),
  getFeed: (page = 1) => api.get(`/posts/feed?page=${page}`),
  getById: (id) => api.get(`/posts/${id}`),
  create: (data) => api.post("/posts", data),
  update: (id, data) => api.put(`/posts/${id}`, data),
  delete: (id) => api.delete(`/posts/${id}`),
  toggleLike: (id) => api.post(`/posts/${id}/like`),
  addComment: (postId, data) => api.post(`/posts/${postId}/comments`, data),
  getComments: (postId) => api.get(`/posts/${postId}/comments`),
  deleteComment: (commentId) => api.delete(`/posts/comments/${commentId}`),
};
