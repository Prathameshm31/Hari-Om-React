import React, { useEffect, useState } from 'react';
import { Store, Phone, Mail, MapPin, Building2, Coins, Award, TrendingUp, Eye, RefreshCw } from 'lucide-react';
import UserLayout from '../components/UserLayout';
import * as SELF from '../api/self';
import Pagination from '../components/ui/Pagination';
import { Skeleton, CardSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import OrderDetailDrawer from '../components/retailer/OrderDetailDrawer';
import { RewardTypeBadge, OrderStatusBadge, PaymentBadge } from '../components/ui/Badges';

const TABS = ['Orders', 'Rewards', 'Tier History'];

const formatDateTime = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
};

const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatMoney = (value) =>
  value == null ? '—' : `₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="detail-item">
    <Icon size={15} className="detail-icon" />
    <div>
      <p className="detail-label">{label}</p>
      <p className="detail-value">{value || '—'}</p>
    </div>
  </div>
);

const RewardsTab = ({ data, loading, onRefresh }) => (
  <div className="tr-widget rd-panel">
    <div className="tr-widget-header">
      <div className="tr-title">
        <span className="tr-title-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}>
          <Coins size={20} />
        </span>
        <div>
          <h3>Reward History</h3>
          <p>All point transactions on your account</p>
        </div>
      </div>
      <button className="tr-icon-btn" type="button" onClick={onRefresh} title="Refresh" aria-label="Refresh">
        <RefreshCw size={18} />
      </button>
    </div>
    {loading ? (
      <Skeleton height={40} style={{ marginBottom: 10 }} />
    ) : data.length === 0 ? (
      <EmptyState message="No reward transactions yet." />
    ) : (
      <div className="rd-list">
        {data.map((t) => {
          const isEarned = (t.pointsEarned || 0) > 0;
          const isRedeemed = (t.pointsRedeemed || 0) > 0;
          return (
            <div className="rd-item" key={t.id}>
              <span className={`rd-icon ${isRedeemed && !isEarned ? 'neg' : 'pos'}`}>
                <Coins size={16} />
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
);

const TierHistoryTab = ({ data, loading, onRefresh }) => (
  <div className="tr-widget rd-panel">
    <div className="tr-widget-header">
      <div className="tr-title">
        <span className="tr-title-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}>
          <Award size={20} />
        </span>
        <div>
          <h3>Tier History</h3>
          <p>Your tier upgrades over time</p>
        </div>
      </div>
      <button className="tr-icon-btn" type="button" onClick={onRefresh} title="Refresh" aria-label="Refresh">
        <RefreshCw size={18} />
      </button>
    </div>
    {loading ? (
      <Skeleton height={40} style={{ marginBottom: 10 }} />
    ) : data.length === 0 ? (
      <EmptyState message="No tier history yet." />
    ) : (
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Previous Tier</th>
              <th>New Tier</th>
              <th>Total Purchase</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {data.map((h) => (
              <tr key={h.id}>
                <td>{formatDate(h.upgradeDate)}</td>
                <td>{h.previousTier || '—'}</td>
                <td>{h.newTier}</td>
                <td>{formatMoney(h.totalPurchaseValue)}</td>
                <td>{h.reason || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

const MyAccount = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState('Orders');
  const [orders, setOrders] = useState(null);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [page, setPage] = useState(0);
  const size = 10;

  const [rewards, setRewards] = useState([]);
  const [rewardsLoading, setRewardsLoading] = useState(false);
  const [tiers, setTiers] = useState([]);
  const [tiersLoading, setTiersLoading] = useState(false);

  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await SELF.fetchMyRetailer();
      setProfile(data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load account information.');
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async (p = page) => {
    setOrdersLoading(true);
    try {
      setOrders(await SELF.fetchMyOrders({ page: p, size }));
    } catch { /* ignore */ } finally {
      setOrdersLoading(false);
    }
  };

  const loadRewards = async () => {
    setRewardsLoading(true);
    try {
      setRewards(await SELF.fetchMyRewardHistory());
    } catch { /* ignore */ } finally {
      setRewardsLoading(false);
    }
  };

  const loadTiers = async () => {
    setTiersLoading(true);
    try {
      setTiers(await SELF.fetchMyTierHistory());
    } catch { /* ignore */ } finally {
      setTiersLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (activeTab === 'Orders') loadOrders();
    if (activeTab === 'Rewards') loadRewards();
    if (activeTab === 'Tier History') loadTiers();
  }, [activeTab]);

  const openOrder = async (orderId) => {
    setDetailLoading(true);
    try {
      setDetail(await SELF.fetchMyOrderDetail(orderId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to load order.');
    } finally {
      setDetailLoading(false);
    }
  };

  const rewardInfo = profile?.rewardInfo;

  return (
    <UserLayout title="My Account" subtitle="Your retailer profile, orders and rewards" activeKey="account">
      {loading ? (
        <CardSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={loadProfile} />
      ) : (
        <>
          <div className="profile-card-wrap">
            <div className="profile-card">
              <div className="profile-avatar">{profile?.shopName?.charAt(0).toUpperCase() || profile?.name?.charAt(0).toUpperCase() || 'R'}</div>
              <div className="profile-info">
                <h2>{profile?.shopName || profile?.name}</h2>
                <p className="profile-company">
                  <Building2 size={14} /> {profile?.companyName || profile?.name}
                </p>
                <span className={`tier-chip tier-${(profile?.tier || 'BRONZE').toLowerCase()}`}>{profile?.tier}</span>
              </div>
            </div>
          </div>

          <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
            <div className="stat-card">
              <div className="stat-info">
                <h3>Reward Balance</h3>
                <p>{rewardInfo?.currentBalance ?? rewardInfo?.availablePoints ?? 0}</p>
              </div>
              <div className="stat-icon primary">
                <Coins size={24} />
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-info">
                <h3>Lifetime Earned</h3>
                <p>{rewardInfo?.lifetimeEarned ?? 0}</p>
              </div>
              <div className="stat-icon success">
                <TrendingUp size={24} />
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-info">
                <h3>Points Redeemed</h3>
                <p>{rewardInfo?.pointsRedeemed ?? 0}</p>
              </div>
              <div className="stat-icon secondary">
                <Coins size={24} />
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-info">
                <h3>Current Tier</h3>
                <p>{rewardInfo?.currentTier || profile?.tier || 'BRONZE'}</p>
              </div>
              <div className="stat-icon info">
                <Award size={24} />
              </div>
            </div>
          </div>

          <div className="rd-panel" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Profile Details</h3>
            <div className="detail-grid">
              <InfoItem icon={Store} label="Shop Name" value={profile?.shopName} />
              <InfoItem icon={Mail} label="Email" value={profile?.email} />
              <InfoItem icon={Phone} label="Mobile" value={profile?.mobileNumber} />
              <InfoItem icon={MapPin} label="City" value={[profile?.city, profile?.state].filter(Boolean).join(', ')} />
              <InfoItem icon={MapPin} label="Address" value={profile?.address} />
              <InfoItem icon={Mail} label="GST Number" value={profile?.gstNumber} />
            </div>
          </div>

          <div className="tabs">
            {TABS.map((tab) => (
              <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'Orders' &&
            (ordersLoading ? (
              <Skeleton height={120} style={{ marginTop: '1rem' }} />
            ) : orders && orders.content.length === 0 ? (
              <EmptyState message="No orders found." />
            ) : orders ? (
              <>
                <div className="table-responsive" style={{ marginTop: '1rem' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Order Number</th>
                        <th>Date</th>
                        <th>Total Amount</th>
                        <th>Order Status</th>
                        <th>Payment</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.content.map((o) => (
                        <tr key={o.id}>
                          <td>{o.orderNumber}</td>
                          <td>{formatDateTime(o.orderDate)}</td>
                          <td>{formatMoney(o.totalAmount)}</td>
                          <td><OrderStatusBadge status={o.status} /></td>
                          <td><PaymentBadge status={o.paymentStatus} /></td>
                          <td>
                            <button className="btn btn-outline" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={() => openOrder(o.id)}>
                              <Eye size={14} /> View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  page={page}
                  size={size}
                  totalElements={orders.totalElements}
                  totalPages={orders.totalPages}
                  onPageChange={(p) => {
                    setPage(p);
                    loadOrders(p);
                  }}
                />
              </>
            ) : null)}

          {activeTab === 'Rewards' && <RewardsTab data={rewards} loading={rewardsLoading} onRefresh={loadRewards} />}
          {activeTab === 'Tier History' && <TierHistoryTab data={tiers} loading={tiersLoading} onRefresh={loadTiers} />}
        </>
      )}

      <OrderDetailDrawer
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        order={detail}
        loading={detailLoading}
        onRetry={() => detail && openOrder(detail.id)}
      />
    </UserLayout>
  );
};

export default MyAccount;
