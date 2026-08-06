import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Store,
  Package,
  IndianRupee,
  Receipt,
  CalendarDays,
  RefreshCw,
  Ban,
  Truck,
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { fetchOrderRequestDetail, approveOrder, rejectOrder, updateOrderStatus } from '../api/orders';
import { Skeleton } from '../components/ui/Skeleton';
import ErrorState from '../components/ui/ErrorState';
import RejectOrderModal from '../components/orders/RejectOrderModal';
import OrderStatusTimeline from '../components/orders/OrderStatusTimeline';
import { OrderStatusBadge, PaymentBadge } from '../components/ui/Badges';
import { useToast } from '../components/ui/Toast';

const formatDateTime = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
};

const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatMoney = (value) =>
  value === null || value === undefined ? '—' : `₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const InfoRow = ({ label, value, strong }) => (
  <div className="info-row">
    <span className="info-label">{label}</span>
    <span className={`info-value ${strong ? 'strong' : ''}`}>{value || '—'}</span>
  </div>
);

const OrderRequestDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showReject, setShowReject] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setOrder(await fetchOrderRequestDetail(orderId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load order request.');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleApprove = async () => {
    setBusy(true);
    try {
      await approveOrder(order.id);
      toast(`Order ${order.orderNumber} approved successfully.`, 'success');
      load();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to approve order.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async (reason) => {
    setBusy(true);
    try {
      await rejectOrder(order.id, reason);
      toast(`Order ${order.orderNumber} rejected.`, 'success');
      setShowReject(false);
      load();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to reject order.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleStatusChange = async (e) => {
    const next = e.target.value;
    if (!next || next === order.status) return;
    setBusy(true);
    try {
      await updateOrderStatus(order.id, next);
      toast(`Order status updated to ${next}.`, 'success');
      load();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to update status.', 'error');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Order Request Details" subtitle="Loading..." activeKey="orderRequests">
        <div style={{ padding: '1rem' }}>{[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} height={40} style={{ marginBottom: 12 }} />)}</div>
      </AdminLayout>
    );
  }

  if (error || !order) {
    return (
      <AdminLayout title="Order Request Details" subtitle="Error" activeKey="orderRequests">
        <ErrorState message={error || 'Order not found.'} onRetry={load} />
        <button className="btn btn-outline" onClick={() => navigate('/order-requests')} style={{ width: 'auto', marginTop: '0.5rem' }}>
          <ArrowLeft size={16} style={{ marginRight: 6 }} /> Back to Order Requests
        </button>
      </AdminLayout>
    );
  }

  const isPending = order.status === 'PENDING';

  return (
    <AdminLayout title="Order Request Details" subtitle={order.orderNumber} activeKey="orderRequests">
      <div className="section-heading" style={{ marginTop: 0 }}>
        <div>
          <button className="btn btn-outline" onClick={() => navigate('/order-requests')} style={{ width: 'auto', marginBottom: '0.5rem' }}>
            <ArrowLeft size={16} style={{ marginRight: 6 }} /> Back to Order Requests
          </button>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--text-main)' }}>{order.orderNumber}</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Placed on {formatDateTime(order.orderDate)}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {isPending && (
            <>
              <button className="btn btn-primary" onClick={handleApprove} disabled={busy} style={{ width: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                {busy && <div className="spinner"></div>} <CheckCircle2 size={16} /> Approve Order
              </button>
              <button className="btn btn-danger" onClick={() => setShowReject(true)} disabled={busy} style={{ width: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <XCircle size={16} /> Reject Order
              </button>
            </>
          )}
          <button className="btn btn-outline" onClick={load} style={{ width: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      <div className="detail-badges-row">
        <OrderStatusBadge status={order.status} />
        <PaymentBadge status={order.paymentStatus} />
      </div>

      <div className="detail-blocks">
        <div className="detail-block">
          <h4><Store size={15} /> Retailer Information</h4>
          <div className="info-grid">
            <InfoRow label="Retailer Name" value={order.retailerName} strong />
            <InfoRow label="Shop Name" value={order.shopName} />
            <InfoRow label="Mobile" value={order.retailerMobile} />
            <InfoRow label="Email" value={order.retailerEmail} />
            <InfoRow label="Address" value={order.retailerAddress} />
          </div>
        </div>

        <div className="detail-block">
          <h4><Receipt size={15} /> Order Information</h4>
          <div className="info-grid">
            <InfoRow label="Order Number" value={order.orderNumber} strong />
            <InfoRow label="Order Date" value={formatDateTime(order.orderDate)} />
            <InfoRow label="Delivery Date" value={formatDate(order.deliveryDate)} />
            <InfoRow label="Status" value={order.status} strong />
            <InfoRow label="Delivery Address" value={order.deliveryAddress} />
            <InfoRow label="Remarks" value={order.remarks} />
          </div>
          {order.status === 'REJECTED' && (
            <div className="rejection-box">
              <h5><Ban size={14} /> Reason for Rejection</h5>
              <p>{order.rejectionReason || '—'}</p>
              <div className="info-row" style={{ marginTop: '0.5rem' }}>
                <span className="info-label">Rejected By</span>
                <span className="info-value">{order.rejectedBy} · {formatDateTime(order.rejectedDate)}</span>
              </div>
            </div>
          )}
          {order.status === 'APPROVED' && (
            <div className="approval-box">
              <h5><CheckCircle2 size={14} /> Approval Details</h5>
              <div className="info-row" style={{ marginTop: '0.5rem' }}>
                <span className="info-label">Approved By</span>
                <span className="info-value">{order.approvedBy} · {formatDateTime(order.approvedDate)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="detail-block" style={{ marginTop: '1rem' }}>
        <h4><Package size={15} /> Ordered Products ({order.items?.length || 0})</h4>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Brand</th>
                <th>Quantity</th>
                <th>Unit</th>
                <th>Price</th>
                <th>GST</th>
                <th>Total Price</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="retailer-cell">
                      <div className="product-thumb" style={{ width: 36, height: 36 }}>
                        {item.productImageUrl ? <img src={item.productImageUrl} alt={item.productName} /> : <Package size={16} />}
                      </div>
                      <div>
                        <span className="retailer-name">{item.productName}</span>
                        <span className="retailer-sub">{item.category}</span>
                      </div>
                    </div>
                  </td>
                  <td>{item.brand || '—'}</td>
                  <td>{item.quantity}</td>
                  <td>{item.unit || '—'}</td>
                  <td>{formatMoney(item.pricePerUnit)}</td>
                  <td>{item.gst != null ? `${item.gst}%` : '—'}</td>
                  <td className="amount">{formatMoney(item.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="cart-summary order-summary">
          <div className="cart-summary-row">
            <span><Package size={14} /> Total Quantity</span>
            <span>{order.totalQuantity ?? 0} units</span>
          </div>
          <div className="cart-summary-row">
            <span><IndianRupee size={14} /> Subtotal</span>
            <span>{formatMoney(order.totalAmount)}</span>
          </div>
          <div className="cart-summary-row">
            <span>GST</span>
            <span>{formatMoney(order.gst)}</span>
          </div>
          <div className="cart-summary-row total">
            <span>Total Amount</span>
            <strong>{formatMoney(order.finalAmount ?? order.totalAmount)}</strong>
          </div>
          <div className="cart-summary-row">
            <span><Truck size={14} /> Reward Points to Earn</span>
            <span className="points-badge">+{order.rewardPointsEarned ?? 0} pts</span>
          </div>
        </div>
      </div>

      <div className="detail-block" style={{ marginTop: '1rem' }}>
        <h4><CalendarDays size={15} /> Order Status</h4>
        <OrderStatusTimeline status={order.status} />
        <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <label className="input-label" style={{ marginBottom: 0 }}>Update Status:</label>
          <select
            className="input-field"
            style={{ width: 'auto', padding: '0.4rem 0.75rem' }}
            value={order.status}
            onChange={handleStatusChange}
            disabled={busy || isPending}
          >
            <option value="APPROVED">APPROVED</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
          <span className="text-muted" style={{ fontSize: '0.8rem' }}>
            {isPending ? 'Approve or reject the order first to change delivery status.' : 'Use this to move the order through delivery.'}
          </span>
        </div>
      </div>

      <RejectOrderModal
        open={showReject}
        onClose={() => setShowReject(false)}
        onConfirm={handleReject}
        orderNumber={order.orderNumber}
        busy={busy}
      />
    </AdminLayout>
  );
};

export default OrderRequestDetail;
