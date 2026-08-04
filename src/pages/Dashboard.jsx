import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  LogOut, 
  LayoutDashboard, 
  ShieldCheck,
  Package, 
  ShoppingCart, 
  Users, 
  Settings,
  Bell,
  Search,
  Menu,
  Plus,
  TrendingUp,
  X
} from 'lucide-react';
import Button from '../components/Button';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = user?.role === 'ADMIN';

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <h1 className="auth-logo" style={{ fontSize: '1.25rem' }}>
            Hari Om <span>Enterprises</span>
          </h1>
          {mobileMenuOpen && (
            <button className="mobile-menu-btn" onClick={toggleMobileMenu} style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'absolute', right: '1rem', top: '1.5rem' }}>
              <X size={24} color="var(--text-main)" />
            </button>
          )}
        </div>
        
        <nav className="sidebar-nav">
          <a href="#" className="nav-item active">
            <LayoutDashboard /> {isAdmin ? 'Dashboard' : 'User Dashboard'}
          </a>
          {isAdmin && (
            <>
              <Link to="/admin" className="nav-item">
                <ShieldCheck /> Admin Dashboard
              </Link>
              <Link to="/admin" className="nav-item">
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
            </>
          )}
          {!isAdmin && (
            <>
              <a href="#" className="nav-item">
                <Package /> View Products
              </a>
              <a href="#" className="nav-item">
                <ShoppingCart /> View Orders
              </a>
              <a href="#" className="nav-item">
                <Users /> Profile
              </a>
            </>
          )}
        </nav>
        
        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p style={{ fontWeight: '500', fontSize: '0.875rem', color: 'var(--text-main)' }}>{user?.name || 'User'}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{isAdmin ? 'ADMIN' : 'USER'}</p>
            </div>
          </div>
          <Button variant="outline" style={{ width: '100%', justifyContent: 'center', gap: '0.5rem' }} onClick={logout}>
            <LogOut size={18} /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="mobile-menu-btn" onClick={toggleMobileMenu} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-main)' }}>
              <Menu size={24} />
            </button>
            <div style={{ position: 'relative', display: 'none' }} className="search-bar-desktop">
              <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search..." 
                style={{ padding: '0.5rem 1rem 0.5rem 2.5rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)', outline: 'none', background: 'var(--bg-main)' }}
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button style={{ background: 'none', border: 'none', position: 'relative', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <Bell size={20} />
              <span style={{ position: 'absolute', top: '0', right: '0', width: '8px', height: '8px', background: 'var(--error)', borderRadius: '50%' }}></span>
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="dashboard-content">
          <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.25rem' }}>Welcome back, {user?.name || 'User'} 👋</h2>
              <p style={{ color: 'var(--text-muted)' }}>Here's what's happening with Hari Om Enterprises today.</p>
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={18} /> Add Product
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-info">
                <h3>Total Products</h3>
                <p>1,248</p>
              </div>
              <div className="stat-icon primary">
                <Package size={24} />
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-info">
                <h3>Total Orders</h3>
                <p>384</p>
              </div>
              <div className="stat-icon secondary">
                <ShoppingCart size={24} />
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-info">
                <h3>Total Customers</h3>
                <p>1,893</p>
              </div>
              <div className="stat-icon info">
                <Users size={24} />
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-info">
                <h3>Total Sales</h3>
                <p>₹1.4M</p>
              </div>
              <div className="stat-icon success">
                <TrendingUp size={24} />
              </div>
            </div>
          </div>

          {/* Recent Activity & Quick Actions (Mock layout) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Recent Activity</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: i !== 3 ? '1px solid var(--border-color)' : 'none' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></div>
                    <div>
                      <p style={{ fontWeight: '500', fontSize: '0.875rem' }}>New order #ORD-{4930 + i} placed</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{i * 15} minutes ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Quick Actions</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                <Button variant="outline" style={{ justifyContent: 'flex-start', padding: '1rem' }}>
                  <Package size={18} style={{ marginRight: '0.75rem', color: 'var(--primary)' }} /> Manage Products
                </Button>
                <Button variant="outline" style={{ justifyContent: 'flex-start', padding: '1rem' }}>
                  <ShoppingCart size={18} style={{ marginRight: '0.75rem', color: 'var(--secondary)' }} /> View Pending Orders
                </Button>
                <Button variant="outline" style={{ justifyContent: 'flex-start', padding: '1rem' }}>
                  <Users size={18} style={{ marginRight: '0.75rem', color: 'var(--success)' }} /> Customer Support
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 30 }}
          onClick={toggleMobileMenu}
        />
      )}
    </div>
  );
};

export default Dashboard;
