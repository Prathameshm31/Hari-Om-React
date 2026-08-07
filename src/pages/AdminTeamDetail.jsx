import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Users, Award, Shield, Trash2, Crown, UserPlus, Coins } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { fetchTeam, removeTeamMember, addTeamMember, updateTeam, addTeamPoints, fetchUnassignedRetailers } from '../api/teams';
import { TableSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import { useToast } from '../components/ui/Toast';
import Modal from '../components/ui/Modal';
import ConfirmModal from '../components/ui/ConfirmModal';
import Button from '../components/Button';
import api from '../api/client';

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

const AdminTeamDetail = () => {
  const { id } = useParams();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Members');
  const { toast } = useToast();

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignRetailers, setAssignRetailers] = useState([]);
  const [assignRetailersLoading, setAssignRetailersLoading] = useState(false);
  const [assignRetailerId, setAssignRetailerId] = useState('');
  const [assigning, setAssigning] = useState(false);

  const [pointsModalOpen, setPointsModalOpen] = useState(false);
  const [pointsForm, setPointsForm] = useState({ points: '', reason: '' });
  const [pointsSubmitting, setPointsSubmitting] = useState(false);

  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  const [confirmAction, setConfirmAction] = useState(null);
  const [actionBusy, setActionBusy] = useState(false);

  const loadTeam = async () => {
    setLoading(true);
    try {
      const data = await fetchTeam(id);
      setTeam(data);
    } catch (err) {
      toast('Failed to load team details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    setTransactionsLoading(true);
    try {
      const { data } = await api.get(`/admin/teams/${id}/transactions`);
      setTransactions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setTransactionsLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'Points' && team) {
      loadTransactions();
    }
  }, [activeTab, team]);

  const openAssignModal = async () => {
    setAssignModalOpen(true);
    setAssignRetailerId('');
    setAssignRetailersLoading(true);
    try {
      setAssignRetailers(await fetchUnassignedRetailers());
    } catch {
      setAssignRetailers([]);
      toast('Failed to load unassigned retailers', 'error');
    } finally {
      setAssignRetailersLoading(false);
    }
  };

  const handleAssignMember = async (e) => {
    e.preventDefault();
    if (!assignRetailerId) return;
    setAssigning(true);
    try {
      await addTeamMember(id, [Number(assignRetailerId)]);
      toast('Member assigned', 'success');
      setAssignModalOpen(false);
      setAssignRetailerId('');
      loadTeam();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to assign member', 'error');
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!confirmAction?.retailerId) return;
    setActionBusy(true);
    try {
      await removeTeamMember(id, confirmAction.retailerId);
      toast('Member removed', 'success');
      setConfirmAction(null);
      loadTeam();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to remove member', 'error');
    } finally {
      setActionBusy(false);
    }
  };

  const handleMakeLeader = async () => {
    if (!confirmAction?.retailerId) return;
    setActionBusy(true);
    try {
      await updateTeam(id, {
        teamName: team.teamName,
        teamDescription: team.teamDescription,
        leaderId: confirmAction.retailerId
      });
      toast('Leader updated', 'success');
      setConfirmAction(null);
      loadTeam();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to update leader', 'error');
    } finally {
      setActionBusy(false);
    }
  };

  const handleAddPoints = async (e) => {
    e.preventDefault();
    if (!pointsForm.points || !pointsForm.reason) return toast('All fields required', 'error');
    setPointsSubmitting(true);
    try {
      await addTeamPoints(id, {
        points: Number(pointsForm.points),
        reason: pointsForm.reason
      });
      toast('Points updated successfully', 'success');
      setPointsModalOpen(false);
      setPointsForm({ points: '', reason: '' });
      loadTeam();
      loadTransactions();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to update points', 'error');
    } finally {
      setPointsSubmitting(false);
    }
  };

  if (loading) return <AdminLayout title="Team Details" activeKey="teams"><TableSkeleton rows={6} columns={4} /></AdminLayout>;
  if (!team) return <AdminLayout title="Team Not Found" activeKey="teams"><div>Team not found.</div></AdminLayout>;

  return (
    <AdminLayout title={team.teamName} subtitle="Team details and management" activeKey="teams">
      <div className="stats-grid animate-fade-in">
        <StatCard label="Total Points" value={team.teamPoints || 0} icon={Award} cls="primary" />
        <StatCard label="Rank" value={team.rank ? `#${team.rank}` : 'N/A'} icon={Shield} cls="info" />
        <StatCard label="Members" value={team.totalMembers || 0} icon={Users} cls="success" />
      </div>

      <div className="tabs">
        {['Members', 'Points'].map((tab) => (
          <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Members' && (
        <div className="table-card animate-fade-in">
          <div className="card-header">
            <h4>Team Members</h4>
            <button className="btn btn-primary btn-add" style={{ width: 'auto', borderRadius: 'var(--radius-md)', padding: '0.45rem 0.9rem', fontSize: '0.8rem' }} onClick={openAssignModal}>
              <UserPlus size={15} /> Assign Retailer
            </button>
          </div>
          <div className="table-scroll">
            {(team.members || []).length === 0 ? (
              <EmptyState
                title="No members yet"
                message="Assign retailers to this team to start tracking their progress."
                action={
                  <button className="btn btn-outline" onClick={openAssignModal} style={{ width: 'auto' }}>
                    <UserPlus size={16} style={{ marginRight: 6 }} /> Assign Retailer
                  </button>
                }
              />
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Retailer</th>
                    <th>Role</th>
                    <th>Joined Date</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(team.members || []).map((m) => (
                    <tr key={m.id}>
                      <td>
                        <div className="retailer-cell">
                          <div className="avatar" style={{ background: m.isLeader ? '#fef3c7' : '#eff6ff', color: m.isLeader ? '#92400e' : 'var(--primary)' }}>
                            {m.retailerName?.charAt(0).toUpperCase() || 'R'}
                          </div>
                          <div>
                            <Link to={`/retailers/${m.retailerId}`} className="retailer-name team-name-link">
                              {m.retailerName}
                            </Link>
                            <span className="retailer-sub">#{m.retailerId}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        {m.isLeader ? (
                          <span className="dot-badge" style={{ background: '#fef3c7', color: '#92400e' }}>
                            <Crown size={12} /> Leader
                          </span>
                        ) : (
                          <span className="dot-badge neutral">Member</span>
                        )}
                      </td>
                      <td>{formatDate(m.joinedDate)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="action-btn-group" style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                          {!m.isLeader && (
                            <button className="btn-view" title="Make Leader" onClick={() => setConfirmAction({ type: 'makeLeader', retailerId: m.retailerId, name: m.retailerName })}>
                              <Crown size={15} />
                            </button>
                          )}
                          <button
                            className="btn-view"
                            title="Remove from team"
                            onClick={() => setConfirmAction({ type: 'removeMember', retailerId: m.retailerId, name: m.retailerName })}
                            style={{ color: 'var(--error)', background: '#fef2f2' }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {activeTab === 'Points' && (
        <div className="table-card animate-fade-in">
          <div className="card-header">
            <h4>Point Transactions</h4>
            <button className="btn btn-primary btn-add" style={{ width: 'auto', borderRadius: 'var(--radius-md)', padding: '0.45rem 0.9rem', fontSize: '0.8rem' }} onClick={() => setPointsModalOpen(true)}>
              <Coins size={15} /> Add / Deduct Points
            </button>
          </div>

          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Reason</th>
                  <th>Points</th>
                  <th>By</th>
                </tr>
              </thead>
              <tbody>
                {transactionsLoading ? (
                  <tr><td colSpan={4}><TableSkeleton rows={3} columns={4} /></td></tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <div className="table-empty">No point transactions found for this team yet.</div>
                    </td>
                  </tr>
                ) : (
                  transactions.map((t) => (
                    <tr key={t.id}>
                      <td>{formatDate(t.dateTime)}</td>
                      <td>{t.reason}</td>
                      <td>
                        <span className={t.difference > 0 ? 'text-pos' : 'text-neg'}>
                          {t.difference > 0 ? `+${t.difference}` : t.difference}
                        </span>
                      </td>
                      <td>{t.updatedBy}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={assignModalOpen}
        onClose={() => !assigning && setAssignModalOpen(false)}
        title="Assign Retailer"
        width={520}
        footer={
          <>
            <Button variant="outline" onClick={() => setAssignModalOpen(false)} disabled={assigning} style={{ width: 'auto' }}>Cancel</Button>
            <Button type="submit" form="assign-member-form" isLoading={assigning} style={{ width: 'auto' }}>Assign Member</Button>
          </>
        }
      >
        <form id="assign-member-form" onSubmit={handleAssignMember} className="action-form">
          <div className="form-note">
            Select an unassigned retailer to add them to this team. A retailer can only belong to one team at a time.
          </div>
          <div className="input-group">
            <label className="input-label" htmlFor="assign-retailer">Select Retailer *</label>
            <select
              id="assign-retailer"
              className="input-field"
              value={assignRetailerId}
              onChange={(e) => setAssignRetailerId(e.target.value)}
              disabled={assigning || assignRetailersLoading}
              required
            >
              <option value="">{assignRetailersLoading ? 'Loading retailers...' : '-- Select a retailer --'}</option>
              {assignRetailers.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name || r.shopName}{r.city ? ` (${r.city})` : ''} — #{r.id}
                </option>
              ))}
            </select>
            {!assignRetailersLoading && assignRetailers.length === 0 && (
              <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                No unassigned retailers available.
              </p>
            )}
          </div>
        </form>
      </Modal>

      <Modal
        open={pointsModalOpen}
        onClose={() => !pointsSubmitting && setPointsModalOpen(false)}
        title="Add / Deduct Points"
        width={520}
        footer={
          <>
            <Button variant="outline" onClick={() => setPointsModalOpen(false)} disabled={pointsSubmitting} style={{ width: 'auto' }}>Cancel</Button>
            <Button type="submit" form="points-form" isLoading={pointsSubmitting} style={{ width: 'auto' }}>Save</Button>
          </>
        }
      >
        <form id="points-form" onSubmit={handleAddPoints} className="action-form">
          <div className="form-note">
            Use a positive value to award points and a negative value to deduct points from this team.
          </div>
          <div className="form-grid">
            <div className="input-group" style={{ gridColumn: 'span 1' }}>
              <label className="input-label" htmlFor="points-value">Points *</label>
              <input
                id="points-value"
                className="input-field"
                type="number"
                value={pointsForm.points}
                onChange={(e) => setPointsForm({ ...pointsForm, points: e.target.value })}
                placeholder="e.g. 100 or -50"
                disabled={pointsSubmitting}
                required
              />
            </div>
            <div className="input-group" style={{ gridColumn: 'span 1' }}>
              <label className="input-label" htmlFor="points-reason">Reason *</label>
              <input
                id="points-reason"
                className="input-field"
                type="text"
                value={pointsForm.reason}
                onChange={(e) => setPointsForm({ ...pointsForm, reason: e.target.value })}
                placeholder="Reason for adjustment"
                disabled={pointsSubmitting}
                required
              />
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!confirmAction}
        onClose={() => !actionBusy && setConfirmAction(null)}
        onConfirm={confirmAction?.type === 'removeMember' ? handleRemoveMember : handleMakeLeader}
        title={confirmAction?.type === 'removeMember' ? 'Remove Member' : 'Make Team Leader'}
        message={
          confirmAction?.type === 'removeMember'
            ? `Are you sure you want to remove "${confirmAction?.name}" from this team?`
            : `Make "${confirmAction?.name}" the leader of this team?`
        }
        confirmLabel={confirmAction?.type === 'removeMember' ? 'Remove' : 'Make Leader'}
        variant={confirmAction?.type === 'removeMember' ? 'danger' : 'primary'}
        busy={actionBusy}
      />
    </AdminLayout>
  );
};

export default AdminTeamDetail;
