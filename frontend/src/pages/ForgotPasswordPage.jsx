import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tokens } from '../styles/tokens';
import heroImage from '../assets/hero-himalaya.jpg';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {

            const res = await fetch(`${API_BASE}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setError(data.error || 'Something went wrong. Try again.');
                return;
            }

            navigate('/reset-password', { state: { email } });
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

                    <div style={{ textAlign: 'center' }}>
                        <h1 style={{ margin: 0, fontFamily: tokens.display, fontSize: '32px', fontWeight: 500, letterSpacing: '-0.03em', color: tokens.ink }}>
                            Reset your password
                        </h1>
                        <p style={{ margin: '10px 0 0', fontSize: '14px', color: tokens.inkMuted }}>
                            We'll send a code to your email.
                        </p>
                    </div>

                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label htmlFor="email" style={{ fontSize: '13px', fontWeight: 500, color: tokens.inkMuted }}>
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
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
                        {submitting ? 'Sending…' : 'Send reset code'}
                    </button>

                    <p style={{ margin: 0, fontSize: '14px', color: tokens.inkMuted }}>
                        Remembered it?{' '}
                        <a
                            onClick={() => navigate('/login')}
                            style={{ color: tokens.ink, fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}
                        >
                            Log in
                        </a>
                    </p>
                </form>
            </div>
        </div>
    );
}
