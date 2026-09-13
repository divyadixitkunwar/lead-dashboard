import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const font = "'Inter', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif";

// Display/headline font — Fraunces 72pt, loaded from public/fonts via
// fonts.css. Same family the Footer wordmark was traced from.
const display = "'Fraunces', Georgia, 'Times New Roman', serif";

// Design tokens for the redesign — reference these same values in every
// section going forward so the page stays visually consistent.
// Color accents (blue/terracotta/stone) are gone — everything is ink,
// black, on ivory now, matching Arlo instead of a multi-color palette.
export const tokens = {
    ivory: '#F6F1E7',
    ink: '#1B1712',
    inkMuted: 'rgba(27, 23, 18, 0.6)',
    inkSoft: 'rgba(27, 23, 18, 0.4)',
    surface: '#FDFBF6',
    pillRest: 'rgba(244, 243, 236, 0.5)',
    pillHover: '#F3F2EB',
    font,
    display,
};

export default function Header() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const scrollTo = (id) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // Previously this was hardcoded to always show Log in / Get started,
    // regardless of whether anyone was logged in — it never touched
    // useAuth() at all. Now it reflects the account's actual state:
    //   not logged in         -> Log in / Get started (unchanged)
    //   superadmin            -> single "Approvals" button
    //   pending_approval      -> single "My Application" button
    //   active, no channel    -> single "Connect" button (there's nothing
    //                            useful to show on the dashboard yet, so
    //                            this points at connecting, not at /app)
    //   active, has a channel -> single "Dashboard" button
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
            {/* Background now matches Arlo's real .hs-nav exactly:
                background:#ffffff26, border:1px solid #ffffff45,
                backdrop-filter:blur(10px) saturate(1.25), plus the
                box-shadow that gives it the glassy edge-lit look —
                none of which was there before. No hover state — the
                pill no longer changes on mouseenter/mouseleave. */}
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
                    {/* Logo */}
                    <div
                        onClick={() => scrollTo('top')}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', paddingLeft: '8px' }}
                    >
                        <div
                            style={{
                                width: '22px',
                                height: '22px',
                                borderRadius: '7px',
                                background: tokens.ink,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                            }}
                        >
                            <div style={{ width: '7px', height: '7px', background: tokens.ivory, borderRadius: '50%' }} />
                        </div>
                        <span style={{ fontSize: '19px', fontWeight: 700, letterSpacing: '-0.02em', color: tokens.ink }}>
                            Ekikrit
                        </span>
                    </div>

                    {/* Right cluster — links + auth actions grouped together */}
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