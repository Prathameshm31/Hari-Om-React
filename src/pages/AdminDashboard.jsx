import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  LogOut,
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Settings,
  Bell,
  Menu,
  Search,
  RefreshCw,
  ShieldCheck,
  X,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import Button from '../components/Button';
import api from '../api/client';

const formatDateTime = (value) => {
  if (!value) return 'Never';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users/status');
      setUsers(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRoleChange = async (id, role) => {
    setNotice('');
    try {
      await api.put(`/admin/users/${id}/role`, { role });
      setNotice(`Role updated to ${role}.`);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update role.');
    }
  };

  const handleStatusToggle = async (id, isActive) => {
    setNotice('');
    try {
      await api.put(`/admin/users/${id}/status`, { isActive: !isActive });
      setNotice(`User ${isActive ? 'deactivated' : 'activated'}.`);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const filteredUsers = useMemo(() => {
    let result = users.filter((u) =>
      (statusFilter === 'ALL' || u.status === statusFilter) &&
      (!search || `${u.name} ${u.email}`.toLowerCase().includes(search.toLowerCase()))
    );

    result = [...result].sort((a, b) => {
      const aTime = a.lastLoginTime ? new Date(a.lastLoginTime).getTime() : 0;
      const bTime = b.lastLoginTime ? new Date(b.lastLoginTime).getTime() : 0;
      return sortOrder === 'desc' ? bTime - aTime : aTime - bTime;
    });

    return result;
  }, [users, statusFilter, search, sortOrder]);

  const onlineCount = users.filter((u) => u.status === 'ONLINE').length;

  return (
    <div className="dashboard-layout">
      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <h1 className="auth-logo" style={{ fontSize: '1.25rem' }}>
            Hari Om <span>Enterprises</span>
          </h1>
          {mobileMenuOpen && (
            <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'absolute', right: '1rem', top: '1.5rem' }}>
              <X size={24} color="var(--text-main)" />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          <Link to="/" className="nav-item">
            <LayoutDashboard /> Dashboard
          </Link>
          <Link to="/admin" className="nav-item active">
            <Users /> Manage Users
          </Link>
          <a href="#" className="nav-item">
            <Package /> Manage Products
          </a>
          <a href="#" className="nav-item">
            <ShoppingCart /> Manage Orders
          </a>
          <a href="#" className="nav-item">
            <Settings /> System Settings
          </a>
        </nav>

        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div>
              <p style={{ fontWeight: '500', fontSize: '0.875rem', color: 'var(--text-main)' }}>{user?.name || 'Admin'}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ADMIN</p>
            </div>
          </div>
          <Button variant="outline" style={{ width: '100%', justifyContent: 'center', gap: '0.5rem' }} onClick={logout}>
            <LogOut size={18} /> Logout
          </Button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-main)' }}>
              <Menu size={24} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', fontWeight: '600' }}>
              <ShieldCheck size={20} color="var(--primary)" /> Admin Dashboard
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button style={{ background: 'none', border: 'none', position: 'relative', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <Bell size={20} />
              <span style={{ position: 'absolute', top: '0', right: '0', width: '8px', height: '8px', background: 'var(--error)', borderRadius: '50%' }}></span>
            </button>
          </div>
        </header>

        <div className="dashboard-content">
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.25rem' }}>User Activity</h2>
              <p style={{ color: 'var(--text-muted)' }}>
                {onlineCount} of {users.length} users online now
              </p>
            </div>
            <Button variant="outline" onClick={fetchUsers} style={{ gap: '0.5rem' }}>
              <RefreshCw size={16} /> Refresh
            </Button>
          </div>

          {notice && (
            <div className="text-success" style={{ marginBottom: '1rem', textAlign: 'center', background: '#f0fdf4', padding: '0.5rem', borderRadius: '0.25rem', fontWeight: '500' }}>
              {notice}
            </div>
          )}

          {error && (
            <div className="text-error" style={{ marginBottom: '1rem', textAlign: 'center', background: '#fef2f2', padding: '0.5rem', borderRadius: '0.25rem' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
              <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', outline: 'none', background: 'var(--bg-main)', color: 'var(--text-main)' }}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '0.6rem 1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', outline: 'none', background: 'var(--bg-main)', color: 'var(--text-main)' }}
            >
              <option value="ALL">All Status</option>
              <option value="ONLINE">ONLINE</option>
              <option value="OFFLINE">OFFLINE</option>
            </select>

            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              style={{ gap: '0.5rem' }}
            >
              Last Active {sortOrder === 'desc' ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </Button>
          </div>

          <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '760px' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                  {['User Name', 'Email', 'Role', 'Status', 'Last Active', 'Actions'].map((h) => (
                    <th key={h} style={{ padding: '0.9rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: '600' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading users...</td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No users found.</td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.9rem 1rem', fontWeight: '500', color: 'var(--text-main)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>
                            {u.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          {u.name}
                        </div>
                      </td>
                      <td style={{ padding: '0.9rem 1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>{u.email}</td>
                      <td style={{ padding: '0.9rem 1rem' }}>
                        <span style={{ padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600', background: u.role === 'ADMIN' ? '#fef3c7' : '#e0e7ff', color: u.role === 'ADMIN' ? '#92400e' : '#3730a3' }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '0.9rem 1rem' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', fontWeight: '500', color: u.status === 'ONLINE' ? 'var(--success)' : 'var(--text-muted)' }}>
                          <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: u.status === 'ONLINE' ? 'var(--success)' : '#cbd5e1' }} />
                          {u.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.9rem 1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        {u.status === 'ONLINE' ? formatDateTime(u.lastLoginTime) : formatDateTime(u.lastLogoutTime || u.lastLoginTime)}
                      </td>
                      <td style={{ padding: '0.9rem 1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            style={{ padding: '0.35rem 0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.8rem' }}
                          >
                            <option value="USER">USER</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleStatusToggle(u.id, u.isActive)}
                            style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {mobileMenuOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 30 }} onClick={() => setMobileMenuOpen(false)} />
      )}
    </div>
  );
};

export default AdminDashboard;
