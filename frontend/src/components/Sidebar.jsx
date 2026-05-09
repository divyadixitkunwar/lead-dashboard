import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SIDEBAR_WIDTH = 260;

const colors = {
    bg: '#FFFFFF',
    pageBg: '#F5F5F7',
    border: 'rgba(0,0,0,0.08)',
    activeText: '#FFFFFF',
    activeBg: '#1D1D1F',
    inactiveText: '#6E6E73',
    hoverBg: '#F5F5F7',
    brand: '#1D1D1F',
    accent: '#0071E3',
};

export default function Sidebar({ children }) {
    const { user, logout } = useAuth();
    const location = useLocation();

    const navItems = [
        {
            path: '/', label: 'Leads', icon: (
                <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
                    <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.8" />
                    <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.4" />
                    <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.4" />
                    <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.8" />
                </svg>
            )
        },
        {
            path: '/users', label: 'Users', icon: (
                <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="5" r="3" fill="currentColor" opacity="0.8" />
                    <path d="M2 13c0-2.761 2.686-5 6-5s6 2.239 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
                </svg>
            ), adminOnly: true
        },
    ];

    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : '??';

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            background: colors.pageBg,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif",
        }}>
            {/* Sidebar */}
            <div style={{
                width: SIDEBAR_WIDTH,
                background: colors.bg,
                borderRight: `1px solid ${colors.border}`,
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                top: 0,
                left: 0,
                bottom: 0,
                zIndex: 100,
            }}>

                {/* Brand */}
                <div style={{
                    padding: '28px 22px 22px',
                    borderBottom: `1px solid ${colors.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                }}>
                    <div style={{
                        width: '34px',
                        height: '34px',
                        background: colors.brand,
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}>
                        <div style={{ width: '11px', height: '11px', background: '#fff', borderRadius: '50%', opacity: 0.9 }} />
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: colors.brand, letterSpacing: '-0.01em' }}>
                        Lead Dashboard
                    </div>
                </div>

                {/* Nav */}
                <nav style={{ padding: '14px 12px', flex: 1 }}>
                    <div style={{
                        fontSize: '11px', fontWeight: '600', color: '#AEAEB2',
                        letterSpacing: '0.06em', textTransform: 'uppercase',
                        padding: '4px 10px 10px',
                    }}>
                        Menu
                    </div>
                    {navItems
                        .filter(item => !item.adminOnly || user?.role === 'admin')
                        .map(item => {
                            const active = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '11px',
                                        padding: '10px 12px',
                                        borderRadius: '10px',
                                        marginBottom: '3px',
                                        background: active ? colors.activeBg : 'transparent',
                                        color: active ? colors.activeText : colors.inactiveText,
                                        textDecoration: 'none',
                                        fontSize: '14px',
                                        fontWeight: active ? '500' : '400',
                                        transition: 'background 0.1s, color 0.1s',
                                        letterSpacing: '-0.01em',
                                    }}
                                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = colors.hoverBg; }}
                                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <span style={{ color: active ? '#fff' : colors.inactiveText, display: 'flex' }}>
                                        {item.icon}
                                    </span>
                                    {item.label}
                                </Link>
                            );
                        })}
                </nav>

                {/* User */}
                <div style={{
                    padding: '12px 12px 16px',
                    borderTop: `1px solid ${colors.border}`,
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        marginBottom: '4px',
                    }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #1D1D1F, #3A3A3C)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#fff',
                            flexShrink: 0,
                        }}>
                            {initials}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{
                                fontSize: '14px', fontWeight: '500', color: '#1D1D1F',
                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            }}>
                                {user?.name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#AEAEB2', textTransform: 'capitalize' }}>
                                {user?.role}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '9px',
                            padding: '9px 12px',
                            width: '100%',
                            background: 'none',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '14px',
                            color: '#FF3B30',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            textAlign: 'left',
                            transition: 'background 0.1s',
                            boxSizing: 'border-box',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,59,48,0.06)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                        <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
                            <path d="M5 2H2a1 1 0 00-1 1v8a1 1 0 001 1h3M9 10l3-3-3-3M12 7H5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Sign out
                    </button>
                </div>
            </div>

            {/* Main content */}
            <div style={{ marginLeft: SIDEBAR_WIDTH, flex: 1, minHeight: '100vh' }}>
                {children}
            </div>
        </div>
    );
}