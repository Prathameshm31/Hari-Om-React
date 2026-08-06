import React from 'react';
import { Store, Users, UserX, Coins, CalendarPlus, ShoppingCart, Wallet, Package } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';

const formatNum = (v) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Number(v || 0));

const Card = ({ label, value, icon, cls }) => (
  <div className="stat-card">
    <div className="stat-info">
      <h3>{label}</h3>
      <p>{value}</p>
    </div>
    <div className={`stat-icon ${cls}`}>{icon}</div>
  </div>
);

const DashboardStats = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="stats-grid">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div className="stat-card" key={i}>
            <div style={{ flex: 1 }}>
              <Skeleton height={12} width="60%" style={{ marginBottom: 12 }} />
              <Skeleton height={26} width="45%" />
            </div>
            <Skeleton circle height={48} width={48} />
          </div>
        ))}
      </div>
    );
  }
  const s = stats || {};
  return (
    <div className="stats-grid">
      <Card label="Total Retailers" value={formatNum(s.totalRetailers)} icon={<Store size={24} />} cls="primary" />
      <Card label="Active Retailers" value={formatNum(s.activeRetailers)} icon={<Users size={24} />} cls="success" />
      <Card label="Inactive Retailers" value={formatNum(s.inactiveRetailers)} icon={<UserX size={24} />} cls="secondary" />
      <Card label="Reward Points Distributed" value={formatNum(s.totalRewardPoints)} icon={<Coins size={24} />} cls="info" />
      <Card label="Retailers Added This Month" value={formatNum(s.retailersAddedThisMonth)} icon={<CalendarPlus size={24} />} cls="primary" />
      <Card label="Pending Orders" value={formatNum(s.pendingOrders)} icon={<ShoppingCart size={24} />} cls="secondary" />
      <Card label="Total Orders" value={formatNum(s.totalOrders)} icon={<Wallet size={24} />} cls="info" />
      <Card label="Total Products" value={formatNum(s.totalProducts)} icon={<Package size={24} />} cls="success" />
    </div>
  );
};

export default DashboardStats;
