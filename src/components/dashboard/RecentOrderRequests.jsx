import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, CheckCircle2, XCircle, RefreshCw, ChevronRight } from 'lucide-react';
import { fetchRecentOrderRequests, approveOrder, rejectOrder } from '../../api/orders';
import RejectOrderModal from '../orders/RejectOrderModal';
import EmptyState from '../ui/EmptyState';
import { Skeleton } from '../ui/Skeleton';
import { useToast } from '../ui/Toast';

const formatMoney = (value) =>
  value === null || value === undefined ? '—' : `₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const formatDateTime = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true });
};

const RecentOrderRequests = ({ limit = 10 }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await fetchRecentOrderRequests(limit));
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    load();
  }, [load]);

  const handleApprove = async (order) => {
    setBusy(true);
    try {
      await approveOrder(order.id);
      toast(`Order ${order.orderNumber} approved.`, 'success');
      load();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to approve order.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async (reason) => {
    if (!rejectTarget) return;
    setBusy(true);
    try {
      await rejectOrder(rejectTarget.id, reason);
      toast(`Order ${rejectTarget.orderNumber} rejected.`, 'success');
      setRejectTarget(null);
      load();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to reject order.', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="tr-widget rd-panel">
      <div className="tr-widget-header">
        <div className="tr-title">
          <span className="tr-title-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}>
            <ShoppingCart size={20} />
          </span>
          <div>
            <h3>Recent Order Requests</h3>
            <p>Latest {limit} pending orders awaiting your review</p>
          </div>
        </div>
        <button className="tr-icon-btn" type="button" onClick={load} title="Refresh" aria-label="Refresh">
          <RefreshCw size={18} />
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '0.5rem 0' }}>
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} height={52} style={{ marginBottom: 8 }} />)}
        </div>
      ) : data.length === 0 ? (
        <EmptyState message="No pending order requests." />
      ) : (
        <div className="req-list">
          {data.map((o) => (
            <div className="req-item" key={o.id}>
              <div className="req-avatar">{o.retailerName?.charAt(0).toUpperCase() || 'R'}</div>
              <div className="req-body">
                <div className="req-line">
                  <strong>{o.retailerName || 'Unknown'}</strong>
                  <span className="req-amount">{formatMoney(o.finalAmount)}</span>
                </div>
                <p className="req-sub">
                  {o.orderNumber} · {formatDateTime(o.orderDate)} · {o.itemCount ?? 0} items
                </p>
              </div>
              <div className="req-actions">
                <button className="btn-action approve" title="Approve" onClick={() => handleApprove(o)} disabled={busy} aria-label="Approve">
                  <CheckCircle2 size={15} />
                </button>
                <button className="btn-action reject" title="Reject" onClick={() => setRejectTarget(o)} disabled={busy} aria-label="Reject">
                  <XCircle size={15} />
                </button>
                <button className="btn-action view" title="Review" onClick={() => navigate(`/order-requests/${o.id}`)} aria-label="Review">
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <RejectOrderModal
        open={Boolean(rejectTarget)}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleReject}
        orderNumber={rejectTarget?.orderNumber}
        busy={busy}
      />
    </div>
  );
};

export default RecentOrderRequests;
