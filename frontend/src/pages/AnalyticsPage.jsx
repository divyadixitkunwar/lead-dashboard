import { useEffect, useState } from 'react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from 'recharts';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

const font = 'Inter, -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif';

const COLORS = {
    ink: '#21211f',
    muted: '#77736b',
    faint: '#9a958c',
    border: 'rgba(33,33,31,0.08)',
    grid: 'rgba(33,33,31,0.06)',
    panel: '#fffdfa',
    page: '#f7f4ee',
    line: '#52779a',
    bar: '#8e887d',
    funnel: '#77736b',
};

function fmtDuration(ms) {
    if (ms == null) return '—';

    const mins = Math.round(ms / 60000);

    if (mins < 60) return `${mins}m`;

    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;

    return remMins ? `${hrs}h ${remMins}m` : `${hrs}h`;
}

function formatName(value) {
    return String(value || '')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());
}

const StatCard = ({ label, value, sub }) => (
    <div style={{
        background: COLORS.panel,
        border: `1px solid ${COLORS.border}`,
        borderRadius: '15px',
        padding: '18px 19px 17px',
        minWidth: 0,
    }}>
        <div style={{
            color: COLORS.ink,
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: '29px',
            fontWeight: 400,
            lineHeight: 1,
            letterSpacing: '-0.03em',
        }}>
            {value}
        </div>

        <div style={{
            marginTop: '9px',
            color: '#34322f',
            fontSize: '13px',
            fontWeight: 550,
        }}>
            {label}
        </div>

        {sub && (
            <div style={{
                marginTop: '3px',
                color: COLORS.faint,
                fontSize: '12px',
            }}>
                {sub}
            </div>
        )}
    </div>
);

const ChartCard = ({ title, subtitle, children, style = {} }) => (
    <section style={{
        background: COLORS.panel,
        border: `1px solid ${COLORS.border}`,
        borderRadius: '15px',
        padding: '21px 22px 18px',
        ...style,
    }}>
        <div>
            <h3 style={{
                margin: 0,
                fontSize: '15px',
                fontWeight: 600,
                color: COLORS.ink,
                letterSpacing: '-0.01em',
            }}>
                {title}
            </h3>

            {subtitle && (
                <p style={{
                    margin: '5px 0 0',
                    color: COLORS.faint,
                    fontSize: '12px',
                }}>
                    {subtitle}
                </p>
            )}
        </div>

        <div style={{ marginTop: '16px' }}>
            {children}
        </div>
    </section>
);

const tooltipStyle = {
    contentStyle: {
        background: '#fffdfa',
        border: `1px solid ${COLORS.border}`,
        borderRadius: '10px',
        boxShadow: '0 8px 24px rgba(33,33,31,0.07)',
        fontSize: '12px',
    },
    labelStyle: {
        color: COLORS.ink,
        fontWeight: 600,
        marginBottom: '4px',
    },
};

