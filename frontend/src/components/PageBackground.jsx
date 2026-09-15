import heroImage from '../assets/homestead-hero-valley.jpg';

export default function PageBackground() {
    return (
        <>
            <div
                aria-hidden="true"
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 2,
                    backgroundImage: `url(${heroImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center 45%',
                    opacity: 0.22,
                    filter: 'blur(46px) saturate(1.15)',
                    pointerEvents: 'none',
                }}
            />
            <div
                aria-hidden="true"
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 2,
                    background: `radial-gradient(70% 40% at 18% 12%, #c1c6db57, transparent 70%),
                                 radial-gradient(60% 40% at 86% 82%, #f4e5b857, transparent 70%)`,
                    pointerEvents: 'none',
                }}
            />
        </>
    );
}