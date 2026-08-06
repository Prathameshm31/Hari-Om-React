import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trophy,
  Crown,
  RefreshCw,
  Search,
  Coins,
  ShoppingBag,
  IndianRupee,
  Calendar,
  ArrowRight,
  ExternalLink,
  Store,
  Users,
} from 'lucide-react';
import { TierBadge } from '../ui/Badges';
import { Skeleton } from '../ui/Skeleton';
import * as API from '../../api/retailers';

const SORT_OPTIONS = [
  { value: 'rewardPoints', label: 'Reward Points' },
  { value: 'totalPurchase', label: 'Purchase Amount' },
  { value: 'totalOrders', label: 'Total Orders' },
];

const TIER_AVATAR = {
  BRONZE: 'linear-gradient(135deg, #b45309, #d97706)',
  SILVER: 'linear-gradient(135deg, #64748b, #94a3b8)',
  GOLD: 'linear-gradient(135deg, #d97706, #fbbf24)',
  PLATINUM: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
  DIAMOND: 'linear-gradient(135deg, #0e7490, #22d3ee)',
};

const formatNumber = (value) => {
  const n = Number(value || 0);
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);
};

const formatDate = (value) => {
  if (!value) return 'Never';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const TopRetailersCard = ({ retailer }) => {
  const navigate = useNavigate();
  const { rank, retailerId, retailerName, shopName, tier, city } = retailer;
  const initial = (retailerName || 'R').charAt(0).toUpperCase();
  const avatarBg = TIER_AVATAR[tier] || TIER_AVATAR.BRONZE;

  const openProfile = () => navigate(`/retailers/${retailerId}`);

  return (
    <div
      className={`tr-card animate-fade-in ${rank === 1 ? 'tr-card-top' : ''}`}
      onClick={openProfile}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') openProfile();
      }}
    >
      <div className="tr-card-main">
        <span className={`tr-rank tr-rank-${rank}`}>
          {rank === 1 ? <Crown size={18} /> : `#${rank}`}
        </span>
        <div className="tr-avatar" style={{ background: avatarBg }}>
          {retailer.profileImageUrl ? (
            <img src={retailer.profileImageUrl} alt={retailerName} />
          ) : (
            initial
          )}
        </div>
        <div className="tr-card-info">
          <div className="tr-card-name">{retailerName}</div>
          <div className="tr-card-shop">
            {shopName || 'No shop name'}
            {city ? <span className="tr-card-city"> · {city}</span> : null}
          </div>
        </div>
        <TierBadge tier={tier} size="sm" />
      </div>

      <div className="tr-stats">
        <div className="tr-stat" title="Reward Points">
          <Coins size={15} />
          <span>{formatNumber(retailer.rewardPoints)}</span>
          <em>pts</em>
        </div>
        <div className="tr-stat" title="Total Purchase">
          <IndianRupee size={15} />
          <span>{formatNumber(retailer.totalPurchase)}</span>
        </div>
        <div className="tr-stat" title="Total Orders">
          <ShoppingBag size={15} />
          <span>{formatNumber(retailer.totalOrders)}</span>
          <em>orders</em>
        </div>
      </div>

      <div className="tr-card-footer">
        <span className="tr-last-order">
          <Calendar size={13} /> Last order: {formatDate(retailer.lastOrderDate)}
        </span>
        <button className="tr-view-profile" type="button" onClick={openProfile}>
          View Profile <ExternalLink size={13} />
        </button>
      </div>
    </div>
  );
};

const SkeletonCard = () => (
  <div className="tr-card tr-card-skeleton">
    <div className="tr-card-main">
      <Skeleton circle height={36} width={36} />
      <div style={{ flex: 1 }}>
        <Skeleton height={14} width="70%" style={{ marginBottom: 8 }} />
        <Skeleton height={12} width="45%" />
      </div>
      <Skeleton height={22} width={70} />
    </div>
    <div className="tr-stats">
      <Skeleton height={30} width="100%" />
      <Skeleton height={30} width="100%" />
      <Skeleton height={30} width="100%" />
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Skeleton height={12} width="45%" />
      <Skeleton height={28} width={110} />
    </div>
  </div>
);

const EmptyState = () => (
  <div className="tr-empty">
    <div className="tr-empty-icon">
      <Users size={40} />
    </div>
    <p>No retailer data available.</p>
  </div>
);

const TopRetailers = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('rewardPoints');
  const debounceRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await API.fetchTopRetailers({ sortBy, search: search.trim() });
      setData(result);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load top retailers.');
    } finally {
      setLoading(false);
    }
  }, [sortBy, search]);

  useEffect(() => {
    debounceRef.current = setTimeout(load, search ? 350 : 0);
    return () => clearTimeout(debounceRef.current);
  }, [load, search]);

  const sortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label;

  return (
    <div className="tr-widget">
      <div className="tr-widget-header">
        <div className="tr-title">
          <span className="tr-title-icon">
            <Trophy size={20} />
          </span>
          <div>
            <h3>Top 5 Retailers</h3>
            <p>Ranked by {sortLabel}</p>
          </div>
        </div>
        <button className="tr-icon-btn" type="button" onClick={load} title="Refresh rankings" aria-label="Refresh">
          <RefreshCw size={18} className={loading ? 'tr-spin' : ''} />
        </button>
      </div>

      <div className="tr-toolbar">
        <div className="tr-search">
          <Search size={15} />
          <input
            type="text"
            placeholder="Search retailer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search retailer"
          />
        </div>
        <select
          className="tr-sort"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          aria-label="Sort by"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="tr-error">{error}</div>}

      <div className="tr-list">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : data.length === 0 ? (
          <EmptyState />
        ) : (
          data.map((r) => <TopRetailersCard key={r.retailerId} retailer={r} />)
        )}
      </div>

      <Link to="/retailers" className="tr-view-all">
        <Store size={16} /> View All Retailers <ArrowRight size={16} />
      </Link>
    </div>
  );
};

export default TopRetailers;
