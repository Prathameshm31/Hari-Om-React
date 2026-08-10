import React, { useCallback, useEffect, useState } from 'react';
import { Users, Trophy, Target, UserCheck } from 'lucide-react';
import UserLayout from '../components/UserLayout';
import { fetchMyTeam } from '../api/teams';
import { Skeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';

const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const MyTeam = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setData(await fetchMyTeam());
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your team.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <UserLayout title="My Team" subtitle="Your team performance and members" activeKey="team">
        <div className="stats-grid"><Skeleton height={110} /><Skeleton height={110} /><Skeleton height={110} /></div>
        <div style={{ marginTop: '1.5rem' }}><Skeleton height={220} /></div>
      </UserLayout>
    );
  }

  if (error) {
    return (
      <UserLayout title="My Team" subtitle="Your team performance and members" activeKey="team">
        <ErrorState message={error} onRetry={load} />
      </UserLayout>
    );
  }

  const team = data?.team;

  if (!team) {
    return (
      <UserLayout title="My Team" subtitle="Your team performance and members" activeKey="team">
        <EmptyState
          title="Not assigned to a team"
          message="You are not part of any team yet. Contact the admin to get added to a team."
        />
      </UserLayout>
    );
  }

  const stats = [
    { label: 'Rank', value: team.rank ? `#${team.rank}` : '—', icon: Trophy, cls: 'primary' },
    { label: 'Team Points', value: team.teamPoints ?? 0, icon: Target, cls: 'success' },
    { label: 'Members', value: team.totalMembers ?? 0, icon: UserCheck, cls: 'info' },
  ];

  return (
    <UserLayout title="My Team" subtitle="Your team performance and members" activeKey="team">
      <div className="section-heading" style={{ marginTop: 0 }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--text-main)' }}>{team.teamName}</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {team.teamCode ? `${team.teamCode} · ` : ''}Leader: {team.leaderName || 'Unassigned'}
            {team.teamDescription ? ` · ${team.teamDescription}` : ''}
          </p>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div className="stat-card" key={s.label}>
              <div className="stat-info">
                <h3>{s.label}</h3>
                <p>{s.value}</p>
              </div>
              <div className={`stat-icon ${s.cls}`}><Icon size={24} /></div>
            </div>
          );
        })}
      </div>

      <div className="table-card animate-fade-in" style={{ marginTop: '1.5rem' }}>
        <div className="section-heading" style={{ marginBottom: '0.75rem', padding: '1.25rem 1.5rem 0' }}>
          <h3>Team Members</h3>
        </div>
        {data?.members?.length ? (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>City</th>
                  <th>Role</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {data.members.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <div className="retailer-cell">
                        <div className="avatar" style={{ background: '#eff6ff', color: 'var(--primary)' }}>
                          {m.retailerName?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <span className="retailer-name">{m.retailerName || '—'}</span>
                      </div>
                    </td>
                    <td>{m.city || '—'}</td>
                    <td>
                      {m.isLeader ? (
                        <span className="status-badge active"><Users size={12} style={{ marginRight: 4 }} /> Leader</span>
                      ) : (
                        <span className="text-muted">Member</span>
                      )}
                    </td>
                    <td>{formatDate(m.joinedDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '1rem' }}>
            <EmptyState message="No members in this team yet." />
          </div>
        )}
      </div>
    </UserLayout>
  );
};

export default MyTeam;
