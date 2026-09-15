import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

const STATUS = {
    new: { color: '#52779a', bg: '#edf3f6', label: 'New' },
    contacted: { color: '#8a6a2f', bg: '#f6f0df', label: 'Contacted' },
    qualified: { color: '#3f7654', bg: '#edf5ef', label: 'Qualified' },
    closed: { color: '#7c7972', bg: '#efede8', label: 'Closed' },
};

const INTENT = {
    price_inquiry: { color: '#6d5a87', bg: '#f2eef7', label: 'Price' },
    delivery_inquiry: { color: '#8a6a2f', bg: '#f6f0df', label: 'Delivery' },
    availability: { color: '#3d7480', bg: '#eaf3f4', label: 'Stock' },
    unclassified: { color: '#7c7972', bg: '#efede8', label: 'General' },
};

const CHANNEL_ICON = {
    whatsapp: 'WhatsApp',
    messenger: 'Messenger',
    instagram: 'Instagram',
};

const font = 'Inter, -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif';

const Badge = ({ color, bg, label }) => (
    <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '7px',
        fontSize: '13px',
        fontWeight: 550,
        color,
        background: bg,
        borderRadius: '999px',
        padding: '5px 10px',
        whiteSpace: 'nowrap',
    }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, display: 'inline-block' }} />
        {label}
    </span>
);

const StatCard = ({ label, value, sub, muted }) => (
    <div style={{
        background: '#fffdfa',
        border: '1px solid rgba(33,33,31,0.08)',
        borderRadius: '15px',
        padding: '17px 18px 16px',
        minWidth: 0,
    }}>
        <div style={{
            color: muted ? '#8f8b83' : '#21211f',
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: '31px',
            fontWeight: 400,
            lineHeight: 1,
            letterSpacing: '-0.03em',
        }}>
            {value}
        </div>
        <div style={{ marginTop: '9px', color: '#34322f', fontSize: '13px', fontWeight: 550 }}>{label}</div>
        {sub && <div style={{ marginTop: '3px', color: '#959087', fontSize: '12px' }}>{sub}</div>}
    </div>
);

