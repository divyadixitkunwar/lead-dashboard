import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tokens } from '../styles/tokens';
import { useAuth } from '../context/AuthContext';
import heroImage from '../assets/hero-himalaya.jpg';

export default function ApplicationPendingPage() {
    const navigate = useNavigate();
    const { user, logout, refreshUser } = useAuth();
    const [checking, setChecking] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (user.status === 'active') {
            navigate('/app');
        }
    }, [user, navigate]);

    const handleCheckAgain = async () => {
        setChecking(true);
        const fresh = await refreshUser();
        setChecking(false);
        if (fresh?.status === 'active') navigate('/app');
    };

    if (!user) return null;

    const rejected = user.status === 'rejected';

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
        gap: '18px',
        textAlign: 'center',
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
                <div style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '22px', height: '22px', borderRadius: '7px', background: tokens.ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: '7px', height: '7px', background: tokens.ivory, borderRadius: '50%' }} />
                        </div>
                        <span style={{ fontSize: '19px', fontWeight: 700, letterSpacing: '-0.02em', color: tokens.ink }}>Ekikrit</span>
                    </div>

                    {rejected ? (
                        <>
                            <h1 style={{ margin: 0, fontFamily: tokens.display, fontSize: '30px', fontWeight: 500, letterSpacing: '-0.03em', color: tokens.ink }}>
                                Your application wasn't approved
                            </h1>
                            <p style={{ margin: 0, fontSize: '14.5px', color: tokens.inkMuted, lineHeight: 1.6 }}>
                                If you think this is a mistake, reach out and we can take another look.
                            </p>
                        </>
                    ) : (
                        <>
                            <h1 style={{ margin: 0, fontFamily: tokens.display, fontSize: '30px', fontWeight: 500, letterSpacing: '-0.03em', color: tokens.ink }}>
                                We've got your application
                            </h1>
                            <p style={{ margin: 0, fontSize: '14.5px', color: tokens.inkMuted, lineHeight: 1.6 }}>
                                Your email's verified  -  we're just reviewing your business before switching on
                                full access. You don't need to do anything else here. You can close this
                                tab and come back any time; logging in will just bring you straight back to
                                this same page until that's done.
                            </p>

                            <button
                                type="button"
                                onClick={handleCheckAgain}
                                disabled={checking}
                                style={{
                                    width: '100%',
                                    background: 'transparent',
                                    color: tokens.ink,
                                    border: '1px solid rgba(27,23,18,0.2)',
                                    borderRadius: '999px',
                                    padding: '11px',
                                    fontFamily: tokens.font,
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    cursor: checking ? 'default' : 'pointer',
                                    opacity: checking ? 0.6 : 1,
                                }}
                            >
                                {checking ? 'Checking…' : 'Check status again'}
                            </button>
                        </>
                    )}

                    <p style={{ margin: 0, fontSize: '13px', color: tokens.inkMuted }}>
                        Signed in as {user.email}  - {' '}
                        <a onClick={logout} style={{ color: tokens.ink, fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}>
                            log out
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
