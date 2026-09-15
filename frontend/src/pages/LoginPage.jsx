import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { tokens } from '../styles/tokens';
import { useAuth } from '../context/AuthContext';
import heroImage from '../assets/hero-himalaya.jpg';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function Field({ id, label, type = 'text', value, onChange, autoComplete, trailing }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <label htmlFor={id} style={{ fontSize: '13px', fontWeight: 500, color: tokens.inkMuted }}>
                    {label}
                </label>
                {trailing}
            </div>
            <input
                id={id}
                type={type}
                required
                value={value}
                onChange={onChange}
                autoComplete={autoComplete}
                style={{
                    fontFamily: tokens.font,
                    fontSize: '15px',
                    color: tokens.ink,
                    background: 'rgba(255,255,255,0.6)',
                    border: '1px solid rgba(27,23,18,0.15)',
                    borderRadius: '10px',
                    padding: '11px 14px',
                    outline: 'none',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(27,23,18,0.35)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(27,23,18,0.15)')}
            />
        </div>
    );
}

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [form, setForm] = useState({ email: '', password: '' });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [notice] = useState(location.state?.passwordReset ? 'Password updated. Log in below.' : '');

    const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();

            if (!res.ok) {
                if (data.code === 'EMAIL_NOT_VERIFIED') {
                    navigate('/signup/verify', { state: { email: form.email } });
                    return;
                }
                if (data.code === 'APPLICATION_REJECTED') {
                    setError(data.error);
                    return;
                }
                setError(data.error || 'Something went wrong. Try again.');
                return;
            }

            login(data.token, data.user);
            navigate(data.user.status === 'pending_approval' ? '/application-pending' : '/app');
        } catch {
            setError('Network error. Try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: tokens.font }}>
            <div
                aria-hidden="true"
                style={{
                    position: 'fixed', inset: 0, zIndex: 0,
                    backgroundImage: `url(${heroImage})`, backgroundSize: 'cover', backgroundPosition: 'center',
                    filter: 'blur(40px)', transform: 'scale(1.1)',
                }}
            />
            <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 1, background: 'rgba(246,241,231,0.6)' }} />

            <div style={{ position: 'relative', zIndex: 2, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
                <form
                    onSubmit={handleSubmit}
                    style={{
                        width: 'min(520px, 100%)',
                        background: tokens.ivory,
                        borderRadius: '16px',
                        padding: '40px 44px 32px',
                        boxShadow: '0 20px 60px rgba(27,23,18,0.12)',
                        border: '1px solid rgba(27,23,18,0.06)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '22px',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '22px', height: '22px', borderRadius: '7px', background: tokens.ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: '7px', height: '7px', background: tokens.ivory, borderRadius: '50%' }} />
                        </div>
                        <span style={{ fontSize: '19px', fontWeight: 700, letterSpacing: '-0.02em', color: tokens.ink }}>Ekikrit</span>
                    </div>

                    <h1 style={{ margin: 0, textAlign: 'center', fontFamily: tokens.display, fontSize: '32px', fontWeight: 500, letterSpacing: '-0.03em', color: tokens.ink }}>
                        Welcome back
                    </h1>

                    {notice && (
                        <span style={{ fontSize: '13px', color: tokens.inkMuted, textAlign: 'center' }}>{notice}</span>
                    )}

                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <Field
                            id="email"
                            label="Email"
                            type="email"
                            value={form.email}
                            onChange={set('email')}
                            autoComplete="email"
                        />

                        <Field
                            id="password"
                            label="Password"
                            type="password"
                            value={form.password}
                            onChange={set('password')}
                            autoComplete="current-password"
                            trailing={
                                <a
                                    onClick={() => navigate('/forgot-password')}
                                    style={{ fontSize: '13px', color: tokens.inkMuted, textDecoration: 'underline', cursor: 'pointer' }}
                                >
                                    Forgot password?
                                </a>
                            }
                        />
                    </div>

                    {error && (
                        <span style={{ fontSize: '13px', color: '#B3261E', alignSelf: 'flex-start' }}>
                            {error}
                        </span>
                    )}

                    <button
                        type="submit"
                        disabled={submitting}
                        style={{
                            width: '100%',
                            background: tokens.ink,
                            color: tokens.ivory,
                            border: 'none',
                            borderRadius: '999px',
                            padding: '13px',
                            fontFamily: tokens.font,
                            fontSize: '15px',
                            fontWeight: 600,
                            cursor: submitting ? 'default' : 'pointer',
                            opacity: submitting ? 0.7 : 1,
                        }}
                    >
                        {submitting ? 'Logging in…' : 'Log in'}
                    </button>

                    <p style={{ margin: 0, fontSize: '14px', color: tokens.inkMuted }}>
                        Don't have an account?{' '}
                        <a
                            onClick={() => navigate('/signup')}
                            style={{ color: tokens.ink, fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}
                        >
                            Sign up
                        </a>
                    </p>
                </form>
            </div>
        </div>
    );
}
