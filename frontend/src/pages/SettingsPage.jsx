import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function MessengerLogo({ size = 18 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="#21211f">
            <path d="M0 7.76C0 3.301 3.493 0 8 0s8 3.301 8 7.76-3.493 7.76-8 7.76c-.81 0-1.586-.107-2.316-.307a.64.64 0 0 0-.427.03l-1.588.702a.64.64 0 0 1-.898-.566l-.044-1.423a.64.64 0 0 0-.215-.456C.956 12.108 0 10.092 0 7.76m5.546-1.459-2.35 3.728c-.225.358.214.761.551.506l2.525-1.916a.48.48 0 0 1 .578-.002l1.869 1.402a1.2 1.2 0 0 0 1.735-.32l2.35-3.728c.226-.358-.214-.761-.551-.506L9.728 7.381a.48.48 0 0 1-.578.002L7.281 5.98a1.2 1.2 0 0 0-1.735.32z" />
        </svg>
    );
}

function InstagramLogo({ size = 18 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="#21211f">
            <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.16 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334" />
        </svg>
    );
}

const CHANNEL_META = {
    messenger: { label: 'Messenger', Logo: MessengerLogo },
    instagram: { label: 'Instagram', Logo: InstagramLogo },
};

const PlusIcon = () => (
    <svg width="12" height="12" viewBox="0 0 13 13" fill="none">
        <path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
);

const Card = ({ title, description, children }) => (
    <section className="settings-card">
        <div className="settings-card-header">
            <h3>{title}</h3>
            {description && <p>{description}</p>}
        </div>
        <div className="settings-card-body">{children}</div>
    </section>
);

const Row = ({ label, sub, children }) => (
    <div className="settings-row">
        <div>
            <div className="settings-row-label">{label}</div>
            {sub && <div className="settings-row-sub">{sub}</div>}
        </div>
        {children}
    </div>
);

const Field = ({ label, type = 'text', value, placeholder, onChange }) => (
    <div className="settings-field">
        <div className="settings-field-label">{label}</div>
        <input
            className="settings-input"
            type={type}
            value={value}
            placeholder={placeholder}
            onChange={onChange}
        />
    </div>
);

const Banner = ({ tone = 'success', children }) => (
    <div className={`settings-banner settings-banner-${tone}`}>{children}</div>
);

