import { tokens } from './Header';

// Same monochrome Bootstrap Icons (MIT licensed) as ChannelsStrip.jsx and
// ConnectChannelPage.jsx, duplicated here rather than imported so this file
// stays self-contained like every other section — single tokens.ink fill,
// no brand colors, matching convention.
function WhatsAppLogo({ size = 16 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill={tokens.ink}>
            <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
        </svg>
    );
}

function MessengerLogo({ size = 16 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill={tokens.ink}>
            <path d="M0 7.76C0 3.301 3.493 0 8 0s8 3.301 8 7.76-3.493 7.76-8 7.76c-.81 0-1.586-.107-2.316-.307a.64.64 0 0 0-.427.03l-1.588.702a.64.64 0 0 1-.898-.566l-.044-1.423a.64.64 0 0 0-.215-.456C.956 12.108 0 10.092 0 7.76m5.546-1.459-2.35 3.728c-.225.358.214.761.551.506l2.525-1.916a.48.48 0 0 1 .578-.002l1.869 1.402a1.2 1.2 0 0 0 1.735-.32l2.35-3.728c.226-.358-.214-.761-.551-.506L9.728 7.381a.48.48 0 0 1-.578.002L7.281 5.98a1.2 1.2 0 0 0-1.735.32z" />
        </svg>
    );
}

function InstagramLogo({ size = 16 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill={tokens.ink}>
            <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334" />
        </svg>
    );
}

// Left column — customer messages arriving from each channel. Cycles
// through the three icons so it reads as "coming from separate places"
// the way the reference's five-source fan-in does.
const leftMessages = [
    { Icon: WhatsAppLogo, text: 'kati ho yo?' },
    { Icon: MessengerLogo, text: 'is this in stock?' },
    { Icon: InstagramLogo, text: 'delivery time?' },
    { Icon: WhatsAppLogo, text: 'red ma cha?' },
    { Icon: MessengerLogo, text: 'price kati parcha' },
];

// Right column — grouped by the three tags the backend actually assigns
// (see src/services/intentTagger.js), not the Company/Team/Personal
// grouping the reference uses.
const rightGroups = [
    {
        label: 'Price inquiry',
        items: [
            { title: 'How much for the blue one?', meta: 'via WhatsApp' },
            { title: 'Quoted rate, 850', meta: 'via Messenger' },
        ],
    },
    {
        label: 'Delivery inquiry',
        items: [
            { title: 'Does it ship to Pokhara?', meta: 'via Instagram' },
            { title: 'Aaucha ki bihanai?', meta: 'via WhatsApp' },
        ],
    },
    {
        label: 'Availability',
        items: [
            { title: 'Size M matra cha?', meta: 'via Messenger' },
            { title: 'Restock date?', meta: 'via Instagram' },
        ],
    },
];

// Wire paths copied 1:1 from Arlo's real .hs-brain__wires SVG (same
// viewBox, same coordinates) so the fan-in/fan-out geometry matches the
// reference exactly. Flow animation is a single continuous loop, same
// as every other ambient animation already built in this file's siblings
// (UnifiedInbox's ek-flow, IntentDetection's rings) rather than a
// scroll-triggered one-shot, since Reveal only fades/translates the
// outer section and doesn't expose its is-in state to children.
const wirePaths = [
    'M 415.39 203.5 C 468.98 203.5, 468.98 297.5, 512.83 297.5',
    'M 407 246.5 C 465.21 246.5, 465.21 297.5, 512.83 297.5',
    'M 407 297.5 C 465.21 297.5, 465.21 297.5, 512.83 297.5',
    'M 407 348.5 C 465.21 348.5, 465.21 297.5, 512.83 297.5',
    'M 407 399.5 C 465.21 399.5, 465.21 297.5, 512.83 297.5',
    'M 627.17 297.5 C 674.79 297.5, 674.79 105.5, 733 105.5',
    'M 627.17 297.5 C 674.79 297.5, 674.79 173.5, 733 173.5',
    'M 627.17 297.5 C 674.79 297.5, 674.79 275.5, 733 275.5',
    'M 627.17 297.5 C 674.79 297.5, 674.79 343.5, 733 343.5',
    'M 627.17 297.5 C 674.79 297.5, 674.79 445.5, 733 445.5',
    'M 627.17 297.5 C 674.79 297.5, 674.79 513.5, 733 513.5',
];

