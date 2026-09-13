import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

const STATUS = {
    new: { color: '#0071E3', bg: 'rgba(0,113,227,0.08)', label: 'New' },
    contacted: { color: '#FF9500', bg: 'rgba(255,149,0,0.08)', label: 'Contacted' },
    qualified: { color: '#34C759', bg: 'rgba(52,199,89,0.08)', label: 'Qualified' },
    closed: { color: '#AEAEB2', bg: 'rgba(174,174,178,0.1)', label: 'Closed' },
};

const INTENT = {
    price_inquiry: { color: '#AF52DE', bg: 'rgba(175,82,222,0.08)', label: 'Price' },
    delivery_inquiry: { color: '#FF9500', bg: 'rgba(255,149,0,0.08)', label: 'Delivery' },
    availability: { color: '#30B0C7', bg: 'rgba(48,176,199,0.08)', label: 'Stock' },
    unclassified: { color: '#AEAEB2', bg: 'rgba(174,174,178,0.08)', label: 'General' },
};

const CHANNEL_ICON = { whatsapp: '💬', messenger: '💙', instagram: '🌸' };

const font = "'Inter', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif";

const Badge = ({ color, bg, label }) => (
    <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        fontSize: '13px', fontWeight: '500', color,
        background: bg, borderRadius: '7px', padding: '4px 10px',
        whiteSpace: 'nowrap',
    }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, display: 'inline-block' }} />
        {label}
    </span>
);

const StatCard = ({ label, value, sub, color }) => (
    <div style={{
        background: '#fff', borderRadius: '16px', padding: '24px 28px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.06)',
        flex: 1,
    }}>
        <div style={{ fontSize: '32px', fontWeight: '600', color: color || '#1D1D1F', letterSpacing: '-0.03em', lineHeight: 1 }}>
            {value}
        </div>
        <div style={{ fontSize: '14px', fontWeight: '500', color: '#1D1D1F', marginTop: '8px' }}>{label}</div>
        {sub && <div style={{ fontSize: '13px', color: '#AEAEB2', marginTop: '3px' }}>{sub}</div>}
    </div>
);

