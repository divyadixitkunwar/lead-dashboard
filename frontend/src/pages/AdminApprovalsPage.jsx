import { useEffect, useState } from 'react';
import { tokens } from '../styles/tokens';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function AdminApprovalsPage() {
    const { user, logout } = useAuth();
    const [pending, setPending] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actingOn, setActingOn] = useState(null);
    const [error, setError] = useState('');

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/admin/pending');
            setPending(res.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Could not load pending applications.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const act = async (userId, action) => {
        setActingOn(userId);
        setError('');
        try {
            await api.post(`/admin/${userId}/${action}`);
            setPending((list) => list.filter((p) => p.user_id !== userId));
        } catch (err) {
            setError(err.response?.data?.error || `Could not ${action} this application.`);
        } finally {
            setActingOn(null);
        }
    };

    const fmtDate = (str) => new Date(str).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <div style={{ minHeight: '100vh', background: tokens.ivory, fontFamily: tokens.font }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 32px',
                borderBottom: '1px solid rgba(27,23,18,0.08)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '7px',
                        background: tokens.ink,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <div style={{
                            width: '7px',
                            height: '7px',
                            background: tokens.ivory,
                            borderRadius: '50%'
                        }} />
                    </div>

                    <span style={{
                        fontSize: '17px',
                        fontWeight: 700,
                        letterSpacing: '-0.02em',
                        color: tokens.ink
                    }}>
                        Ekikrit <span style={{
                            fontWeight: 500,
                            color: tokens.inkMuted
                        }}>Owner</span>
                    </span>
                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                }}>
                    <span style={{
                        fontSize: '13px',
                        color: tokens.inkMuted
                    }}>
                        {user?.email}
                    </span>

                    <button
                        onClick={logout}
                        style={{
                            background: 'none',
                            border: '1px solid rgba(27,23,18,0.15)',
                            borderRadius: '999px',
                            padding: '7px 14px',
                            fontSize: '13px',
                            color: tokens.ink,
                            cursor: 'pointer',
                            fontFamily: tokens.font,
                        }}
                    >
                        Log out
                    </button>
                </div>
            </div>

            <div style={{
                maxWidth: '760px',
                margin: '0 auto',
                padding: '48px 24px'
            }}>
                <h1 style={{
                    margin: '0 0 6px',
                    fontFamily: tokens.display,
                    fontSize: '28px',
                    fontWeight: 500,
                    letterSpacing: '-0.02em',
                    color: tokens.ink
                }}>
                    Pending applications
                </h1>

                <p style={{
                    margin: '0 0 28px',
                    fontSize: '14px',
                    color: tokens.inkMuted
                }}>
                    Businesses waiting for approval, oldest first.
                </p>

                {error && (
                    <div style={{
                        marginBottom: '16px',
                        fontSize: '13px',
                        color: '#B3261E'
                    }}>
                        {error}
                    </div>
                )}

                {loading ? (
                    <div style={{
                        padding: '60px',
                        textAlign: 'center',
                        color: tokens.inkMuted,
                        fontSize: '14px'
                    }}>
                        Loading…
                    </div>
                ) : pending.length === 0 ? (
                    <div style={{
                        padding: '48px',
                        textAlign: 'center',
                        color: tokens.inkMuted,
                        fontSize: '14px',
                        background: 'rgba(255,255,255,0.5)',
                        borderRadius: '14px',
                        border: '1px solid rgba(27,23,18,0.08)',
                    }}>
                        Nothing waiting right now.
                    </div>
                ) : (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                    }}>
                        {pending.map((p) => (
                            <div
                                key={p.user_id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '16px',
                                    background: 'rgba(255,255,255,0.6)',
                                    border: '1px solid rgba(27,23,18,0.08)',
                                    borderRadius: '14px',
                                    padding: '16px 20px',
                                }}
                            >
                                <div style={{ minWidth: 0 }}>
                                    <div style={{
                                        fontSize: '15px',
                                        fontWeight: 600,
                                        color: tokens.ink
                                    }}>
                                        {p.business.name}
                                    </div>

                                    <div style={{
                                        fontSize: '13px',
                                        color: tokens.inkMuted,
                                        marginTop: '2px'
                                    }}>
                                        {p.name} · {p.email} · applied {fmtDate(p.applied_at)}
                                    </div>

                                    <div style={{
                                        fontSize: '12.5px',
                                        color: tokens.inkSoft,
                                        marginTop: '4px'
                                    }}>
                                        Facebook: {p.facebook_contact || ' - '}
                                    </div>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    gap: '8px',
                                    flexShrink: 0
                                }}>
                                    <button
                                        onClick={() => act(p.user_id, 'reject')}
                                        disabled={actingOn === p.user_id}
                                        style={{
                                            background: 'transparent',
                                            border: '1px solid rgba(27,23,18,0.2)',
                                            color: tokens.ink,
                                            borderRadius: '999px',
                                            padding: '8px 16px',
                                            fontSize: '13px',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            fontFamily: tokens.font,
                                            opacity: actingOn === p.user_id ? 0.5 : 1,
                                        }}
                                    >
                                        Reject
                                    </button>

                                    <button
                                        onClick={() => act(p.user_id, 'approve')}
                                        disabled={actingOn === p.user_id}
                                        style={{
                                            background: tokens.ink,
                                            border: 'none',
                                            color: tokens.ivory,
                                            borderRadius: '999px',
                                            padding: '8px 16px',
                                            fontSize: '13px',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            fontFamily: tokens.font,
                                            opacity: actingOn === p.user_id ? 0.5 : 1,
                                        }}
                                    >
                                        Approve
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}