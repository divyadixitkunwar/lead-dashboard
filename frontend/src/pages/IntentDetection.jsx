import { tokens } from './Header';

const phrases = [
    { text: 'kati parcha yesko?', tag: 'Price' },
    { text: 'kati vayo yo?', tag: 'Price' },
    { text: 'stock cha ki sakkiyo?', tag: 'Stock' },
    { text: 'available xa hoina?', tag: 'Stock' },
    { text: 'kathmandu samma pathaunu huncha?', tag: 'Delivery' },
    { text: 'pokhara ma delivery garxau?', tag: 'Delivery' },
];

export default function IntentDetection() {
    return (
        <section style={{ position: 'relative', zIndex: 1, padding: '96px 24px', fontFamily: tokens.font }}>
            <div style={{ maxWidth: '620px', margin: '0 auto 44px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '38px', fontWeight: 600, letterSpacing: '-0.025em', color: tokens.ink, margin: '0 0 16px', fontFamily: tokens.display }}>
                    It reads <em style={{ fontStyle: 'italic' }}>Romanized Nepali.</em> Really.
                </h2>
                <p style={{ fontSize: '15px', color: tokens.inkMuted, lineHeight: 1.6, margin: 0 }}>
                    Spelling variants, slang, and shorthand — matched to the same intent automatically,
                    no matter how your customer happens to type it.
                </p>
            </div>

            <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {phrases.map((item) => (
                    <div
                        key={item.text}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            background: 'rgba(255,255,255,0.7)',
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)',
                            border: `1px solid ${tokens.ink}14`,
                            borderRadius: '14px',
                            padding: '15px 20px',
                            boxShadow: '0 4px 14px -8px rgba(36,31,26,0.18)',
                        }}
                    >
                        <span style={{ fontSize: '15px', color: tokens.ink }}>&ldquo;{item.text}&rdquo;</span>
                        <span
                            style={{
                                fontSize: '12.5px', fontWeight: 600, color: tokens.ink,
                                background: `${tokens.ink}0f`, borderRadius: '999px', padding: '4px 12px',
                                whiteSpace: 'nowrap', marginLeft: '16px',
                            }}
                        >
                            {item.tag}
                        </span>
                    </div>
                ))}
            </div>
        </section>
    );
}