export default function AnalyticsPage() {
    const [summary, setSummary] = useState(null);
    const [responseTime, setResponseTime] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let alive = true;

        Promise.all([
            api.get('/analytics/summary'),
            api.get('/analytics/response-time'),
        ])
            .then(([summaryRes, responseRes]) => {
                if (!alive) return;

                setSummary(summaryRes.data);
                setResponseTime(responseRes.data);
            })
            .catch(err => {
                console.error(err);
                if (alive) setError('Unable to load analytics.');
            })
            .finally(() => {
                if (alive) setLoading(false);
            });

        return () => {
            alive = false;
        };
    }, []);

    if (loading) {
        return (
            <Sidebar>
                <div style={{
                    padding: '40px',
                    fontFamily: font,
                    color: COLORS.muted,
                }}>
                    Loading analytics...
                </div>
            </Sidebar>
        );
    }

    if (error || !summary) {
        return (
            <Sidebar>
                <div style={{
                    padding: '40px',
                    fontFamily: font,
                }}>
                    <h1 style={{ margin: 0 }}>Analytics</h1>
                    <p style={{ color: COLORS.muted, marginTop: '8px' }}>
                        {error || 'Unable to load analytics.'}
                    </p>
                </div>
            </Sidebar>
        );
    }

    const dayData = Object.entries(summary.byDay || {})
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({
            date: date.slice(5),
            count,
        }));

    const channelData = (summary.byChannel || []).map(item => ({
        name: formatName(item.channel),
        count: item._count,
    }));

    const intentData = (summary.byIntent || []).map(item => ({
        name: formatName(item.intent),
        count: item._count,
    }));

    const statusOrder = ['new', 'contacted', 'qualified', 'closed'];

    const funnelData = statusOrder.map(status => ({
        name: formatName(status),
        count: summary.byStatus?.find(item => item.status === status)?._count || 0,
    }));

    const duplicateRate = summary.total
        ? `${((summary.duplicates / summary.total) * 100).toFixed(1)}%`
        : '0%';

    return (
        <Sidebar>
            <div style={{
                width: '100%',
                maxWidth: '1400px',
                margin: '0 auto',
                boxSizing: 'border-box',
                fontFamily: font,
            }}>
                <div className="dashboard-heading">
                    <div>
                        <h1>Analytics</h1>
                        <p>See how leads are coming in and moving through the workspace.</p>
                    </div>
                </div>

                <div className="dashboard-stat-grid">
                    <StatCard
                        label="Total leads"
                        value={summary.total}
                    />
                    <StatCard
                        label="Duplicates flagged"
                        value={summary.duplicates}
                        sub={`${duplicateRate} of all leads`}
                    />
                    <StatCard
                        label="Avg first response"
                        value={fmtDuration(responseTime?.avg_response_ms)}
                    />
                    <StatCard
                        label="Leads with a reply"
                        value={responseTime?.sample_size || 0}
                    />
                </div>

                <div style={{
                    marginTop: '28px',
                    display: 'grid',
                    gap: '22px',
                }}>
                    <ChartCard
                        title="Leads over time"
                        subtitle="Daily lead volume"
                    >
                        <div style={{ width: '100%', height: 185 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={dayData}
                                    margin={{ top: 4, right: 8, left: -18, bottom: 2 }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="2 4"
                                        stroke={COLORS.grid}
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="date"
                                        tick={{
                                            fontSize: 10,
                                            fill: COLORS.faint,
                                        }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        allowDecimals={false}
                                        tick={{
                                            fontSize: 10,
                                            fill: COLORS.faint,
                                        }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip {...tooltipStyle} />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        stroke={COLORS.line}
                                        strokeWidth={2}
                                        dot={false}
                                        activeDot={{ r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartCard>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                        gap: '22px',
                    }}>
                        <ChartCard
                            title="By channel"
                            subtitle="Where your leads originate"
                        >
                            <div style={{ width: '100%', height: 180 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={channelData}
                                        margin={{ top: 4, right: 8, left: -18, bottom: 2 }}
                                    >
                                        <CartesianGrid
                                            strokeDasharray="2 4"
                                            stroke={COLORS.grid}
                                            vertical={false}
                                        />
                                        <XAxis
                                            dataKey="name"
                                            tick={{
                                                fontSize: 10,
                                                fill: COLORS.faint,
                                            }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            allowDecimals={false}
                                            tick={{
                                                fontSize: 10,
                                                fill: COLORS.faint,
                                            }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip {...tooltipStyle} />
                                        <Bar
                                            dataKey="count"
                                            fill={COLORS.bar}
                                            radius={[4, 4, 0, 0]}
                                            barSize={34}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </ChartCard>

                        <ChartCard
                            title="By intent"
                            subtitle="What customers are asking about"
                        >
                            <div style={{ width: '100%', height: 180 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={intentData}
                                        margin={{ top: 4, right: 8, left: -18, bottom: 2 }}
                                    >
                                        <CartesianGrid
                                            strokeDasharray="2 4"
                                            stroke={COLORS.grid}
                                            vertical={false}
                                        />
                                        <XAxis
                                            dataKey="name"
                                            tick={{
                                                fontSize: 10,
                                                fill: COLORS.faint,
                                            }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            allowDecimals={false}
                                            tick={{
                                                fontSize: 10,
                                                fill: COLORS.faint,
                                            }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip {...tooltipStyle} />
                                        <Bar
                                            dataKey="count"
                                            fill={COLORS.bar}
                                            radius={[4, 4, 0, 0]}
                                            barSize={34}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </ChartCard>
                    </div>

                    <ChartCard
                        title="Status funnel"
                        subtitle="Current lead status"
                    >
                        <div style={{ width: '100%', height: 190 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={funnelData}
                                    layout="vertical"
                                    margin={{ top: 4, right: 8, left: 2, bottom: 2 }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="2 4"
                                        stroke={COLORS.grid}
                                        horizontal={false}
                                    />
                                    <XAxis
                                        type="number"
                                        allowDecimals={false}
                                        tick={{
                                            fontSize: 10,
                                            fill: COLORS.faint,
                                        }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        width={82}
                                        tick={{
                                            fontSize: 10,
                                            fill: COLORS.muted,
                                        }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip {...tooltipStyle} />
                                    <Bar
                                        dataKey="count"
                                        fill={COLORS.funnel}
                                        radius={[0, 4, 4, 0]}
                                        barSize={22}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartCard>
                </div>
            </div>
        </Sidebar>
    );
}
