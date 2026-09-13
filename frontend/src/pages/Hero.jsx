import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { tokens } from './Header';
import heroImage from '../assets/hero-himalaya.jpg';
import washSky from "../assets/wash-sky.svg?url"
import washCream from "../assets/wash-cream.svg?url"
import washOlive from "../assets/wash-olive.svg?url"

// Sidebar nav icons — plain, minimal line icons for a real navigation
// list (Inbox, Assigned, Contacts, Automations, Settings), replacing the
// old channel-logo / tag-dot lists that made the sidebar read as a legend
// of sample data rather than an actual product nav.
function InboxNavIcon({ size = 14 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
            <rect x="1.5" y="3.4" width="13" height="9.6" rx="1.5" />
            <path d="M1.5 8.6h3.3l1 1.9h4.4l1-1.9h3.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function UserNavIcon({ size = 14 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
            <circle cx="8" cy="5.2" r="2.6" />
            <path d="M2.6 13.4c0-2.6 2.4-4 5.4-4s5.4 1.4 5.4 4" strokeLinecap="round" />
        </svg>
    );
}

function ContactsNavIcon({ size = 14 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
            <rect x="2" y="1.8" width="12" height="12.4" rx="1.5" />
            <circle cx="8" cy="6.3" r="1.7" />
            <path d="M4.8 11.5c0-1.5 1.4-2.4 3.2-2.4s3.2.9 3.2 2.4" strokeLinecap="round" />
        </svg>
    );
}

