import React from 'react';

const tierColors = {
  BRONZE: { bg: '#ffedd5', fg: '#9a3412' },
  SILVER: { bg: '#e2e8f0', fg: '#475569' },
  GOLD: { bg: '#fef3c7', fg: '#92400e' },
  PLATINUM: { bg: '#ede9fe', fg: '#6d28d9' },
  DIAMOND: { bg: '#cffafe', fg: '#155e75' },
};

export const TierBadge = ({ tier, size = 'md' }) => {
  const c = tierColors[tier] || { bg: '#e0e7ff', fg: '#3730a3' };
  return (
    <span className={`tier-badge tier-${size}`} style={{ background: c.bg, color: c.fg }}>
      {tier}
    </span>
  );
};

export const OrderStatusBadge = ({ status }) => {
  const map = {
    PENDING: '#f59e0b',
    CONFIRMED: '#0ea5e9',
    PROCESSING: '#8b5cf6',
    SHIPPED: '#6366f1',
    DELIVERED: '#22c55e',
    CANCELLED: '#ef4444',
  };
  const color = map[status] || '#64748b';
  return (
    <span className="dot-badge" style={{ background: `${color}18`, color }}>
      <span className="dot" style={{ background: color }} />
      {status}
    </span>
  );
};

export const PaymentBadge = ({ status }) => {
  const map = {
    PAID: { color: '#22c55e', label: 'Paid' },
    PARTIAL: { color: '#f59e0b', label: 'Partial' },
    PENDING: { color: '#64748b', label: 'Pending' },
    REFUNDED: { color: '#0ea5e9', label: 'Refunded' },
    FAILED: { color: '#ef4444', label: 'Failed' },
  };
  const item = map[status] || { color: '#64748b', label: status };
  return (
    <span className="dot-badge" style={{ background: `${item.color}18`, color: item.color }}>
      <span className="dot" style={{ background: item.color }} />
      {item.label}
    </span>
  );
};

export const OnlineBadge = ({ status }) => (
  <span className={`online-badge ${status === 'ONLINE' ? 'online' : 'offline'}`}>
    <span className="pulse-dot" />
    {status === 'ONLINE' ? 'Online' : 'Offline'}
  </span>
);

export const ActiveBadge = ({ active }) => (
  <span className={`active-badge ${active ? 'ok' : 'no'}`}>
    {active ? 'Active' : 'Inactive'}
  </span>
);

export const RewardTypeBadge = ({ type }) => {
  const map = {
    ORDER: { label: 'Order', color: '#2563eb' },
    BONUS: { label: 'Bonus', color: '#22c55e' },
    TIER_BONUS: { label: 'Tier Bonus', color: '#8b5cf6' },
    REDEEM: { label: 'Redeemed', color: '#f59e0b' },
    DEDUCT: { label: 'Deducted', color: '#ef4444' },
    ADJUSTMENT: { label: 'Adjustment', color: '#64748b' },
  };
  const item = map[type] || { label: type, color: '#64748b' };
  return (
    <span className="dot-badge" style={{ background: `${item.color}18`, color: item.color }}>
      {item.label}
    </span>
  );
};
