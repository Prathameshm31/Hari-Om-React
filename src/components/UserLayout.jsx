import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  LogOut,
  LayoutDashboard,
  Store,
  Bell,
  Menu,
  X,
  UserRound,
  ShoppingBag,
} from 'lucide-react';
import Button from './Button';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, to: '/' },
  { key: 'orders', label: 'My Orders', icon: ShoppingBag, to: '/orders' },
  { key: 'account', label: 'My Account', icon: Store, to: '/my-account' },
];

const UserLayout = ({ title, subtitle, activeKey, children }) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const active = activeKey || NAV_ITEMS.find((n) => location.pathname.startsWith(n.to))?.key;

  return (
    <div className="dashboard-layout">
      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <h1 className="auth-logo" style={{ fontSize: '1.25rem' }}>
            Hari Om <span>Enterprises</span>
          </h1>
          {mobileMenuOpen && (
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'absolute', right: '1rem', top: '1.5rem' }}
              aria-label="Close menu"
            >
              <X size={24} color="var(--text-main)" />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.key}
                to={item.to}
                className={`nav-item ${active === item.key ? 'active' : ''}`}
              >
                <Icon /> {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'var(--primary)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
              }}
            >
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p style={{ fontWeight: '500', fontSize: '0.875rem', color: 'var(--text-main)' }}>{user?.name || 'User'}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>USER</p>
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
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-main)' }}
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', fontWeight: '600' }}>
              <UserRound size={20} color="var(--primary)" /> My Account
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button style={{ background: 'none', border: 'none', position: 'relative', cursor: 'pointer', color: 'var(--text-muted)' }} aria-label="Notifications">
              <Bell size={20} />
              <span style={{ position: 'absolute', top: '0', right: '0', width: '8px', height: '8px', background: 'var(--error)', borderRadius: '50%' }} />
            </button>
          </div>
        </header>

        <div className="dashboard-content">
          {(title || subtitle) && (
            <div className="page-heading">
              <div>
                <h2>{title}</h2>
                {subtitle && <p>{subtitle}</p>}
              </div>
            </div>
          )}
          {children}
        </div>
      </main>

      {mobileMenuOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 30 }} onClick={() => setMobileMenuOpen(false)} />
      )}
    </div>
  );
};

export default UserLayout;
