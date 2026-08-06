import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  FileSpreadsheet,
  FileText,
  ChevronUp,
  ChevronDown,
  Store,
  Eye,
  RefreshCw,
  IndianRupee,
  ShoppingCart,
  UserPlus,
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { fetchRetailers, fetchCities, exportRetailersExcel, exportRetailersPdf, createRetailer } from '../api/retailers';
import RetailerFormModal from '../components/retailer/RetailerFormModal';
import Pagination from '../components/ui/Pagination';
import { TableSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import { TierBadge, OnlineBadge, ActiveBadge } from '../components/ui/Badges';

const PAGE_SIZES = [10, 25, 50];

const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatMoney = (value) => {
  if (value === null || value === undefined) return '₹0';
  return `₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

const SortableHeader = ({ label, sortKey, sortBy, sortDir, onSort }) => {
  const active = sortBy === sortKey;
  return (
    <th
      className={active ? 'sortable active' : 'sortable'}
      onClick={() => onSort(sortKey)}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        {label}
        {active && (sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
      </span>
    </th>
  );
};

const Retailers = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({ content: [], totalElements: 0, totalPages: 0, page: 0, size: 10 });
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [tier, setTier] = useState('');
  const [city, setCity] = useState('');
  const [activeStatus, setActiveStatus] = useState('');
  const [onlineStatus, setOnlineStatus] = useState('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sortBy, setSortBy] = useState('id');
  const [sortDir, setSortDir] = useState('asc');

  const [showCreate, setShowCreate] = useState(false);
  const [createBusy, setCreateBusy] = useState(false);
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchRetailers({
        search,
        tier,
        city,
        activeStatus,
        onlineStatus,
        page,
        size,
        sortBy,
        sortDir,
      });
      setData(res);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load retailers.');
    } finally {
      setLoading(false);
    }
  }, [search, tier, city, activeStatus, onlineStatus, page, size, sortBy, sortDir]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    fetchCities().then(setCities).catch(() => {});
  }, []);

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortDir('asc');
    }
    setPage(0);
  };

  const resetFilters = () => {
    setSearch('');
    setTier('');
    setCity('');
    setActiveStatus('');
    setOnlineStatus('');
    setPage(0);
  };

  const hasFilters = search || tier || city || activeStatus || onlineStatus;

  const handleCreate = async (values) => {
    setCreateBusy(true);
    try {
      await createRetailer(values);
      setShowCreate(false);
      setNotice('Retailer created successfully.');
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create retailer.');
    } finally {
      setCreateBusy(false);
    }
  };

  const totals = useMemo(() => {
    if (!data.content?.length) return null;
    return {
      orders: data.content.reduce((s, r) => s + (r.totalOrders || 0), 0),
      purchase: data.content.reduce((s, r) => s + (Number(r.totalPurchaseAmount) || 0), 0),
    };
  }, [data.content]);

  return (
    <AdminLayout title="Retailers" subtitle="Manage all registered retailers and their business history" activeKey="retailers">
      {/* Toolbar */}
      <div className="table-toolbar animate-fade-in">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name, mobile, shop or GST..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
          />
        </div>
        <select value={tier} onChange={(e) => { setTier(e.target.value); setPage(0); }}>
          <option value="">All Tiers</option>
          {['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'].map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select value={city} onChange={(e) => { setCity(e.target.value); setPage(0); }}>
          <option value="">All Cities</option>
          {cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select value={activeStatus} onChange={(e) => { setActiveStatus(e.target.value); setPage(0); }}>
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <select value={onlineStatus} onChange={(e) => { setOnlineStatus(e.target.value); setPage(0); }}>
          <option value="">All Presence</option>
          <option value="ONLINE">Online</option>
          <option value="OFFLINE">Offline</option>
        </select>
        <div className="export-group">
          <button className="btn btn-export" title="Export to Excel" onClick={() => exportRetailersExcel().catch(() => {})}>
            <FileSpreadsheet size={16} /> Excel
          </button>
          <button className="btn btn-export" title="Export to PDF" onClick={() => exportRetailersPdf().catch(() => {})}>
            <FileText size={16} /> PDF
          </button>
          <button className="btn btn-primary btn-add" style={{ width: 'auto', borderRadius: 'var(--radius-md)', padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => setShowCreate(true)}>
            <UserPlus size={16} /> Add Retailer
          </button>
        </div>
      </div>

      {notice && (
        <div className="notice-banner" onClick={() => setNotice('')}>
          {notice}
        </div>
      )}

      {hasFilters && (
        <div className="filter-chips">
          <span className="chip-label">Active filters:</span>
          {search && <span className="chip">Search: {search}</span>}
          {tier && <span className="chip">Tier: {tier}</span>}
          {city && <span className="chip">City: {city}</span>}
          {activeStatus && <span className="chip">{activeStatus === 'true' ? 'Active' : 'Inactive'}</span>}
          {onlineStatus && <span className="chip">{onlineStatus === 'ONLINE' ? 'Online' : 'Offline'}</span>}
          <button className="chip-clear" onClick={resetFilters}>Clear all</button>
        </div>
      )}

      {totals && (
        <div className="mini-stats">
          <span><Store size={14} /> {data.totalElements} retailers</span>
          <span><IndianRupee size={14} /> {formatMoney(totals.purchase)} total shown</span>
          <span><ShoppingCart size={14} /> {totals.orders} orders shown</span>
        </div>
      )}

      {error && <ErrorState message={error} onRetry={load} />}

      <div className="table-card animate-fade-in">
        {loading ? (
          <TableSkeleton rows={size} columns={13} />
        ) : data.content.length === 0 ? (
          <EmptyState
            title="No retailers found"
            message="Try adjusting the search or filters, or check back later."
            action={<button className="btn btn-outline" onClick={resetFilters} style={{ width: 'auto' }}><RefreshCw size={16} style={{ marginRight: 6 }} /> Reset filters</button>}
          />
        ) : (
          <>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <SortableHeader label="Retailer" sortKey="name" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                    <th>Shop Name</th>
                    <th>Mobile</th>
                    <SortableHeader label="City" sortKey="city" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                    <th>GST No.</th>
                    <SortableHeader label="Tier" sortKey="tier" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                    <th>Reward Points</th>
                    <th>Total Orders</th>
                    <th>Total Purchase</th>
                    <th>Last Order</th>
                    <th>Status</th>
                    <th>Online</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.content.map((r) => (
                    <tr key={r.id} className="row-hover" onClick={() => navigate(`/retailers/${r.id}`)}>
                      <td>
                        <div className="retailer-cell">
                          <div className="avatar" style={{ background: '#eff6ff', color: 'var(--primary)' }}>
                            {r.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="retailer-name">{r.name}</span>
                            <span className="retailer-sub">{r.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>{r.shopName || '—'}</td>
                      <td>{r.mobileNumber}</td>
                      <td>{r.city || '—'}</td>
                      <td className="mono">{r.gstNumber || '—'}</td>
                      <td><TierBadge tier={r.tier} /></td>
                      <td><span className="points-badge">{r.rewardPoints ?? 0}</span></td>
                      <td>{r.totalOrders ?? 0}</td>
                      <td className="amount">{formatMoney(r.totalPurchaseAmount)}</td>
                      <td>{formatDate(r.lastOrderDate)}</td>
                      <td><ActiveBadge active={r.isActive} /></td>
                      <td><OnlineBadge status={r.onlineStatus} /></td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn-view"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/retailers/${r.id}`);
                          }}
                        >
                          <Eye size={15} /> View Details
                        </button>
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

      <RetailerFormModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onConfirm={handleCreate}
        busy={createBusy}
      />
    </AdminLayout>
  );
};

export default Retailers;
