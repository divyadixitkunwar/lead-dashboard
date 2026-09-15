import { tokens } from '../styles/tokens';

function WhatsAppLogo({ size = 12 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill={tokens.ink}>
            <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
        </svg>
    );
}

function MessengerLogo({ size = 12 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill={tokens.ink}>
            <path d="M0 7.76C0 3.301 3.493 0 8 0s8 3.301 8 7.76-3.493 7.76-8 7.76c-.81 0-1.586-.107-2.316-.307a.64.64 0 0 0-.427.03l-1.588.702a.64.64 0 0 1-.898-.566l-.044-1.423a.64.64 0 0 0-.215-.456C.956 12.108 0 10.092 0 7.76m5.546-1.459-2.35 3.728c-.225.358.214.761.551.506l2.525-1.916a.48.48 0 0 1 .578-.002l1.869 1.402a1.2 1.2 0 0 0 1.735-.32l2.35-3.728c.226-.358-.214-.761-.551-.506L9.728 7.381a.48.48 0 0 1-.578.002L7.281 5.98a1.2 1.2 0 0 0-1.735.32z" />
        </svg>
    );
}

function InstagramLogo({ size = 12 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill={tokens.ink}>
            <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334" />
        </svg>
    );
}

function Check({ size = 11 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
            <path d="M5 13l4.5 4.5L19 7" stroke={tokens.ink} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

const bullets = [
    'A status for every lead: new, contacted, qualified, or closed',
    "An alert the moment someone's waited too long",
    'Duplicate customers flagged automatically, so nobody replies twice',
];

const leads = [
    { name: 'Sunita Gurung', Icon: WhatsAppLogo, channel: 'WhatsApp', status: 'New', urgent: true, meta: 'Waiting 42m' },
    { name: 'Bikash Shrestha', Icon: MessengerLogo, channel: 'Messenger', status: 'Contacted', dup: true, meta: 'Possible duplicate' },
    { name: 'Anita Rai', Icon: InstagramLogo, channel: 'Instagram', status: 'Qualified', done: true, meta: 'Replied in 3m' },
];

export default function SlippingThrough() {
    return (
        <section
            id="product"
            style={{ position: 'relative', zIndex: 1, padding: '96px 24px', fontFamily: tokens.font }}
        >
            <style>{`
                @keyframes ek-kc-pulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(27,23,18,0.32); }
                    50% { box-shadow: 0 0 0 5px rgba(27,23,18,0); }
                }
                .ek-kc-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: ${tokens.ink};
                    flex-shrink: 0;
                    animation: ek-kc-pulse 1.7s ease-in-out infinite;
                }
                @media (prefers-reduced-motion: reduce) {
                    .ek-kc-dot { animation: none; }
                }
            `}</style>

            <div
                className="ek-kc-grid"
                style={{
                    maxWidth: '1140px',
                    margin: '0 auto',
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
                    gap: '64px',
                    alignItems: 'center',
                }}
            >
                <div>
                    <h2
                        style={{
                            fontSize: '38px', fontWeight: 600, letterSpacing: '-0.025em',
                            color: tokens.ink, margin: '0 0 16px', fontFamily: tokens.display,
                            lineHeight: 1.15,
                        }}
                    >
                        Keep every customer <em style={{ fontStyle: 'italic' }}>from slipping through.</em>
                    </h2>
                    <p style={{ fontSize: '15px', color: tokens.inkMuted, lineHeight: 1.6, margin: '0 0 28px', maxWidth: '440px' }}>
                        Every message gets a status the second it lands. If someone's waited
                        too long for a reply, you'll know, and if the same customer messages
                        twice, Ekikrit catches that too.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {bullets.map((b) => (
                            <div key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                <span style={{ marginTop: '3px' }}><Check /></span>
                                <span style={{ fontSize: '14.5px', fontWeight: 500, color: tokens.ink, lineHeight: 1.5 }}>{b}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div
                    className="ek-kc-visual"
                    style={{
                        position: 'relative',
                        width: '100%',
                        aspectRatio: '539 / 452',
                        boxSizing: 'border-box',
                        background: 'rgba(255,255,255,0.62)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        border: `1px solid ${tokens.ink}14`,
                        borderRadius: '26px',
                        padding: '36px 32px',
                        boxShadow: '0 24px 60px -24px rgba(36,31,26,0.4)',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: `${tokens.ink}75` }}>
                            Lead queue
                        </span>
                        <span style={{ fontSize: '11.5px', color: tokens.inkSoft }}>Updated just now</span>
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '18px' }}>
                        {leads.map((lead) => (
                            <div
                                key={lead.name}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px',
                                    background: '#fff', border: `1px solid ${tokens.ink}14`,
                                    borderRadius: '15px', padding: '17px 20px',
                                    boxShadow: '0 4px 12px -6px rgba(36,31,26,0.18)',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '13px', minWidth: 0 }}>
                                    <div style={{
                                        width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
                                        background: tokens.ink, color: tokens.ivory,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '14px', fontWeight: 600,
                                    }}>
                                        {lead.name.charAt(0)}
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '14.5px', fontWeight: 600, color: tokens.ink }}>
                                            {lead.name}
                                            {lead.dup && (
                                                <span style={{
                                                    fontSize: '9px', fontWeight: 700, letterSpacing: '0.04em',
                                                    background: `${tokens.ink}0f`, color: tokens.ink,
                                                    borderRadius: '999px', padding: '2px 7px', textTransform: 'uppercase',
                                                    whiteSpace: 'nowrap',
                                                }}>
                                                    Dup?
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: tokens.inkMuted, marginTop: '3px' }}>
                                            <lead.Icon /> {lead.channel}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                    <div style={{ fontSize: '11.5px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: `${tokens.ink}75` }}>
                                        {lead.status}
                                    </div>
                                    <div style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '5px',
                                        fontSize: '12.5px', marginTop: '4px', whiteSpace: 'nowrap',
                                        color: lead.urgent ? tokens.ink : tokens.inkMuted,
                                        fontWeight: lead.urgent ? 600 : 400,
                                    }}>
                                        {lead.urgent && <span className="ek-kc-dot" />}
                                        {lead.done && <Check size={10} />}
                                        {lead.meta}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}