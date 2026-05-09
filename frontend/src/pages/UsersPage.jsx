import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

const font = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif";

const MetaItem = ({ label, value }) => (
    <div>
        <div style={{ fontSize: '11px', fontWeight: '600', color: '#AEAEB2', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>
            {label}
        </div>
        <div style={{ fontSize: '14px', color: '#1D1D1F' }}>{value}</div>
    </div>
);

const Field = ({ label, type, value, placeholder, onChange, focusKey, focusState, setFocus }) => (
    <div>
        <div style={{ fontSize: '11px', fontWeight: '600', color: '#AEAEB2', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '7px' }}>
            {label}
        </div>
        <input
            type={type}
            value={value}
            placeholder={placeholder}
            onChange={onChange}
            onFocus={() => setFocus(focusKey)}
            onBlur={() => setFocus('')}
            style={{
                width: '100%', boxSizing: 'border-box',
                background: '#F5F5F7', fontFamily: font,
                border: `1px solid ${focusState === focusKey ? '#0071E3' : 'transparent'}`,
                borderRadius: '12px', padding: '11px 14px',
                fontSize: '14px', color: '#1D1D1F', outline: 'none',
                boxShadow: focusState === focusKey ? '0 0 0 3px rgba(0,113,227,0.12)' : 'none',
                transition: 'all 0.15s',
            }}
        />
    </div>
);

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'staff' });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [focusField, setFocusField] = useState('');
    const [roleFocus, setRoleFocus] = useState(false);

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const createUser = async () => {
        setError('');
        setSubmitting(true);
        try {
            await api.post('/users', form);
            setForm({ name: '', email: '', password: '', role: 'staff' });
            setShowForm(false);
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create user');
        } finally {
            setSubmitting(false);
        }
    };

    const updateRole = async (id, role) => {
        try {
            await api.patch(`/users/${id}`, { role });
            fetchUsers();
        } catch (err) { console.error(err); }
    };

    const deleteUser = async (id) => {
        if (!window.confirm('Delete this user? This cannot be undone.')) return;
        try {
            await api.delete(`/users/${id}`);
            fetchUsers();
        } catch (err) { console.error(err); }
    };

    const fmtDate = (str) =>
        new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const isFormValid = form.name && form.email && form.password;

    return (
        <Sidebar>
            <div style={{ fontFamily: font, padding: '40px 48px', width: '100%', boxSizing: 'border-box' }}>

                {/* Page header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', gap: '16px', flexWrap: 'wrap' }}>
                    <div>
                        <div style={{ fontSize: '26px', fontWeight: '600', color: '#1D1D1F', letterSpacing: '-0.02em', marginBottom: '5px' }}>
                            Users
                        </div>
                        <div style={{ fontSize: '14px', color: '#AEAEB2' }}>
                            {users.length} team member{users.length !== 1 ? 's' : ''}
                        </div>
                    </div>
                    <button
                        onClick={() => { setShowForm(!showForm); setError(''); }}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '7px',
                            background: showForm ? '#F5F5F7' : '#1D1D1F',
                            color: showForm ? '#6E6E73' : '#fff',
                            border: 'none', borderRadius: '10px',
                            padding: '10px 18px', fontSize: '14px', fontWeight: '500',
                            cursor: 'pointer', fontFamily: font, transition: 'all 0.15s',
                        }}
                    >
                        {showForm ? 'Cancel' : (
                            <>
                                <svg width="14" height="14" viewBox="0 0 13 13" fill="none">
                                    <path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                                </svg>
                                Add user
                            </>
                        )}
                    </button>
                </div>

                {/* Meta strip */}
                <div style={{
                    background: '#fff', borderRadius: '14px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04), 0 0 1px rgba(0,0,0,0.06)',
                    padding: '20px 32px', marginBottom: '16px',
                    display: 'flex', gap: '48px', flexWrap: 'wrap',
                }}>
                    <MetaItem label="Total members" value={users.length} />
                    <MetaItem label="Admins" value={users.filter(u => u.role === 'admin').length} />
                    <MetaItem label="Staff" value={users.filter(u => u.role === 'staff').length} />
                </div>

                {/* Add user form */}
                {showForm && (
                    <div style={{
                        background: '#fff', borderRadius: '18px',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.06)',
                        padding: '28px 32px', marginBottom: '16px',
                    }}>
                        <div style={{ fontSize: '15px', fontWeight: '600', color: '#1D1D1F', marginBottom: '22px' }}>
                            New team member
                        </div>

                        {error && (
                            <div style={{
                                background: 'rgba(255,59,48,0.06)', border: '1px solid rgba(255,59,48,0.15)',
                                borderRadius: '12px', padding: '14px 18px', marginBottom: '20px',
                                fontSize: '14px', color: '#FF3B30',
                            }}>
                                {error}
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                            <Field
                                label="Full name" type="text" value={form.name} placeholder="Aarav Sharma"
                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                focusKey="name" focusState={focusField} setFocus={setFocusField}
                            />
                            <Field
                                label="Email address" type="email" value={form.email} placeholder="aarav@company.com"
                                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                focusKey="email" focusState={focusField} setFocus={setFocusField}
                            />
                            <Field
                                label="Password" type="password" value={form.password} placeholder="••••••••"
                                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                focusKey="password" focusState={focusField} setFocus={setFocusField}
                            />
                            <div>
                                <div style={{ fontSize: '11px', fontWeight: '600', color: '#AEAEB2', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '7px' }}>
                                    Role
                                </div>
                                <select
                                    value={form.role}
                                    onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                                    onFocus={() => setRoleFocus(true)}
                                    onBlur={() => setRoleFocus(false)}
                                    style={{
                                        width: '100%', boxSizing: 'border-box',
                                        background: '#F5F5F7', fontFamily: font,
                                        border: `1px solid ${roleFocus ? '#0071E3' : 'transparent'}`,
                                        borderRadius: '12px', padding: '11px 14px',
                                        fontSize: '14px', color: '#1D1D1F', outline: 'none', cursor: 'pointer',
                                        boxShadow: roleFocus ? '0 0 0 3px rgba(0,113,227,0.12)' : 'none',
                                        transition: 'all 0.15s',
                                    }}
                                >
                                    <option value="staff">Staff</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={createUser}
                            disabled={submitting || !isFormValid}
                            style={{
                                padding: '10px 22px',
                                background: isFormValid ? '#0071E3' : '#E5E5EA',
                                color: isFormValid ? '#fff' : '#AEAEB2',
                                border: 'none', borderRadius: '10px',
                                fontSize: '14px', fontWeight: '500',
                                cursor: isFormValid ? 'pointer' : 'default',
                                fontFamily: font, transition: 'all 0.15s',
                            }}
                        >
                            {submitting ? 'Creating...' : 'Create user'}
                        </button>
                    </div>
                )}

                {/* Users table */}
                <div style={{
                    background: '#fff', borderRadius: '18px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.06)',
                    overflow: 'hidden',
                }}>
                    {/* Table header */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: '1fr 140px 160px 100px',
                        padding: '16px 28px', borderBottom: '1px solid rgba(0,0,0,0.06)',
                    }}>
                        {['Member', 'Role', 'Joined', ''].map((h, i) => (
                            <div key={i} style={{
                                fontSize: '11px', fontWeight: '600', color: '#AEAEB2',
                                textTransform: 'uppercase', letterSpacing: '0.06em',
                                textAlign: i === 3 ? 'right' : 'left',
                            }}>
                                {h}
                            </div>
                        ))}
                    </div>

                    {loading ? (
                        <div style={{ padding: '100px', textAlign: 'center', color: '#AEAEB2', fontSize: '15px' }}>
                            Loading...
                        </div>
                    ) : users.length === 0 ? (
                        <div style={{ padding: '100px', textAlign: 'center', color: '#AEAEB2', fontSize: '15px' }}>
                            No users yet
                        </div>
                    ) : users.map((user, idx) => (
                        <div
                            key={user.id}
                            style={{
                                display: 'grid', gridTemplateColumns: '1fr 140px 160px 100px',
                                padding: '16px 28px', alignItems: 'center',
                                borderBottom: idx < users.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                                transition: 'background 0.1s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            {/* Identity */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
                                    background: 'linear-gradient(135deg, #1D1D1F 0%, #3A3A3C 100%)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '15px', fontWeight: '500', color: '#fff',
                                }}>
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#1D1D1F', marginBottom: '3px' }}>
                                        {user.name}
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#AEAEB2' }}>{user.email}</div>
                                </div>
                            </div>

                            {/* Role selector */}
                            <div>
                                <select
                                    value={user.role}
                                    onChange={e => updateRole(user.id, e.target.value)}
                                    style={{
                                        background: user.role === 'admin' ? '#1D1D1F' : '#F5F5F7',
                                        color: user.role === 'admin' ? '#fff' : '#6E6E73',
                                        border: 'none', borderRadius: '8px',
                                        padding: '5px 12px', fontSize: '13px', fontWeight: '500',
                                        cursor: 'pointer', outline: 'none', fontFamily: font,
                                        textTransform: 'capitalize',
                                    }}
                                >
                                    <option value="staff">Staff</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            {/* Joined date */}
                            <div style={{ fontSize: '13px', color: '#AEAEB2' }}>
                                {fmtDate(user.created_at)}
                            </div>

                            {/* Remove */}
                            <div style={{ textAlign: 'right' }}>
                                <button
                                    onClick={() => deleteUser(user.id)}
                                    style={{
                                        background: 'none', border: 'none', padding: '0',
                                        fontSize: '13px', fontWeight: '500', color: '#AEAEB2',
                                        cursor: 'pointer', fontFamily: font, transition: 'color 0.15s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.color = '#FF3B30'}
                                    onMouseLeave={e => e.currentTarget.style.color = '#AEAEB2'}
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </Sidebar>
    );
}