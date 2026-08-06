import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Coins, Gift, ArrowRight } from 'lucide-react';
import { fetchMyRewardSummary } from '../../api/rewards';
import { Skeleton } from '../ui/Skeleton';
import ProgressBar from './ProgressBar';

const RewardProgressWidget = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyRewardSummary()
      .then(setSummary)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="tr-widget rd-panel">
        <Skeleton height={40} />
        <Skeleton height={70} style={{ marginTop: 12 }} />
      </div>
    );
  }

  const next = summary?.nextReward;

  return (
    <div className="tr-widget rd-panel">
      <div className="tr-widget-header">
        <div className="tr-title">
          <span className="tr-title-icon" style={{ background: 'linear-gradient(135deg, #f97316, #fbbf24)' }}>
            <Coins size={20} />
          </span>
          <div>
            <h3>My Reward Progress</h3>
            <p>{summary?.currentPoints ?? 0} points available</p>
          </div>
        </div>
        <Link className="tr-widget-link" to="/my-rewards">
          My Rewards <ArrowRight size={14} />
        </Link>
      </div>

      {next ? (
        <div className="reward-widget-next">
          <div className="reward-widget-next-head">
            <span className="reward-next-badge">NEXT UP</span>
            <strong>{next.rewardName}</strong>
          </div>
          <div className="reward-card-progress-top">
            <span>{next.currentPoints ?? 0} / {next.requiredPoints} points</span>
            <span>{next.remainingPoints} to go</span>
          </div>
          <ProgressBar percent={next.progressPercent} showLabel={false} />
        </div>
      ) : (
        <div className="reward-widget-next">
          <div className="reward-widget-empty">
            <Gift size={18} />
            <span>You have unlocked every reward!</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RewardProgressWidget;