export default function SettingsPage() {
    const { user, refreshUser } = useAuth();
    const isAdmin = user?.role === 'admin';

    const tabs = [
        { key: 'profile', label: 'Profile' },
        ...(isAdmin ? [{ key: 'business', label: 'Business' }] : []),
        { key: 'channels', label: 'Channels' },
        ...(isAdmin ? [{ key: 'team', label: 'Team' }] : []),
    ];

    const [tab, setTab] = useState('profile');

    const [name, setName] = useState(user?.name || '');
    const [savingName, setSavingName] = useState(false);
    const [nameMsg, setNameMsg] = useState(null);

    const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
    const [savingPw, setSavingPw] = useState(false);
    const [pwMsg, setPwMsg] = useState(null);

    const saveName = async () => {
        setNameMsg(null);

        if (!name.trim()) {
            return setNameMsg({ tone: 'error', text: 'Name is required' });
        }

        setSavingName(true);

        try {
            await api.patch('/auth/profile', { name: name.trim() });
            await refreshUser();
            setNameMsg({ tone: 'success', text: 'Name updated' });
        } catch (err) {
            setNameMsg({ tone: 'error', text: err.response?.data?.error || 'Failed to update name' });
        } finally {
            setSavingName(false);
        }
    };

    const savePassword = async () => {
        setPwMsg(null);

        if (!pw.current || !pw.next || !pw.confirm) {
            return setPwMsg({ tone: 'error', text: 'Fill in all three fields' });
        }

        if (pw.next.length < 8) {
            return setPwMsg({ tone: 'error', text: 'New password must be at least 8 characters' });
        }

        if (pw.next !== pw.confirm) {
            return setPwMsg({ tone: 'error', text: "New passwords don't match" });
        }

        setSavingPw(true);

        try {
            await api.post('/auth/change-password', {
                currentPassword: pw.current,
                newPassword: pw.next,
            });

            setPw({ current: '', next: '', confirm: '' });
            setPwMsg({ tone: 'success', text: 'Password updated' });
        } catch (err) {
            setPwMsg({ tone: 'error', text: err.response?.data?.error || 'Failed to update password' });
        } finally {
            setSavingPw(false);
        }
    };

    const [business, setBusiness] = useState(null);
    const [businessName, setBusinessName] = useState('');
    const [savingBiz, setSavingBiz] = useState(false);
    const [bizMsg, setBizMsg] = useState(null);
    const [bizLoading, setBizLoading] = useState(true);

    useEffect(() => {
        if (tab !== 'business' || !isAdmin || business) return;

        api.get('/business')
            .then(res => {
                setBusiness(res.data);
                setBusinessName(res.data.name);
            })
            .catch(() => setBizMsg({ tone: 'error', text: 'Failed to load business' }))
            .finally(() => setBizLoading(false));
    }, [tab, isAdmin]);

    const saveBusiness = async () => {
        setBizMsg(null);

        if (!businessName.trim()) {
            return setBizMsg({ tone: 'error', text: 'Business name is required' });
        }

        setSavingBiz(true);

        try {
            const res = await api.patch('/business', { name: businessName.trim() });
            setBusiness(res.data);
            setBizMsg({ tone: 'success', text: 'Business name updated' });
        } catch (err) {
            setBizMsg({ tone: 'error', text: err.response?.data?.error || 'Failed to update business' });
        } finally {
            setSavingBiz(false);
        }
    };

    const [channels, setChannels] = useState([]);
    const [channelsLoading, setChannelsLoading] = useState(true);
    const [channelsLoaded, setChannelsLoaded] = useState(false);
    const [disconnectingId, setDisconnectingId] = useState(null);

    const fetchChannels = () => {
        setChannelsLoading(true);

        api.get('/channels')
            .then(res => setChannels(res.data))
            .catch(() => {})
            .finally(() => {
                setChannelsLoading(false);
                setChannelsLoaded(true);
            });
    };

    useEffect(() => {
        if (tab !== 'channels' || channelsLoaded) return;
        fetchChannels();
    }, [tab, channelsLoaded]);

    const disconnectChannel = async (id) => {
        if (!window.confirm(
            'Disconnect this channel? Leads will keep their history, but new messages will stop coming in.'
        )) {
            return;
        }

        setDisconnectingId(id);

        try {
            await api.delete(`/channels/${id}`);
            fetchChannels();
        } catch (err) {
            console.error(err);
        } finally {
            setDisconnectingId(null);
        }
    };

    const fmtDate = (str) =>
        new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
        <Sidebar>
            <div className="settings-wrap">
                <div className="dashboard-heading">
                    <div>
                        <h1>Settings</h1>
                        <p>Manage your account, business, and connected channels.</p>
                    </div>
                </div>

                <div className="settings-tabs">
                    {tabs.map(t => (
                        <button
                            key={t.key}
                            className={`settings-tab${tab === t.key ? ' is-active' : ''}`}
                            onClick={() => setTab(t.key)}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {tab === 'profile' && (
                    <>
                        <Card title="Account">
                            <Row label="Email">
                                <span className="settings-row-value">{user?.email}</span>
                            </Row>
                            <Row label="Role">
                                <span className="settings-row-value">{user?.role}</span>
                            </Row>
                        </Card>

                        <Card title="Your name">
                            {nameMsg && <Banner tone={nameMsg.tone}>{nameMsg.text}</Banner>}

                            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                                <div style={{ flex: '1 1 260px', minWidth: '220px' }}>
                                    <Field
                                        label="Full name"
                                        value={name}
                                        placeholder="Your name"
                                        onChange={e => setName(e.target.value)}
                                    />
                                </div>

                                <button
                                    className="settings-btn settings-btn-primary"
                                    onClick={saveName}
                                    disabled={savingName || !name.trim()}
                                >
                                    {savingName ? 'Saving…' : 'Save name'}
                                </button>
                            </div>
                        </Card>

                        <Card title="Password" description="Requires your current password to confirm it's you.">
                            {pwMsg && <Banner tone={pwMsg.tone}>{pwMsg.text}</Banner>}

                            <div style={{ display: 'grid', gap: '14px', maxWidth: '360px', marginBottom: '18px' }}>
                                <Field
                                    label="Current password"
                                    type="password"
                                    value={pw.current}
                                    placeholder="••••••••"
                                    onChange={e => setPw(p => ({ ...p, current: e.target.value }))}
                                />
                                <Field
                                    label="New password"
                                    type="password"
                                    value={pw.next}
                                    placeholder="••••••••"
                                    onChange={e => setPw(p => ({ ...p, next: e.target.value }))}
                                />
                                <Field
                                    label="Confirm new password"
                                    type="password"
                                    value={pw.confirm}
                                    placeholder="••••••••"
                                    onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))}
                                />
                            </div>

                            <button
                                className="settings-btn settings-btn-primary"
                                onClick={savePassword}
                                disabled={savingPw}
                            >
                                {savingPw ? 'Updating…' : 'Update password'}
                            </button>
                        </Card>
                    </>
                )}

                {tab === 'business' && isAdmin && (
                    <Card title="Business name" description="Shown across the dashboard and in emails to your team.">
                        {bizMsg && <Banner tone={bizMsg.tone}>{bizMsg.text}</Banner>}

                        {bizLoading ? (
                            <div className="settings-empty">Loading…</div>
                        ) : (
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                                <div style={{ flex: '1 1 260px', minWidth: '220px' }}>
                                    <Field
                                        label="Business name"
                                        value={businessName}
                                        placeholder="Business name"
                                        onChange={e => setBusinessName(e.target.value)}
                                    />
                                </div>

                                <button
                                    className="settings-btn settings-btn-primary"
                                    onClick={saveBusiness}
                                    disabled={savingBiz || !businessName.trim()}
                                >
                                    {savingBiz ? 'Saving…' : 'Save business name'}
                                </button>
                            </div>
                        )}
                    </Card>
                )}

                {tab === 'channels' && (
                    <Card
                        title="Connected channels"
                        description="Disconnect a channel to stop new leads coming in from it. Existing lead history is kept."
                    >
                        {channelsLoading ? (
                            <div className="settings-empty">Loading…</div>
                        ) : channels.length === 0 ? (
                            <div className="settings-empty">No channels connected yet.</div>
                        ) : (
                            <div>
                                {channels.map((ch) => {
                                    const meta = CHANNEL_META[ch.platform] || { label: ch.platform, Logo: null };
                                    const Logo = meta.Logo;

                                    return (
                                        <div className="settings-row" key={ch.id}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '13px', minWidth: 0 }}>
                                                <div className="settings-channel-icon">
                                                    {Logo ? <Logo /> : null}
                                                </div>
                                                <div style={{ minWidth: 0 }}>
                                                    <div className="settings-row-label">{ch.display_name || meta.label}</div>
                                                    <div className="settings-row-sub">
                                                        {meta.label} · connected {fmtDate(ch.created_at)}
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                className="settings-link-btn settings-link-danger"
                                                onClick={() => disconnectChannel(ch.id)}
                                                disabled={disconnectingId === ch.id}
                                            >
                                                {disconnectingId === ch.id ? 'Disconnecting…' : 'Disconnect'}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <Link className="settings-add-row" to="/signup/connect">
                            <PlusIcon />
                            Connect another channel
                        </Link>
                    </Card>
                )}

                {tab === 'team' && isAdmin && (
                    <Card title="Team members" description="Invite teammates, change roles, or remove access.">
                        <Row label="Manage your team" sub="Invites, roles, and access">
                            <Link className="settings-btn settings-btn-secondary" to="/app/users">
                                Manage →
                            </Link>
                        </Row>
                    </Card>
                )}
            </div>
        </Sidebar>
    );
}
