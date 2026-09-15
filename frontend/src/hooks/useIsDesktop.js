import { useEffect, useState } from 'react';

const DESKTOP_BREAKPOINT = '(min-width: 900px)';

export default function useIsDesktop() {
    const [isDesktop, setIsDesktop] = useState(
        () => typeof window === 'undefined' || window.matchMedia(DESKTOP_BREAKPOINT).matches
    );

    useEffect(() => {
        const mql = window.matchMedia(DESKTOP_BREAKPOINT);
        const handler = (e) => setIsDesktop(e.matches);
        mql.addEventListener('change', handler);
        return () => mql.removeEventListener('change', handler);
    }, []);

    return isDesktop;
}
