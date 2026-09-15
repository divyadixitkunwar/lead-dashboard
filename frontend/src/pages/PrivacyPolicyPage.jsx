import Header from '../components/Header';
import Footer from '../components/Footer';
import PageBackground from '../components/PageBackground';
import { tokens } from '../styles/tokens';

const sections = [
    {
        heading: '1. What we collect',
        body: `To run your account we store the information you give us when you sign up
        (business name, your name, email, and the Facebook contact used to connect
        channels), plus the messages and conversation metadata that flow through the
        channels you connect, so they can be shown to you in one inbox.`,
    },
    {
        heading: '2. How we use it',
        body: `Your data is used to operate Ekikrit: showing your unified inbox, tagging and
        routing conversations, and letting your team collaborate on leads. We don't use
        your customers' messages to train models or for any purpose outside your own
        account.`,
    },
    {
        heading: '3. Who can see it',
        body: `Your messages and customer information stay inside your business account.
        Only the team members you invite can see them. We don't sell or share your
        data with advertisers or unrelated third parties.`,
    },
    {
        heading: '4. Connected platforms',
        body: `Connecting WhatsApp, Messenger, or Instagram means Ekikrit talks to Meta's
        APIs on your behalf, using the permissions you grant during connection. You can
        revoke that access at any time from Settings or directly from your Facebook
        account settings.`,
    },
    {
        heading: '5. Data retention',
        body: `We keep your account and conversation data for as long as your account is
        active. If you'd like your data deleted, contact us and we'll take care of it.`,
    },
    {
        heading: '6. Contact',
        body: `Questions about this policy or your data? Reach us at hello@ekikrit.app.`,
    },
];

export default function PrivacyPolicyPage() {
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
                    Privacy Policy
                </h1>
                <p style={{ fontSize: '13.5px', color: tokens.inkSoft, margin: '0 0 48px' }}>
                    Last updated September 2026 · Placeholder policy for the Ekikrit private beta.
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
