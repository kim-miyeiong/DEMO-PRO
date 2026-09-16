import axios from 'axios';

const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

const api = axios.create({ baseURL: API_BASE });

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401 && getAdminToken()) {
      localStorage.removeItem('admin_session');
      if (window.location.pathname.startsWith('/admin')) {
        window.location.assign('/admin/login');
      }
    }
    return Promise.reject(error);
  },
);

function getAdminToken() {
  try {
    const session = JSON.parse(localStorage.getItem('admin_session') || 'null');
    return session?.token || null;
  } catch {
    return null;
  }
}

function adminHeaders() {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const fetchBooks = async () => {
  const res = await api.get('/books');
  return res.data.data;
};

export const fetchBook = async (id) => {
  const res = await api.get(`/books/${id}`);
  return res.data.data;
};

export const uploadBook = async (formData) => {
  const res = await api.post('/books', formData, {
    headers: adminHeaders(),
  });
  return res.data.data;
};

export const updateBook = async (id, formData) => {
  const res = await api.put(`/books/${id}`, formData, {
    headers: adminHeaders(),
  });
  return res.data.data;
};

export const deleteBook = async (id) => {
  const res = await api.delete(`/books/${id}`, { headers: adminHeaders() });
  return res.data;
};

export const fetchCart = async (userId) => {
  const res = await api.get(`/cart/${userId}`);
  return res.data.data;
};

export const addToCart = async (userId, bookId, quantity = 1) => {
  const res = await api.post(`/cart/${userId}`, { bookId, quantity });
  return res.data;
};

export const removeFromCart = async (userId, itemId) => {
  const res = await api.delete(`/cart/${userId}/${itemId}`);
  return res.data;
};

export const checkout = async (userId) => {
  const res = await api.post(`/orders/${userId}`);
  return res.data.data;
};

export const fetchOrders = async (userId) => {
  const res = await api.get(`/orders/${userId}`);
  return res.data.data;
};

export const fetchAdminStats = async () => {
  const res = await api.get('/admin/stats', { headers: adminHeaders() });
  return res.data.data;
};

export const processPayment = async (data) => {
  const res = await api.post('/payment/process', data);
  return res.data.data;
};

export const downloadFile = (filename, paymentToken) => {
  if (!paymentToken) return Promise.reject(new Error('Payment required. Please complete checkout first.'));
  const url = `${API_BASE}/download/${filename}?token=${encodeURIComponent(paymentToken)}`;
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const adminLogin = async (username, password) => {
  const res = await api.post('/admin/login', { username, password });
  return res.data.data;
};

export const subscribeBooks = (callback) => {
  const eventSource = new EventSource(`${API_BASE}/realtime/books`);
  eventSource.onmessage = (event) => {
    try { const msg = JSON.parse(event.data); callback(msg); }
    catch (e) { console.error('SSE parse error:', e); }
  };
  return () => eventSource.close();
};

export const subscribeOrders = (userId, callback) => {
  const eventSource = new EventSource(`${API_BASE}/realtime/orders/${userId}`);
  eventSource.onmessage = (event) => {
    try { const msg = JSON.parse(event.data); callback(msg); }
    catch (e) { console.error('SSE parse error:', e); }
  };
  return () => eventSource.close();
};

export const subscribeAllOrders = (callback) => {
  const eventSource = new EventSource(`${API_BASE}/realtime/orders`);
  eventSource.onmessage = (event) => {
    try { const msg = JSON.parse(event.data); callback(msg); }
    catch (e) { console.error('SSE parse error:', e); }
  };
  return () => eventSource.close();
};

export const subscribeCart = (userId, callback) => {
  const eventSource = new EventSource(`${API_BASE}/realtime/cart/${userId}`);
  eventSource.onmessage = (event) => {
    try { const msg = JSON.parse(event.data); callback(msg); }
    catch (e) { console.error('SSE parse error:', e); }
  };
  return () => eventSource.close();
};
