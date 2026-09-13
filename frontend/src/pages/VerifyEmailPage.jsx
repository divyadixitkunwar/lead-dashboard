import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { tokens } from './Header';
import { StepIndicator } from './SignUpAccountPage';
import { useAuth } from '../context/AuthContext';
import heroImage from '../assets/hero-himalaya.jpg';

// Adjust if your backend runs elsewhere / you proxy API calls differently.
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function VerifyEmailPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const email = location.state?.email;

    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [cooldown, setCooldown] = useState(0);
    const [resending, setResending] = useState(false);
    const [resendNotice, setResendNotice] = useState('');

    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setInterval(() => setCooldown((c) => (c > 0 ? c - 1 : 0)), 1000);
        return () => clearInterval(t);
    }, [cooldown]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            const res = await fetch(`${API_BASE}/auth/verify-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Invalid code.');
                return;
            }
            // Goes through AuthContext (not raw localStorage) so `user` in
            // context updates synchronously with this client-side navigate.
            // Writing localStorage directly here left context's `user` as
            // null until a full reload, which made ProtectedRoute bounce
            // straight back to /login on the very next screen.
            login(data.token, data.user);
            // Verifying logs them in for good — no separate "log in again"
            // step. Always goes to the waiting page now; there's no branch
            // to `active` here since verify-email always lands on
            // pending_approval.
            navigate('/application-pending');
        } catch {
            setError('Network error. Try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleResend = async () => {
        setResendNotice('');
        setError('');
        setResending(true);
        try {
            const res = await fetch(`${API_BASE}/auth/resend-verification`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) {
                if (data.wait_seconds) setCooldown(data.wait_seconds);
                setError(data.error || 'Could not resend code.');
                return;
            }
            setCooldown(60);
            setResendNotice('New code sent.');
        } catch {
            setError('Network error. Try again.');
        } finally {
            setResending(false);
        }
    };

    const cardStyle = {
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

            <div style={{ position: 'relative', zIndex: 2, flexShrink: 0, paddingTop: '40px' }}>
                {/* "Connect" is no longer a signup-wizard step — connecting a
                    channel now happens after approval, from the dashboard,
                    not as part of this sequence. Two steps, not three. */}
                <StepIndicator steps={['Account', 'Verify']} activeIndex={1} />
            </div>

            <div style={{ position: 'relative', zIndex: 2, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
                {!email ? (
                    <div style={cardStyle}>
                        <p style={{ margin: 0, fontSize: '15px', color: tokens.inkMuted, textAlign: 'center' }}>
                            We couldn't find a signup in progress.
                        </p>
                        <a onClick={() => navigate('/signup')} style={{ color: tokens.ink, fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}>
                            Start signup again
                        </a>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={cardStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '22px', height: '22px', borderRadius: '7px', background: tokens.ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ width: '7px', height: '7px', background: tokens.ivory, borderRadius: '50%' }} />
                            </div>
                            <span style={{ fontSize: '19px', fontWeight: 700, letterSpacing: '-0.02em', color: tokens.ink }}>Ekikrit</span>
                        </div>

                        <h1 style={{ margin: 0, textAlign: 'center', fontFamily: tokens.display, fontSize: '32px', fontWeight: 500, letterSpacing: '-0.03em', color: tokens.ink }}>
                            Check your email
                        </h1>
                        <p style={{ margin: '-10px 0 0', fontSize: '14px', color: tokens.inkMuted, textAlign: 'center' }}>
                            We sent a code to <strong style={{ color: tokens.ink }}>{email}</strong>
                        </p>

                        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label htmlFor="code" style={{ fontSize: '13px', fontWeight: 500, color: tokens.inkMuted }}>
                                Verification code
                            </label>
                            <input
                                id="code"
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                required
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                style={{
                                    fontFamily: tokens.font,
                                    fontSize: '24px',
                                    letterSpacing: '8px',
                                    textAlign: 'center',
                                    color: tokens.ink,
                                    background: 'rgba(255,255,255,0.6)',
                                    border: '1px solid rgba(27,23,18,0.15)',
                                    borderRadius: '10px',
                                    padding: '12px 14px',
                                    outline: 'none',
                                }}
                                onFocus={(e) => (e.target.style.borderColor = 'rgba(27,23,18,0.35)')}
                                onBlur={(e) => (e.target.style.borderColor = 'rgba(27,23,18,0.15)')}
                            />
                        </div>

                        {error && <span style={{ fontSize: '13px', color: '#B3261E', alignSelf: 'flex-start' }}>{error}</span>}
                        {!error && resendNotice && <span style={{ fontSize: '13px', color: tokens.inkMuted, alignSelf: 'flex-start' }}>{resendNotice}</span>}

                        <button
                            type="submit"
                            disabled={submitting || code.length !== 6}
                            style={{
                                width: '100%', background: tokens.ink, color: tokens.ivory, border: 'none',
                                borderRadius: '999px', padding: '13px', fontFamily: tokens.font, fontSize: '15px',
                                fontWeight: 600, cursor: submitting ? 'default' : 'pointer',
                                opacity: submitting || code.length !== 6 ? 0.6 : 1,
                            }}
                        >
                            {submitting ? 'Verifying…' : 'Verify email'}
                        </button>

                        <p style={{ margin: 0, fontSize: '14px', color: tokens.inkMuted }}>
                            Didn't get it?{' '}
                            <a
                                onClick={cooldown > 0 || resending ? undefined : handleResend}
                                style={{
                                    color: cooldown > 0 || resending ? tokens.inkSoft : tokens.ink,
                                    fontWeight: 600, textDecoration: 'underline',
                                    cursor: cooldown > 0 || resending ? 'default' : 'pointer',
                                }}
                            >
                                {cooldown > 0 ? `Resend in ${cooldown}s` : resending ? 'Sending…' : 'Resend code'}
                            </a>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}
