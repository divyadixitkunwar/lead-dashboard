import { useEffect, useRef, useState } from 'react';

// Matches Arlo's real .hs-reveal rule exactly:
//   opacity: 0 -> 1, transform: translateY(26px) -> none,
//   both over 0.7s cubic-bezier(.22, 1, .36, 1) (their --hs-ease value),
// triggered once via IntersectionObserver as a section scrolls into view.
// It doesn't reverse on scrolling back up — same as the real site, whose
// .is-in class is only ever added, never removed.
//
// zIndex: 3 also does double duty: it's what keeps whatever's wrapped in
// here rendering above PageBackground's atmos layer (zIndex: 2), so its
// text stays crisp instead of getting a faint wash over it — that's the
// footer/text-clarity fix.
export default function Reveal({ children, threshold = 0.15 }) {
    const ref = useRef(null);
    const [isIn, setIsIn] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduceMotion || !('IntersectionObserver' in window)) {
            setIsIn(true);
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsIn(true);
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold, rootMargin: '0px 0px -80px 0px' }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [threshold]);

    return (
        <div
            ref={ref}
            style={{
                position: 'relative',
                zIndex: 3,
                opacity: isIn ? 1 : 0,
                transform: isIn ? 'none' : 'translateY(26px)',
                transition: 'opacity 0.7s cubic-bezier(.22,1,.36,1), transform 0.7s cubic-bezier(.22,1,.36,1)',
            }}
        >
            {children}
        </div>
    );
}