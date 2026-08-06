import React from 'react';
import { X, Package, IndianRupee, CreditCard, Truck, Receipt } from 'lucide-react';
import { OrderStatusBadge, PaymentBadge } from '../ui/Badges';
import { Skeleton } from '../ui/Skeleton';

const formatMoney = (value) =>
  value === null || value === undefined ? '—' : `₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const formatDateTime = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
};

const InfoRow = ({ label, value, strong }) => (
  <div className="info-row">
    <span className="info-label">{label}</span>
    <span className={`info-value ${strong ? 'strong' : ''}`}>{value || '—'}</span>
  </div>
);

const OrderDetailDrawer = ({ open, onClose, order, loading, onRetry }) => {
  return (
    <div className={`drawer-overlay ${open ? 'open' : ''}`} onMouseDown={onClose}>
      <div className="drawer" onMouseDown={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div>
            <h3>Order Details</h3>
            <span className="drawer-sub">{order?.orderNumber || 'Loading…'}</span>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="drawer-body">
          {loading && !order ? (
            <div style={{ padding: '1rem' }}>
              <Skeleton height={16} width="40%" style={{ marginBottom: 12 }} />
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} height={30} style={{ marginBottom: 8 }} />
              ))}
            </div>
          ) : !order ? (
            <div className="error-state" style={{ padding: '2rem' }}>
              <p>Could not load order details.</p>
              {onRetry && <button className="btn btn-outline" onClick={onRetry} style={{ width: 'auto' }}>Retry</button>}
            </div>
          ) : (
            <>
              <div className="drawer-badges">
                <OrderStatusBadge status={order.status} />
                <PaymentBadge status={order.paymentStatus} />
                <span className="dot-badge neutral">{order.deliveryStatus || '—'}</span>
              </div>

              <section className="drawer-section">
                <h4><Receipt size={15} /> Order Information</h4>
                <div className="info-grid">
                  <InfoRow label="Order Number" value={order.orderNumber} strong />
                  <InfoRow label="Invoice Number" value={order.invoiceNumber} />
                  <InfoRow label="Order Date" value={formatDateTime(order.orderDate)} />
                  <InfoRow label="Delivery Date" value={order.deliveryDate} />
                  <InfoRow label="Payment Method" value={order.paymentMethod} />
                  <InfoRow label="Sales Representative" value={order.salesRepresentative} />
                  <InfoRow label="Delivery Address" value={order.deliveryAddress} />
                </div>
              </section>

              <section className="drawer-section">
                <h4><Package size={15} /> Products ({order.items?.length || 0})</h4>
                <div className="order-items">
                  {order.items?.map((item) => (
                    <div className="order-item" key={item.id}>
                      <div className="product-thumb">
                        {item.productImageUrl ? (
                          <img src={item.productImageUrl} alt={item.productName} />
                        ) : (
                          <span>{item.productName?.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="order-item-info">
                        <p className="order-item-name">{item.productName}</p>
                        <p className="order-item-sub">
                          {item.brand} · {item.category} · {item.quantity} {item.unit} × {formatMoney(item.pricePerUnit)}
                        </p>
                        {Number(item.discount || 0) > 0 && <p className="order-item-sub discount">Discount: {formatMoney(item.discount)}</p>}
                        {Number(item.gst || 0) > 0 && <p className="order-item-sub">GST: {item.gst}%</p>}
                      </div>
                      <div className="order-item-total">{formatMoney(item.totalAmount)}</div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="drawer-section">
                <h4><IndianRupee size={15} /> Summary</h4>
                <div className="info-grid">
                  <InfoRow label="Total Quantity" value={`${order.totalQuantity ?? 0} units`} />
                  <InfoRow label="Total Amount" value={formatMoney(order.totalAmount)} />
                  <InfoRow label="Discount" value={`- ${formatMoney(order.discount)}`} />
                  <InfoRow label="GST" value={formatMoney(order.gst)} />
                  <InfoRow label="Final Amount" value={formatMoney(order.finalAmount)} strong />
                  <InfoRow label="Reward Points Earned" value={`+${order.rewardPointsEarned ?? 0} pts`} strong />
                </div>
              </section>

              {order.payments?.length > 0 && (
                <section className="drawer-section">
                  <h4><CreditCard size={15} /> Payments</h4>
                  {order.payments.map((p) => (
                    <div className="payment-row" key={p.id}>
                      <div>
                        <p className="order-item-name">{p.method}</p>
                        <p className="order-item-sub">TXN: {p.transactionId || '—'}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p className="order-item-name">{formatMoney(p.amount)}</p>
                        <p className="order-item-sub"><PaymentBadge status={p.status} /></p>
                      </div>
                    </div>
                  ))}
                </section>
              )}

              <div className="drawer-note">
                <Truck size={16} /> Delivery status: <strong>{order.deliveryStatus || '—'}</strong>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailDrawer;
