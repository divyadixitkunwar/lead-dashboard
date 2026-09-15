import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (!token) {
            setLoading(false);
            return;
        }

        if (savedUser) {
            try { setUser(JSON.parse(savedUser)); } catch {  }
        }

        fetch(`${API_BASE}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
        })
            .then(async (res) => {
                if (res.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setUser(null);
                    return;
                }
                if (!res.ok) return;
                const fresh = await res.json();
                localStorage.setItem('user', JSON.stringify(fresh));
                setUser(fresh);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const login = (token, userData) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const refreshUser = async () => {
        const token = localStorage.getItem('token');
        if (!token) return null;
        const res = await fetch(`${API_BASE}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
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
