import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  MapPin,
  CalendarDays,
  StickyNote,
  ArrowLeft,
  Package,
} from 'lucide-react';
import UserLayout from '../components/UserLayout';
import { fetchProducts, createOrder } from '../api/orders';
import * as SELF from '../api/self';
import { Skeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import { useToast } from '../components/ui/Toast';

const UNITS = ['Bag', 'Ton', 'Piece', 'Kg', 'Coil', 'Bucket', 'Packet', 'Box', 'Litre', 'Roll'];

const productUnits = (p) => {
  if (Array.isArray(p?.units) && p.units.length) return p.units;
  if (p?.unit) return String(p.unit).split(',').map((u) => u.trim()).filter(Boolean);
  return [];
};

const firstUnit = (p) => productUnits(p)[0] || UNITS[0];

const formatMoney = (value) =>
  value === null || value === undefined ? '—' : `₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const CreateOrder = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');

  const [cart, setCart] = useState([]);
  const [unitSel, setUnitSel] = useState({});
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const [prods, profile] = await Promise.all([fetchProducts(), SELF.fetchMyRetailer()]);
        setProducts(prods);
        if (profile?.address) {
          setDeliveryAddress([profile.address, profile.city, profile.state, profile.pincode].filter(Boolean).join(', '));
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load product catalog.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean));
    return ['ALL', ...set];
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const term = search.trim().toLowerCase();
      const matchSearch = !term || p.productName.toLowerCase().includes(term) || (p.brand || '').toLowerCase().includes(term);
      const matchCat = category === 'ALL' || p.category === category;
      return matchSearch && matchCat;
    });
  }, [products, search, category]);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const subtotal = (item.price || 0) * item.quantity;
      const gst = subtotal * 0.18;
      return sum + subtotal + gst;
    }, 0);
  }, [cart]);

  const addToCart = (product) => {
    const unit = unitSel[product.id] || firstUnit(product);
    setCart((prev) => {
      const existing = prev.find((c) => c.productId === product.id);
      if (existing) {
        return prev.map((c) => (c.productId === product.id ? { ...c, unit, quantity: c.quantity + 1 } : c));
      }
      return [...prev, {
        productId: product.id,
        productName: product.productName,
        brand: product.brand,
        category: product.category,
        unit,
        units: productUnits(product),
        price: Number(product.price) || 0,
        imageUrl: product.imageUrl,
        quantity: 1,
      }];
    });
  };

  const updateCart = (productId, patch) => {
    setCart((prev) => prev.map((c) => (c.productId === productId ? { ...c, ...patch } : c)));
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((c) => c.productId !== productId));
  };

  const validate = () => {
    const errs = {};
    if (cart.length === 0) errs.cart = 'Add at least one product to your order.';
    if (!deliveryAddress.trim()) errs.deliveryAddress = 'Delivery address is required.';
    if (!deliveryDate) errs.deliveryDate = 'Delivery date is required.';
    else if (new Date(deliveryDate) < new Date(new Date().toDateString())) errs.deliveryDate = 'Delivery date cannot be in the past.';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        items: cart.map((c) => ({
          productId: c.productId,
          quantity: c.quantity,
          unit: c.unit,
        })),
        deliveryAddress: deliveryAddress.trim(),
        deliveryDate,
        remarks: remarks.trim() || undefined,
      };
      await createOrder(payload);
      toast('Order placed successfully. Awaiting admin approval.', 'success');
      navigate('/orders');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.items || 'Failed to place order.';
      toast(typeof msg === 'string' ? msg : JSON.stringify(msg), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <UserLayout title="Create New Order" subtitle="Build your order request like a shopping cart" activeKey="orders">
      <div className="section-heading" style={{ marginTop: 0 }}>
        <div>
          <button className="btn btn-outline" onClick={() => navigate('/orders')} style={{ width: 'auto', marginBottom: '0.5rem' }}>
            <ArrowLeft size={16} style={{ marginRight: 6 }} /> Back to My Orders
          </button>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--text-main)' }}>Select Products</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Choose materials from the catalog and add them to your order.
          </p>
        </div>
      </div>

      <div className="create-order-layout">
        <div className="catalog-panel">
          <div className="table-toolbar">
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search products or brands..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((c) => (
                <option key={c} value={c}>{c === 'ALL' ? 'All Categories' : c}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} height={130} />)}
            </div>
          ) : error ? (
            <ErrorState message={error} onRetry={() => window.location.reload()} />
          ) : filtered.length === 0 ? (
            <EmptyState message="No products match your search." />
          ) : (
            <div className="product-catalog">
              {filtered.map((p) => (
                <div className="product-card" key={p.id}>
                  <div className="product-card-thumb">
                    {p.imageUrl ? <img src={p.imageUrl} alt={p.productName} /> : <Package size={22} />}
                  </div>
                  <div className="product-card-body">
                    <h4>{p.productName}</h4>
                    <p>{p.brand} · {p.category}</p>
                    <div className="product-card-stats">
                      <div>
                        <span>Price</span>
                        <strong>{formatMoney(p.price)}</strong>
                      </div>
                    </div>
                    <div className="product-card-unit">
                      <span>Unit</span>
                      {productUnits(p).length > 1 ? (
                        <select
                          value={unitSel[p.id] || firstUnit(p)}
                          onChange={(e) => setUnitSel((s) => ({ ...s, [p.id]: e.target.value }))}
                          aria-label={`Unit for ${p.productName}`}
                        >
                          {productUnits(p).map((u) => <option key={u} value={u}>{u}</option>)}
                        </select>
                      ) : (
                        <strong>{productUnits(p)[0] || '—'}</strong>
                      )}
                    </div>
                    <button className="btn btn-primary btn-add" style={{ width: '100%', marginTop: '0.5rem' }} onClick={() => addToCart(p)}>
                      <Plus size={16} /> Add to Order
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="cart-panel">
          <div className="rd-panel" style={{ position: 'sticky', top: '1rem' }}>
            <div className="tr-widget-header">
              <div className="tr-title">
                <span className="tr-title-icon" style={{ background: 'linear-gradient(135deg, #2563eb, #0ea5e9)' }}>
                  <ShoppingCart size={20} />
                </span>
                <div>
                  <h3>Your Order</h3>
                  <p>{cart.length} item{cart.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>

            {formErrors.cart && <p className="text-error">{formErrors.cart}</p>}

            {cart.length === 0 ? (
              <EmptyState message="Your order is empty. Add products from the catalog." />
            ) : (
              <div className="cart-items">
                {cart.map((item) => (
                  <div className="cart-item" key={item.productId}>
                    <div className="cart-item-thumb">
                      {item.imageUrl ? <img src={item.imageUrl} alt={item.productName} /> : item.productName.charAt(0).toUpperCase()}
                    </div>
                    <div className="cart-item-main">
                      <p className="cart-item-name">{item.productName}</p>
                      <p className="cart-item-sub">{item.brand} · {formatMoney(item.price)}</p>
                      <div className="cart-item-controls">
                        <div className="qty-stepper">
                          <button type="button" onClick={() => updateCart(item.productId, { quantity: Math.max(1, item.quantity - 1) })} aria-label="Decrease">
                            <Minus size={13} />
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateCart(item.productId, { quantity: Math.max(1, Number(e.target.value) || 1) })}
                          />
                          <button type="button" onClick={() => updateCart(item.productId, { quantity: item.quantity + 1 })} aria-label="Increase">
                            <Plus size={13} />
                          </button>
                        </div>
                        <select
                          value={item.unit}
                          onChange={(e) => updateCart(item.productId, { unit: e.target.value })}
                          title="Unit"
                        >
                          {(item.units && item.units.length ? item.units : UNITS).map((u) => <option key={u} value={u}>{u}</option>)}
                        </select>
                        <button className="cart-remove" type="button" onClick={() => removeFromCart(item.productId)} aria-label="Remove">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                    <div className="cart-item-total">
                      {formatMoney((item.price * item.quantity) * 1.18)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="input-group" style={{ marginTop: '1rem' }}>
                <label className="input-label"><MapPin size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Delivery Address *</label>
                <textarea
                  className="input-field"
                  rows={2}
                  placeholder="Enter the full delivery address"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                />
                {formErrors.deliveryAddress && <p className="text-error">{formErrors.deliveryAddress}</p>}
              </div>

              <div className="input-group" style={{ marginTop: '0.75rem' }}>
                <label className="input-label"><CalendarDays size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Delivery Date *</label>
                <input
                  type="date"
                  className="input-field"
                  value={deliveryDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                />
                {formErrors.deliveryDate && <p className="text-error">{formErrors.deliveryDate}</p>}
              </div>

              <div className="input-group" style={{ marginTop: '0.75rem' }}>
                <label className="input-label"><StickyNote size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Remarks (Optional)</label>
                <textarea
                  className="input-field"
                  rows={2}
                  placeholder="Any special instructions for the order"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>

              <div className="cart-summary">
                <div className="cart-summary-row">
                  <span>Items ({cart.reduce((s, c) => s + c.quantity, 0)} units)</span>
                  <span>{cart.length}</span>
                </div>
                <div className="cart-summary-row total">
                  <span>Estimated Total (incl. 18% GST)</span>
                  <strong>{formatMoney(cartTotal)}</strong>
                </div>
                <p className="cart-summary-note">Final pricing will be confirmed by the admin before delivery.</p>
              </div>

              <ButtonSubmit loading={submitting} disabled={cart.length === 0} />
            </form>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

const ButtonSubmit = ({ loading, disabled }) => (
  <button
    type="submit"
    className="btn btn-primary"
    style={{ width: '100%', justifyContent: 'center', marginTop: '0.75rem' }}
    disabled={loading || disabled}
  >
    {loading && <div className="spinner"></div>}
    {disabled ? 'Add Products to Continue' : 'Place Order Request'}
  </button>
);

export default CreateOrder;
