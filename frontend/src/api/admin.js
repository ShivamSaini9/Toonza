import api from "./axios";

// Thin wrapper around the /api/v1/admin/* endpoints so admin pages don't
// repeat URL strings everywhere.
export const adminApi = {
  getOverview: () => api.get("/api/v1/admin/overview"),

  getUsers: (params) => api.get("/api/v1/admin/users", { params }),
  getUser: (id) => api.get(`/api/v1/admin/users/${id}`),
  setSuspension: (id, suspended) =>
    api.patch(`/api/v1/admin/users/${id}/suspend`, { suspended }),
  updateCredits: (id, credits, mode = "set") =>
    api.patch(`/api/v1/admin/users/${id}/credits`, { credits, mode }),
  updateRole: (id, role) => api.patch(`/api/v1/admin/users/${id}/role`, { role }),

  getTransactions: (params) => api.get("/api/v1/admin/transactions", { params }),

  getAssets: (params) => api.get("/api/v1/admin/assets", { params }),
  createAsset: (formData) =>
    api.post("/api/v1/admin/assets", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateAsset: (id, payload) => api.patch(`/api/v1/admin/assets/${id}`, payload),
  deleteAsset: (id) => api.delete(`/api/v1/admin/assets/${id}`),

  getCommunityPosts: (params) => api.get("/api/v1/admin/community", { params }),
  deleteCommunityPost: (id) => api.delete(`/api/v1/admin/community/${id}`),
};

export const dialogueApi = {
  separate: (script) => api.post("/api/v1/dialogue/separate", { script }),
};

export const assetLibraryApi = {
  list: (params) => api.get("/api/v1/assets", { params }),
  download: (id) => api.post(`/api/v1/assets/${id}/download`),
};
