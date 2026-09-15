import PageBackground from './PageBackground';
import Logo from './Logo';
import { tokens } from '../styles/tokens';

export default function DesktopOnly() {
    return (
        <div id="top" style={{ position: 'relative', background: tokens.ivory, minHeight: '100vh' }}>
            <PageBackground />

            <main
                style={{
                    position: 'relative',
                    zIndex: 1,
                    minHeight: '100vh',
                    maxWidth: '520px',
                    margin: '0 auto',
                    padding: '32px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    fontFamily: tokens.font,
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '28px' }}>
                    <Logo size={22} color={tokens.ink} />
                    <span style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em', color: tokens.ink }}>
                        Ekikrit
                    </span>
                </div>

                <h1
                    style={{
                        fontFamily: tokens.display,
                        fontSize: '32px',
                        fontWeight: 500,
                        letterSpacing: '-0.03em',
                        color: tokens.ink,
                        margin: '0 0 14px',
                    }}
                >
                    Best viewed on desktop
                </h1>

                <p style={{ fontSize: '14.5px', color: tokens.inkMuted, lineHeight: 1.7, margin: 0 }}>
                    Ekikrit isn't built for phones or tablets yet. Please open this page on a
                    laptop or desktop computer to continue.
                </p>
            </main>
        </div>
    );
}