export default function DashboardPage() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ status: '', channel: '', intent: '', message_type: '' });
    const [search, setSearch] = useState('');
    const [focusSearch, setFocusSearch] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        setSearch(searchParams.get('q') || '');
    }, [searchParams]);

    useEffect(() => { fetchLeads(); }, [filters]);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const params = {};
            Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
            const res = await api.get('/leads', { params });
            setLeads(res.data);
        } catch (err) {
            console.error(err);
            setLeads([]);
        } finally {
            setLoading(false);
        }
    };

    const filtered = leads.filter(l => {
        const name = (l.contact_name || '').toLowerCase();
        const phone = l.phone || '';
        const query = search.toLowerCase();
        return name.includes(query) || phone.includes(search);
    });

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
        if (diff < 3600000) return `${Math.max(1, Math.floor(diff / 60000))}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const SelectFilter = ({ filterKey, options, placeholder }) => (
        <select
            aria-label={placeholder}
            value={filters[filterKey]}
            onChange={e => setFilters(f => ({ ...f, [filterKey]: e.target.value }))}
            style={{
                minHeight: '37px',
                color: filters[filterKey] ? '#21211f' : '#77736b',
                background: filters[filterKey] ? '#eee9df' : '#f6f3ed',
                border: `1px solid ${filters[filterKey] ? 'rgba(33,33,31,0.14)' : 'transparent'}`,
                borderRadius: '999px',
                padding: '0 11px',
                fontSize: '13px',
                fontFamily: font,
                cursor: 'pointer',
                outline: 'none',
                fontWeight: filters[filterKey] ? 550 : 450,
            }}
        >
            <option value="">{placeholder}</option>
            {options.map(o => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
        </select>
    );

    const hasFilters = Object.values(filters).some(Boolean) || search;

    return (
        <Sidebar>
            <div style={{ width: '100%', boxSizing: 'border-box', fontFamily: font }}>
                <div className="dashboard-heading">
                    <div>
                        <h1>Leads</h1>
                        <p>Incoming messages across your connected channels.</p>
                    </div>
                </div>

                <div className="dashboard-stat-grid">
                    <StatCard label="Total leads" value={stats.total} />
                    <StatCard label="New leads" value={stats.new} sub="Awaiting response" />
                    <StatCard label="Qualified" value={stats.qualified} />
                    <StatCard label="Duplicates" value={stats.duplicates} sub="Needs review" muted={!stats.duplicates} />
                </div>

                <section className="dashboard-panel">
                    <div className="dashboard-panel-header">
                        <div>
                            <strong>All leads</strong>
                            <span>{filtered.length} shown</span>
                        </div>
                        {hasFilters && (
                            <button
                                onClick={() => { setFilters({ status: '', channel: '', intent: '', message_type: '' }); setSearch(''); }}
                                className="dashboard-clear"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>

                    <div className="dashboard-toolbar">
                        <div className="dashboard-search">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.6" />
                                <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search by name or phone"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                onFocus={() => setFocusSearch(true)}
                                onBlur={() => setFocusSearch(false)}
                                style={{
                                    borderColor: focusSearch ? 'rgba(82,119,154,0.55)' : 'rgba(33,33,31,0.08)',
                                    boxShadow: focusSearch ? '0 0 0 3px rgba(82,119,154,0.10)' : 'none',
                                }}
                            />
                        </div>
                        <SelectFilter filterKey="status" placeholder="Status" options={['new', 'contacted', 'qualified', 'closed']} />
                        <SelectFilter filterKey="channel" placeholder="Channel" options={['whatsapp', 'messenger', 'instagram']} />
                        <SelectFilter filterKey="intent" placeholder="Intent" options={['price_inquiry', 'delivery_inquiry', 'availability', 'unclassified']} />
                        <SelectFilter filterKey="message_type" placeholder="Type" options={['customer_lead', 'supplier', 'general']} />
                    </div>

                    <div className="dashboard-table-wrap">
                        <div className="dashboard-table-head">
                            {['Contact', 'Channel', 'Intent', 'Type', 'Status', 'Date'].map(h => (
                                <div key={h}>{h}</div>
                            ))}
                        </div>

                        {loading ? (
                            <div className="dashboard-table-state">Loading leads...</div>
                        ) : filtered.length === 0 ? (
                            <div className="dashboard-table-state">
                                <strong>No leads found</strong>
                                <span>Try clearing a filter or changing your search.</span>
                            </div>
                        ) : filtered.map((lead, i) => {
                            const st = STATUS[lead.status] || STATUS.new;
                            const intent = INTENT[lead.intent] || INTENT.unclassified;
                            return (
                                <div
                                    key={lead.id}
                                    className="dashboard-row"
                                    onClick={() => navigate(`/app/leads/${lead.id}`)}
                                    style={{ borderBottomColor: i < filtered.length - 1 ? 'rgba(33,33,31,0.06)' : 'transparent' }}
                                >
                                    <div className="dashboard-contact">
                                        <div className="dashboard-contact-avatar">
                                            {(lead.contact_name || '?').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="dashboard-contact-copy">
                                            <div>
                                                {lead.contact_name || 'Unknown contact'}
                                                {lead.possible_duplicate && <span className="dashboard-dup">DUP</span>}
                                            </div>
                                            {lead.phone && <small>{lead.phone}</small>}
                                        </div>
                                    </div>
                                    <div className="dashboard-channel">{CHANNEL_ICON[lead.channel] || lead.channel}</div>
                                    <div><Badge color={intent.color} bg={intent.bg} label={intent.label} /></div>
                                    <div className="dashboard-type">{(lead.message_type || 'general').replace(/_/g, ' ')}</div>
                                    <div><Badge color={st.color} bg={st.bg} label={st.label} /></div>
                                    <div className="dashboard-date">{fmtDate(lead.created_at)}</div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="dashboard-panel-footer">
                        <span>{filtered.length} of {leads.length} leads</span>
                        <span>Click a lead to view details</span>
                    </div>
                </section>
            </div>
        </Sidebar>
    );
}
