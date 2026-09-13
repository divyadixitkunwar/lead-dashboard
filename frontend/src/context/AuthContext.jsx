import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // On every app load, if we have a token, re-check status against the
    // server rather than trusting whatever was cached in localStorage.
    // This is what makes "leave and come back later" work correctly —
    // someone who was pending_approval when they last closed the tab sees
    // their real, current status (including having been approved in the
    // meantime) without needing to log in again.
    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (!token) {
            setLoading(false);
            return;
        }

        // Show the cached user immediately so there's no flash of
        // "logged out" while the network request is in flight.
        if (savedUser) {
            try { setUser(JSON.parse(savedUser)); } catch { /* ignore bad cache */ }
        }

        fetch(`${API_BASE}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(async (res) => {
                if (res.status === 401) {
                    // Token itself is invalid/expired — really logged out.
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setUser(null);
                    return;
                }
                if (!res.ok) return; // transient error — keep the cached user
                const fresh = await res.json();
                localStorage.setItem('user', JSON.stringify(fresh));
                setUser(fresh);
            })
            .catch(() => { /* network error — keep the cached user, don't log out */ })
            .finally(() => setLoading(false));
    }, []);

    const login = (token, userData) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    // Lets a page (e.g. the waiting-for-approval screen) pull the latest
    // status on demand without a full reload.
    const refreshUser = async () => {
        const token = localStorage.getItem('token');
        if (!token) return null;
        const res = await fetch(`${API_BASE}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return null;
        const fresh = await res.json();
        localStorage.setItem('user', JSON.stringify(fresh));
        setUser(fresh);
        return fresh;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
