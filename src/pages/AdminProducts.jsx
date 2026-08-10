import React, { useCallback, useEffect, useState } from 'react';
import { useToast } from '../components/ui/Toast';
import { Search, Plus, Pencil, Trash2, Package, PackageCheck, PackageX } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import {
  fetchAdminProducts,
  fetchAdminProductStats,
  fetchProductCategories,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
} from '../api/products';
import ProductFormModal from '../components/products/ProductFormModal';
import ConfirmModal from '../components/ui/ConfirmModal';
import Pagination from '../components/ui/Pagination';
import { TableSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';

const PAGE_SIZES = [10, 25, 50];

const formatPrice = (value) => {
  if (value == null) return '—';
  const n = Number(value);
  if (Number.isNaN(n)) return '—';
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const productUnits = (p) => {
  if (Array.isArray(p?.units) && p.units.length) return p.units;
  if (p?.unit) return String(p.unit).split(',').map((u) => u.trim()).filter(Boolean);
  return [];
};

const StatCard = ({ label, value, icon: Icon, cls }) => (
  <div className="stat-card">
    <div className="stat-info">
      <h3>{label}</h3>
      <p>{value}</p>
    </div>
    <div className={`stat-icon ${cls}`}><Icon size={24} /></div>
  </div>
);

const AdminProducts = () => {
  const { toast } = useToast();

  const [data, setData] = useState({ content: [], totalElements: 0, totalPages: 0, page: 0, size: 10 });
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formBusy, setFormBusy] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchAdminProducts({ search, category, status, page, size });
      setData(res);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  }, [search, category, status, page, size]);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      setStats(await fetchAdminProductStats());
    } catch {
      /* stats are non-critical */
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    fetchProductCategories().then(setCategories).catch(() => {});
  }, []);

  const handleCreate = async (values) => {
    setFormBusy(true);
    try {
      await createAdminProduct(values);
      setShowForm(false);
      toast('Product added successfully.', 'success');
      load();
      loadStats();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to add product.', 'error');
    } finally {
      setFormBusy(false);
    }
  };

  const handleEdit = async (values) => {
    setFormBusy(true);
    try {
      await updateAdminProduct(editing.id, values);
      setShowForm(false);
      setEditing(null);
      toast('Product updated successfully.', 'success');
      load();
      loadStats();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to update product.', 'error');
    } finally {
      setFormBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    try {
      await deleteAdminProduct(deleteTarget.id);
      toast('Product deleted.', 'success');
      setDeleteTarget(null);
      load();
      loadStats();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to delete product.', 'error');
    } finally {
      setDeleteBusy(false);
    }
  };

  const s = stats || {};

  return (
    <AdminLayout title="Products" subtitle="Manage the product catalog" activeKey="products">
      <div className="stats-grid animate-fade-in">
        <StatCard label="Total Products" value={statsLoading ? '—' : s.totalProducts ?? 0} icon={Package} cls="primary" />
        <StatCard label="Active" value={statsLoading ? '—' : s.activeProducts ?? 0} icon={PackageCheck} cls="success" />
        <StatCard label="Inactive" value={statsLoading ? '—' : s.inactiveProducts ?? 0} icon={PackageX} cls="danger" />
      </div>

      <div className="table-toolbar animate-fade-in" style={{ marginTop: '1rem' }}>
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by product name..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          />
        </div>
        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(0); }}>
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }}>
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
        <div className="export-group">
          <button
            className="btn btn-primary btn-add"
            style={{ width: 'auto', borderRadius: 'var(--radius-md)', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            onClick={() => { setEditing(null); setShowForm(true); }}
          >
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={load} />}

      <div className="table-card animate-fade-in" style={{ marginTop: '1rem' }}>
        {loading ? (
          <TableSkeleton rows={size} columns={9} />
        ) : data.content.length === 0 ? (
          <EmptyState
            title="No products found"
            message="Try adjusting the search or filters, or add a new product."
            action={
              <button className="btn btn-outline" onClick={() => { setEditing(null); setShowForm(true); }} style={{ width: 'auto' }}>
                <Plus size={16} style={{ marginRight: 6 }} /> Add Product
              </button>
            }
          />
        ) : (
          <>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Brand</th>
                    <th>Category</th>
                    <th>Unit</th>
                    <th>Price</th>
                    <th>GST (%)</th>
                    <th>Image</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.content.map((p) => (
                    <tr key={p.id} className="row-hover">
                      <td>
                        <div className="retailer-cell">
                          <div className="avatar" style={{ background: '#eff6ff', color: 'var(--primary)' }}>
                            {p.productName?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="retailer-name">{p.productName}</span>
                            <span className="retailer-sub">{p.id ? `#${p.id}` : '—'}</span>
                          </div>
                        </div>
                      </td>
                      <td>{p.brand || '—'}</td>
                      <td><span className="product-category">{p.category || '—'}</span></td>
                      <td>
                        <div className="product-unit-list">
                          {productUnits(p).length ? (
                            productUnits(p).map((u) => (
                              <span key={u} className="product-unit-chip product-unit-chip-static">{u}</span>
                            ))
                          ) : (
                            '—'
                          )}
                        </div>
                      </td>
                      <td className="amount">{formatPrice(p.price)}</td>
                      <td>{p.gst != null ? `${Number(p.gst).toLocaleString('en-IN')}%` : '0%'}</td>
                      <td>
                        {p.imageUrl ? (
                          <img className="product-thumb" src={p.imageUrl} alt={p.productName} loading="lazy" />
                        ) : (
                          <span className="product-thumb product-thumb-empty" aria-label="No image">—</span>
                        )}
                      </td>
                      <td>
                        <span className={`status-badge ${p.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
                          {p.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="action-btn-group">
                          <button className="btn-view" title="Edit" onClick={() => { setEditing(p); setShowForm(true); }}>
                            <Pencil size={15} />
                          </button>
                          <button className="btn-view danger" title="Delete" onClick={() => setDeleteTarget(p)}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="table-footer">
              <div className="page-size">
                <span>Rows:</span>
                <select value={size} onChange={(e) => { setSize(Number(e.target.value)); setPage(0); }}>
                  {PAGE_SIZES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
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

      <ProductFormModal
        open={showForm}
        onClose={() => { setShowForm(false); setEditing(null); }}
        onConfirm={editing ? handleEdit : handleCreate}
        busy={formBusy}
        initial={editing}
        categories={categories}
      />

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete this product?"
        message={`"${deleteTarget?.productName}" will be removed from the catalog and hidden from retailers. This action can be reversed by re-adding the product.`}
        confirmLabel="Delete Product"
        busy={deleteBusy}
      />
    </AdminLayout>
  );
};

export default AdminProducts;
