import { useNavigate } from 'react-router-dom';

const font = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif";

const INTENT_DEMO = [
    { phrase: 'kati parcha yesko?', tag: 'Price', color: '#AF52DE', bg: 'rgba(175,82,222,0.08)' },
    { phrase: 'stock cha ki sakkiyo?', tag: 'Stock', color: '#30B0C7', bg: 'rgba(48,176,199,0.08)' },
    { phrase: 'kathmandu samma pathaunu huncha?', tag: 'Delivery', color: '#FF9500', bg: 'rgba(255,149,0,0.08)' },
];

const CHANNELS = [
    { name: 'WhatsApp', color: '#25D366', bubble: 'kati parcha yo?' },
    { name: 'Messenger', color: '#0084FF', bubble: 'stock cha?' },
    { name: 'Instagram', color: '#E1306C', bubble: 'delivery hunxa?' },
];

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div style={{ fontFamily: font, background: '#fff', color: '#1D1D1F' }}>
            <style>{`
                @keyframes convergeWA { 0% { transform: translate(-90px,-40px) scale(0.9); opacity: 0; } 60% { opacity: 1; } 100% { transform: translate(0,0) scale(1); opacity: 1; } }
                @keyframes convergeMS { 0% { transform: translate(0,-60px) scale(0.9); opacity: 0; } 60% { opacity: 1; } 100% { transform: translate(0,0) scale(1); opacity: 1; } }
                @keyframes convergeIG { 0% { transform: translate(90px,-40px) scale(0.9); opacity: 0; } 60% { opacity: 1; } 100% { transform: translate(0,0) scale(1); opacity: 1; } }
                @keyframes riseRow { 0% { transform: translateY(14px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
                .bubble-wa { animation: convergeWA 0.9s cubic-bezier(.2,.8,.2,1) both; }
                .bubble-ms { animation: convergeMS 0.9s cubic-bezier(.2,.8,.2,1) 0.12s both; }
                .bubble-ig { animation: convergeIG 0.9s cubic-bezier(.2,.8,.2,1) 0.24s both; }
                .lead-row { animation: riseRow 0.6s ease 0.7s both; }
                @media (prefers-reduced-motion: reduce) {
                    .bubble-wa, .bubble-ms, .bubble-ig, .lead-row { animation: none !important; }
                }
            `}</style>

            {/* Nav */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '20px 48px', borderBottom: '1px solid rgba(0,0,0,0.06)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
                    <div style={{
                        width: '30px', height: '30px', borderRadius: '9px',
                        background: 'linear-gradient(135deg, #1D1D1F, #3A3A3C)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <div style={{ width: '10px', height: '10px', background: '#fff', borderRadius: '50%', opacity: 0.9 }} />
                    </div>
                    <span style={{ fontSize: '15px', fontWeight: '600', letterSpacing: '-0.01em' }}>Ekikrit</span>
                </div>
                <button
                    onClick={() => navigate('/login')}
                    style={{
                        background: '#1D1D1F', color: '#fff', border: 'none',
                        borderRadius: '10px', padding: '9px 20px', fontSize: '14px',
                        fontWeight: '500', cursor: 'pointer', fontFamily: font,
                    }}
                >
                    Log in
                </button>
            </div>

            {/* Hero */}
            <div style={{ padding: '90px 48px 70px', maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}>
                <h1 style={{
                    fontSize: '44px', fontWeight: '600', letterSpacing: '-0.03em',
                    lineHeight: '1.15', margin: '0 0 18px',
                }}>
                    Every {'"kati parcha?"'}<br />in one place.
                </h1>
                <p style={{ fontSize: '17px', color: '#6E6E73', lineHeight: '1.6', margin: '0 0 36px' }}>
                    WhatsApp, Messenger, and Instagram messages — pulled into one inbox,
                    tagged by what your customer actually wants, in the Nepali your customers actually type.
                </p>
                <button
                    onClick={() => navigate('/login')}
                    style={{
                        background: '#0071E3', color: '#fff', border: 'none',
                        borderRadius: '12px', padding: '13px 28px', fontSize: '15px',
                        fontWeight: '500', cursor: 'pointer', fontFamily: font,
                    }}
                >
                    Log in to your dashboard
                </button>
            </div>

            {/* Signature: convergence visual */}
            <div style={{ padding: '0 48px 100px', maxWidth: '820px', margin: '0 auto' }}>
                <div style={{ position: 'relative', height: '210px', marginBottom: '18px' }}>
                    {CHANNELS.map((c, i) => (
                        <div
                            key={c.name}
                            className={i === 0 ? 'bubble-wa' : i === 1 ? 'bubble-ms' : 'bubble-ig'}
                            style={{
                                position: 'absolute', top: 0,
                                left: `calc(50% + ${(i - 1) * 220}px - 90px)`,
                                width: '180px', background: '#fff',
                                border: `1px solid ${c.color}33`, borderRadius: '14px 14px 14px 4px',
                                padding: '12px 16px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                            }}
                        >
                            <div style={{ fontSize: '11px', fontWeight: '600', color: c.color, marginBottom: '5px' }}>
                                {c.name}
                            </div>
                            <div style={{ fontSize: '13px', color: '#1D1D1F' }}>{c.bubble}</div>
                        </div>
                    ))}

                    <div
                        className="lead-row"
                        style={{
                            position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                            width: '440px', background: '#fff', borderRadius: '14px',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.06)',
                            padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '13px',
                        }}
                    >
                        <div style={{
                            width: '36px', height: '36px', borderRadius: '11px',
                            background: 'linear-gradient(135deg, #1D1D1F, #3A3A3C)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '13px', fontWeight: '500', color: '#fff', flexShrink: 0,
                        }}>
                            S
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '14px', fontWeight: '500' }}>Sunita Gurung</div>
                            <div style={{ fontSize: '12px', color: '#AEAEB2' }}>3 channels · unified</div>
                        </div>
                        <span style={{
                            fontSize: '12px', fontWeight: '500', color: '#AF52DE',
                            background: 'rgba(175,82,222,0.08)', borderRadius: '7px', padding: '4px 10px',
                        }}>
                            Price
                        </span>
                    </div>
                </div>
                <p style={{ textAlign: 'center', fontSize: '13px', color: '#AEAEB2' }}>
                    Three inboxes. One lead.
                </p>
            </div>

            {/* Intent classification section */}
            <div style={{ background: '#F5F5F7', padding: '70px 48px' }}>
                <div style={{ maxWidth: '760px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '26px', fontWeight: '600', letterSpacing: '-0.02em', marginBottom: '10px', textAlign: 'center' }}>
                        It reads Romanized Nepali. Really.
                    </h2>
                    <p style={{ fontSize: '15px', color: '#6E6E73', textAlign: 'center', marginBottom: '40px' }}>
                        Spelling variants, slang, and shorthand — matched to intent automatically.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {INTENT_DEMO.map(d => (
                            <div key={d.phrase} style={{
                                background: '#fff', borderRadius: '14px', padding: '16px 22px',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                            }}>
                                <span style={{ fontSize: '15px' }}>{`"${d.phrase}"`}</span>
                                <span style={{
                                    fontSize: '13px', fontWeight: '500', color: d.color,
                                    background: d.bg, borderRadius: '7px', padding: '4px 12px',
                                }}>
                                    {d.tag}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Contact / onboarding */}
            <div style={{ padding: '80px 48px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '600', letterSpacing: '-0.02em', marginBottom: '12px' }}>
                    Bring your business onto Ekikrit
                </h2>
                <p style={{ fontSize: '15px', color: '#6E6E73', marginBottom: '28px', lineHeight: '1.6' }}>
                    Accounts are set up individually so every channel connects correctly.
                    Message us and we will get you running.
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <a
                        href="https://wa.me/9770000000000"
                        target="_blank" rel="noopener noreferrer"
                        style={{
                            background: '#25D366', color: '#fff', textDecoration: 'none',
                            borderRadius: '11px', padding: '12px 22px', fontSize: '14px', fontWeight: '500',
                        }}
                    >
                        Message us on WhatsApp
                    </a>
                    <a
                        href="mailto:hello@ekikrit.app"
                        style={{
                            background: '#F5F5F7', color: '#1D1D1F', textDecoration: 'none',
                            borderRadius: '11px', padding: '12px 22px', fontSize: '14px', fontWeight: '500',
                        }}
                    >
                        hello@ekikrit.app
                    </a>
                </div>
            </div>

            {/* Footer */}
            <div style={{
                borderTop: '1px solid rgba(0,0,0,0.06)', padding: '24px 48px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                fontSize: '13px', color: '#AEAEB2',
            }}>
                <span>© 2026 Ekikrit</span>
                <button
                    onClick={() => navigate('/login')}
                    style={{ background: 'none', border: 'none', color: '#6E6E73', cursor: 'pointer', fontSize: '13px', fontFamily: font }}
                >
                    Log in
                </button>
            </div>
        </div>
    );
}