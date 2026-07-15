const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'stayverse_token';
const USER_KEY = 'user';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setSession({ token, user }) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser() {
  const stored = localStorage.getItem(USER_KEY);
  return stored ? JSON.parse(stored) : null;
}

async function request(path, options = {}) {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    throw new Error(data?.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export const authApi = {
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  me: () => request('/auth/me'),
};

export const roomsApi = {
  list: () => request('/rooms'),
  get: (id) => request(`/rooms/${id}`),
  create: (payload) => request('/rooms', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id, payload) => request(`/rooms/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  remove: (id) => request(`/rooms/${id}`, { method: 'DELETE' }),
};

export const bookingsApi = {
  listMine: () => request('/bookings/my'),
  listAll: () => request('/bookings'),
  create: (payload) => request('/bookings', { method: 'POST', body: JSON.stringify(payload) }),
  cancel: (id) => request(`/bookings/${id}/cancel`, { method: 'PATCH' }),
};

export const propertyRequestsApi = {
  listMine: () => request('/property-requests/my'),
  listAll: () => request('/property-requests'),
  create: (payload) => request('/property-requests', { method: 'POST', body: JSON.stringify(payload) }),
  approve: (id) => request(`/property-requests/${id}/approve`, { method: 'PATCH' }),
  reject: (id) => request(`/property-requests/${id}/reject`, { method: 'PATCH' }),
};
