import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tokens } from '../styles/tokens';
import Logo from './Logo';

const font = tokens.font;

export default function Header() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const scrollTo = (id) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    let authAction = null;
    if (user) {
        if (user.role === 'superadmin') {
            authAction = { label: 'Approvals', to: '/admin/approvals' };
        } else if (user.status === 'pending_approval' || user.status === 'rejected') {
            authAction = { label: 'My Application', to: '/application-pending' };
        } else if (!user.hasChannel) {
            authAction = { label: 'Connect', to: '/signup/connect' };
        } else {
            authAction = { label: 'Dashboard', to: '/app' };
        }
    }

    return (
        <nav
            aria-label="Main navigation"
            style={{
                position: "absolute",
                top: '32px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 50,
                width: 'min(92%, 56rem)',
                fontFamily: font,
            }}
        >
            <div
                style={{
                    borderRadius: '999px',
                    background: '#ffffff26',
                    border: '1px solid #ffffff45',
                    boxShadow: '0 4px 19.9px rgba(0,0,0,0.06), inset 0 -1px 10.9px #fff',
                    backdropFilter: 'blur(10px) saturate(1.25)',
                    WebkitBackdropFilter: 'blur(10px) saturate(1.25)',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px',
                    }}
                >
                    <div
                        onClick={() => scrollTo('top')}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', paddingLeft: '8px' }}
                    >
                        <Logo size={22} color={tokens.ink} />
                        <span style={{ fontFamily: tokens.display, fontSize: '20px', fontWeight: 600, letterSpacing: '-0.01em', color: tokens.ink }}>
                            Ekikrit
                        </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <button
                            onClick={() => scrollTo('product')}
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                fontFamily: font, fontSize: '14px', fontWeight: 500, color: tokens.ink,
                                padding: '10px 16px', borderRadius: '999px',
                            }}
                        >
                            Product
                        </button>
                        <button
                            onClick={() => scrollTo('how-it-works')}
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                fontFamily: font, fontSize: '14px', fontWeight: 500, color: tokens.ink,
                                padding: '10px 16px', borderRadius: '999px',
                            }}
                        >
                            How it works
                        </button>
                        {authAction ? (
                            <button
                                onClick={() => navigate(authAction.to)}
                                style={{
                                    background: tokens.ink, color: tokens.ivory, border: 'none',
                                    borderRadius: '999px', padding: '10px 20px', fontSize: '14px',
                                    fontWeight: 600, cursor: 'pointer', fontFamily: font, marginLeft: '4px',
                                }}
                            >
                                {authAction.label}
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => navigate('/login')}
                                    style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        fontFamily: font, fontSize: '14px', fontWeight: 500, color: tokens.ink,
                                        padding: '10px 16px', borderRadius: '999px',
                                    }}
                                >
                                    Log in
                                </button>
                                <button
                                    onClick={() => navigate('/signup')}
                                    style={{
                                        background: tokens.ink, color: tokens.ivory, border: 'none',
                                        borderRadius: '999px', padding: '10px 20px', fontSize: '14px',
                                        fontWeight: 600, cursor: 'pointer', fontFamily: font, marginLeft: '4px',
                                    }}
                                >
                                    Get started
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
