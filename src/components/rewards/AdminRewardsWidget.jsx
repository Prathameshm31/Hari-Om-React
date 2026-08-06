import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Gift, CheckCircle2, Power, Coins, ArrowRight } from 'lucide-react';
import { fetchAdminRewardStats } from '../../api/rewards';
import { Skeleton } from '../ui/Skeleton';

const Row = ({ icon, label, value, cls }) => (
  <div className="tr-widget-row">
    <span className={`tr-widget-row-icon ${cls}`}>{icon}</span>
    <span className="tr-widget-row-label">{label}</span>
    <strong>{value}</strong>
  </div>
);

const AdminRewardsWidget = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminRewardStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="tr-widget rd-panel">
      <div className="tr-widget-header">
        <div className="tr-title">
          <span className="tr-title-icon" style={{ background: 'linear-gradient(135deg, #2563eb, #60a5fa)' }}>
            <Gift size={20} />
          </span>
          <div>
            <h3>Rewards Program</h3>
            <p>Catalog &amp; redemption overview</p>
          </div>
        </div>
        <Link className="tr-widget-link" to="/rewards">
          Manage <ArrowRight size={14} />
        </Link>
      </div>
      {loading ? (
        <>
          <Skeleton height={36} style={{ marginBottom: 10 }} />
          <Skeleton height={36} style={{ marginBottom: 10 }} />
          <Skeleton height={36} />
        </>
      ) : (
        <div className="tr-widget-list">
          <Row icon={<Gift size={16} />} label="Total Rewards" value={stats?.totalRewards ?? 0} cls="primary" />
          <Row icon={<Power size={16} />} label="Active Rewards" value={stats?.activeRewards ?? 0} cls="success" />
          <Row icon={<CheckCircle2 size={16} />} label="Eligible Rewards" value={stats?.rewardsPending ?? 0} cls="secondary" />
          <Row icon={<Coins size={16} />} label="Claimed Rewards" value={stats?.claimedRewards ?? 0} cls="info" />
          
          {stats?.mostPopularReward && (
            <div className="notice-banner" style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
              <Gift size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              Popular: <strong>{stats.mostPopularReward}</strong>
            </div>
          )}
          
          {stats?.recentlyAddedRewards?.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recently Added</div>
              {stats.recentlyAddedRewards.slice(0, 3).map(r => (
                <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: 500 }}>{r.rewardName}</span>
                  <span className="points-badge" style={{ padding: '2px 6px', fontSize: '0.75rem' }}>{r.requiredPoints} pts</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminRewardsWidget;
