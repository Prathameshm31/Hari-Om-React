import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Eye,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  PackageCheck,
  ShoppingBag,
  Ban,
} from 'lucide-react';
import UserLayout from '../components/UserLayout';
import { fetchMyOrders, fetchMyOrderDetail, cancelMyOrder } from '../api/orders';
import Pagination from '../components/ui/Pagination';
import { Skeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import OrderDetailDrawer from '../components/retailer/OrderDetailDrawer';
import ConfirmModal from '../components/ui/ConfirmModal';
import { OrderStatusBadge } from '../components/ui/Badges';
import { useToast } from '../components/ui/Toast';

const STATUS_TABS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'DELIVERED', 'CANCELLED'];

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

const MyOrders = () => {
  const { toast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const size = 10;

  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelBusy, setCancelBusy] = useState(false);

  const load = useCallback(async (p = page) => {
    setLoading(true);
    setError('');
    try {
      setData(await fetchMyOrders({ orderStatus: status, search, page: p, size }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your orders.');
    } finally {
      setLoading(false);
    }
  }, [status, search, page]);

  useEffect(() => {
    load();
  }, [load]);

  const orders = data?.content || [];

  const stats = useMemo(() => {
    if (!data) return null;
    return {
      PENDING: data.content.filter((o) => o.status === 'PENDING').length,
      APPROVED: data.content.filter((o) => o.status === 'APPROVED').length,
      REJECTED: data.content.filter((o) => o.status === 'REJECTED').length,
      DELIVERED: data.content.filter((o) => o.status === 'DELIVERED').length,
      TOTAL: data.totalElements,
    };
  }, [data]);

  const openOrder = async (orderId) => {
    setDetailLoading(true);
    try {
      setDetail(await fetchMyOrderDetail(orderId));
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to load order.', 'error');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelBusy(true);
    try {
      await cancelMyOrder(cancelTarget.id);
      toast(`Order ${cancelTarget.orderNumber} cancelled.`, 'success');
      setCancelTarget(null);
      load();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to cancel order.', 'error');
      setCancelTarget(null);
    } finally {
      setCancelBusy(false);
    }
  };

  const statCards = stats && (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-info"><h3>Total Orders</h3><p>{stats.TOTAL}</p></div>
        <div className="stat-icon primary"><ShoppingBag size={24} /></div>
      </div>
      <div className="stat-card">
        <div className="stat-info"><h3>Pending</h3><p>{stats.PENDING}</p></div>
        <div className="stat-icon secondary"><Clock size={24} /></div>
      </div>
      <div className="stat-card">
        <div className="stat-info"><h3>Approved</h3><p>{stats.APPROVED}</p></div>
        <div className="stat-icon success"><CheckCircle2 size={24} /></div>
      </div>
      <div className="stat-card">
        <div className="stat-info"><h3>Rejected</h3><p>{stats.REJECTED}</p></div>
        <div className="stat-icon danger"><XCircle size={24} /></div>
      </div>
      <div className="stat-card">
        <div className="stat-info"><h3>Delivered</h3><p>{stats.DELIVERED}</p></div>
        <div className="stat-icon info"><PackageCheck size={24} /></div>
      </div>
    </div>
  );

  return (
    <UserLayout title="My Orders" subtitle="Track your order requests and their approval status" activeKey="orders">
      <div className="section-heading" style={{ marginTop: 0 }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--text-main)' }}>Order Requests</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Place new orders for construction materials and track their approval.
          </p>
        </div>
        <Link className="btn btn-primary" to="/orders/new" style={{ width: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <PlusCircle size={18} /> Create New Order
        </Link>
      </div>

      {statCards}

      <div className="table-toolbar animate-fade-in" style={{ marginTop: '1.25rem' }}>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by order number or product..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
          />
        </div>
        <div className="tabs tabs-compact">
          {STATUS_TABS.map((s) => (
            <button
              key={s}
              className={`tab ${status === s ? 'active' : ''}`}
              onClick={() => {
                setStatus(s);
                setPage(0);
              }}
            >
              {s === 'ALL' ? 'All' : s}
            </button>
          ))}
        </div>
        <button className="btn btn-export" title="Refresh" onClick={() => load()} aria-label="Refresh">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {error && <ErrorState message={error} onRetry={() => load()} />}

      <div className="table-card animate-fade-in" style={{ marginTop: '1rem' }}>
        {loading ? (
          <div style={{ padding: '1rem' }}>{[1, 2, 3].map((i) => <Skeleton key={i} height={48} style={{ marginBottom: 10 }} />)}</div>
        ) : orders.length === 0 ? (
          <EmptyState
            title={search || status !== 'ALL' ? 'No orders match' : 'No orders yet'}
            message={search || status !== 'ALL' ? 'Try adjusting the filters.' : 'Create your first order request to get started.'}
            action={<Link className="btn btn-outline" to="/orders/new" style={{ width: 'auto' }}><PlusCircle size={16} style={{ marginRight: 6 }} /> Create New Order</Link>}
          />
        ) : (
          <>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order Number</th>
                    <th>Order Date</th>
                    <th>Products</th>
                    <th>Qty</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Approval</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="row-hover">
                      <td className="order-no">{o.orderNumber}</td>
                      <td>{formatDateTime(o.orderDate)}</td>
                      <td>
                        <span className="retailer-name">{o.productName || '—'}</span>
                        <span className="retailer-sub">{o.itemCount > 1 ? `+${o.itemCount - 1} more items` : ''}</span>
                      </td>
                      <td>{o.totalQuantity ?? 0}</td>
                      <td className="amount">{formatMoney(o.finalAmount ?? o.totalAmount)}</td>
                      <td><OrderStatusBadge status={o.status} /></td>
                      <td>
                        {o.status === 'REJECTED' ? (
                          <span className="reject-cell" title={o.rejectionReason || ''}>
                            <Ban size={13} /> {o.rejectionReason || 'Rejected'}
                          </span>
                        ) : o.status === 'APPROVED' ? (
                          <span className="approve-cell">
                            <CheckCircle2 size={13} /> {formatDate(o.approvedDate)}
                          </span>
                        ) : o.status === 'CANCELLED' ? (
                          <span className="text-muted">Cancelled</span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button className="btn-view" onClick={() => openOrder(o.id)}>
                          <Eye size={15} /> View
                        </button>
                        {o.status === 'PENDING' && (
                          <button
                            className="btn-view cancel"
                            onClick={() => setCancelTarget(o)}
                          >
                            <Ban size={15} /> Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="table-footer">
              <Pagination
                page={data.page}
                totalPages={data.totalPages}
                totalElements={data.totalElements}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </div>

      <OrderDetailDrawer
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        order={detail}
        loading={detailLoading}
        onRetry={() => detail && openOrder(detail.id)}
      />

      <ConfirmModal
        open={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        title="Cancel Order"
        message={`Are you sure you want to cancel order ${cancelTarget?.orderNumber}? This cannot be undone.`}
        confirmLabel="Cancel Order"
        variant="danger"
        busy={cancelBusy}
      />
    </UserLayout>
  );
};

export default MyOrders;
