import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const font = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif";

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/auth/login', { email, password });
            login(res.data.token, res.data.user);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = (field) => ({
        width: '100%', boxSizing: 'border-box',
        background: '#F5F5F7', fontFamily: font,
        border: `1px solid ${focusedField === field ? '#0071E3' : 'transparent'}`,
        borderRadius: '12px', padding: '13px 16px',
        fontSize: '15px', color: '#1D1D1F', outline: 'none',
        boxShadow: focusedField === field ? '0 0 0 3px rgba(0,113,227,0.12)' : 'none',
        transition: 'all 0.15s',
    });

    return (
        <div style={{
            minHeight: '100vh',
            background: '#F5F5F7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: font,
            padding: '24px',
        }}>
            <div style={{
                background: '#fff',
                borderRadius: '24px',
                padding: '52px',
                width: '100%',
                maxWidth: '440px',
                boxShadow: '0 4px 32px rgba(0,0,0,0.07), 0 0 1px rgba(0,0,0,0.08)',
            }}>

                {/* Logo */}
                <div style={{
                    width: '52px', height: '52px',
                    background: 'linear-gradient(135deg, #1D1D1F 0%, #3A3A3C 100%)',
                    borderRadius: '16px',
                    marginBottom: '36px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <div style={{ width: '20px', height: '20px', background: '#fff', borderRadius: '50%', opacity: 0.9 }} />
                </div>

                {/* Heading */}
                <div style={{ fontSize: '30px', fontWeight: '600', color: '#1D1D1F', letterSpacing: '-0.02em', marginBottom: '6px', lineHeight: '1.2' }}>
                    Sign in
                </div>
                <div style={{ fontSize: '15px', color: '#6E6E73', marginBottom: '40px' }}>
                    Welcome back to Lead Dashboard
                </div>

                {/* Error */}
                {error && (
                    <div style={{
                        background: 'rgba(255,59,48,0.06)', border: '1px solid rgba(255,59,48,0.15)',
                        borderRadius: '12px', padding: '13px 16px', marginBottom: '24px',
                        fontSize: '14px', color: '#FF3B30',
                        display: 'flex', alignItems: 'center', gap: '9px',
                    }}>
                        <span>⚠</span> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Email */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#1D1D1F', marginBottom: '8px' }}>
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            onFocus={() => setFocusedField('email')}
                            onBlur={() => setFocusedField(null)}
                            style={inputStyle('email')}
                            placeholder="you@company.com"
                            required
                        />
                    </div>

                    {/* Password */}
                    <div style={{ marginBottom: '28px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#1D1D1F', marginBottom: '8px' }}>
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            onFocus={() => setFocusedField('password')}
                            onBlur={() => setFocusedField(null)}
                            style={inputStyle('password')}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            background: loading ? '#6E6E73' : '#0071E3',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '14px',
                            fontSize: '15px',
                            fontWeight: '500',
                            cursor: loading ? 'default' : 'pointer',
                            fontFamily: font,
                            opacity: loading ? 0.7 : 1,
                            transition: 'background 0.15s, opacity 0.15s',
                            letterSpacing: '-0.01em',
                        }}
                    >
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', fontSize: '13px', color: '#AEAEB2', marginTop: '36px' }}>
                    Lead Management System · Secure Access
                </div>
            </div>
        </div>
    );
}