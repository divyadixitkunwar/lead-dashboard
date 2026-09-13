import { tokens } from './Header';

const inputs = [
    { emoji: '💬', text: 'kati parcha yesko?', sub: 'WhatsApp' },
    { emoji: '📦', text: 'stock cha ki sakkiyo?', sub: 'Messenger' },
    { emoji: '🚚', text: 'kathmandu samma pathaunu huncha?', sub: 'Instagram' },
];

const outputs = [
    { group: 'Price', title: 'Sunita Gurung — kati parcha?', meta: '2 min ago · unanswered' },
    { group: 'Stock', title: 'Bikash Shrestha — stock cha?', meta: '14 min ago · replied' },
    { group: 'Delivery', title: 'Anita Rai — pathaunu huncha?', meta: '1 hr ago · replied' },
];

// A connector is just a short line that lives inside its own row — it
// only ever has to span its own flex gap, so it can't drift out of sync
// with the chip it belongs to the way one global absolute-positioned SVG
// (matched to hand-guessed pixel coordinates) could and did.
function Connector({ reverse = false, delay = 0 }) {
    return (
        <div style={{ flex: 1, height: '1px', position: 'relative', minWidth: '24px' }}>
            <div style={{ position: 'absolute', inset: 0, background: `${tokens.ink}1a` }} />
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: `linear-gradient(${reverse ? '270deg' : '90deg'}, transparent, ${tokens.ink}, transparent)`,
                    animation: `ek-flow 2.6s ease-in-out infinite`,
                    animationDelay: `${delay}s`,
                }}
            />
        </div>
    );
}

export default function UnifiedInbox() {
    return (
        <section
            id="product"
            style={{ position: 'relative', zIndex: 1, padding: '96px 24px', fontFamily: tokens.font }}
        >
            <style>{`
                @keyframes ek-ringOut {
                    0%, 58% { opacity: 0; transform: scale(0.72); }
                    70% { opacity: 0.5; }
                    100% { opacity: 0; transform: scale(1.5); }
                }
                @keyframes ek-corePulse {
                    0%, 62%, 100% { transform: scale(1); }
                    70% { transform: scale(1.045); }
                    84% { transform: scale(0.995); }
                }
                @keyframes ek-glow {
                    0%, 100% { opacity: 0.35; transform: scale(0.9); }
                    50% { opacity: 0.75; transform: scale(1.18); }
                }
                @keyframes ek-flow {
                    0%, 100% { transform: translateX(-100%); opacity: 0; }
                    50% { opacity: 1; }
                    100% { transform: translateX(100%); opacity: 0; }
                }
                .ek-ring { animation: ek-ringOut 2.8s cubic-bezier(.22,1,.36,1) infinite; }
                .ek-ring:nth-of-type(1) { width: 118px; height: 118px; }
                .ek-ring:nth-of-type(2) { width: 148px; height: 148px; animation-delay: 1s; }
                .ek-ring:nth-of-type(3) { width: 178px; height: 178px; animation-delay: 2s; }
                .ek-core { animation: ek-corePulse 2.8s cubic-bezier(.22,1,.36,1) infinite; }
                .ek-glow-el { animation: ek-glow 2.8s ease-in-out infinite; }
                @media (prefers-reduced-motion: reduce) {
                    .ek-ring, .ek-core, .ek-glow-el, [style*="ek-flow"] { animation: none !important; }
                }
            `}</style>

            <div style={{ maxWidth: '680px', margin: '0 auto 48px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '38px', fontWeight: 600, letterSpacing: '-0.025em', color: tokens.ink, margin: '0 0 16px', fontFamily: tokens.display }}>
                    Every channel, <em style={{ fontStyle: 'italic' }}>one inbox.</em>
                </h2>
                <p style={{ fontSize: '15px', color: tokens.inkMuted, lineHeight: 1.6, margin: 0 }}>
                    WhatsApp, Messenger, and Instagram all land in the same place, tagged
                    by what the customer actually wants — before anyone on your team has to read a word.
                </p>
            </div>

            <div
                style={{
                    maxWidth: '1080px',
                    margin: '0 auto',
                    background: 'rgba(255,255,255,0.62)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: `1px solid ${tokens.ink}14`,
                    borderRadius: '26px',
                    padding: '52px 40px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '28px',
                }}
            >
                {/* One row per channel — chip, connector, core (center row
                    only), connector, tagged output. Everything lines up by
                    construction, not by guessed coordinates. */}
                {inputs.map((item, i) => (
                    <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span
                            style={{
                                flex: '0 1 260px', display: 'flex', alignItems: 'center', gap: '8px',
                                background: '#fff', border: `1px solid ${tokens.ink}14`,
                                borderRadius: '11px', padding: '11px 14px', fontSize: '13.5px',
                                color: tokens.ink, boxShadow: '0 4px 12px -6px rgba(36,31,26,0.18)',
                            }}
                        >
                            <span aria-hidden="true">{item.emoji}</span>
                            {item.text}
                        </span>

                        <Connector delay={i * 0.3} />

                        {/* Center column — only rendered once, on the middle row */}
                        {i === 1 ? (
                            <div style={{ flex: '0 0 auto', width: '140px', height: '140px', display: 'grid', placeItems: 'center', position: 'relative' }}>
                                <div
                                    className="ek-glow-el"
                                    style={{
                                        position: 'absolute', width: '110px', height: '110px', borderRadius: '50%',
                                        background: `radial-gradient(circle, ${tokens.ink}33, transparent 70%)`,
                                    }}
                                />
                                {[0, 1, 2].map((r) => (
                                    <span
                                        key={r}
                                        className="ek-ring"
                                        style={{ position: 'absolute', borderRadius: '50%', border: `1px solid ${tokens.ink}26` }}
                                    />
                                ))}
                                <span
                                    className="ek-core"
                                    style={{
                                        position: 'relative', zIndex: 2, width: '64px', height: '64px', borderRadius: '50%',
                                        background: tokens.ink, display: 'grid', placeItems: 'center',
                                        boxShadow: '0 12px 30px -6px rgba(10,77,104,0.42)',
                                    }}
                                >
                                    <div style={{ width: '8px', height: '8px', background: tokens.ivory, borderRadius: '50%' }} />
                                </span>
                            </div>
                        ) : (
                            <div style={{ flex: '0 0 auto', width: '140px' }} />
                        )}

                        <Connector reverse delay={1.2 + i * 0.3} />

                        <div style={{ flex: '0 1 260px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontSize: '10.5px', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: `${tokens.ink}75` }}>
                                {outputs[i].group}
                            </span>
                            <span
                                style={{
                                    background: '#fff', border: `1px solid ${tokens.ink}14`,
                                    borderRadius: '11px', padding: '11px 14px',
                                    boxShadow: '0 4px 12px -6px rgba(36,31,26,0.18)',
                                }}
                            >
                                <b style={{ display: 'block', fontSize: '13.5px', fontWeight: 500, color: tokens.ink }}>{outputs[i].title}</b>
                                <small style={{ color: `${tokens.ink}85`, fontSize: '11.5px' }}>{outputs[i].meta}</small>
                            </span>
                        </div>
                    </div>
                ))}
                <div style={{ textAlign: 'center', fontSize: '9.5px', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: `${tokens.ink}75` }}>
                    Unified inbox
                </div>
            </div>
        </section>
    );
}