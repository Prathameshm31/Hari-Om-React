import React from 'react';
import { Gift, Coins, Award } from 'lucide-react';
import RewardStatusBadge from './RewardStatusBadge';
import ProgressBar from './ProgressBar';

const IMAGE_FALLBACK = 'https://placehold.co/400x240?text=Reward';

const RewardCard = ({ reward, onClick }) => {
  const claimed = reward.status === 'CLAIMED';
  const eligible = reward.status === 'ELIGIBLE';
  const locked = reward.status === 'LOCKED';

  return (
    <div className="premium-reward-card" onClick={() => onClick(reward)}>
      <div className="premium-reward-image-wrap">
        {reward.imageUrl ? (
          <img
            src={reward.imageUrl}
            alt={reward.rewardName}
            className="premium-reward-image"
            onError={(e) => { e.currentTarget.src = IMAGE_FALLBACK; }}
          />
        ) : (
          <div className="premium-reward-fallback">
            <Gift size={48} />
          </div>
        )}
        <div className="premium-reward-badge">
          <RewardStatusBadge status={reward.status} />
        </div>
        <div className="premium-reward-category">
          {reward.category || 'Reward'}
        </div>
      </div>

      <div className="premium-reward-body">
        <h3 className="premium-reward-title">{reward.rewardName}</h3>
        <p className="premium-reward-desc">{reward.description}</p>

        <div className="premium-reward-stats">
          <div className="premium-reward-stat">
            <span className="premium-reward-stat-label">Points</span>
            <span className="premium-reward-stat-value">
              <Coins size={16} className="text-muted" /> {reward.requiredPoints}
            </span>
          </div>
          {reward.rewardValue != null && (
            <div className="premium-reward-stat" style={{ alignItems: 'flex-end' }}>
              <span className="premium-reward-stat-label">Value</span>
              <span className="premium-reward-stat-value text-success">
                <Award size={16} /> ₹{Number(reward.rewardValue).toLocaleString('en-IN')}
              </span>
            </div>
          )}
        </div>

        <div className="premium-reward-progress-wrap">
          {locked && (
            <>
              <div className="premium-reward-progress-info">
                <span>{reward.currentPoints ?? 0} / {reward.requiredPoints}</span>
                <span>{Math.round(reward.progressPercent || 0)}%</span>
              </div>
              <ProgressBar percent={reward.progressPercent} showLabel={false} />
              <div className="premium-reward-progress-text">
                {reward.remainingPoints} more points to unlock
              </div>
            </>
          )}

          {eligible && (
            <div className="premium-reward-action claim">
              🎉 Claim Reward
            </div>
          )}

          {claimed && (
            <div className="premium-reward-action claimed">
              🎁 Claimed
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RewardCard;
