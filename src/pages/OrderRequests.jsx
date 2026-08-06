import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, RefreshCw, ShoppingCart, Users } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { fetchOrderRequests } from '../api/orders';
import Pagination from '../components/ui/Pagination';
import { Skeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import { OrderStatusBadge } from '../components/ui/Badges';

const STATUS_TABS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const formatDateTime = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
};

const formatMoney = (value) =>
  value === null || value === undefined ? '—' : `₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const OrderRequests = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const size = 10;

  const load = useCallback(async (p = page) => {
    setLoading(true);
    setError('');
    try {
      setData(await fetchOrderRequests({ status, search, page: p, size }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load order requests.');
    } finally {
      setLoading(false);
    }
  }, [status, search, page]);

  useEffect(() => {
    load();
  }, [load]);

  const orders = data?.content || [];

  return (
    <AdminLayout title="Order Requests" subtitle="Review and manage all retailer order requests" activeKey="orderRequests">
      <div className="table-toolbar animate-fade-in">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by retailer, mobile, order ID or product..."
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

      {data && (
        <div className="mini-stats">
          <span><ShoppingCart size={14} /> {data.totalElements} order requests</span>
          <span><Users size={14} /> {status === 'ALL' ? 'All statuses' : status}</span>
        </div>
      )}

      {error && <ErrorState message={error} onRetry={() => load()} />}

      <div className="table-card animate-fade-in">
        {loading ? (
          <div style={{ padding: '1rem' }}>{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} height={48} style={{ marginBottom: 10 }} />)}</div>
        ) : orders.length === 0 ? (
          <EmptyState
            title="No order requests"
            message={search || status !== 'ALL' ? 'Try adjusting the filters or search.' : 'No orders have been placed yet.'}
            action={<button className="btn btn-outline" onClick={() => { setSearch(''); setStatus('ALL'); setPage(0); }} style={{ width: 'auto' }}><RefreshCw size={16} style={{ marginRight: 6 }} /> Reset filters</button>}
          />
        ) : (
          <>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Retailer Name</th>
                    <th>Shop Name</th>
                    <th>Mobile</th>
                    <th>Order Date</th>
                    <th>Items</th>
                    <th>Total Qty</th>
                    <th>Total Amount</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="row-hover" onClick={() => navigate(`/order-requests/${o.id}`)}>
                      <td className="order-no">{o.orderNumber}</td>
                      <td>
                        <div className="retailer-cell">
                          <div className="avatar" style={{ background: '#eff6ff', color: 'var(--primary)' }}>
                            {o.retailerName?.charAt(0).toUpperCase() || 'R'}
                          </div>
                          <div>
                            <span className="retailer-name">{o.retailerName || '—'}</span>
                            {o.rejectionReason && (
                              <span className="retailer-sub reject-sub" title={o.rejectionReason}>Rejected: {o.rejectionReason}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>{o.shopName || '—'}</td>
                      <td>{o.mobileNumber || '—'}</td>
                      <td>{formatDateTime(o.orderDate)}</td>
                      <td>{o.itemCount ?? 0}</td>
                      <td>{o.totalQuantity ?? 0}</td>
                      <td className="amount">{formatMoney(o.finalAmount ?? o.totalAmount)}</td>
                      <td><OrderStatusBadge status={o.status} /></td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn-view"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/order-requests/${o.id}`);
                          }}
                        >
                          <Eye size={15} /> Review
                        </button>
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
    </AdminLayout>
  );
};

export default OrderRequests;
