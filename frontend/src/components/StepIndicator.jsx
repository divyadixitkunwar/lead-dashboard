import { tokens } from '../styles/tokens';

export function StepIndicator({ steps, activeIndex }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '18px', fontFamily: tokens.font }}>
            {steps.map((label, i) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span
                            style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                flexShrink: 0,
                                background: i === activeIndex ? tokens.ink : 'transparent',
                                border: i === activeIndex ? 'none' : `1px solid rgba(27,23,18,0.45)`,
                            }}
                        />
                        <span
                            style={{
                                fontSize: '14px',
                                fontWeight: i === activeIndex ? 600 : 500,
                                color: i === activeIndex ? tokens.ink : 'rgba(27,23,18,0.45)',
                            }}
                        >
                            {label}
                        </span>
                    </div>
                    {i < steps.length - 1 && (
                        <span style={{ width: '56px', height: '1px', background: 'rgba(27,23,18,0.2)' }} />
                    )}
                </div>
            ))}
        </div>
    );
}
