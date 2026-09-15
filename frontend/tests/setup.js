import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Ensure every test starts with a clean DOM and clean localStorage/sessionStorage,
// since AuthContext and api.js both read/write localStorage directly.
beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
});

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

// jsdom does not implement scrollIntoView / matchMedia — several pages call
// these (LeadDetailPage auto-scroll, useIsDesktop hook). Stub them once,
// globally, so individual tests don't need to.
window.HTMLElement.prototype.scrollIntoView = vi.fn();

if (!window.matchMedia) {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    }));
}

// recharts' ResponsiveContainer requires ResizeObserver, which jsdom doesn't
// implement. Without this, charts render at 0x0 and skip their children,
// so chart text/labels never appear in the test DOM.
class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
}
window.ResizeObserver = window.ResizeObserver || ResizeObserverMock;
