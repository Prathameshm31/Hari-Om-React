import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronRight,
  Store,
  MapPin,
  Mail,
  Phone,
  BadgeCheck,
  FileText,
  CalendarDays,
  Pencil,
  Power,
  Medal,
  PlusCircle,
  MinusCircle,
  KeyRound,
  History,
  TrendingUp,
  Package,
  Clock,
  Award,
  Layers,
  Wallet,
  Star,
  UserPlus,
  ShoppingCart,
  LogIn,
  LogOut,
  Trash2,
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import * as API from '../api/retailers';
import Pagination from '../components/ui/Pagination';
import { CardSkeleton, Skeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import ConfirmModal from '../components/ui/ConfirmModal';
import OrderDetailDrawer from '../components/retailer/OrderDetailDrawer';
import AdminActionModal from '../components/retailer/AdminActionModal';
import {
  MonthlyPurchaseChart,
  MonthlyOrdersChart,
  MonthlyPointsChart,
  CategoryPieChart,
  BrandBarChart,
} from '../components/retailer/Charts';
import { TierBadge, OnlineBadge, ActiveBadge, OrderStatusBadge, PaymentBadge, RewardTypeBadge } from '../components/ui/Badges';

const formatMoney = (value) =>
  value === null || value === undefined ? '₹0' : `₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

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

const InfoItem = ({ icon, label, value }) => (
  <div className="info-item">
    <span className="info-item-icon">{icon}</span>
    <div>
      <p className="info-item-label">{label}</p>
      <p className="info-item-value">{value || '—'}</p>
    </div>
  </div>
);

const TierProgress = ({ rewardInfo }) => {
  if (!rewardInfo || !rewardInfo.nextTier) {
    return (
      <div className="tier-progress">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span className="tier-progress-label"><Award size={15} /> Highest tier achieved</span>
          <TierBadge tier={rewardInfo?.currentTier} />
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: '100%', background: 'linear-gradient(90deg,#f59e0b,#22c55e)' }} />
        </div>
        <p className="tier-progress-note">You are at the top tier. Keep earning reward points.</p>
      </div>
    );
  }
  return (
    <div className="tier-progress">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span className="tier-progress-label">
          <TrendingUp size={15} /> {rewardInfo.currentTier} → <strong>{rewardInfo.nextTier}</strong>
        </span>
        <span className="tier-progress-pct">{rewardInfo.tierProgressPercent || 0}%</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${rewardInfo.tierProgressPercent || 0}%` }} />
      </div>
      <p className="tier-progress-note">
        Spend {formatMoney(rewardInfo.remainingPurchaseForNextTier)} more to reach {rewardInfo.nextTier} tier.
      </p>
    </div>
  );
};

const RewardCards = ({ rewardInfo }) => {
  const cards = [
    { label: 'Available Points', value: rewardInfo?.availablePoints ?? 0, icon: <Star size={20} />, cls: 'primary' },
    { label: 'Lifetime Earned', value: rewardInfo?.lifetimeEarned ?? 0, icon: <Award size={20} />, cls: 'secondary' },
    { label: 'Points Redeemed', value: rewardInfo?.pointsRedeemed ?? 0, icon: <Wallet size={20} />, cls: 'info' },
    { label: 'Current Tier', value: rewardInfo?.currentTier ?? '—', icon: <Medal size={20} />, cls: 'success' },
  ];
  return (
    <div className="stats-grid reward-cards">
      {cards.map((c) => (
        <div className="stat-card" key={c.label}>
          <div className="stat-info">
            <h3>{c.label}</h3>
            <p>{c.value}</p>
          </div>
          <div className={`stat-icon ${c.cls}`}>{c.icon}</div>
        </div>
      ))}
    </div>
  );
};

