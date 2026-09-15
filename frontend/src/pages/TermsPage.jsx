import Header from '../components/Header';
import Footer from '../components/Footer';
import PageBackground from '../components/PageBackground';
import { tokens } from '../styles/tokens';

const sections = [
    {
        heading: '1. Using Ekikrit',
        body: `Ekikrit is currently in private beta. By creating an account you agree to use the
        product only for legitimate business messaging: connecting your own WhatsApp,
        Messenger, or Instagram accounts and managing conversations with your own
        customers. Access during the beta is subject to approval and may be limited,
        paused, or withdrawn at any time.`,
    },
    {
        heading: '2. Your account',
        body: `You're responsible for the accuracy of the information you give us when you sign
        up, and for keeping your login credentials secure. Let us know right away if you
        think someone else has access to your account.`,
    },
    {
        heading: '3. Connected channels',
        body: `When you connect a WhatsApp, Messenger, or Instagram account, you're
        confirming that you're authorized to connect it and that doing so doesn't
        violate that platform's own terms of service. You can disconnect a channel at
        any time from Settings.`,
    },
    {
        heading: '4. Acceptable use',
        body: `Please don't use Ekikrit to send unsolicited messages, spam, or anything
        illegal, abusive, or deceptive. We may suspend accounts that put the platform,
        other users, or their customers at risk.`,
    },
    {
        heading: '5. Changes',
        body: `We're a small team building this in the open during beta, so these terms may
        change as the product does. We'll do our best to flag anything significant
        before it takes effect.`,
    },
    {
        heading: '6. Contact',
        body: `Questions about these terms? Reach us at hello@ekikrit.app.`,
    },
];

export default function TermsPage() {
    return (
        <div id="top" style={{ position: 'relative', background: tokens.ivory, minHeight: '100vh' }}>
            <PageBackground />
            <Header />

            <main
                style={{
                    position: 'relative',
                    zIndex: 1,
                    maxWidth: '720px',
                    margin: '0 auto',
                    padding: '160px 24px 96px',
                    fontFamily: tokens.font,
                }}
            >
                <h1
                    style={{
                        fontFamily: tokens.display,
                        fontSize: '42px',
                        fontWeight: 500,
                        letterSpacing: '-0.03em',
                        color: tokens.ink,
                        margin: '0 0 12px',
                    }}
                >
                    Terms of Service
                </h1>
                <p style={{ fontSize: '13.5px', color: tokens.inkSoft, margin: '0 0 48px' }}>
                    Last updated September 2026 · Placeholder terms for the Ekikrit private beta.
                </p>

                {sections.map((s) => (
                    <section key={s.heading} style={{ marginBottom: '32px' }}>
                        <h2
                            style={{
                                fontFamily: tokens.display,
                                fontSize: '20px',
                                fontWeight: 600,
                                color: tokens.ink,
                                margin: '0 0 10px',
                            }}
                        >
                            {s.heading}
                        </h2>
                        <p style={{ fontSize: '14.5px', color: tokens.inkMuted, lineHeight: 1.7, margin: 0 }}>
                            {s.body}
                        </p>
                    </section>
                ))}
            </main>

            <Footer />
        </div>
    );
}
