import { tokens } from '../styles/tokens';

const roster = [
    { name: 'Priya Shrestha', caption: 'Admin · assigned this' },
    { name: 'Raj Thapa', caption: 'Staff · added a note' },
    { name: 'Menuka K.C.', caption: 'Staff · replied 3×' },
];

const railPaths = [
    'M 570 208 C 570 264, 176 244, 176 300',
    'M 570 208 C 570 264, 432 244, 432 300',
    'M 570 208 C 570 264, 688 244, 688 300',
    'M 570 208 C 570 264, 944 244, 944 300',
];

export default function OnePlace() {
    return (
        <section style={{ position: 'relative', zIndex: 1, padding: '96px 24px', fontFamily: tokens.font }}>
            <style>{`
                @keyframes ek-tw-railFlow {
                    0% { stroke-dashoffset: 120px; opacity: 0; }
                    12% { opacity: 1; }
                    75% { opacity: 1; }
                    100% { stroke-dashoffset: -80px; opacity: 0; }
                }
                .ek-tw-rail-flow {
                    stroke: #6d789c;
                    stroke-width: 2.4px;
                    stroke-linecap: round;
                    stroke-dasharray: 8 320;
                    animation: 2.8s cubic-bezier(.45,0,.55,1) infinite ek-tw-railFlow;
                }
                @keyframes ek-tw-in {
                    0% { opacity: 0; transform: translateY(8px); }
                    100% { opacity: 1; transform: none; }
                }
                .ek-tw-mate {
                    animation: ek-tw-in .5s cubic-bezier(.22,1,.36,1) both;
                }
                @media (prefers-reduced-motion: reduce) {
                    .ek-tw-rail-flow, .ek-tw-mate { animation: none !important; }
                }
            `}</style>

            <div style={{ maxWidth: '620px', margin: '0 auto 48px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '38px', fontWeight: 600, letterSpacing: '-0.025em', color: tokens.ink, margin: '0 0 16px', fontFamily: tokens.display }}>
                    Give your team <em style={{ fontStyle: 'italic' }}>one place to work.</em>
                </h2>
                <p style={{ fontSize: '15px', color: tokens.inkMuted, lineHeight: 1.6, margin: 0 }}>
                    Invite your team, assign the right person to each conversation, and
                    everyone can see what's already been said, no separate logins, no
                    starting from zero.
                </p>
            </div>

            <div
                className="ek-tw-panel"
                style={{
                    position: 'relative',
                    maxWidth: '1140px',
                    margin: '0 auto',
                    background: 'rgba(255,255,255,0.62)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: `1px solid ${tokens.ink}0f`,
                    borderRadius: '26px',
                    padding: '40px 60px 44px',
                }}
            >
                <svg
                    aria-hidden="true"
                    className="ek-tw-rails"
                    viewBox="0 0 1140 440"
                    preserveAspectRatio="none"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
                >
                    {railPaths.map((d, i) => (
                        <path key={`base-${i}`} d={d} stroke="#6d789c4d" strokeWidth="1.2" fill="none" vectorEffect="non-scaling-stroke" />
                    ))}
                    {railPaths.map((d, i) => (
                        <path
                            key={`flow-${i}`}
                            className="ek-tw-rail-flow"
                            d={d}
                            fill="none"
                            vectorEffect="non-scaling-stroke"
                            style={{ animationDelay: `${i * 0.16}s` }}
                        />
                    ))}
                </svg>

                <div
                    style={{
                        position: 'relative', zIndex: 1,
                        width: 'min(560px, 100%)', margin: '0 auto',
                        background: '#fff', borderRadius: '16px',
                        padding: '20px 22px 18px',
                        boxShadow: '0 10px 26px -6px rgba(36,31,26,0.2)',
                        textAlign: 'left',
                    }}
                >
                    <span style={{ display: 'block', fontSize: '10px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: `${tokens.ink}75` }}>
                        Lead · assigned
                    </span>
                    <h3 style={{ margin: '6px 0 12px', fontSize: '17px', fontWeight: 600, color: tokens.ink, fontFamily: tokens.font }}>
                        Sunita Gurung  -  price inquiry
                    </h3>
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                        {[
                            'Asked about the blue kurta over WhatsApp',
                            'Price list sent within minutes',
                            'Status moved to qualified',
                        ].map((item) => (
                            <li key={item} style={{ position: 'relative', paddingLeft: '16px', fontSize: '13px', lineHeight: 1.7, color: tokens.inkMuted }}>
                                <span style={{ position: 'absolute', top: '0.72em', left: '2px', width: '5px', height: '5px', borderRadius: '50%', background: `${tokens.ink}47` }} />
                                {item}
                            </li>
                        ))}
                    </ul>
                    <small style={{ display: 'block', marginTop: '10px', fontSize: '11.5px', color: tokens.inkSoft }}>
                        Assigned to Priya Shrestha
                    </small>
                </div>

                <div
                    className="ek-tw-team"
                    style={{
                        position: 'relative', zIndex: 1,
                        display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px',
                        marginTop: '92px',
                    }}
                >
                    {roster.map((person, i) => (
                        <div
                            key={person.name}
                            className="ek-tw-mate"
                            style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                background: '#fff', border: `1px solid ${tokens.ink}14`,
                                borderRadius: '14px', padding: '12px 14px',
                                textAlign: 'left',
                                animationDelay: `${0.45 + i * 0.12}s`,
                            }}
                        >
                            <div style={{
                                width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
                                background: tokens.ink, color: tokens.ivory,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '13px', fontWeight: 600,
                            }}>
                                {person.name.charAt(0)}
                            </div>
                            <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                                <b style={{ fontSize: '13px', fontWeight: 500, color: tokens.ink }}>{person.name}</b>
                                <small style={{ fontSize: '11.5px', color: tokens.inkMuted }}>{person.caption}</small>
                            </div>
                        </div>
                    ))}

                    <div
                        className="ek-tw-mate"
                        style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            background: '#fff', border: `1px solid ${tokens.ink}14`,
                            borderRadius: '14px', padding: '12px 14px',
                            textAlign: 'left',
                            animationDelay: `${0.45 + roster.length * 0.12}s`,
                        }}
                    >
                        <div style={{
                            width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
                            background: `${tokens.ink}14`, color: `${tokens.ink}80`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '12px', fontWeight: 600,
                        }}>
                            +2
                        </div>
                        <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                            <b style={{ fontSize: '13px', fontWeight: 500, color: tokens.ink }}>+2 teammates</b>
                            <small style={{ fontSize: '11.5px', color: tokens.inkMuted }}>same inbox, same week</small>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}