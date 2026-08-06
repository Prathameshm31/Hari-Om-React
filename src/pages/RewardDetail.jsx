import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';
import { Coins, ArrowLeft, Gift, Info, Award, CheckCircle2, CalendarDays } from 'lucide-react';
import UserLayout from '../components/UserLayout';
import { fetchMyReward, claimReward } from '../api/rewards';
import RewardStatusBadge from '../components/rewards/RewardStatusBadge';
import ProgressBar from '../components/rewards/ProgressBar';
import ConfirmModal from '../components/ui/ConfirmModal';
import { Skeleton } from '../components/ui/Skeleton';
import ErrorState from '../components/ui/ErrorState';
import Button from '../components/Button';

const IMAGE_FALLBACK = 'https://placehold.co/600x360?text=Reward';

const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const RewardDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [reward, setReward] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showClaim, setShowClaim] = useState(false);
  const [claimBusy, setClaimBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchMyReward(id);
      setReward(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load reward.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleClaim = async () => {
    setClaimBusy(true);
    try {
      await claimReward(id);
      toast('Reward claimed successfully!', 'success');
      setShowClaim(false);
      load();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to claim reward.', 'error');
    } finally {
      setClaimBusy(false);
    }
  };

  if (loading) {
    return (
      <UserLayout title="Reward Details" activeKey="rewards">
        <Skeleton height={320} />
      </UserLayout>
    );
  }

  if (error || !reward) {
    return (
      <UserLayout title="Reward Details" activeKey="rewards">
        <ErrorState message={error || 'Reward not found.'} onRetry={load} />
      </UserLayout>
    );
  }

  const claimed = reward.status === 'CLAIMED';
  const eligible = reward.status === 'ELIGIBLE';

  return (
    <UserLayout title="Reward Details" subtitle={reward.rewardName} activeKey="rewards">
      <button className="btn btn-outline" style={{ width: 'auto', marginBottom: '1.25rem' }} onClick={() => navigate('/my-rewards')}>
        <ArrowLeft size={16} style={{ marginRight: 6 }} /> Back to My Rewards
      </button>

      <div className="reward-detail-card animate-fade-in">
        <div className="reward-detail-media">
          {reward.imageUrl ? (
            <img src={reward.imageUrl} alt={reward.rewardName} onError={(e) => { e.currentTarget.src = IMAGE_FALLBACK; }} />
          ) : (
            <div className="reward-card-fallback" style={{ minHeight: '100%' }}>
              <Gift size={56} />
            </div>
          )}
          <div className="reward-card-status">
            <RewardStatusBadge status={reward.status} />
          </div>
        </div>

        <div className="reward-detail-body">
          <div className="reward-card-category">{reward.category || 'Reward'}</div>
          <h1>{reward.rewardName}</h1>

          <div className="reward-detail-points">
            <span><Coins size={18} /> {reward.requiredPoints} points required</span>
            {reward.rewardValue != null && <span><Award size={18} /> ₹{Number(reward.rewardValue).toLocaleString('en-IN')} value</span>}
          </div>

          <div className="reward-detail-progress">
            <div className="reward-card-progress-top">
              <span>Your progress: {reward.currentPoints ?? 0} / {reward.requiredPoints} points</span>
              <span>{reward.progressPercent}%</span>
            </div>
            <ProgressBar percent={reward.progressPercent} showLabel={false} />
            <p className="reward-detail-progress-note">
              {reward.remainingPoints > 0
                ? `Earn ${reward.remainingPoints} more points to unlock this reward.`
                : 'You have enough points for this reward!'}
            </p>
          </div>

          {reward.description && (
            <div className="reward-detail-section">
              <h4><Info size={16} /> About this reward</h4>
              <p>{reward.description}</p>
            </div>
          )}

          {reward.terms && (
            <div className="reward-detail-section">
              <h4>Terms &amp; Conditions</h4>
              <p>{reward.terms}</p>
            </div>
          )}

          <div className="reward-detail-meta">
            {(reward.startDate || reward.endDate) && (
              <span><CalendarDays size={15} /> {formatDate(reward.startDate)} — {formatDate(reward.endDate)}</span>
            )}
          </div>

          <div className="reward-detail-action">
            {claimed ? (
              <div className="reward-claimed-banner">
                <CheckCircle2 size={20} /> This reward has been claimed. Enjoy!
              </div>
            ) : eligible ? (
              <Button onClick={() => setShowClaim(true)} style={{ width: 'auto', minWidth: 220 }}>
                Claim this reward
              </Button>
            ) : (
              <div className="reward-locked-note">
                <Gift size={18} /> Keep ordering to earn points and unlock this reward.
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        open={showClaim}
        onClose={() => setShowClaim(false)}
        onConfirm={handleClaim}
        title="Claim this reward?"
        message={`You are about to claim "${reward.rewardName}" for ${reward.requiredPoints} points. Please confirm.`}
        confirmLabel="Claim Reward"
        variant="primary"
        busy={claimBusy}
      />
    </UserLayout>
  );
};

export default RewardDetail;
