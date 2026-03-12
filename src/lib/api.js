const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

// Token management
function getToken() {
  return localStorage.getItem("auth_token");
}

function setToken(token) {
  localStorage.setItem("auth_token", token);
}

function removeToken() {
  localStorage.removeItem("auth_token");
}

// API request helper
async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Auth API
export const authApi = {
  register: async (data) => {
    const result = await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    setToken(result.token);
    return result;
  },

  login: async (email, password) => {
    const result = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setToken(result.token);
    return result;
  },

  logout: async () => {
    await apiRequest("/auth/logout", { method: "POST" });
    removeToken();
  },

  getSession: async () => {
    const token = getToken();
    if (!token) return { session: null };
    
    try {
      const data = await apiRequest("/auth/me");
      return { session: { user: data.user, roles: data.roles } };
    } catch {
      removeToken();
      return { session: null };
    }
  },
};

// Profiles API
export const profilesApi = {
  getAll: () => apiRequest("/profiles"),
  getById: (id) => apiRequest(`/profiles/${id}`),
  update: (id, data) =>
    apiRequest(`/profiles/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

// Roles API
export const rolesApi = {
  getMyRoles: () => apiRequest("/roles/me"),
};

// Crops API
export const cropsApi = {
  getAll: (params) => {
    const query = new URLSearchParams();
    if (params?.category) query.append("category", params.category);
    if (params?.available !== undefined) query.append("available", String(params.available));
    if (params?.state) query.append("state", params.state);
    if (params?.district) query.append("district", params.district);
    const queryString = query.toString();
    return apiRequest(`/crops${queryString ? `?${queryString}` : ""}`);
  },
  getAvailable: () => apiRequest("/crops/available"),
  getMyCrops: () => apiRequest("/crops/my-crops"),
  create: (data) =>
    apiRequest("/crops", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    apiRequest(`/crops/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    apiRequest(`/crops/${id}`, {
      method: "DELETE",
    }),
};


export const transportApi = {
  
  getAll: () => apiRequest("/transport"), 

  
  getFarmerMine: () => apiRequest("/transport/farmer/mine"),

  
  getBuyerMine: () => apiRequest("/transport/buyer/mine"),

  
  create: (data) =>
    apiRequest("/transport", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  
  confirm: (id, estimatedDeliveryAt, shipping = {}) =>
    apiRequest(`/transport/${id}/confirm`, {
      method: "PATCH",
      body: JSON.stringify({
        estimatedDeliveryAt,
        ...shipping,
      }),
    }),

  
  ship: (id) =>
    apiRequest(`/transport/${id}/ship`, {
      method: "PATCH",
    }),

  
  deliver: (id) =>
    apiRequest(`/transport/${id}/deliver`, {
      method: "PATCH",
    }),

  
  complete: (id, otp) =>
    apiRequest(`/transport/${id}/complete`, {
      method: "PATCH",
      body: JSON.stringify({ otp }),
    }),
  
  // PATCH /api/transport/:id/cancel
  cancel: (id, reason) =>
    apiRequest(`/transport/${id}/cancel`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    }),
};
// Price Predictions API
export const pricePredictionsApi = {
  getAll: () => apiRequest("/price-predictions"),
  create: (data) =>
    apiRequest("/price-predictions", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  // ML Model Prediction - calls the actual ML model
  predict: (data) =>
    apiRequest("/price-predictions/predict", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// Ratings API
export const ratingsApi = {
  getAll: () => apiRequest("/ratings"),
  create: (data) =>
    apiRequest("/ratings", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export const chatApi = {
  // 'messages' will be the entire array of chat history
  ask: (messages) =>
    apiRequest("/chat/ask", {
      method: "POST",
      body: JSON.stringify({ messages }),
    }),
};

// Export token management for direct use if needed
export { getToken, removeToken, setToken };