export default function DashboardPage() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ status: '', channel: '', intent: '', message_type: '' });
    const [search, setSearch] = useState('');
    const [focusSearch, setFocusSearch] = useState(false);
    const navigate = useNavigate();

    useEffect(() => { fetchLeads(); }, [filters]);

    const fetchLeads = async () => {
        try {
            const params = {};
            Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
            const res = await api.get('/leads', { params });
            setLeads(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const filtered = leads.filter(l =>
        l.contact_name.toLowerCase().includes(search.toLowerCase()) ||
        (l.phone && l.phone.includes(search))
    );

    const stats = {
        total: leads.length,
        new: leads.filter(l => l.status === 'new').length,
        qualified: leads.filter(l => l.status === 'qualified').length,
        duplicates: leads.filter(l => l.possible_duplicate).length,
    };

    const fmtDate = (str) => {
        const d = new Date(str);
        const now = new Date();
        const diff = now - d;
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const SelectFilter = ({ filterKey, options, placeholder }) => (
        <select
            value={filters[filterKey]}
            onChange={e => setFilters(f => ({ ...f, [filterKey]: e.target.value }))}
            style={{
                background: filters[filterKey] ? '#1D1D1F' : '#F5F5F7',
                color: filters[filterKey] ? '#fff' : '#6E6E73',
                border: 'none', borderRadius: '8px',
                padding: '8px 13px', fontSize: '14px',
                fontFamily: font, cursor: 'pointer', outline: 'none',
                fontWeight: filters[filterKey] ? '500' : '400',
            }}
        >
            <option value="">{placeholder}</option>
            {options.map(o => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
        </select>
    );

    const hasFilters = Object.values(filters).some(Boolean) || search;

    return (
        <Sidebar>
            <div style={{ fontFamily: font, padding: '40px 48px', width: '100%', boxSizing: 'border-box' }}>

                {/* Header */}
                <div style={{ marginBottom: '28px' }}>
                    <h1 style={{ fontSize: '26px', fontWeight: '600', color: '#1D1D1F', letterSpacing: '-0.02em', marginBottom: '5px', margin: 0 }}>
                        Leads
                    </h1>
                    <p style={{ fontSize: '14px', color: '#6E6E73', margin: '5px 0 0' }}>
                        Incoming messages across all channels
                    </p>
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', gap: '14px', marginBottom: '24px' }}>
                    <StatCard label="Total leads" value={stats.total} />
                    <StatCard label="New leads" value={stats.new} color="#0071E3" sub="Awaiting response" />
                    <StatCard label="Qualified" value={stats.qualified} color="#34C759" />
                    <StatCard label="Duplicates" value={stats.duplicates} color="#FF3B30" sub="Needs review" />
                </div>

                {/* Toolbar */}
                <div style={{
                    background: '#fff', borderRadius: '14px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.06)',
                    padding: '14px 18px', marginBottom: '12px',
                    display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap',
                }}>
                    {/* Search */}
                    <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                        <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#AEAEB2' }} width="15" height="15" viewBox="0 0 14 14" fill="none">
                            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3" />
                            <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search by name or phone..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onFocus={() => setFocusSearch(true)}
                            onBlur={() => setFocusSearch(false)}
                            style={{
                                width: '100%', boxSizing: 'border-box',
                                background: '#F5F5F7', border: `1px solid ${focusSearch ? '#0071E3' : 'transparent'}`,
                                borderRadius: '8px', padding: '8px 13px 8px 34px',
                                fontSize: '14px', color: '#1D1D1F', outline: 'none',
                                fontFamily: font,
                                boxShadow: focusSearch ? '0 0 0 3px rgba(0,113,227,0.12)' : 'none',
                                transition: 'all 0.15s',
                            }}
                        />
                    </div>

                    <div style={{ width: '1px', height: '22px', background: 'rgba(0,0,0,0.08)' }} />

                    <SelectFilter filterKey="status" placeholder="All status" options={['new', 'contacted', 'qualified', 'closed']} />
                    <SelectFilter filterKey="channel" placeholder="All channels" options={['whatsapp', 'messenger', 'instagram']} />
                    <SelectFilter filterKey="intent" placeholder="All intent" options={['price_inquiry', 'delivery_inquiry', 'availability', 'unclassified']} />
                    <SelectFilter filterKey="message_type" placeholder="All types" options={['customer_lead', 'supplier', 'general']} />

                    {hasFilters && (
                        <button
                            onClick={() => { setFilters({ status: '', channel: '', intent: '', message_type: '' }); setSearch(''); }}
                            style={{
                                background: 'none', border: 'none', fontSize: '14px', color: '#FF3B30',
                                cursor: 'pointer', fontFamily: font, padding: '4px 8px', borderRadius: '6px',
                            }}
                        >
                            Clear
                        </button>
                    )}
                </div>

                {/* Table */}
                <div style={{
                    background: '#fff', borderRadius: '16px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.06)',
                    overflow: 'hidden',
                }}>
                    {/* Header row */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
                        padding: '12px 24px', borderBottom: '1px solid rgba(0,0,0,0.06)',
                        background: '#FAFAFA',
                    }}>
                        {['Contact', 'Channel', 'Intent', 'Type', 'Status', 'Date'].map(h => (
                            <div key={h} style={{ fontSize: '11px', fontWeight: '600', color: '#AEAEB2', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                {h}
                            </div>
                        ))}
                    </div>

                    {loading ? (
                        <div style={{ padding: '80px', textAlign: 'center', fontSize: '15px', color: '#AEAEB2' }}>
                            Loading...
                        </div>
                    ) : filtered.length === 0 ? (
                        <div style={{ padding: '80px', textAlign: 'center', fontSize: '15px', color: '#AEAEB2' }}>
                            No leads found
                        </div>
                    ) : filtered.map((lead, i) => {
                        const st = STATUS[lead.status] || STATUS.new;
                        const int = INTENT[lead.intent] || INTENT.unclassified;
                        return (
                            <div
                                key={lead.id}
                                onClick={() => navigate(`/app/leads/${lead.id}`)}
                                style={{
                                    display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
                                    padding: '16px 24px', cursor: 'pointer', alignItems: 'center',
                                    borderBottom: i < filtered.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                                    transition: 'background 0.1s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                {/* Contact */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '13px', minWidth: 0 }}>
                                    <div style={{
                                        width: '38px', height: '38px', borderRadius: '12px', flexShrink: 0,
                                        background: 'linear-gradient(135deg, #1D1D1F, #3A3A3C)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '14px', fontWeight: '500', color: '#fff',
                                    }}>
                                        {lead.contact_name.charAt(0).toUpperCase()}
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#1D1D1F', display: 'flex', alignItems: 'center', gap: '7px' }}>
                                            {lead.contact_name}
                                            {lead.possible_duplicate && (
                                                <span style={{ fontSize: '10px', background: 'rgba(255,59,48,0.1)', color: '#FF3B30', borderRadius: '4px', padding: '1px 5px', fontWeight: '600' }}>
                                                    DUP
                                                </span>
                                            )}
                                        </div>
                                        {lead.phone && <div style={{ fontSize: '13px', color: '#AEAEB2', marginTop: '2px' }}>{lead.phone}</div>}
                                    </div>
                                </div>

                                {/* Channel */}
                                <div style={{ fontSize: '14px', color: '#6E6E73' }}>
                                    {CHANNEL_ICON[lead.channel]} {lead.channel}
                                </div>

                                {/* Intent */}
                                <div><Badge color={int.color} bg={int.bg} label={int.label} /></div>

                                {/* Type */}
                                <div style={{ fontSize: '13px', color: '#AEAEB2', textTransform: 'capitalize' }}>
                                    {lead.message_type.replace(/_/g, ' ')}
                                </div>

                                {/* Status */}
                                <div><Badge color={st.color} bg={st.bg} label={st.label} /></div>

                                {/* Date */}
                                <div style={{ fontSize: '13px', color: '#AEAEB2' }}>{fmtDate(lead.created_at)}</div>
                            </div>
                        );
                    })}
                </div>

                <div style={{ marginTop: '12px', fontSize: '13px', color: '#AEAEB2', textAlign: 'right' }}>
                    {filtered.length} of {leads.length} leads
                </div>

            </div>
        </Sidebar>
    );
}