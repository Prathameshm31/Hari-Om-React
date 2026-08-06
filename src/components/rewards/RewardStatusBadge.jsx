import React from 'react';

const styles = {
  LOCKED: { bg: '#f1f5f9', color: '#64748b', label: 'Locked' },
  ELIGIBLE: { bg: '#ecfdf5', color: '#059669', label: 'Eligible' },
  CLAIMED: { bg: '#eff6ff', color: '#2563eb', label: 'Claimed' },
};

const RewardStatusBadge = ({ status }) => {
  const s = styles[status] || styles.LOCKED;
  return (
    <span
      className="reward-status-badge"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
};

export default RewardStatusBadge;
