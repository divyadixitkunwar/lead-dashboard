import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

const font = "'Inter', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif";

const STATUS = {
    new: { color: '#0071E3', bg: 'rgba(0,113,227,0.1)' },
    contacted: { color: '#FF9500', bg: 'rgba(255,149,0,0.1)' },
    qualified: { color: '#34C759', bg: 'rgba(52,199,89,0.1)' },
    closed: { color: '#AEAEB2', bg: 'rgba(174,174,178,0.1)' },
};

const INTENT = {
    price_inquiry: { color: '#AF52DE', bg: 'rgba(175,82,222,0.1)' },
    delivery_inquiry: { color: '#FF9500', bg: 'rgba(255,149,0,0.1)' },
    availability: { color: '#30B0C7', bg: 'rgba(48,176,199,0.1)' },
    unclassified: { color: '#AEAEB2', bg: 'rgba(174,174,178,0.1)' },
};

const Badge = ({ color, bg, label }) => (
    <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        fontSize: '13px', fontWeight: '500', color, background: bg,
        borderRadius: '7px', padding: '4px 10px',
    }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: color }} />
        {label}
    </span>
);

const MetaItem = ({ label, value }) => (
    <div>
        <div style={{ fontSize: '11px', fontWeight: '600', color: '#AEAEB2', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>
            {label}
        </div>
        <div style={{ fontSize: '14px', color: '#1D1D1F', fontWeight: '400' }}>{value}</div>
    </div>
);

export default function LeadDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [lead, setLead] = useState(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('');
    const [noteContent, setNoteContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [noteFocus, setNoteFocus] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => { fetchLead(); }, [id]);
    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [lead?.messages]);

    const fetchLead = async () => {
        try {
            const res = await api.get(`/leads/${id}`);
            setLead(res.data);
            setStatus(res.data.status);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const updateStatus = async (newStatus) => {
        setStatus(newStatus);
        try { await api.patch(`/leads/${id}`, { status: newStatus }); }
        catch (err) { console.error(err); }
    };

    const addNote = async () => {
        if (!noteContent.trim()) return;
        setSubmitting(true);
        try {
            await api.post(`/leads/${id}/notes`, { content: noteContent });
            setNoteContent('');
            fetchLead();
        } catch (err) { console.error(err); }
        finally { setSubmitting(false); }
    };

    const getPlatformLink = (channel, phone) => {
        if (channel === 'whatsapp' && phone) return 'https://wa.me/' + phone;
        if (channel === 'messenger') return 'https://messenger.com';
        return 'https://instagram.com';
    };

    const fmtTime = (str) => new Date(str).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const fmtDate = (str) => new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    if (loading) return (
        <Sidebar>
            <div style={{ fontFamily: font, padding: '80px', textAlign: 'center', color: '#AEAEB2', fontSize: '15px' }}>
                Loading...
            </div>
        </Sidebar>
    );

    if (!lead) return (
        <Sidebar>
            <div style={{ fontFamily: font, padding: '80px', textAlign: 'center', color: '#AEAEB2', fontSize: '15px' }}>
                Lead not found
            </div>
        </Sidebar>
    );

    const st = STATUS[status] || STATUS.new;
    const int = INTENT[lead.intent] || INTENT.unclassified;

    return (
        <Sidebar>
            <div style={{ fontFamily: font, padding: '40px 48px', width: '100%', boxSizing: 'border-box' }}>

                <button
                    onClick={() => navigate('/app')}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: '7px',
                        background: 'none', border: 'none', fontSize: '14px',
                        color: '#6E6E73', cursor: 'pointer', fontFamily: font,
                        marginBottom: '28px', padding: '0',
                    }}
                >
                    <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
                        <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Back to Leads
                </button>

                {lead.possible_duplicate && (
                    <div style={{
                        background: 'rgba(255,59,48,0.06)', border: '1px solid rgba(255,59,48,0.15)',
                        borderRadius: '14px', padding: '16px 22px', marginBottom: '24px',
                        display: 'flex', alignItems: 'center', gap: '14px',
                    }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,59,48,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ fontSize: '16px' }}>⚠</span>
                        </div>
                        <div>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#FF3B30', marginBottom: '3px' }}>Possible duplicate lead</div>
                            <div style={{ fontSize: '13px', color: '#FF6961' }}>Another lead exists with the same phone number. Review before responding.</div>
                        </div>
                    </div>
                )}

                <div style={{
                    background: '#fff', borderRadius: '18px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.06)',
                    padding: '28px 32px', marginBottom: '16px',
                }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{
                                width: '62px', height: '62px', borderRadius: '18px', flexShrink: 0,
                                background: 'linear-gradient(135deg, #1D1D1F 0%, #3A3A3C 100%)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '24px', fontWeight: '500', color: '#fff',
                            }}>
                                {lead.contact_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div style={{ fontSize: '22px', fontWeight: '600', color: '#1D1D1F', letterSpacing: '-0.02em', marginBottom: '5px' }}>
                                    {lead.contact_name}
                                </div>
                                {lead.phone && (
                                    <div style={{ fontSize: '14px', color: '#6E6E73', marginBottom: '12px' }}>{lead.phone}</div>
                                )}
                                <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '13px', color: '#6E6E73', background: '#F5F5F7', borderRadius: '7px', padding: '4px 10px', textTransform: 'capitalize' }}>
                                        {lead.channel}
                                    </span>
                                    <span style={{ fontSize: '13px', color: '#6E6E73', background: '#F5F5F7', borderRadius: '7px', padding: '4px 10px', textTransform: 'capitalize' }}>
                                        {lead.message_type.replace(/_/g, ' ')}
                                    </span>
                                    <Badge color={int.color} bg={int.bg} label={lead.intent.replace(/_/g, ' ')} />
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <select
                                value={status}
                                onChange={e => updateStatus(e.target.value)}
                                style={{
                                    background: st.bg, color: st.color,
                                    border: 'none', borderRadius: '10px',
                                    padding: '10px 14px', fontSize: '14px', fontWeight: '500',
                                    cursor: 'pointer', outline: 'none', fontFamily: font,
                                }}
                            >
                                {['new', 'contacted', 'qualified', 'closed'].map(s => (
                                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                ))}
                            </select>
                            <a
                                href={getPlatformLink(lead.channel, lead.phone)}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '7px',
                                    background: '#0071E3', color: '#fff', textDecoration: 'none',
                                    borderRadius: '10px', padding: '10px 18px', fontSize: '14px', fontWeight: '500',
                                }}
                            >
                                Open in {lead.channel}
                                <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
                                    <path d="M2 10L10 2M10 2H5M10 2v5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>

                <div style={{
                    background: '#fff', borderRadius: '14px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04), 0 0 1px rgba(0,0,0,0.06)',
                    padding: '20px 32px', marginBottom: '16px',
                    display: 'flex', gap: '48px', flexWrap: 'wrap',
                }}>
                    <MetaItem label="Created" value={fmtDate(lead.created_at)} />
                    <MetaItem label="Last updated" value={fmtDate(lead.updated_at)} />
                    <MetaItem label="Thread ID" value={lead.platform_thread_id || ' - '} />
                    <MetaItem label="Assigned to" value={lead.assigned_to ? `User #${lead.assigned_to}` : 'Unassigned'} />
                    <MetaItem label="Messages" value={lead.messages?.length || 0} />
                    <MetaItem label="Notes" value={lead.notes?.length || 0} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

                    <div style={{
                        background: '#fff', borderRadius: '18px',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.06)',
                        display: 'flex', flexDirection: 'column', overflow: 'hidden',
                    }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ fontSize: '15px', fontWeight: '600', color: '#1D1D1F' }}>Messages</div>
                            <div style={{ fontSize: '13px', color: '#AEAEB2' }}>{lead.messages?.length || 0} total</div>
                        </div>

                        <div style={{ padding: '20px', flex: 1, overflowY: 'auto', maxHeight: '500px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {!lead.messages || lead.messages.length === 0 ? (
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px', color: '#AEAEB2', fontSize: '14px' }}>
                                    No messages yet
                                </div>
                            ) : lead.messages.map(msg => (
                                <div key={msg.id} style={{ display: 'flex', justifyContent: msg.direction === 'outbound' ? 'flex-end' : 'flex-start' }}>
                                    <div style={{ maxWidth: '78%' }}>
                                        <div style={{
                                            padding: '12px 16px', borderRadius: msg.direction === 'outbound' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                            background: msg.direction === 'outbound' ? '#0071E3' : '#F5F5F7',
                                            color: msg.direction === 'outbound' ? '#fff' : '#1D1D1F',
                                            fontSize: '14px', lineHeight: '1.5',
                                        }}>
                                            {msg.body}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#AEAEB2', marginTop: '5px', textAlign: msg.direction === 'outbound' ? 'right' : 'left', padding: '0 4px' }}>
                                            {fmtTime(msg.received_at)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    <div style={{
                        background: '#fff', borderRadius: '18px',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.06)',
                        display: 'flex', flexDirection: 'column', overflow: 'hidden',
                    }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ fontSize: '15px', fontWeight: '600', color: '#1D1D1F' }}>Notes</div>
                            <div style={{ fontSize: '13px', color: '#AEAEB2' }}>{lead.notes?.length || 0} total</div>
                        </div>

                        <div style={{ padding: '20px', flex: 1, overflowY: 'auto', maxHeight: '320px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {!lead.notes || lead.notes.length === 0 ? (
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px', color: '#AEAEB2', fontSize: '14px' }}>
                                    No notes yet
                                </div>
                            ) : lead.notes.map(note => (
                                <div key={note.id} style={{ background: '#FAFAFA', borderRadius: '12px', padding: '14px 16px', border: '1px solid rgba(0,0,0,0.04)' }}>
                                    <div style={{ fontSize: '14px', color: '#1D1D1F', lineHeight: '1.55', marginBottom: '10px' }}>{note.content}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{
                                            width: '22px', height: '22px', borderRadius: '50%',
                                            background: '#E5E5EA', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '10px', fontWeight: '600', color: '#6E6E73',
                                        }}>
                                            {note.users ? note.users.name.charAt(0) : '?'}
                                        </div>
                                        <span style={{ fontSize: '12px', color: '#AEAEB2' }}>
                                            {note.users ? note.users.name : 'Unknown'} · {fmtDate(note.created_at)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ padding: '20px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                            <textarea
                                value={noteContent}
                                onChange={e => setNoteContent(e.target.value)}
                                onFocus={() => setNoteFocus(true)}
                                onBlur={() => setNoteFocus(false)}
                                placeholder="Write a note about this lead..."
                                rows={3}
                                style={{
                                    width: '100%', boxSizing: 'border-box',
                                    background: '#F5F5F7', resize: 'none', outline: 'none', fontFamily: font,
                                    border: `1px solid ${noteFocus ? '#0071E3' : 'transparent'}`,
                                    borderRadius: '12px', padding: '12px 14px', fontSize: '14px',
                                    color: '#1D1D1F', lineHeight: '1.5',
                                    boxShadow: noteFocus ? '0 0 0 3px rgba(0,113,227,0.12)' : 'none',
                                    transition: 'all 0.15s',
                                }}
                            />
                            <button
                                onClick={addNote}
                                disabled={submitting || !noteContent.trim()}
                                style={{
                                    marginTop: '12px', padding: '10px 20px',
                                    background: noteContent.trim() ? '#0071E3' : '#E5E5EA',
                                    color: noteContent.trim() ? '#fff' : '#AEAEB2',
                                    border: 'none', borderRadius: '10px',
                                    fontSize: '14px', fontWeight: '500', cursor: noteContent.trim() ? 'pointer' : 'default',
                                    fontFamily: font, transition: 'all 0.15s',
                                }}
                            >
                                {submitting ? 'Saving...' : 'Add Note'}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </Sidebar>
    );
}