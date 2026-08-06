import React, { useCallback, useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Coins, TrendingUp, Award, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import UserLayout from '../components/UserLayout';
import * as SELF from '../api/self';
import { CardSkeleton, Skeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import { OrderStatusBadge, PaymentBadge, RewardTypeBadge } from '../components/ui/Badges';

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

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, orders, rw] = await Promise.all([
        SELF.fetchMyRetailer(),
        SELF.fetchMyOrders({ page: 0, size: 5 }),
        SELF.fetchMyRewardHistory(),
      ]);
      setProfile(p);
      setRecentOrders(orders);
      setRewards(rw);
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

  const rewardInfo = profile?.rewardInfo;
  const ordersList = recentOrders?.content || [];

  return (
    <UserLayout title="Dashboard" subtitle="Your retailer summary" activeKey="dashboard">
      <div className="section-heading" style={{ marginTop: 0 }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--text-main)' }}>Welcome back, {user?.name || 'there'}</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Here's what's happening with your {profile?.shopName || 'retailer'} account today.
          </p>
        </div>
        <Link className="btn btn-outline" to="/my-account" style={{ width: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          View Full Account
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <h3>Reward Balance</h3>
            <p>{rewardInfo?.currentBalance ?? rewardInfo?.availablePoints ?? 0}</p>
          </div>
          <div className="stat-icon primary"><Coins size={24} /></div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <h3>Lifetime Earned</h3>
            <p>{rewardInfo?.lifetimeEarned ?? 0}</p>
          </div>
          <div className="stat-icon success"><TrendingUp size={24} /></div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <h3>Points Redeemed</h3>
            <p>{rewardInfo?.pointsRedeemed ?? 0}</p>
          </div>
          <div className="stat-icon secondary"><Coins size={24} /></div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <h3>Current Tier</h3>
            <p>{rewardInfo?.currentTier || profile?.tier || 'BRONZE'}</p>
          </div>
          <div className="stat-icon info"><Award size={24} /></div>
        </div>
      </div>

      <div className="dashboard-split" style={{ marginTop: '1.5rem' }}>
        <div className="table-card">
          <div className="section-heading" style={{ marginBottom: '0.75rem' }}>
            <h3>Recent Orders</h3>
            <Link className="btn btn-outline" to="/my-account" style={{ width: 'auto', fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
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
                    <th>Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersList.map((o) => (
                    <tr key={o.id}>
                      <td>{o.orderNumber}</td>
                      <td>{formatDateTime(o.orderDate)}</td>
                      <td className="amount">{formatMoney(o.totalAmount)}</td>
                      <td><OrderStatusBadge status={o.orderStatus} /></td>
                      <td><PaymentBadge status={o.paymentStatus} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rd-panel">
          <div className="section-heading" style={{ marginBottom: '0.75rem' }}>
            <h3>Recent Rewards</h3>
            <Link className="btn btn-outline" to="/my-account" style={{ width: 'auto', fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
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
    </UserLayout>
  );
};

export default Dashboard;
