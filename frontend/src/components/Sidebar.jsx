import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const SIDEBAR_WIDTH = 236;

const Icon = ({ name }) => {
    const common = { width: 17, height: 17, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' };
    const paths = {
        leads: <><rect x="4" y="4" width="6" height="6" rx="1.4" /><rect x="14" y="4" width="6" height="6" rx="1.4" /><rect x="4" y="14" width="6" height="6" rx="1.4" /><rect x="14" y="14" width="6" height="6" rx="1.4" /></>,
        team: <><circle cx="9" cy="8" r="3" /><path d="M3.5 20c.4-3.4 2.3-5.2 5.5-5.2s5.1 1.8 5.5 5.2" /><path d="M15.5 5.5a3 3 0 0 1 0 5.8M17 14.8c2.1.8 3.4 2.3 3.7 5.2" /></>,
        settings: <><circle cx="12" cy="12" r="3" /><path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6 18 18M18 6l-1.4 1.4M7.4 16.6 6 18" /></>,
        channels: <><path d="M7 8a5 5 0 0 1 9.6-2M17 16a5 5 0 0 1-9.6 2" /><path d="M16 4v4h4M8 20v-4H4" /></>,
        approvals: <><path d="m5 12 4 4L19 6" /><circle cx="12" cy="12" r="9" /></>,
        invite: <><path d="M12 5v14M5 12h14" /></>,
        logout: <><path d="M10 5H6.5A1.5 1.5 0 0 0 5 6.5v11A1.5 1.5 0 0 0 6.5 19H10" /><path d="m14 8 4 4-4 4M18 12H9" /></>,
    };
    return <svg {...common}>{paths[name]}</svg>;
};

function initials(name = '') {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return 'L';
    return parts.slice(0, 2).map(part => part[0]).join('').toUpperCase();
}

function pageTitle(pathname) {
    if (pathname.startsWith('/app/leads/')) return 'Lead';
    if (pathname === '/app/users') return 'Team';
    if (pathname === '/app/settings') return 'Settings';
    return 'Leads';
}

export default function Sidebar({ children }) {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [businessName, setBusinessName] = useState('');

    const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
    const isSuperadmin = user?.role === 'superadmin';

    useEffect(() => {
        let alive = true;
        api.get('/business')
            .then(res => {
                const name = res.data?.name || res.data?.business?.name;
                if (alive && name) setBusinessName(name);
            })
            .catch(() => {});
        return () => { alive = false; };
    }, []);

    const resolvedBusiness = businessName || user?.business_name || user?.business?.name || 'Lead Dashboard';
    const workspaceInitials = useMemo(() => initials(resolvedBusiness), [resolvedBusiness]);
    const title = pageTitle(location.pathname);

    const sections = [
        {
            label: 'Workspace',
            items: [
                { path: '/app', label: 'Leads', icon: 'leads' },
                ...(isSuperadmin ? [{ path: '/admin/approvals', label: 'Approvals', icon: 'approvals' }] : []),
            ],
        },
        {
            label: 'Manage',
            items: [
                ...(isAdmin ? [{ path: '/app/users', label: 'Team', icon: 'team' }] : []),
                { path: '/app/settings', label: 'Settings', icon: 'settings' },
            ],
        },
    ];

    return (
        <div className="app-shell">
            <aside className="app-sidebar">
                <div className="app-sidebar-top">
                    <div className="app-brand-row">
                        <div className="app-brand-mark" aria-hidden="true">{workspaceInitials}</div>
                        <div className="app-brand-copy">
                            <span className="app-brand-name">{resolvedBusiness}</span>
                            <span className="app-brand-subtitle">Leads workspace</span>
                        </div>
                    </div>

                    <div className="app-search-quiet" aria-label="Search">
                        <span className="app-search-icon">⌕</span>
                        <span>Search</span>
                        <kbd>⌘K</kbd>
                    </div>
                </div>

                <nav className="app-nav" aria-label="Primary navigation">
                    {sections.map(section => (
                        <div className="app-nav-section" key={section.label}>
                            <div className="app-nav-section-label">{section.label}</div>
                            {section.items.map(item => {
                                const active = location.pathname === item.path || (item.path === '/app' && location.pathname.startsWith('/app/leads/'));
                                return (
                                    <Link className={`app-nav-link${active ? ' is-active' : ''}`} key={item.path} to={item.path}>
                                        <Icon name={item.icon} />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                <div className="app-sidebar-bottom">
                    {isAdmin && (
                        <Link className="app-nav-link app-bottom-link" to="/app/users">
                            <Icon name="invite" />
                            <span>Invite teammates</span>
                        </Link>
                    )}

                    <button className="app-user-card" type="button" onClick={() => window.location.href = '/app/settings'}>
                        <span className="app-user-avatar">{initials(user?.name)}</span>
                        <span className="app-user-copy">
                            <strong>{user?.name || 'Account'}</strong>
                            <small>{user?.role || 'Member'}</small>
                        </span>
                    </button>

                    <button className="app-signout" onClick={logout}>
                        <Icon name="logout" />
                        <span>Sign out</span>
                    </button>
                </div>
            </aside>

            <main className="app-main">
                <header className="app-topbar">
                    <div className="app-breadcrumb">
                        <span>{resolvedBusiness}</span>
                        <span className="app-breadcrumb-slash">/</span>
                        <strong>{title}</strong>
                    </div>
                    <Link className="app-top-avatar" to="/app/settings" aria-label="Open profile">
                        {initials(user?.name)}
                    </Link>
                </header>
                <div className="app-main-content">{children}</div>
            </main>
        </div>
    );
}
