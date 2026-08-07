import React, { useCallback, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Coins, Gift, RefreshCw, Search, Award, CheckCircle2, Lock, Target } from 'lucide-react';
import UserLayout from '../components/UserLayout';
import { fetchMyRewards, fetchMyRewardSummary, claimReward } from '../api/rewards';
import RewardCard from '../components/rewards/RewardCard';
import ProgressBar from '../components/rewards/ProgressBar';
import { CardSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import Modal from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';

const MyRewards = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rewards, setRewards] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('ALL'); // ALL, LOCKED, ELIGIBLE, CLAIMED
  
  const [selectedReward, setSelectedReward] = useState(null);
  const [isClaiming, setIsClaiming] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [rw, sm] = await Promise.all([fetchMyRewards(), fetchMyRewardSummary()]);
      setRewards(rw);
      setSummary(sm);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load rewards.');
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

  const handleClaim = async () => {
    if (!selectedReward) return;
    setIsClaiming(true);
    try {
      await claimReward(selectedReward.rewardId);
      toast('Reward claimed successfully! Please contact support to collect your gift.', 'success');
      load(); // Refresh data to update points and status
      setSelectedReward(null);
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to claim reward.', 'error');
    } finally {
      setIsClaiming(false);
    }
  };

  const filteredRewards = rewards.filter(r => {
    if (filter !== 'ALL' && r.status !== filter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return r.rewardName?.toLowerCase().includes(q) || r.category?.toLowerCase().includes(q);
    }
    return true;
  });

  const handleCardClick = (reward) => {
    setSelectedReward(reward);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ marginTop: '2rem' }}>
          <CardSkeleton cards={4} />
        </div>
      );
    }

    if (error) {
      return <ErrorState message={error} onRetry={load} />;
    }

    const next = summary?.nextReward;
    const totalUnlocked = rewards.filter((r) => r.status === 'ELIGIBLE' || r.status === 'CLAIMED').length;

    return (
      <div className="animate-fade-in">
        {/* Summary Section */}
        <div className="rewards-summary-grid">
          <div className="rewards-summary-card" style={{ '--card-gradient': 'linear-gradient(135deg, #2563eb, #60a5fa)' }}>
            <div className="rewards-summary-icon">
              <Coins size={24} />
            </div>
            <div className="rewards-summary-info">
              <p>Current Reward Points</p>
              <h3>{summary?.currentPoints ?? 0}</h3>
            </div>
          </div>
          
          <div className="rewards-summary-card" style={{ '--card-gradient': 'linear-gradient(135deg, #f97316, #fbbf24)' }}>
            <div className="rewards-summary-icon">
              <Target size={24} />
            </div>
            <div className="rewards-summary-info">
              <p>Next Reward</p>
              <h3 style={{ fontSize: next ? '1.25rem' : '1.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {next ? next.rewardName : 'All Unlocked!'}
              </h3>
            </div>
          </div>

          <div className="rewards-summary-card" style={{ '--card-gradient': 'linear-gradient(135deg, #ef4444, #f87171)' }}>
            <div className="rewards-summary-icon">
              <Lock size={24} />
            </div>
            <div className="rewards-summary-info">
              <p>Points to Unlock Next</p>
              <h3>{next ? next.remainingPoints : 0}</h3>
            </div>
          </div>

          <div className="rewards-summary-card" style={{ '--card-gradient': 'linear-gradient(135deg, #059669, #34d399)' }}>
            <div className="rewards-summary-icon">
              <Award size={24} />
            </div>
            <div className="rewards-summary-info">
              <p>Total Rewards Unlocked</p>
              <h3>{totalUnlocked}</h3>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="rewards-toolbar">
          <div className="rewards-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search rewards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="rewards-filters">
            {['ALL', 'LOCKED', 'ELIGIBLE', 'CLAIMED'].map(f => (
              <button
                key={f}
                className={`rewards-filter-btn ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Rewards Grid */}
        {filteredRewards.length === 0 ? (
          <EmptyState 
            title="No rewards found" 
            message={searchTerm || filter !== 'ALL' ? "Try adjusting your filters or search term." : "No rewards are available at the moment."} 
          />
        ) : (
          <div className="rewards-grid">
            {filteredRewards.map((r) => (
              <RewardCard key={r.rewardId} reward={r} onClick={handleCardClick} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <UserLayout title="My Rewards" subtitle="Track your reward points and unlock exciting gifts as you purchase more products." activeKey="rewards">
      
      <div className="rewards-header">
        <div className="rewards-header-title">
          <div className="rewards-title-icon">
            <Gift size={22} />
          </div>
          <div>
            <h2>My Rewards</h2>
            <p>Track your reward points and unlock exciting gifts as you purchase more products.</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div className="breadcrumb" style={{ marginBottom: 0, marginRight: '1rem' }}>
            <span className="breadcrumb-link">Home</span> / <span>Rewards</span>
          </div>
          <button className="btn btn-outline" onClick={load} title="Refresh" aria-label="Refresh" style={{ padding: '0.6rem', width: 'auto' }}>
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {renderContent()}

      {/* Reward Details Dialog */}
      <Modal 
        open={!!selectedReward} 
        onClose={() => setSelectedReward(null)} 
        title={selectedReward?.rewardName || 'Reward Details'}
        width={600}
      >
        {selectedReward && (
          <div className="reward-dialog-content">
            <div className="reward-dialog-hero">
              <img 
                src={selectedReward.imageUrl || 'https://placehold.co/800x400?text=Reward'} 
                alt={selectedReward.rewardName}
                className="reward-dialog-image"
                onError={(e) => { e.currentTarget.src = 'https://placehold.co/800x400?text=Reward'; }}
              />
            </div>
            
            <div className="reward-dialog-category">
              {selectedReward.category || 'Reward'}
            </div>
            
            <p className="reward-dialog-desc">
              {selectedReward.description}
            </p>

            <div className="reward-dialog-info-grid">
              <div>
                <span className="premium-reward-stat-label">Required Points</span>
                <div className="premium-reward-stat-value" style={{ marginTop: '0.35rem' }}>
                  <Coins size={18} className="text-muted" /> {selectedReward.requiredPoints}
                </div>
              </div>
              
              <div>
                <span className="premium-reward-stat-label">Your Points</span>
                <div className="premium-reward-stat-value" style={{ marginTop: '0.35rem' }}>
                  <Target size={18} className="text-primary" /> {selectedReward.currentPoints ?? 0}
                </div>
              </div>

              {selectedReward.startDate && (
                <div>
                  <span className="premium-reward-stat-label">Valid From</span>
                  <div className="premium-reward-stat-value" style={{ marginTop: '0.35rem', fontSize: '0.85rem' }}>
                    {new Date(selectedReward.startDate).toLocaleDateString()}
                  </div>
                </div>
              )}

              {selectedReward.endDate && (
                <div>
                  <span className="premium-reward-stat-label">Valid Until</span>
                  <div className="premium-reward-stat-value" style={{ marginTop: '0.35rem', fontSize: '0.85rem' }}>
                    {new Date(selectedReward.endDate).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>

            {selectedReward.status === 'LOCKED' && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div className="premium-reward-progress-info">
                  <span>Progress</span>
                  <span>{Math.round(selectedReward.progressPercent || 0)}%</span>
                </div>
                <ProgressBar percent={selectedReward.progressPercent} showLabel={false} />
                <p className="premium-reward-progress-text">
                  {selectedReward.remainingPoints} more points to unlock this reward.
                </p>
              </div>
            )}

            {selectedReward.termsAndConditions && (
              <div className="reward-dialog-tc">
                <h4>Terms & Conditions</h4>
                <p>{selectedReward.termsAndConditions}</p>
              </div>
            )}

            {selectedReward.status === 'ELIGIBLE' && (
              <div className="reward-dialog-success">
                <h4>🎉 Congratulations!</h4>
                <p>You are now eligible to claim this reward. Please contact Hari Om Enterprises to collect it.</p>
              </div>
            )}

            {selectedReward.status === 'CLAIMED' && (
              <div className="reward-dialog-success" style={{ background: '#eff6ff', borderColor: '#bfdbfe', color: '#1e3a8a' }}>
                <CheckCircle2 size={24} style={{ margin: '0 auto 0.5rem auto' }} />
                <h4>Reward Claimed</h4>
                <p>You have already claimed this reward. Enjoy!</p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button className="btn btn-outline" onClick={() => setSelectedReward(null)}>
                Close
              </button>
              {selectedReward.status === 'ELIGIBLE' && (
                <button 
                  className="btn btn-primary" 
                  onClick={handleClaim}
                  disabled={isClaiming}
                >
                  {isClaiming ? 'Claiming...' : 'Claim Reward Now'}
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

    </UserLayout>
  );
};

export default MyRewards;
