import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus, Trash2, Search, IndianRupee, UserPlus } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { fetchTeams, createTeam, deleteTeam } from '../api/teams';
import { TableSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import { useToast } from '../components/ui/Toast';
import Modal from '../components/ui/Modal';
import ConfirmModal from '../components/ui/ConfirmModal';
import { ActiveBadge } from '../components/ui/Badges';
import Input from '../components/Input';
import Button from '../components/Button';

const formatMoney = (value) => {
  if (value === null || value === undefined) return '₹0';
  return `₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

const AdminTeams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({ teamName: '', teamDescription: '' });

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadTeams = async () => {
    setLoading(true);
    try {
      const data = await fetchTeams();
      setTeams(data.content || data);
    } catch (err) {
      toast('Failed to load teams', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, []);

  const filteredTeams = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return teams;
    return teams.filter(
      (t) =>
        t.teamName?.toLowerCase().includes(q) ||
        t.leaderName?.toLowerCase().includes(q) ||
        String(t.teamCode || '').toLowerCase().includes(q)
    );
  }, [teams, search]);

  const totals = useMemo(() => {
    if (!teams.length) return null;
    return {
      members: teams.reduce((s, t) => s + (t.totalMembers || 0), 0),
      points: teams.reduce((s, t) => s + (t.teamPoints || 0), 0),
    };
  }, [teams]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteTeam(deleteTarget);
      toast('Team deleted successfully', 'success');
      setDeleteTarget(null);
      loadTeams();
    } catch (err) {
      toast('Failed to delete team', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!formData.teamName.trim()) return toast('Team name is required', 'error');

    setCreating(true);
    try {
      await createTeam(formData);
      toast('Team created successfully', 'success');
      setIsModalOpen(false);
      setFormData({ teamName: '', teamDescription: '' });
      loadTeams();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to create team', 'error');
    } finally {
      setCreating(false);
    }
  };

  return (
    <AdminLayout title="Team Management" subtitle="Manage retailer teams, members and their progress" activeKey="teams">
      <div className="table-toolbar animate-fade-in">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by team name, leader or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="export-group">
          <button
            className="btn btn-primary btn-add"
            style={{ width: 'auto', borderRadius: 'var(--radius-md)', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={16} /> Create New Team
          </button>
        </div>
      </div>

      {totals && (
        <div className="mini-stats">
          <span><Users size={14} /> {teams.length} teams</span>
          <span><UserPlus size={14} /> {totals.members} total members</span>
          <span><IndianRupee size={14} /> {formatMoney(totals.points)} points in circulation</span>
        </div>
      )}

      <div className="table-card animate-fade-in" style={{ marginTop: '1rem' }}>
        {loading ? (
          <TableSkeleton rows={6} columns={7} />
        ) : filteredTeams.length === 0 ? (
          <EmptyState
            title={teams.length === 0 ? 'No teams found' : 'No matching teams'}
            message={
              teams.length === 0
                ? 'Create your first team to group retailers and track their performance.'
                : 'Try adjusting your search to find the team you are looking for.'
            }
            action={
              <button className="btn btn-outline" onClick={() => setIsModalOpen(true)} style={{ width: 'auto' }}>
                <Plus size={16} style={{ marginRight: 6 }} /> Create New Team
              </button>
            }
          />
        ) : (
          <>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Team Name</th>
                    <th>Leader</th>
                    <th>Members</th>
                    <th>Total Points</th>
                    <th>Rank</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeams.map((t) => (
                    <tr key={t.id}>
                      <td>
                        <div className="retailer-cell">
                          <div className="avatar" style={{ background: '#eff6ff', color: 'var(--primary)' }}>
                            {t.teamName?.charAt(0).toUpperCase() || 'T'}
                          </div>
                          <div>
                            <Link to={`/teams/${t.id}`} className="retailer-name team-name-link">
                              {t.teamName}
                            </Link>
                            <span className="retailer-sub">{t.teamCode || '—'}</span>
                          </div>
                        </div>
                      </td>
                      <td>{t.leaderName || 'Unassigned'}</td>
                      <td>{t.totalMembers || 0}</td>
                      <td><span className="points-badge">{t.teamPoints || 0}</span></td>
                      <td>{t.rank ? `#${t.rank}` : 'N/A'}</td>
                      <td><ActiveBadge active={t.status === 'ACTIVE'} /></td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn-view"
                          title="Delete team"
                          onClick={() => setDeleteTarget(t.id)}
                          style={{ color: 'var(--error)', background: '#fef2f2' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="table-footer">
              <div className="page-size">
                <span>Showing {filteredTeams.length} of {teams.length} teams</span>
              </div>
            </div>
          </>
        )}
      </div>

      <Modal
        open={isModalOpen}
        onClose={() => !creating && setIsModalOpen(false)}
        title="Create New Team"
        width={520}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={creating} style={{ width: 'auto' }}>
              Cancel
            </Button>
            <Button type="submit" form="create-team-form" isLoading={creating} style={{ width: 'auto' }}>
              Create Team
            </Button>
          </>
        }
      >
        <form id="create-team-form" onSubmit={handleCreateTeam} className="action-form">
          <div className="form-note">
            Create a new team to group retailers together. You can assign members and leader after the team is created.
          </div>
          <div className="form-grid">
            <Input
              label="Team Name"
              id="team-name"
              value={formData.teamName}
              onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
              placeholder="Enter team name"
              style={{ gridColumn: 'span 2' }}
              required
            />
            <div className="input-group" style={{ gridColumn: 'span 2' }}>
              <label className="input-label" htmlFor="team-desc">Description</label>
              <textarea
                id="team-desc"
                className="input-field"
                rows={3}
                value={formData.teamDescription}
                onChange={(e) => setFormData({ ...formData, teamDescription: e.target.value })}
                placeholder="Brief description about this team"
              />
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => !deleting && setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Team"
        message={`Are you sure you want to delete "${teams.find((t) => t.id === deleteTarget)?.teamName || 'this team'}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        busy={deleting}
      />
    </AdminLayout>
  );
};

export default AdminTeams;