function AutomationNavIcon({ size = 14 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M8.8 1.5 3 9h4l-1 5.5L13 7H9z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function SettingsNavIcon({ size = 14 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
            <circle cx="8" cy="8" r="2.2" />
            <path d="M8 1.6v1.7M8 12.7v1.7M14.4 8h-1.7M3.3 8H1.6M12.4 3.6l-1.2 1.2M4.8 11.2l-1.2 1.2M12.4 12.4l-1.2-1.2M4.8 4.8 3.6 3.6" strokeLinecap="round" />
        </svg>
    );
}

function SearchIcon({ size = 13 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={tokens.inkSoft} strokeWidth="1.4">
            <circle cx="7" cy="7" r="5.2" />
            <line x1="10.8" y1="10.8" x2="14.5" y2="14.5" strokeLinecap="round" />
        </svg>
    );
}

function ChevronDownIcon({ size = 9 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 12 8" fill="none" stroke={tokens.inkMuted} strokeWidth="1.6">
            <path d="M1 2l5 4 5-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export default function Hero() {
    const navigate = useNavigate();

    // The How-it-works section needs to know how far its own content
    // should sit below the seam, since half the dashboard card overlaps
    // into it. Rather than guessing that height, measure the card for
    // real and publish it as a CSS var HowItWorks.jsx reads — stays
    // correct if the card's content (row count, etc.) ever changes.
    const dashCardRef = useRef(null);

    useEffect(() => {
        const el = dashCardRef.current;
        if (!el) return;
        const publish = () => {
            document.documentElement.style.setProperty('--ek-hero-dash-half', `${el.offsetHeight / 2}px`);
        };
        publish();
        const ro = new ResizeObserver(publish);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const headlineRef = useRef(null);

    const scrollTo = (id) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const stats = [
        { label: 'Messages today', value: '42' },
        { label: 'Auto-tagged', value: '38' },
        { label: 'Unassigned', value: '4', accent: true },
        { label: 'Busiest channel', value: 'WhatsApp' },
    ];

    // 8 rows instead of 5 — the card needed real length now that it
    // straddles the seam between Hero and How it works, not just a
    // five-row sample.
    const rows = [
        { name: 'Sita', channel: 'WhatsApp', text: 'kati parcha?', tag: 'Price', assignee: 'You' },
        { name: 'Rita', channel: 'Messenger', text: 'stock cha ki?', tag: 'Stock', assignee: 'Maya' },
        { name: 'Bimal', channel: 'Instagram', text: 'kailey samma?', tag: 'Delivery', assignee: 'You' },
        { name: 'Kabita', channel: 'WhatsApp', text: 'discount huncha?', tag: 'Price', assignee: 'Maya' },
        { name: 'Suresh', channel: 'Messenger', text: 'bholi available?', tag: 'Stock', assignee: 'You' },
        { name: 'Deepak', channel: 'WhatsApp', text: 'yo cha ki red ma?', tag: 'Stock', assignee: 'Maya' },
        { name: 'Anita', channel: 'Instagram', text: 'how much for two?', tag: 'Price', assignee: 'You' },
        { name: 'Nabin', channel: 'Messenger', text: 'kaha samma deliver huncha?', tag: 'Delivery', assignee: 'Maya' },
    ];

    // A proper nav list instead of a dump of the sample channels/tags —
    // this is what a real inbox product's sidebar actually contains.
    const navItems = [
        { Icon: InboxNavIcon, label: 'Inbox', active: true },
        { Icon: UserNavIcon, label: 'Assigned to me' },
        { Icon: ContactsNavIcon, label: 'Contacts' },
    ];

    const navItemsSecondary = [
        { Icon: AutomationNavIcon, label: 'Automations' },
        { Icon: SettingsNavIcon, label: 'Settings' },
    ];

    // Distinct, muted-palette treatments per tag/channel/row so the table
    // doesn't read as one flat grey stamp repeated five times — this is
    // the single biggest thing separating a "real" dashboard screenshot
    // from a component-kit dummy.
    const tagStyles = {
        Price: { bg: '#F6E8CC', fg: '#8A6415' },
        Stock: { bg: '#DBE7F4', fg: '#2D5C89' },
        Delivery: { bg: '#DDEEE0', fg: '#2E6A3E' },
    };

    const channelDotColors = {
        WhatsApp: '#8CA98F',
        Messenger: '#8CA3C7',
        Instagram: '#C7A0AE',
    };

    const avatarTints = ['#EFE9E1', '#E7ECEA', '#EEE7EE', '#E9EEE7', '#E6ECEF', '#EFE9E1', '#E7ECEA', '#EEE7EE'];

    return (
        // Root is now a plain, unclipped section. The photo/wash/copy live
        // in their own clipped rounded panel below; the dashboard is a
        // sibling of that panel, not a child of it, specifically so it's
        // free to render past the panel's edges without being cut off by
        // the panel's own overflow:hidden.
        <section id="hero" style={{ position: 'relative', zIndex: 3, width: '100%', fontFamily: tokens.font }}>
            <style>{`
                @keyframes ek-heroSettle {
                    0%   { opacity: 0.9; transform: scale(1.04); filter: blur(14px); }
                    100% { opacity: 0.9; transform: scale(1);    filter: blur(3px);  }
                }

                .ek-hero-photo {
                    animation: ek-heroSettle 0.8s cubic-bezier(.22,1,.36,1) both;
                }

                @keyframes ek-headlineRise {
                    0% {
                        opacity: 0;
                        transform: translateY(24px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .ek-hero-headline {
                    animation: ek-headlineRise 1.3s cubic-bezier(.22,1,.36,1) both;
                }

                @keyframes ek-dashRise {
                    0%   { opacity: 0; transform: translate(-50%, -50%) translateY(36px) scale(0.97); }
                    100% { opacity: 1; transform: translate(-50%, -50%) translateY(0)    scale(1);    }
                }

                .ek-hero-dash-card {
                    animation: ek-dashRise 1.3s cubic-bezier(.22,1,.36,1) both;
                    animation-delay: 0s;
                }

                @media (prefers-reduced-motion: reduce) {
                    .ek-hero-photo {
                        animation: none;
                        opacity: 0.9;
                        filter: blur(3px);
                        transform: none;
                    }

                    .ek-hero-headline {
                        animation: none;
                        opacity: 1;
                        transform: none;
                    }

                    .ek-hero-dash-card {
                        animation: none;
                        opacity: 1;
                    }
                }

                @media (max-width: 760px) {
                    .ek-hero-sidebar { display: none !important; }
                    .ek-hero-stats { grid-template-columns: repeat(2, 1fr) !important; }
                    .ek-hero-toolbar { flex-wrap: wrap; }
                    /* Below the breakpoint where the card would get too
                       cramped to overlap gracefully, drop the overlap and
                       let it sit in normal flow instead. */
                    .ek-hero-dash-anchor { height: auto !important; }
                    .ek-hero-dash-card { position: relative !important; left: auto !important; top: auto !important; transform: none !important; margin: 0 auto; }
                }
            `}</style>

            {/* Photo panel: unchanged size (100svh), unchanged clipping.
                Contains only the background image, wash, and hero copy —
                no dashboard inside it anymore. */}
            <div
                style={{
                    position: 'relative',
                    isolation: 'isolate',
                    width: '100%',
                    minHeight: '100svh',
                    background: tokens.ivory,
                    borderRadius: '13px',
                    padding: '35px 24px 64px',
                    boxSizing: 'border-box',
                    overflow: 'hidden',
                }}
            >
                <div
                    className="ek-hero-photo"
                    style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 0,
                        backgroundImage: `url(${heroImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center center',
                        pointerEvents: 'none',
                    }}
                />

                <div
                    style={{
                        position: 'absolute',
                        pointerEvents: 'none',
                        zIndex: 1,
                        width: '169.05%',
                        // 77.6% left a gap between sky's bottom edge
                        // (-29.4% + 77.6% = 48.2%) and olive's top edge
                        // (61.3%) with nothing covering it — that gap was
                        // the line. 92% closes it exactly, with a hair of
                        // overlap into olive rather than falling short.
                        height: '92%',
                        left: '-32.9%',
                        top: '-29.4%',
                        background: `url(${washSky}) 50% / 100% 100% no-repeat`,
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        pointerEvents: 'none',
                        zIndex: 3,
                        width: '136%',
                        height: '53.9%',
                        left: '-19.6%',
                        top: '68.2%',
                        background: `url(${washCream}) 50% / 100% 100% no-repeat`,
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        pointerEvents: 'none',
                        zIndex: 3,
                        width: '169.05%',
                        height: '77.6%',
                        left: '-32.9%',
                        top: '61.3%',
                        background: `url(${washOlive}) 50% / 100% 100% no-repeat`,
                    }}
                />

                <div
                    style={{
                        position: 'relative',
                        zIndex: 4,
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}
                >
                    <div
                        ref={headlineRef}
                        className="ek-hero-headline"
                        style={{
                            // ↓↓↓ THIS IS THE VALUE TO EDIT ↓↓↓
                            // Pushed intentionally low right now (was 90px)
                            // so it's obvious on screen whether the change
                            // is landing. Adjust this single number until
                            // the gap to the header looks right.
                            marginTop: '180px',
                            width: '100%',
                            maxWidth: '520px',
                            padding: '0 24px',
                            boxSizing: 'border-box',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '20px'
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '12px',
                                width: '100%',
                                textAlign: 'center'
                            }}
                        >
                            <h1
                                style={{
                                    width: '100%',
                                    fontSize: '50px',
                                    fontWeight: 500,
                                    letterSpacing: '-0.05em',
                                    lineHeight: 1.2,
                                    color: tokens.ink,
                                    margin: 0,
                                    fontFamily: tokens.display,
                                }}
                            >
                                Every "kati parcha?"<br />
                                in one place.
                            </h1>

                            <p
                                style={{
                                    width: '100%',
                                    fontSize: '16px',
                                    fontWeight: 500,
                                    letterSpacing: '-0.02em',
                                    lineHeight: 1.5,
                                    color: tokens.ink,
                                    opacity: 0.85,
                                    margin: 0,
                                }}
                            >
                                You can't catch every message the second it comes in, but we can,
                                so not one gets missed, not one customer goes unseen.
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <button
                                onClick={() => navigate('/signup')}
                                style={{
                                    background: tokens.ink,
                                    color: tokens.ivory,
                                    border: 'none',
                                    borderRadius: '999px',
                                    padding: '10.8px 19.8px 11.7px',
                                    fontSize: '13.5px',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    fontFamily: tokens.font,
                                }}
                            >
                                Get started
                            </button>

                            <button
                                onClick={() => scrollTo('how-it-works')}
                                style={{
                                    background: 'rgba(255,255,255,0.55)',
                                    color: tokens.ink,
                                    border: '1px solid rgba(36,31,26,0.15)',
                                    borderRadius: '999px',
                                    padding: '10.8px 19.8px 11.7px',
                                    fontSize: '13.5px',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    fontFamily: tokens.font,
                                }}
                            >
                                See how it works
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Zero-height anchor sitting exactly at the seam between Hero
                and How it works (it's the last thing in Hero's flow, right
                after the photo panel, and takes no space itself). The card
                inside it is absolutely positioned and shifted up by 50% of
                its own height via translate(-50%, -50%), so this anchor
                point becomes the card's vertical center — regardless of
                how tall the card actually is. That's what puts the
                Hero/How-it-works boundary through its middle rather than
                requiring a hand-tuned pixel guess. */}
            <div className="ek-hero-dash-anchor" style={{ position: 'relative', height: 0 }}>
                <div
                    className="ek-hero-dash-card"
                    ref={dashCardRef}
                    style={{
                        position: 'absolute',
                        left: '50%',
                        top: 0,
                        transform: 'translate(-50%, -50%)',
                        zIndex: 5,
                        width: 'min(1080px, calc(100% - 32px))',
                    }}
                >
                    <div
                        style={{
                            background: '#fff',
                            border: `1px solid ${tokens.ink}14`,
                            borderRadius: '18px',
                            boxShadow: '0 30px 70px -20px rgba(36,31,26,0.4)',
                            overflow: 'hidden',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '16px 22px',
                                borderBottom: `1px solid ${tokens.ink}12`,
                                background: tokens.surface,
                            }}
                        >
                            <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#E5645A' }} />
                            <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#E3B341' }} />
                            <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#5CB176' }} />

                            <span style={{ marginLeft: '10px', fontSize: '13px', fontWeight: 600, color: tokens.ink }}>
                                Inbox
                            </span>

                            <span
                                style={{
                                    marginLeft: 'auto',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    color: tokens.ink,
                                    background: `${tokens.ink}0d`,
                                    borderRadius: '999px',
                                    padding: '5px 12px',
                                }}
                            >
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#5CB176' }} />
                                Synced
                            </span>
                        </div>

                        <div style={{ display: 'flex' }}>
                            <div
                                className="ek-hero-sidebar"
                                style={{
                                    width: '200px',
                                    flexShrink: 0,
                                    boxSizing: 'border-box',
                                    borderRight: `1px solid ${tokens.ink}10`,
                                    padding: '24px 18px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '26px',
                                }}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    {navItems.map((item) => (
                                        <div
                                            key={item.label}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                fontSize: '12.5px',
                                                fontWeight: item.active ? 600 : 500,
                                                color: item.active ? tokens.ink : tokens.inkMuted,
                                                background: item.active ? `${tokens.ink}0d` : 'transparent',
                                                borderRadius: '8px',
                                                padding: '9px 11px',
                                            }}
                                        >
                                            <item.Icon size={14} />
                                            {item.label}
                                        </div>
                                    ))}
                                </div>

                                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column' }}>
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '2px',
                                            paddingBottom: '14px',
                                            marginBottom: '14px',
                                            borderBottom: `1px solid ${tokens.ink}10`,
                                        }}
                                    >
                                        {navItemsSecondary.map((item) => (
                                            <div
                                                key={item.label}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px',
                                                    fontSize: '12.5px',
                                                    fontWeight: 500,
                                                    color: tokens.inkMuted,
                                                    borderRadius: '8px',
                                                    padding: '9px 11px',
                                                }}
                                            >
                                                <item.Icon size={14} />
                                                {item.label}
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span
                                            style={{
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '50%',
                                                flexShrink: 0,
                                                background: tokens.ink,
                                                color: tokens.ivory,
                                                fontSize: '11px',
                                                fontWeight: 600,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            A
                                        </span>

                                        <div style={{ minWidth: 0 }}>
                                            <div
                                                style={{
                                                    fontSize: '12px',
                                                    fontWeight: 600,
                                                    color: tokens.ink,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                Anmol Collection
                                            </div>

                                            <div
                                                style={{
                                                    fontSize: '10.5px',
                                                    color: tokens.inkSoft,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                hello@anmolcollection.com
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ flex: 1, minWidth: 0, padding: '24px 28px 26px', boxSizing: 'border-box' }}>

                                {/* Utility row — search + export + range filter. This is
                                    the kind of clutter real dashboards have and dummies
                                    don't: it's what makes the reference screenshot read
                                    as a live product instead of a static mock. */}
                                <div
                                    className="ek-hero-toolbar"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: '12px',
                                        marginBottom: '20px',
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            border: `1px solid ${tokens.ink}14`,
                                            borderRadius: '9px',
                                            padding: '8px 12px',
                                            width: '220px',
                                            boxSizing: 'border-box',
                                            background: tokens.surface,
                                        }}
                                    >
                                        <SearchIcon />
                                        <span style={{ fontSize: '12px', color: tokens.inkSoft }}>
                                            Search conversations
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ fontSize: '12px', fontWeight: 600, color: tokens.inkMuted, cursor: 'pointer' }}>
                                            Export
                                        </span>

                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                border: `1px solid ${tokens.ink}14`,
                                                borderRadius: '999px',
                                                padding: '6px 12px',
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                color: tokens.ink,
                                            }}
                                        >
                                            Last 7 days
                                            <ChevronDownIcon />
                                        </div>
                                    </div>
                                </div>

                                <div
                                    className="ek-hero-stats"
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(4, 1fr)',
                                        gap: '14px',
                                        marginBottom: '24px'
                                    }}
                                >
                                    {stats.map((s) => (
                                        <div
                                            key={s.label}
                                            style={{
                                                border: `1px solid ${tokens.ink}12`,
                                                borderRadius: '10px',
                                                padding: '14px 16px',
                                                background: tokens.surface,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontSize: '9.5px',
                                                    fontWeight: 600,
                                                    letterSpacing: '0.05em',
                                                    textTransform: 'uppercase',
                                                    color: tokens.inkSoft,
                                                    marginBottom: '7px'
                                                }}
                                            >
                                                {s.label}
                                            </div>

                                            <div
                                                style={{
                                                    fontSize: '18px',
                                                    fontWeight: 600,
                                                    color: s.accent ? '#C1524A' : tokens.ink,
                                                    letterSpacing: '-0.02em'
                                                }}
                                            >
                                                {s.value}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '20px',
                                        marginBottom: '18px',
                                        fontSize: '12.5px',
                                        fontWeight: 600
                                    }}
                                >
                                    <span style={{ color: tokens.ink, borderBottom: `2px solid ${tokens.ink}`, paddingBottom: '8px' }}>
                                        All messages
                                    </span>
                                    <span style={{ color: tokens.inkMuted, paddingBottom: '8px' }}>
                                        Unassigned
                                    </span>
                                </div>

                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1.2fr 1.6fr 0.8fr 0.7fr 0.9fr',
                                        gap: '10px',
                                        padding: '0 6px 10px',
                                        borderBottom: `1px solid ${tokens.ink}12`,
                                        fontSize: '10.5px',
                                        fontWeight: 600,
                                        letterSpacing: '0.05em',
                                        textTransform: 'uppercase',
                                        color: tokens.inkSoft,
                                    }}
                                >
                                    <span>Customer</span>
                                    <span>Message</span>
                                    <span>Channel</span>
                                    <span>Tag</span>
                                    <span>Assigned</span>
                                </div>

                                <div>
                                    {rows.map((row, i) => (
                                        <div
                                            key={row.name}
                                            style={{
                                                display: 'grid',
                                                gridTemplateColumns: '1.2fr 1.6fr 0.8fr 0.7fr 0.9fr',
                                                gap: '10px',
                                                alignItems: 'center',
                                                padding: '15px 6px',
                                                borderBottom: `1px solid ${tokens.ink}0a`,
                                            }}
                                        >
                                            <span
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '9px',
                                                    fontSize: '12.5px',
                                                    fontWeight: 600,
                                                    color: tokens.ink,
                                                    minWidth: 0
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        width: '20px',
                                                        height: '20px',
                                                        borderRadius: '50%',
                                                        flexShrink: 0,
                                                        background: avatarTints[i % avatarTints.length],
                                                        color: tokens.ink,
                                                        fontSize: '9.5px',
                                                        fontWeight: 600,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    {row.name.charAt(0)}
                                                </span>

                                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {row.name}
                                                </span>
                                            </span>

                                            <span
                                                style={{
                                                    fontSize: '12px',
                                                    color: tokens.inkMuted,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                {row.text}
                                            </span>

                                            <span style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '11.5px', color: tokens.inkSoft, minWidth: 0 }}>
                                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0, background: channelDotColors[row.channel] }} />
                                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {row.channel}
                                                </span>
                                            </span>

                                            <span
                                                style={{
                                                    fontSize: '10px',
                                                    fontWeight: 600,
                                                    color: tagStyles[row.tag].fg,
                                                    background: tagStyles[row.tag].bg,
                                                    borderRadius: '999px',
                                                    padding: '3px 9px',
                                                    width: 'fit-content',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {row.tag}
                                            </span>

                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                                                <span
                                                    style={{
                                                        width: '18px',
                                                        height: '18px',
                                                        borderRadius: '50%',
                                                        flexShrink: 0,
                                                        background: tokens.ink,
                                                        color: tokens.ivory,
                                                        fontSize: '9px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {row.assignee.charAt(0)}
                                                </span>

                                                <span
                                                    style={{
                                                        fontSize: '11.5px',
                                                        color: tokens.inkMuted,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >
                                                    {row.assignee}
                                                </span>
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Footer — gives the table a real, deliberate close
                                    instead of just stopping at the last row, which is
                                    what made the card look unfinished even when it was
                                    fully visible. */}
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        paddingTop: '16px',
                                        marginTop: '2px',
                                    }}
                                >
                                    <span style={{ fontSize: '11.5px', color: tokens.inkSoft }}>
                                        Showing 8 of 240 conversations
                                    </span>
                                    <span style={{ fontSize: '11.5px', fontWeight: 600, color: tokens.ink, cursor: 'pointer' }}>
                                        View all →
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}