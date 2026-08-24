/* ============================================================
   Harvest Stall — API client
   Shared by index.html, farmer-dashboard.html, admin-dashboard.html
   ============================================================ */
const API_BASE = "https://harvest-stall.onrender.com/api";
const Auth = {
  getToken(){ return localStorage.getItem("hs_token"); },
  setSession(token, user){
    localStorage.setItem("hs_token", token);
    localStorage.setItem("hs_user", JSON.stringify(user));
  },
  getUser(){
    try { return JSON.parse(localStorage.getItem("hs_user") || "null"); }
    catch(e){ return null; }
  },
  clear(){
    localStorage.removeItem("hs_token");
    localStorage.removeItem("hs_user");
  },
  isLoggedIn(){ return !!this.getToken(); }
};

async function apiRequest(path, { method = "GET", body, isForm = false } = {}){
  const headers = {};
  const token = Auth.getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!isForm && body) headers["Content-Type"] = "application/json";

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: isForm ? body : (body ? JSON.stringify(body) : undefined)
    });
  } catch (networkErr) {
    const err = new Error("Can't reach the Harvest Stall server. Is the backend running?");
    err.isNetworkError = true;
    throw err;
  }

  let data = null;
  try { data = await res.json(); } catch(e) { /* empty body */ }

  if (!res.ok) {
    const err = new Error((data && data.message) || `Request failed (${res.status})`);
    err.status = res.status;
    err.details = data;
    throw err;
  }
  return data;
}

const Api = {
  // ---- auth ----
  register: (payload) => apiRequest("/auth/register", { method: "POST", body: payload }),
  login: (payload) => apiRequest("/auth/login", { method: "POST", body: payload }),
  me: () => apiRequest("/auth/me"),

  // ---- profile ----
  updateProfile: (payload) => apiRequest("/users/me", { method: "PUT", body: payload }),
  addAddress: (payload) => apiRequest("/users/me/addresses", { method: "POST", body: payload }),
  updateAddress: (id, payload) => apiRequest(`/users/me/addresses/${id}`, { method: "PUT", body: payload }),
  deleteAddress: (id) => apiRequest(`/users/me/addresses/${id}`, { method: "DELETE" }),
  toggleWishlist: (productId) => apiRequest(`/users/me/wishlist/${productId}`, { method: "POST" }),
  getWishlist: () => apiRequest("/users/me/wishlist"),

  // ---- products ----
  listProducts: (query = "") => apiRequest(`/products${query}`),
  getProduct: (id) => apiRequest(`/products/${id}`),
  suggestions: (q) => apiRequest(`/products/suggestions?q=${encodeURIComponent(q)}`),
  myProducts: () => apiRequest("/products/mine/list"),
  createProduct: (formData) => apiRequest("/products", { method: "POST", body: formData, isForm: true }),
  updateProduct: (id, formData) => apiRequest(`/products/${id}`, { method: "PUT", body: formData, isForm: true }),
  deleteProduct: (id) => apiRequest(`/products/${id}`, { method: "DELETE" }),
  updateStock: (id, payload) => apiRequest(`/products/${id}/stock`, { method: "PATCH", body: payload }),

  // ---- cart ----
  getCart: () => apiRequest("/cart"),
  addToCart: (payload) => apiRequest("/cart/items", { method: "POST", body: payload }),
  updateCartItem: (itemId, payload) => apiRequest(`/cart/items/${itemId}`, { method: "PUT", body: payload }),
  removeCartItem: (itemId) => apiRequest(`/cart/items/${itemId}`, { method: "DELETE" }),
  clearCart: () => apiRequest("/cart", { method: "DELETE" }),

  // ---- orders ----
  checkout: (payload) => apiRequest("/orders/checkout", { method: "POST", body: payload }),
  myOrders: () => apiRequest("/orders/my"),
  farmerOrders: (status) => apiRequest(`/orders/farmer/list${status ? `?status=${status}` : ""}`),
  updateOrderStatus: (id, payload) => apiRequest(`/orders/${id}/status`, { method: "PATCH", body: payload }),

  // ---- farmer dashboard ----
  farmerDashboard: () => apiRequest("/farmer/dashboard"),
  farmerRevenue: (days) => apiRequest(`/farmer/analytics/revenue?days=${days || 30}`),
  farmerTopProducts: () => apiRequest("/farmer/analytics/top-products"),
  farmerMessages: () => apiRequest("/farmer/messages"),
  updateMessageStatus: (id, status) => apiRequest(`/farmer/messages/${id}`, { method: "PATCH", body: { status } }),

  // ---- admin dashboard ----
  adminDashboard: () => apiRequest("/admin/dashboard"),
  adminCustomers: (q) => apiRequest(`/admin/customers${q ? `?q=${encodeURIComponent(q)}` : ""}`),
  adminFarmers: (status) => apiRequest(`/admin/farmers${status ? `?status=${status}` : ""}`),
  setFarmerApproval: (id, payload) => apiRequest(`/admin/farmers/${id}/approval`, { method: "PATCH", body: payload }),
  setUserActive: (id, isActive) => apiRequest(`/admin/users/${id}/status`, { method: "PATCH", body: { isActive } }),
  adminProducts: (q) => apiRequest(`/admin/products${q ? `?q=${encodeURIComponent(q)}` : ""}`),
  adminRemoveProduct: (id) => apiRequest(`/admin/products/${id}`, { method: "DELETE" }),
  adminOrders: (status) => apiRequest(`/admin/orders${status ? `?status=${status}` : ""}`),
  createCategory: (payload) => apiRequest("/admin/categories", { method: "POST", body: payload }),
  updateCategory: (id, payload) => apiRequest(`/admin/categories/${id}`, { method: "PUT", body: payload }),
  deleteCategory: (id) => apiRequest(`/admin/categories/${id}`, { method: "DELETE" }),
  sendAnnouncement: (payload) => apiRequest("/admin/announcements", { method: "POST", body: payload }),
  listAnnouncements: () => apiRequest("/admin/announcements"),

  // ---- categories / contact ----
  categories: () => apiRequest("/categories"),
  sendContact: (payload) => apiRequest("/contact", { method: "POST", body: payload }),
  contactSeller: (farmerId, payload) => apiRequest(`/contact/seller/${farmerId}`, { method: "POST", body: payload })
};