const OverviewTab = ({ detail }) => {
  const user = detail;
  const rewardInfo = user.rewardInfo;
  const items = [
    { icon: <Store size={16} />, label: 'Shop Name', value: user.shopName },
    { icon: <MapPin size={16} />, label: 'Address', value: [user.address, user.city, user.state, user.pincode].filter(Boolean).join(', ') },
    { icon: <Mail size={16} />, label: 'Email', value: user.email },
    { icon: <Phone size={16} />, label: 'Mobile Number', value: user.mobileNumber },
    { icon: <BadgeCheck size={16} />, label: 'GST Number', value: user.gstNumber },
    { icon: <FileText size={16} />, label: 'PAN Number', value: user.panNumber },
    { icon: <CalendarDays size={16} />, label: 'Registration Date', value: formatDate(user.registrationDate) },
    { icon: <Clock size={16} />, label: 'Last Login', value: formatDateTime(user.lastLoginTime) },
    { icon: <Clock size={16} />, label: 'Last Logout', value: formatDateTime(user.lastLogoutTime) },
  ];

  return (
    <div className="tab-grid animate-fade-in">
      <div className="card">
        <div className="card-header">
          <h4>Basic Information</h4>
        </div>
        <div className="basic-grid">
          <InfoItem icon={<Store size={16} />} label="Retailer Name" value={user.name} />
          <InfoItem icon={<Store size={16} />} label="Shop Name" value={user.shopName} />
          <InfoItem icon={<Store size={16} />} label="Company Name" value={user.companyName} />
          <InfoItem icon={<Phone size={16} />} label="Mobile Number" value={user.mobileNumber} />
          <InfoItem icon={<Mail size={16} />} label="Email" value={user.email} />
          <InfoItem icon={<MapPin size={16} />} label="City" value={user.city} />
          <InfoItem icon={<MapPin size={16} />} label="State" value={user.state} />
          <InfoItem icon={<BadgeCheck size={16} />} label="GST Number" value={user.gstNumber} />
          <InfoItem icon={<FileText size={16} />} label="PAN Number" value={user.panNumber} />
          <InfoItem icon={<CalendarDays size={16} />} label="Registration Date" value={formatDate(user.registrationDate)} />
          <InfoItem icon={<Clock size={16} />} label="Last Login" value={formatDateTime(user.lastLoginTime)} />
          <InfoItem icon={<Clock size={16} />} label="Last Logout" value={formatDateTime(user.lastLogoutTime)} />
        </div>
        <div className="address-box">
          <MapPin size={16} /> <span>{items[1].value}</span>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h4>Account & Stats</h4>
        </div>
        <div className="acct-status">
          <div className="acct-status-row">
            <span>Account Status</span>
            <ActiveBadge active={user.isActive} />
          </div>
          <div className="acct-status-row">
            <span>Presence</span>
            <OnlineBadge status={user.onlineStatus} />
          </div>
          <div className="acct-status-row">
            <span>Current Tier</span>
            <TierBadge tier={user.tier} />
          </div>
        </div>
        <div className="mini-stats vertical">
          <div className="mini-stat">
            <span className="mini-stat-label">Total Orders</span>
            <span className="mini-stat-value">{user.totalOrders ?? 0}</span>
          </div>
          <div className="mini-stat">
            <span className="mini-stat-label">Total Purchase</span>
            <span className="mini-stat-value">{formatMoney(user.totalPurchaseAmount)}</span>
          </div>
          <div className="mini-stat">
            <span className="mini-stat-label">Last Order Date</span>
            <span className="mini-stat-value">{formatDate(user.lastOrderDate)}</span>
          </div>
        </div>
      </div>

      <div className="card span-2">
        <div className="card-header">
          <h4>Reward Information</h4>
          <TierBadge tier={rewardInfo?.currentTier} />
        </div>
        <RewardCards rewardInfo={rewardInfo} />
        <TierProgress rewardInfo={rewardInfo} />
      </div>
    </div>
  );
};

