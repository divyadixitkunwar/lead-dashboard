import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tokens } from './Header';
import heroImage from '../assets/hero-himalaya.jpg';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Shared across both signup screens (Account / Verify). Connecting a
// channel no longer happens as a third wizard step — it happens after
// approval, from the dashboard — so this only ever renders two steps now.
export function StepIndicator({ steps, activeIndex }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '18px', fontFamily: tokens.font }}>
            {steps.map((label, i) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span
                            style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                flexShrink: 0,
                                background: i === activeIndex ? tokens.ink : 'transparent',
                                border: i === activeIndex ? 'none' : `1px solid rgba(27,23,18,0.45)`,
                            }}
                        />
                        <span
                            style={{
                                fontSize: '14px',
                                fontWeight: i === activeIndex ? 600 : 500,
                                color: i === activeIndex ? tokens.ink : 'rgba(27,23,18,0.45)',
                            }}
                        >
                            {label}
                        </span>
                    </div>
                    {i < steps.length - 1 && (
                        <span style={{ width: '56px', height: '1px', background: 'rgba(27,23,18,0.2)' }} />
                    )}
                </div>
            ))}
        </div>
    );
}

function Field({ id, label, type = 'text', value, onChange, autoComplete, helper }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor={id} style={{ fontSize: '13px', fontWeight: 500, color: tokens.inkMuted }}>
                {label}
            </label>
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
            {helper && <span style={{ fontSize: '12px', color: tokens.inkSoft }}>{helper}</span>}
        </div>
    );
}

export default function SignupAccountPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ business_name: '', name: '', email: '', password: '', facebook_contact: '' });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (form.password.length < 8) {
            setError('Password needs to be at least 8 characters.');
            return;
        }

        setError('');
        setSubmitting(true);

        try {
            // UPDATED: actually call the backend registration endpoint
            const res = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Something went wrong. Try again.');
                return;
            }

            // UPDATED: only go to verification after registration succeeds
            navigate('/signup/verify', {
                state: { email: data.email || form.email },
            });
        } catch (err) {
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
                    position: 'fixed',
                    inset: 0,
                    zIndex: 0,
                    backgroundImage: `url(${heroImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'blur(40px)',
                    transform: 'scale(1.1)',
                }}
            />

            <div
                aria-hidden="true"
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 1,
                    background: 'rgba(246,241,231,0.6)',
                }}
            />

            <div style={{ position: 'relative', zIndex: 2, flexShrink: 0, paddingTop: '40px' }}>
                <StepIndicator steps={['Account', 'Verify']} activeIndex={0} />
            </div>

            <div
                style={{
                    position: 'relative',
                    zIndex: 2,
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '32px 16px',
                }}
            >
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
                        <div
                            style={{
                                width: '22px',
                                height: '22px',
                                borderRadius: '7px',
                                background: tokens.ink,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <div style={{ width: '7px', height: '7px', background: tokens.ivory, borderRadius: '50%' }} />
                        </div>
                        <span style={{ fontSize: '19px', fontWeight: 700, letterSpacing: '-0.02em', color: tokens.ink }}>
                            Ekikrit
                        </span>
                    </div>

                    <h1
                        style={{
                            margin: 0,
                            textAlign: 'center',
                            fontFamily: tokens.display,
                            fontSize: '32px',
                            fontWeight: 500,
                            letterSpacing: '-0.03em',
                            color: tokens.ink,
                        }}
                    >
                        Let's set up your inbox
                    </h1>

                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <Field
                            id="business_name"
                            label="Business name"
                            value={form.business_name}
                            onChange={set('business_name')}
                            autoComplete="organization"
                        />

                        <Field
                            id="name"
                            label="Your name"
                            value={form.name}
                            onChange={set('name')}
                            autoComplete="name"
                        />

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
                            autoComplete="new-password"
                            helper="At least 8 characters"
                        />

                        <Field
                            id="facebook_contact"
                            label="Your Facebook email or profile link"
                            value={form.facebook_contact}
                            onChange={set('facebook_contact')}
                            autoComplete="off"
                            helper="We use this to add you so the Facebook/Instagram connect step works once you're approved."
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
                        {submitting ? 'Creating account…' : 'Create account'}
                    </button>

                    <p style={{ margin: 0, fontSize: '12px', color: tokens.inkSoft, textAlign: 'center', lineHeight: 1.5 }}>
                        By continuing, you agree to the{' '}
                        <a href="/terms" style={{ color: tokens.inkMuted, textDecoration: 'underline' }}>
                            Terms
                        </a>{' '}
                        and{' '}
                        <a href="/privacy" style={{ color: tokens.inkMuted, textDecoration: 'underline' }}>
                            Privacy Policy
                        </a>
                        .
                    </p>

                    <p style={{ margin: 0, fontSize: '14px', color: tokens.inkMuted }}>
                        Already have an account?{' '}
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