import axios from 'axios';

// Matches the same pattern already used everywhere else in this codebase
// (AuthContext.jsx, LoginPage.jsx, etc.) — falls back to localhost only for
// local dev. Without this, every page that uses this axios instance
// (Dashboard, Leads, Users, Admin Approvals, Connect Channels) would have
// silently tried to reach localhost:3000 from a deployed frontend and
// failed completely — this was the one real bug in this cleanup pass, not
// just tidiness.
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000'
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;