const OrdersTab = ({ retailerId }) => {
  const [data, setData] = useState({ content: [], totalElements: 0, totalPages: 0, page: 0, size: 10 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ search: '', category: '', orderStatus: '', paymentStatus: '', fromDate: '', toDate: '' });
  const [page, setPage] = useState(0);
  const sortBy = 'orderDate';
  const sortDir = 'desc';

  const [drawerOrder, setDrawerOrder] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.fetchOrders(retailerId, { ...filters, page, size: data.size, sortBy, sortDir });
      setData(res);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }, [retailerId, filters, page, data.size, sortBy, sortDir]);

  useEffect(() => {
    load();
  }, [load]);

  const openOrder = async (orderId) => {
    setDrawerOpen(true);
    setDrawerLoading(true);
    setDrawerOrder(null);
    try {
      const res = await API.fetchOrderDetail(orderId);
      setDrawerOrder(res);
    } catch {
      setDrawerOrder(null);
    } finally {
      setDrawerLoading(false);
    }
  };

  const exportParams = () => {
    const params = {};
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params[k] = v;
    });
    return params;
  };

  return (
    <div className="animate-fade-in">
      <div className="table-toolbar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search order / invoice / product..."
            value={filters.search}
            onChange={(e) => {
              setFilters((f) => ({ ...f, search: e.target.value }));
              setPage(0);
            }}
          />
        </div>
        <input
          type="date"
          value={filters.fromDate}
          onChange={(e) => { setFilters((f) => ({ ...f, fromDate: e.target.value })); setPage(0); }}
          title="From date"
        />
        <input
          type="date"
          value={filters.toDate}
          onChange={(e) => { setFilters((f) => ({ ...f, toDate: e.target.value })); setPage(0); }}
          title="To date"
        />
        <select
          value={filters.category}
          onChange={(e) => { setFilters((f) => ({ ...f, category: e.target.value })); setPage(0); }}
        >
          <option value="">All Categories</option>
          {['Cement', 'Steel', 'Bricks', 'Sand', 'Aggregate', 'Pipes', 'Paint', 'Tiles', 'Electrical', 'Plumbing'].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={filters.orderStatus}
          onChange={(e) => { setFilters((f) => ({ ...f, orderStatus: e.target.value })); setPage(0); }}
        >
          <option value="">All Order Status</option>
          {['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={filters.paymentStatus}
          onChange={(e) => { setFilters((f) => ({ ...f, paymentStatus: e.target.value })); setPage(0); }}
        >
          <option value="">All Payment Status</option>
          {['PENDING', 'PAID', 'PARTIAL', 'REFUNDED', 'FAILED'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <div className="export-group">
          <button className="btn btn-export" onClick={() => API.exportOrdersExcel(retailerId, exportParams()).catch(() => {})}>Excel</button>
          <button className="btn btn-export" onClick={() => API.exportOrdersPdf(retailerId, exportParams()).catch(() => {})}>PDF</button>
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={load} />}

      <div className="table-card">
        {loading ? (
          <div className="table-skeleton">
            {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} height={30} style={{ marginBottom: 10 }} />)}
          </div>
        ) : data.content.length === 0 ? (
          <EmptyState title="No orders found" message="No orders match the current filters." />
        ) : (
          <>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order No</th>
                    <th>Date</th>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Final Amount</th>
                    <th>Points</th>
                    <th>Order Status</th>
                    <th>Payment</th>
                    <th>Sales Rep</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {data.content.map((o) => (
                    <tr key={o.id} className="row-hover" onClick={() => openOrder(o.id)}>
                      <td>
                        <span className="order-no">{o.orderNumber}</span>
                        <span className="retailer-sub">{o.invoiceNumber}</span>
                      </td>
                      <td>{formatDateTime(o.orderDate)}</td>
                      <td>
                        <span className="retailer-name">{o.productName}</span>
                        {o.itemCount > 1 && <span className="retailer-sub">+{o.itemCount - 1} more</span>}
                        <span className="retailer-sub">{o.brand} · {o.category}</span>
                      </td>
                      <td>{o.totalQuantity ?? 0}</td>
                      <td className="amount">{formatMoney(o.finalAmount)}</td>
                      <td><span className="points-badge">+{o.rewardPointsEarned ?? 0}</span></td>
                      <td><OrderStatusBadge status={o.status} /></td>
                      <td><PaymentBadge status={o.paymentStatus} /></td>
                      <td>{o.salesRepresentative || '—'}</td>
                      <td><ChevronRight size={16} color="var(--text-muted)" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="table-footer">
              <Pagination
                page={data.page}
                totalPages={data.totalPages}
                totalElements={data.totalElements}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </div>

      <OrderDetailDrawer
        order={drawerOrder}
        open={drawerOpen}
        loading={drawerLoading}
        onClose={() => setDrawerOpen(false)}
        onRetry={() => drawerOrder && openOrder(drawerOrder.id)}
      />
    </div>
  );
};

const RewardsTab = ({ retailerId }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setRows(await API.fetchRewardHistory(retailerId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load reward history.');
    } finally {
      setLoading(false);
    }
  }, [retailerId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="animate-fade-in">
      {error && <ErrorState message={error} onRetry={load} />}
      <div className="table-card">
        {loading ? (
          <div className="table-skeleton">
            {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} height={30} style={{ marginBottom: 10 }} />)}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState title="No reward transactions" message="Reward activity will appear here." />
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Activity</th>
                  <th>Points Earned</th>
                  <th>Points Redeemed</th>
                  <th>Balance</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>{formatDateTime(r.date)}</td>
                    <td><RewardTypeBadge type={r.type} /></td>
                    <td>
                      {r.pointsEarned > 0 ? (
                        <span className="text-pos">+{r.pointsEarned}</span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td>
                      {r.pointsRedeemed > 0 ? (
                        <span className="text-neg">−{r.pointsRedeemed}</span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td><span className="points-badge">{r.balance}</span></td>
                    <td className="remarks-cell">{r.remarks || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const TiersTab = ({ retailerId }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.fetchTierHistory(retailerId)
      .then(setRows)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [retailerId]);

  return (
    <div className="animate-fade-in">
      <div className="table-card">
        {loading ? (
          <div className="table-skeleton">
            {[1, 2, 3].map((i) => <Skeleton key={i} height={30} style={{ marginBottom: 10 }} />)}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState title="No tier upgrades yet" message="Tier changes will appear here." />
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Previous Tier</th>
                  <th>New Tier</th>
                  <th>Upgrade Date</th>
                  <th>Reason</th>
                  <th>Total Purchase Value</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td><TierBadge tier={r.previousTier} /></td>
                    <td><TierBadge tier={r.newTier} /></td>
                    <td>{formatDateTime(r.upgradeDate)}</td>
                    <td>{r.reason || '—'}</td>
                    <td className="amount">{formatMoney(r.totalPurchaseValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const AnalyticsTab = ({ retailerId }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    API.fetchAnalytics(retailerId)
      .then(setAnalytics)
      .catch((err) => setError(err.response?.data?.message || 'Failed to load analytics.'))
      .finally(() => setLoading(false));
  }, [retailerId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div>
        <CardSkeleton cards={2} />
        <div style={{ marginTop: '1.5rem' }}><CardSkeleton cards={2} /></div>
      </div>
    );
  }
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!analytics) return null;

  return (
    <div className="analytics-grid animate-fade-in">
      <MonthlyPurchaseChart data={analytics.monthlyPurchase} />
      <MonthlyOrdersChart data={analytics.monthlyOrders} />
      <MonthlyPointsChart data={analytics.monthlyRewardPoints} />
      <CategoryPieChart data={analytics.categoryDistribution} />
      <BrandBarChart data={analytics.brandPurchases} />
    </div>
  );
};

const ProductsTab = ({ retailerId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.fetchAnalytics(retailerId)
      .then((a) => setProducts(a.frequentProducts || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [retailerId]);

  return (
    <div className="animate-fade-in">
      {loading ? (
        <CardSkeleton cards={4} />
      ) : products.length === 0 ? (
        <EmptyState title="No purchase history" message="Frequently purchased products will appear here." />
      ) : (
        <div className="product-cards">
          {products.map((p) => (
            <div className="product-card" key={p.productId || p.name}>
              <div className="product-card-thumb">
                {p.image ? <img src={p.image} alt={p.name} /> : <Package size={28} />}
              </div>
              <div className="product-card-body">
                <h4>{p.name}</h4>
                <p>{p.brand} · {p.category}</p>
                <div className="product-card-stats">
                  <div>
                    <span>Qty Purchased</span>
                    <strong>{p.totalQuantity}</strong>
                  </div>
                  <div>
                    <span>Total Amount</span>
                    <strong>{formatMoney(p.totalAmount)}</strong>
                  </div>
                </div>
                <p className="product-card-last">Last purchased: {formatDate(p.lastPurchasedDate)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const TimelineTab = ({ retailerId }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.fetchTimeline(retailerId)
      .then(setEvents)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [retailerId]);

  const typeIcon = (type) => {
    switch (type) {
      case 'REGISTERED': return <UserPlusIcon />;
      case 'FIRST_ORDER': case 'ORDER_PLACED': return <ShoppingCartIcon />;
      case 'TIER_UPGRADE': return <MedalIcon />;
      case 'REWARD_BONUS': case 'TIER_BONUS': return <PlusCircleIcon />;
      case 'REWARD_DEDUCT': case 'REWARD_REDEEM': return <MinusCircleIcon />;
      case 'LOGIN': return <LogInIcon />;
      case 'LOGOUT': return <LogOutIcon />;
      case 'STATUS_CHANGE': return <PowerIcon />;
      case 'PROFILE_UPDATE': return <PencilIcon />;
      case 'PASSWORD_RESET': return <KeyIcon />;
      case 'LARGE_PURCHASE': return <StarIcon />;
      default: return <ClockIcon />;
    }
  };

  return (
    <div className="animate-fade-in">
      {loading ? (
        <div className="table-skeleton">
          {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} height={40} style={{ marginBottom: 12 }} />)}
        </div>
      ) : events.length === 0 ? (
        <EmptyState title="No activity yet" message="Events like login, orders and tier changes will appear here." />
      ) : (
        <div className="timeline">
          {events.map((ev) => (
            <div className="timeline-item" key={ev.id}>
              <div className={`timeline-dot type-${ev.type.toLowerCase()}`}>{typeIcon(ev.type)}</div>
              <div className="timeline-content">
                <p>{ev.message}</p>
                <span>{formatDateTime(ev.date)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const LoginsTab = ({ retailerId }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.fetchLoginHistory(retailerId)
      .then(setRows)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [retailerId]);

  return (
    <div className="animate-fade-in">
      <div className="table-card">
        {loading ? (
          <div className="table-skeleton">
            {[1, 2, 3].map((i) => <Skeleton key={i} height={30} style={{ marginBottom: 10 }} />)}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState title="No login history" message="Retailer logins will appear here." />
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Login Time</th>
                  <th>Logout Time</th>
                  <th>IP Address</th>
                  <th>Device</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>{formatDateTime(r.loginTime)}</td>
                    <td>{formatDateTime(r.logoutTime)}</td>
                    <td className="mono">{r.ipAddress || '—'}</td>
                    <td>{r.deviceInfo || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const RetailerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [notice, setNotice] = useState('');
  const [action, setAction] = useState(null);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setDetail(await API.fetchRetailer(id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load retailer details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const runAction = async (act, values) => {
    setBusy(true);
    setNotice('');
    try {
      switch (act) {
        case 'edit':
          await API.updateRetailer(id, values);
          setNotice('Retailer information updated.');
          break;
        case 'tier':
          await API.updateRetailerTier(id, values.tier, values.reason);
          setNotice(`Tier changed to ${values.tier}.`);
          break;
        case 'bonus':
          await API.addBonusPoints(id, Number(values.points), values.remarks);
          setNotice(`${values.points} bonus points added.`);
          break;
        case 'deduct':
          await API.deductPoints(id, Number(values.points), values.remarks);
          setNotice(`${values.points} points deducted.`);
          break;
        case 'reset':
          await API.resetRetailerPassword(id, values.newPassword);
          setNotice('Password reset successfully.');
          break;
        default:
          break;
      }
      setAction(null);
      load();
    } catch (err) {
      setNotice('');
      alert(err.response?.data?.message || 'Action failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleAction = async (values) => {
    if (action === 'deduct') {
      setPendingAction({ action, values });
      setConfirm({
        kind: 'deduct',
        title: 'Deduct Reward Points',
        message: `Are you sure you want to deduct ${values.points} points from ${detail?.name}? This action cannot be undone.`,
        confirmLabel: 'Deduct Points',
      });
      return;
    }
    await runAction(action, values);
  };

  const handleConfirm = async () => {
    if (!confirm) return;
    setBusy(true);
    try {
      if (confirm.kind === 'delete') {
        await API.deleteRetailer(id);
        navigate('/retailers');
        return;
      }
      if (confirm.kind === 'deduct' && pendingAction) {
        const act = pendingAction.action;
        const values = pendingAction.values;
        setPendingAction(null);
        await runAction(act, values);
      }
      setConfirm(null);
    } catch (err) {
      setNotice('');
      alert(err.response?.data?.message || 'Action failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const toggleStatus = async () => {
    if (!detail) return;
    const next = !detail.isActive;
    try {
      await API.updateRetailerStatus(id, next);
      setNotice(`Retailer ${next ? 'activated' : 'deactivated'}.`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const tabs = [
    { key: 'overview', label: 'Overview', icon: <Store size={15} /> },
    { key: 'orders', label: 'Purchase History', icon: <History size={15} /> },
    { key: 'rewards', label: 'Reward History', icon: <Award size={15} /> },
    { key: 'tiers', label: 'Tier History', icon: <Layers size={15} /> },
    { key: 'analytics', label: 'Analytics', icon: <TrendingUp size={15} /> },
    { key: 'products', label: 'Products', icon: <Package size={15} /> },
    { key: 'timeline', label: 'Timeline', icon: <Clock size={15} /> },
    { key: 'logins', label: 'Login History', icon: <KeyRound size={15} /> },
  ];

  const prefill = useMemo(() => {
    if (!detail) return {};
    return {
      fullName: detail.name,
      mobileNumber: detail.mobileNumber,
      shopName: detail.shopName,
      companyName: detail.companyName,
      email: detail.email,
      gstNumber: detail.gstNumber,
      panNumber: detail.panNumber,
      city: detail.city,
      state: detail.state,
      pincode: detail.pincode,
      address: detail.address,
      profileImageUrl: detail.profileImageUrl,
    };
  }, [detail]);

  return (
    <AdminLayout activeKey="retailers">
      <div className="breadcrumb">
        <button className="breadcrumb-link" onClick={() => navigate('/retailers')}>
          <ArrowLeft size={15} /> Retailers
        </button>
        <ChevronRight size={14} />
        <span>{detail?.name || 'Retailer Details'}</span>
      </div>

      {notice && (
        <div className="notice-banner" onClick={() => setNotice('')}>
          {notice}
        </div>
      )}

      {loading && !detail ? (
        <div>
          <CardSkeleton cards={4} />
          <div style={{ marginTop: '1.5rem' }}><CardSkeleton cards={1} /></div>
        </div>
      ) : error && !detail ? (
        <ErrorState message={error} onRetry={load} />
      ) : detail ? (
        <>
          <div className="profile-hero animate-fade-in">
            <div className="profile-avatar">
              {detail.profileImageUrl ? (
                <img src={detail.profileImageUrl} alt={detail.name} />
              ) : (
                <span>{detail.name?.charAt(0).toUpperCase()}</span>
              )}
              <span className={`presence-dot ${detail.onlineStatus === 'ONLINE' ? 'online' : 'offline'}`} />
            </div>
            <div className="profile-main">
              <h2>{detail.name}</h2>
              <p className="profile-sub">{detail.shopName || detail.companyName} · {detail.city || '—'}</p>
              <div className="profile-badges">
                <TierBadge tier={detail.tier} />
                <ActiveBadge active={detail.isActive} />
                <OnlineBadge status={detail.onlineStatus} />
              </div>
            </div>
            <div className="profile-stats">
              <div>
                <span>Total Orders</span>
                <strong>{detail.totalOrders ?? 0}</strong>
              </div>
              <div>
                <span>Total Purchase</span>
                <strong>{formatMoney(detail.totalPurchaseAmount)}</strong>
              </div>
              <div>
                <span>Reward Points</span>
                <strong className="points-text">{detail.rewardInfo?.availablePoints ?? 0}</strong>
              </div>
            </div>
            <div className="profile-actions">
              <button className="btn btn-primary action-btn" onClick={() => setAction('edit')}>
                <Pencil size={15} /> Edit
              </button>
              <button className="btn btn-outline action-btn" onClick={toggleStatus}>
                <Power size={15} /> {detail.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <div className="action-menu">
                <button className="btn btn-outline action-btn" onClick={() => setAction('tier')}>
                  <Medal size={15} /> Change Tier
                </button>
                <button className="btn btn-outline action-btn" onClick={() => setAction('bonus')}>
                  <PlusCircle size={15} /> Add Bonus
                </button>
                <button className="btn btn-outline action-btn" onClick={() => setAction('deduct')}>
                  <MinusCircle size={15} /> Deduct
                </button>
                <button className="btn btn-outline action-btn" onClick={() => setAction('reset')}>
                  <KeyRound size={15} /> Reset Password
                </button>
                <button
                  className="btn btn-outline action-btn btn-danger"
                  onClick={() =>
                    setConfirm({
                      kind: 'delete',
                      title: 'Delete Retailer',
                      message: `Are you sure you want to delete ${detail.name}? The retailer will be deactivated and hidden from all lists. This can be undone by an administrator.`,
                      confirmLabel: 'Delete Retailer',
                    })
                  }
                >
                  <Trash2 size={15} /> Delete
                </button>
              </div>
            </div>
          </div>

          <div className="tabs animate-fade-in">
            {tabs.map((t) => (
              <button
                key={t.key}
                className={`tab ${activeTab === t.key ? 'active' : ''}`}
                onClick={() => setActiveTab(t.key)}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <div className="tab-content">
            {activeTab === 'overview' && <OverviewTab detail={detail} />}
            {activeTab === 'orders' && <OrdersTab retailerId={detail.id} />}            {activeTab === 'rewards' && <RewardsTab retailerId={detail.id} />}
            {activeTab === 'tiers' && <TiersTab retailerId={detail.id} />}
            {activeTab === 'analytics' && <AnalyticsTab retailerId={detail.id} />}
            {activeTab === 'products' && <ProductsTab retailerId={detail.id} />}
            {activeTab === 'timeline' && <TimelineTab retailerId={detail.id} />}
            {activeTab === 'logins' && <LoginsTab retailerId={detail.id} />}
          </div>
        </>
      ) : null}

      <AdminActionModal
        action={action}
        open={Boolean(action)}
        onClose={() => setAction(null)}
        onConfirm={handleAction}
        prefill={prefill}
        busy={busy}
      />

      <ConfirmModal
        open={Boolean(confirm)}
        title={confirm?.title}
        message={confirm?.message}
        confirmLabel={confirm?.confirmLabel}
        busy={busy}
        onCancel={() => {
          setConfirm(null);
          setPendingAction(null);
        }}
        onConfirm={handleConfirm}
      />
    </AdminLayout>
  );
};

// Timeline icon helpers (kept local to avoid over-importing lucide)
const UserPlusIcon = () => <UserPlus size={14} />;
const ShoppingCartIcon = () => <ShoppingCart size={14} />;
const MedalIcon = () => <Medal size={14} />;
const PlusCircleIcon = () => <PlusCircle size={14} />;
const MinusCircleIcon = () => <MinusCircle size={14} />;
const LogInIcon = () => <LogIn size={14} />;
const LogOutIcon = () => <LogOut size={14} />;
const PowerIcon = () => <Power size={14} />;
const PencilIcon = () => <Pencil size={14} />;
const KeyIcon = () => <KeyRound size={14} />;
const StarIcon = () => <Star size={14} />;
const ClockIcon = () => <Clock size={14} />;

export default RetailerDetail;
