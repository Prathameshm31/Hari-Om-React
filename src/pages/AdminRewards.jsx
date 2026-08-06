import React, { useCallback, useEffect, useState } from 'react';
import { useToast } from '../components/ui/Toast';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Power,
  Gift,
  IndianRupee,
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import {
  fetchAdminRewards,
  fetchAdminRewardStats,
  createAdminReward,
  updateAdminReward,
  deleteAdminReward,
  toggleAdminRewardStatus,
} from '../api/rewards';
import RewardFormModal from '../components/rewards/RewardFormModal';
import ConfirmModal from '../components/ui/ConfirmModal';
import Pagination from '../components/ui/Pagination';
import { TableSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';

const PAGE_SIZES = [10, 25, 50];

const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
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

const AdminRewards = () => {
  const { toast } = useToast();

  const [data, setData] = useState({ content: [], totalElements: 0, totalPages: 0, page: 0, size: 10 });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formBusy, setFormBusy] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchAdminRewards({ search, status, page, size });
      setData(res);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load rewards.');
    } finally {
      setLoading(false);
    }
  }, [search, status, page, size]);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      setStats(await fetchAdminRewardStats());
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

  const handleCreate = async (values) => {
    setFormBusy(true);
    try {
      await createAdminReward(values);
      setShowForm(false);
      toast('Reward created successfully.', 'success');
      load();
      loadStats();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to create reward.', 'error');
    } finally {
      setFormBusy(false);
    }
  };

  const handleEdit = async (values) => {
    setFormBusy(true);
    try {
      await updateAdminReward(editing.id, values);
      setShowForm(false);
      setEditing(null);
      toast('Reward updated successfully.', 'success');
      load();
      loadStats();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to update reward.', 'error');
    } finally {
      setFormBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    try {
      await deleteAdminReward(deleteTarget.id);
      toast('Reward deleted.', 'success');
      setDeleteTarget(null);
      load();
      loadStats();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to delete reward.', 'error');
    } finally {
      setDeleteBusy(false);
    }
  };

  const handleToggle = async (reward) => {
    setTogglingId(reward.id);
    try {
      await toggleAdminRewardStatus(reward.id);
      toast(`Reward ${reward.status === 'ACTIVE' ? 'deactivated' : 'activated'}.`, 'success');
      load();
      loadStats();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to update status.', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  const s = stats || {};

  return (
    <AdminLayout title="Rewards" subtitle="Manage the reward catalog and redemption program" activeKey="rewards">
      <div className="stats-grid animate-fade-in">
        <StatCard label="Total Rewards" value={statsLoading ? '—' : s.totalRewards ?? 0} icon={Gift} cls="primary" />
        <StatCard label="Active Rewards" value={statsLoading ? '—' : s.activeRewards ?? 0} icon={Gift} cls="success" />
        <StatCard label="Eligible Rewards" value={statsLoading ? '—' : s.rewardsPending ?? 0} icon={Power} cls="secondary" />
        <StatCard label="Claimed Rewards" value={statsLoading ? '—' : s.claimedRewards ?? 0} icon={IndianRupee} cls="info" />
      </div>

      {s.mostPopularReward && (
        <div className="notice-banner" style={{ marginTop: '1rem' }}>
          <Gift size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
          Most popular reward: <strong>{s.mostPopularReward}</strong>
        </div>
      )}

      <div className="table-toolbar animate-fade-in" style={{ marginTop: '1rem' }}>
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by reward name or category..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          />
        </div>
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
            <Plus size={16} /> Add Reward
          </button>
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={load} />}

      <div className="table-card animate-fade-in" style={{ marginTop: '1rem' }}>
        {loading ? (
          <TableSkeleton rows={size} columns={7} />
        ) : data.content.length === 0 ? (
          <EmptyState
            title="No rewards found"
            message="Try adjusting the search or filters, or create a new reward."
            action={
              <button className="btn btn-outline" onClick={() => { setEditing(null); setShowForm(true); }} style={{ width: 'auto' }}>
                <Plus size={16} style={{ marginRight: 6 }} /> Add Reward
              </button>
            }
          />
        ) : (
          <>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Reward</th>
                    <th>Category</th>
                    <th>Required Points</th>
                    <th>Value</th>
                    <th>Validity</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.content.map((r) => (
                    <tr key={r.id} className="row-hover" onClick={() => { setEditing(r); setShowForm(true); }}>
                      <td>
                        <div className="retailer-cell">
                          <div className="avatar" style={{ background: '#fff7ed', color: 'var(--secondary)' }}>
                            {r.rewardName?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="retailer-name">{r.rewardName}</span>
                            <span className="retailer-sub">{r.createdBy || '—'}</span>
                          </div>
                        </div>
                      </td>
                      <td>{r.category || '—'}</td>
                      <td><span className="points-badge">{r.requiredPoints}</span></td>
                      <td className="amount">{r.rewardValue != null ? `₹${Number(r.rewardValue).toLocaleString('en-IN')}` : '—'}</td>
                      <td>
                        {r.startDate || r.endDate
                          ? `${formatDate(r.startDate)} → ${formatDate(r.endDate)}`
                          : 'Always'}
                      </td>
                      <td>
                        <span className={`status-pill ${r.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
                          {r.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="action-btn-group">
                          <button className="btn-view" title="Edit" onClick={(e) => { e.stopPropagation(); setEditing(r); setShowForm(true); }}>
                            <Pencil size={15} />
                          </button>
                          <button className="btn-view" title={r.status === 'ACTIVE' ? 'Deactivate' : 'Activate'} disabled={togglingId === r.id} onClick={(e) => { e.stopPropagation(); handleToggle(r); }}>
                            <Power size={15} />
                          </button>
                          <button className="btn-view danger" title="Delete" onClick={(e) => { e.stopPropagation(); setDeleteTarget(r); }}>
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

      <RewardFormModal
        open={showForm}
        onClose={() => { setShowForm(false); setEditing(null); }}
        onConfirm={editing ? handleEdit : handleCreate}
        busy={formBusy}
        initial={editing}
      />

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete this reward?"
        message={`"${deleteTarget?.rewardName}" will be removed from the catalog and hidden from retailers. This action can be reversed by re-adding the reward.`}
        confirmLabel="Delete Reward"
        busy={deleteBusy}
      />
    </AdminLayout>
  );
};

export default AdminRewards;
