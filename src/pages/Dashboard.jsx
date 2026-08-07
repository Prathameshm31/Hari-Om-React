import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ArrowUpCircle, ArrowDownCircle, PlusCircle, ShoppingBag, Clock, CheckCircle2, XCircle, PackageCheck, Users } from 'lucide-react';
import UserLayout from '../components/UserLayout';
import * as SELF from '../api/self';
import { fetchMyOrders } from '../api/orders';
import RewardProgressWidget from '../components/rewards/RewardProgressWidget';
import { CardSkeleton, Skeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import { OrderStatusBadge, RewardTypeBadge } from '../components/ui/Badges';

const formatDateTime = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true });
};

const formatMoney = (value) =>
  value == null ? '₹0' : `₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const Dashboard = () => {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [recentOrders, setRecentOrders] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [myTeam, setMyTeam] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, orders, rw] = await Promise.all([
        SELF.fetchMyRetailer(),
        fetchMyOrders({ page: 0, size: 100 }),
        SELF.fetchMyRewardHistory(),
      ]);
      setProfile(p);
      setRecentOrders(orders);
      setRewards(rw);
      try {
        const { fetchMyTeam } = await import('../api/teams');
        setMyTeam(await fetchMyTeam());
      } catch (err) {
        console.log('No team assigned or error');
      }
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const ordersList = recentOrders?.content || [];

  const orderStats = useMemo(() => {
    const stats = { PENDING: 0, APPROVED: 0, REJECTED: 0, DELIVERED: 0, TOTAL: 0 };
    (recentOrders?.content || []).forEach((o) => {
      stats.TOTAL += 1;
      if (stats[o.status] !== undefined) stats[o.status] += 1;
    });
    return stats;
  }, [recentOrders]);

  if (user?.role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  if (loading) {
    return (
      <UserLayout title="Dashboard" subtitle="Your retailer summary" activeKey="dashboard">
        <CardSkeleton cards={4} />
        <div style={{ marginTop: '1.5rem' }}><Skeleton height={160} /></div>
      </UserLayout>
    );
  }

  if (error) {
    return (
      <UserLayout title="Dashboard" subtitle="Your retailer summary" activeKey="dashboard">
        <ErrorState message={error} onRetry={load} />
      </UserLayout>
    );
  }

  const statsCards = [
    { label: 'Total Orders', value: orderStats.TOTAL, icon: ShoppingBag, cls: 'primary' },
    { label: 'Pending Orders', value: orderStats.PENDING, icon: Clock, cls: 'secondary' },
    { label: 'Approved Orders', value: orderStats.APPROVED, icon: CheckCircle2, cls: 'success' },
    { label: 'Rejected Orders', value: orderStats.REJECTED, icon: XCircle, cls: 'danger' },
    { label: 'Delivered Orders', value: orderStats.DELIVERED, icon: PackageCheck, cls: 'info' },
  ];

  return (
    <UserLayout title="Dashboard" subtitle="Your retailer summary" activeKey="dashboard">
      <div className="section-heading" style={{ marginTop: 0 }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--text-main)' }}>Welcome back, {user?.name || 'there'}</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Here's what's happening with your {profile?.shopName || 'retailer'} account today.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link className="btn btn-primary" to="/orders/new" style={{ width: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <PlusCircle size={18} /> Create New Order
          </Link>
          <Link className="btn btn-outline" to="/orders" style={{ width: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingBag size={18} /> My Orders
          </Link>
        </div>
      </div>

      <div className="stats-grid">
        {statsCards.map((c) => {
          const Icon = c.icon;
          return (
            <div className="stat-card" key={c.label}>
              <div className="stat-info">
                <h3>{c.label}</h3>
                <p>{c.value}</p>
              </div>
              <div className={`stat-icon ${c.cls}`}><Icon size={24} /></div>
            </div>
          );
        })}
      </div>

      <div className="tr-widget rd-panel" style={{ marginTop: '1.5rem' }}>
        <div className="tr-widget-header">
          <div className="tr-title">
            <span className="tr-title-icon" style={{ background: 'linear-gradient(135deg, #2563eb, #60a5fa)' }}>
              <Users size={20} />
            </span>
            <div>
              <h3>My Team</h3>
              <p>Your team performance at a glance</p>
            </div>
          </div>
        </div>
        {myTeam ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'center' }}>
            <div style={{ minWidth: '160px', flex: '1 1 200px' }}>
              <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '0.25rem' }}>{myTeam.team?.teamName || 'My Team'}</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Leader: {myTeam.team?.leaderName || 'Unassigned'}</p>
            </div>
            <div style={{ display: 'flex', gap: '1.75rem' }}>
              <div>
                <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>Rank</p>
                <p style={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--text-main)' }}>#{myTeam.team?.rank}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>Points</p>
                <p style={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--text-main)' }}>{myTeam.team?.teamPoints}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>Members</p>
                <p style={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--text-main)' }}>{myTeam.team?.totalMembers}</p>
              </div>
            </div>
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>You are not assigned to any team yet.</p>
        )}
      </div>

      <div className="dashboard-split" style={{ marginTop: '1.5rem' }}>
        <div className="table-card">
          <div className="section-heading" style={{ marginBottom: '0.75rem', padding: '1.25rem 1.5rem 0' }}>
            <h3>Recent Orders</h3>
            <Link className="btn btn-outline" to="/orders" style={{ width: 'auto', fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
              View all
            </Link>
          </div>
          {ordersList.length === 0 ? (
            <EmptyState message="No orders yet." />
          ) : (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order Number</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersList.slice(0, 8).map((o) => (
                    <tr key={o.id}>
                      <td className="order-no">{o.orderNumber}</td>
                      <td>{formatDateTime(o.orderDate)}</td>
                      <td className="amount">{formatMoney(o.finalAmount ?? o.totalAmount)}</td>
                      <td><OrderStatusBadge status={o.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="dashboard-right">
          <RewardProgressWidget />

          <div className="rd-panel" style={{ marginTop: '1.5rem' }}>
            <div className="section-heading" style={{ marginBottom: '0.75rem' }}>
              <h3>Recent Rewards</h3>
              <Link className="btn btn-outline" to="/my-rewards" style={{ width: 'auto', fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                View all
              </Link>
            </div>
            {rewards.length === 0 ? (
              <EmptyState message="No reward transactions yet." />
            ) : (
              <div className="rd-list">
                {rewards.slice(0, 6).map((t) => {
                  const isEarned = (t.pointsEarned || 0) > 0;
                  const isRedeemed = (t.pointsRedeemed || 0) > 0;
                  const Icon = isRedeemed && !isEarned ? ArrowDownCircle : ArrowUpCircle;
                  return (
                    <div className="rd-item" key={t.id}>
                      <span className={`rd-icon ${isRedeemed && !isEarned ? 'neg' : 'pos'}`}>
                        <Icon size={16} />
                      </span>
                      <div className="rd-body">
                        <div className="rd-line">
                          <strong>{isEarned ? `+${t.pointsEarned}` : isRedeemed ? `−${t.pointsRedeemed}` : '0'} points</strong>
                          <RewardTypeBadge type={t.type} />
                        </div>
                        <p className="rd-sub">{formatDateTime(t.date)}{t.remarks ? ` · ${t.remarks}` : ''}</p>
                      </div>
                      <span className={`rd-balance ${isRedeemed && !isEarned ? 'neg' : 'pos'}`}>{t.balance}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default Dashboard;
