import React from 'react';
import { Coins, ArrowUpCircle, ArrowDownCircle, RefreshCw } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';
import { RewardTypeBadge } from '../ui/Badges';

const formatDateTime = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true });
};

const RecentTransactions = ({ data, loading, onRefresh }) => (
  <div className="tr-widget rd-panel">
    <div className="tr-widget-header">
      <div className="tr-title">
        <span className="tr-title-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}>
          <Coins size={20} />
        </span>
        <div>
          <h3>Recent Reward Transactions</h3>
          <p>Latest point movements</p>
        </div>
      </div>
      <button className="tr-icon-btn" type="button" onClick={onRefresh} title="Refresh" aria-label="Refresh">
        <RefreshCw size={18} />
      </button>
    </div>

    <div className="rd-list">
      {loading ? (
        Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height={44} style={{ marginBottom: 10 }} />)
      ) : data.length === 0 ? (
        <p className="rd-empty">No reward transactions yet.</p>
      ) : (
        data.map((t) => {
          const isEarned = (t.pointsEarned || 0) > 0;
          const isRedeemed = (t.pointsRedeemed || 0) > 0;
          const Icon = isRedeemed && !isEarned ? ArrowDownCircle : ArrowUpCircle;
          return (
            <div className="rd-item" key={t.id}>
              <span className={`rd-icon ${isRedeemed && !isEarned ? 'neg' : 'pos'}`}>
                <Icon size={16} />
              </span>
              <div className="rd-body">
                <div className="rd-line">
                  <strong>{t.retailerName}</strong>
                  <RewardTypeBadge type={t.type} />
                </div>
                <p className="rd-sub">
                  {isEarned ? `+${t.pointsEarned}` : isRedeemed ? `−${t.pointsRedeemed}` : '0'} pts · {formatDateTime(t.date)}
                </p>
                {t.reason && <p className="rd-reason">{t.reason}</p>}
              </div>
              <span className={`rd-balance ${isRedeemed && !isEarned ? 'neg' : 'pos'}`}>{t.balance}</span>
            </div>
          );
        })
      )}
    </div>
  </div>
);

export default RecentTransactions;