export default function HowItWorks() {
    return (
        <section
            id="how-it-works"
            className="ek-hiw-sec"
            // Top padding clears the dashboard card that overlaps down
            // from Hero: --ek-hero-dash-half is the card's real measured
            // half-height (set by Hero.jsx via ResizeObserver, not
            // guessed), plus 152px, which is the reference site's actual
            // section-to-section gap (.hs-sec has 76px padding top and
            // bottom, so two adjacent sections are 76+76 apart). The
            // fallback (360px) only applies before Hero's effect runs.
            style={{
                position: 'relative', zIndex: 1, fontFamily: tokens.font,
                padding: 'calc(var(--ek-hero-dash-half, 360px) + 152px) 24px 96px',
            }}
        >
            <style>{`
                @media (max-width: 760px) {
                    /* Hero drops the seam-overlap trick at this same
                       breakpoint, so there's no card to clear here either. */
                    .ek-hiw-sec { padding-top: 96px !important; }
                }
                @keyframes ek-hiwFlow {
                    0% { stroke-dashoffset: 48px; }
                    100% { stroke-dashoffset: 0; }
                }
                .ek-hiw-wire-flow {
                    stroke: ${tokens.ink};
                    stroke-opacity: 0.55;
                    stroke-width: 2.4px;
                    stroke-linecap: round;
                    stroke-dasharray: 8 320;
                    animation: ek-hiwFlow 2.8s cubic-bezier(.45,0,.55,1) infinite;
                }
                @keyframes ek-hiwRingOut {
                    0%, 58% { opacity: 0; transform: scale(0.72); }
                    70% { opacity: 0.5; }
                    100% { opacity: 0; transform: scale(1.5); }
                }
                @keyframes ek-hiwCorePulse {
                    0%, 62%, 100% { transform: scale(1); }
                    70% { transform: scale(1.045); }
                    84% { transform: scale(0.995); }
                }
                @keyframes ek-hiwGlow {
                    0%, 100% { opacity: 0.35; transform: scale(0.9); }
                    50% { opacity: 0.75; transform: scale(1.18); }
                }
                .ek-hiw-ring { animation: ek-hiwRingOut 2.8s cubic-bezier(.22,1,.36,1) infinite; }
                .ek-hiw-ring:nth-of-type(1) { width: 138px; height: 138px; }
                .ek-hiw-ring:nth-of-type(2) { width: 172px; height: 172px; animation-delay: 1s; }
                .ek-hiw-ring:nth-of-type(3) { width: 206px; height: 206px; animation-delay: 2s; }
                .ek-hiw-core { animation: ek-hiwCorePulse 2.8s cubic-bezier(.22,1,.36,1) infinite; }
                .ek-hiw-glow { animation: ek-hiwGlow 2.8s ease-in-out infinite; }
                @media (max-width: 1000px) {
                    .ek-hiw-panel { grid-template-columns: 1fr !important; gap: 26px !important; }
                    .ek-hiw-wires { display: none; }
                }
                @media (prefers-reduced-motion: reduce) {
                    .ek-hiw-wire-flow, .ek-hiw-ring, .ek-hiw-core, .ek-hiw-glow { animation: none !important; }
                }
            `}</style>

            <div style={{ maxWidth: '620px', margin: '0 auto 48px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '38px', fontWeight: 600, letterSpacing: '-0.025em', color: tokens.ink, margin: '0 0 16px', fontFamily: tokens.display }}>
                    How it works
                </h2>
                <p style={{ fontSize: '15px', color: tokens.inkMuted, lineHeight: 1.6, margin: 0 }}>
                    A customer messages you on WhatsApp, Messenger, or Instagram. Ekikrit
                    catches it, tags it by what it's about, price, delivery, or stock, and
                    drops it in one inbox. You save time, and stop losing customers to slow
                    replies.
                </p>
            </div>

            <div
                className="ek-hiw-panel"
                style={{
                    position: 'relative',
                    maxWidth: '1140px',
                    margin: '0 auto',
                    background: 'rgba(255,255,255,0.62)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: `1px solid ${tokens.ink}0f`,
                    borderRadius: '26px',
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0,1fr) auto minmax(0,1fr)',
                    alignItems: 'center',
                    gap: '44px',
                    padding: '52px 46px',
                }}
            >
                <svg
                    aria-hidden="true"
                    className="ek-hiw-wires"
                    viewBox="0 0 1140 595"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
                >
                    {wirePaths.map((d, i) => (
                        <path key={`base-${i}`} d={d} stroke={`${tokens.ink}17`} strokeWidth="1.2" fill="none" />
                    ))}
                    {wirePaths.map((d, i) => (
                        <path
                            key={`flow-${i}`}
                            className="ek-hiw-wire-flow"
                            d={d}
                            fill="none"
                            style={{ animationDelay: `${i * 0.16}s` }}
                        />
                    ))}
                </svg>

                {/* Left: messages arriving from each channel */}
                <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '11px' }}>
                    {leftMessages.map(({ Icon, text }, i) => (
                        <span
                            key={i}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                background: '#fff', border: `1px solid ${tokens.ink}14`,
                                borderRadius: '11px', padding: '11px 14px', fontSize: '13.5px',
                                color: tokens.ink, boxShadow: '0 4px 12px -6px rgba(36,31,26,0.18)',
                            }}
                        >
                            <Icon />
                            {text}
                        </span>
                    ))}
                </div>

                {/* Center: empty hub, no icon, no label */}
                <div style={{ position: 'relative', zIndex: 1, width: '210px', height: '210px', display: 'grid', placeItems: 'center' }}>
                    <span
                        className="ek-hiw-glow"
                        style={{
                            position: 'absolute', width: '142px', height: '142px', borderRadius: '50%',
                            background: `radial-gradient(circle, ${tokens.ink}26, transparent 70%)`,
                        }}
                    />
                    {[0, 1, 2].map((r) => (
                        <span
                            key={r}
                            className="ek-hiw-ring"
                            style={{ position: 'absolute', borderRadius: '50%', border: `1px solid ${tokens.ink}26` }}
                        />
                    ))}
                    <span
                        className="ek-hiw-core"
                        style={{
                            position: 'relative', width: '112px', height: '112px', borderRadius: '50%',
                            background: tokens.ink, boxShadow: '0 14px 38px -10px rgba(27,23,18,0.5)',
                        }}
                    />
                </div>

                {/* Right: grouped by tag */}
                <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '11px' }}>
                    {rightGroups.map((group, gi) => (
                        <div key={group.label} style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
                            <span
                                style={{
                                    fontSize: '10.5px', fontWeight: 500, letterSpacing: '0.14em',
                                    textTransform: 'uppercase', color: `${tokens.ink}75`,
                                    marginTop: gi === 0 ? 0 : '10px',
                                }}
                            >
                                {group.label}
                            </span>
                            {group.items.map((item, i) => (
                                <span
                                    key={i}
                                    style={{
                                        display: 'flex', flexDirection: 'column', gap: '2px',
                                        background: '#fff', border: `1px solid ${tokens.ink}14`,
                                        borderRadius: '11px', padding: '11px 14px',
                                        boxShadow: '0 4px 12px -6px rgba(36,31,26,0.18)',
                                    }}
                                >
                                    <b style={{ fontSize: '14.5px', fontWeight: 500, color: tokens.ink }}>{item.title}</b>
                                    <small style={{ color: `${tokens.ink}85`, fontSize: '11.5px' }}>{item.meta}</small>
                                </span>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}