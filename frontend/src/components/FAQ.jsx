import { tokens } from '../styles/tokens';

const faqs = [
    {
        q: 'What is Ekikrit?',
        a: "Right now you're juggling three inboxes: WhatsApp, Messenger, and Instagram. A customer messages you on one, someone else messages you on another, and it's easy to lose track of who asked what. Ekikrit fixes that. It pulls every message into one inbox, so you check one place instead of three.",
    },
    {
        q: 'Do I need to change how I message customers?',
        a: 'No. You keep messaging customers exactly like you do now, on WhatsApp, Messenger, or Instagram.',
    },
    {
        q: 'Can I disconnect a channel later?',
        a: "You're not locked into anything. If a channel stops being useful, or you just want it gone, go to Settings and disconnect it. You can always reconnect later if you change your mind.",
    },
    {
        q: 'What if a customer mixes English and Nepali in one message?',
        a: "That's fine, Ekikrit still catches what they're asking for. Customers switch between Nepali and English mid sentence all the time, and it's built to handle that.",
    },
    {
        q: 'Can multiple team members use one inbox?',
        a: 'Yes. The admin invites team members, and everyone works out of the same shared inbox instead of separate logins for each app.',
    },
    {
        q: 'Is there a mobile app, or is it browser-only?',
        a: "There's no app to download yet. Ekikrit runs in the browser, and it works fine if you're checking it from your phone. A dedicated mobile app just isn't built yet.",
    },
    {
        q: 'Do I need a developer to set this up?',
        a: "You don't need a developer or a setup call. Create an account, connect your channels, and you're ready to go. No code involved.",
    },
    {
        q: 'How much does it cost?',
        a: "Ekikrit hasn't launched publicly yet, it's currently in private beta. You can sign up today, but you'll need approval before you get access.",
    },
    {
        q: 'Is my data secure?',
        a: 'Your messages and customer information stay inside your business account only. Nobody outside your team can see them, and Ekikrit never shares or sells your data to anyone else.',
    },
];

export default function FAQ() {
    return (
        <section style={{ position: 'relative', zIndex: 1, padding: '96px 24px', fontFamily: tokens.font }}>
            <style>{`
                .ek-faq-item {
                    border-bottom: 1px solid rgba(36,31,26,0.1);
                    padding: 4px 0;
                }
                .ek-faq-item summary {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 20px;
                    padding: 18px 2px;
                    font-size: 16px;
                    font-weight: 600;
                    color: ${tokens.ink};
                    letter-spacing: -0.01em;
                    cursor: pointer;
                    list-style: none;
                    transition: color 0.2s;
                }
                .ek-faq-item summary::-webkit-details-marker { display: none; }
                .ek-faq-item summary:hover { color: ${tokens.inkMuted}; }
                .ek-faq-mark { flex: none; width: 15px; height: 15px; position: relative; }
                .ek-faq-mark i {
                    position: absolute; inset: 50% 0 auto;
                    height: 1.5px; border-radius: 2px;
                    background: rgba(36,31,26,0.5);
                    transition: transform 0.32s cubic-bezier(.22,1,.36,1);
                }
                .ek-faq-mark i:last-child { transform: rotate(90deg); }
                .ek-faq-item[open] .ek-faq-mark i:last-child { transform: rotate(0deg); }
                .ek-faq-item[open] .ek-faq-mark i:first-child { transform: rotate(180deg); }
                .ek-faq-body {
                    display: grid;
                    grid-template-rows: 0fr;
                    opacity: 0;
                    transition: grid-template-rows 0.36s cubic-bezier(.22,1,.36,1), opacity 0.3s ease;
                }
                .ek-faq-item[open] .ek-faq-body { grid-template-rows: 1fr; opacity: 1; }
                .ek-faq-body > p {
                    margin: 0; overflow: hidden;
                    padding-right: 34px;
                    color: ${tokens.inkMuted};
                    font-size: 14.5px;
                    line-height: 1.6;
                }
                .ek-faq-item[open] .ek-faq-body > p { padding-bottom: 18px; }
            `}</style>

            <div style={{ maxWidth: '620px', margin: '0 auto 44px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '38px', fontWeight: 600, letterSpacing: '-0.025em', color: tokens.ink, margin: '0 0 12px', fontFamily: tokens.display }}>
                    Questions, <em style={{ fontStyle: 'italic' }}>answered.</em>
                </h2>
            </div>

            <div style={{ maxWidth: '680px', margin: '0 auto' }}>
                {faqs.map((item) => (
                    <details key={item.q} className="ek-faq-item">
                        <summary>
                            {item.q}
                            <span className="ek-faq-mark">
                                <i />
                                <i />
                            </span>
                        </summary>
                        <div className="ek-faq-body">
                            <p>{item.a}</p>
                        </div>
                    </details>
                ))}
            </div>
        </section>
    );
}