import React from 'react';
import { Activity, RefreshCw } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';

const formatRelative = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const diff = Math.round((Date.now() - d.getTime()) / 60000);
  if (diff < 1) return 'just now';
  if (diff < 60) return `${diff}m ago`;
  const hours = Math.round(diff / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
};

const RecentActivities = ({ data, loading, onRefresh }) => (
  <div className="tr-widget rd-panel">
    <div className="tr-widget-header">
      <div className="tr-title">
        <span className="tr-title-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}>
          <Activity size={20} />
        </span>
        <div>
          <h3>Recent Activities</h3>
          <p>Latest retailer events</p>
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
        <p className="rd-empty">No recent activities.</p>
      ) : (
        data.map((a) => (
          <div className="rd-item" key={a.id}>
            <span className="rd-dot" />
            <div className="rd-body">
              <p className="rd-line-text">{a.message}</p>
              <span className="rd-time">{formatRelative(a.date)}</span>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

export default RecentActivities;
