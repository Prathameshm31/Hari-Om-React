import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import TopRetailers from '../components/dashboard/TopRetailers';
import DashboardStats from '../components/dashboard/DashboardStats';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import RecentActivities from '../components/dashboard/RecentActivities';
import RecentOrderRequests from '../components/dashboard/RecentOrderRequests';
import AdminRewardsWidget from '../components/rewards/AdminRewardsWidget';
import { fetchDashboardStats, fetchRecentTransactions, fetchRecentActivities } from '../api/retailers';
import { fetchTeamLeaderboard } from '../api/teams';
import { Trophy } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [recentTx, setRecentTx] = useState([]);
  const [txLoading, setTxLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);

  const loadStats = async () => {
    try {
      setStats(await fetchDashboardStats());
    } catch { /* ignore */ } finally {
      setStatsLoading(false);
    }
  };

  const loadRecentTx = async () => {
    setTxLoading(true);
    try {
      setRecentTx(await fetchRecentTransactions(6));
    } catch { /* ignore */ } finally {
      setTxLoading(false);
    }
  };

  const loadActivities = async () => {
    setActivityLoading(true);
    try {
      setActivities(await fetchRecentActivities(6));
    } catch { /* ignore */ } finally {
      setActivityLoading(false);
    }
  };

  const loadLeaderboard = async () => {
    setLeaderboardLoading(true);
    try {
      setLeaderboard(await fetchTeamLeaderboard());
    } catch (err) {
      console.log('No leaderboard');
    } finally {
      setLeaderboardLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    loadRecentTx();
    loadActivities();
    loadLeaderboard();
  }, []);

  return (
    <AdminLayout title="Admin Dashboard" subtitle="Overview of retailers, orders and reward activity" activeKey="dashboard">
      <DashboardStats stats={stats} loading={statsLoading} />

      <section className="section">
        <div className="dashboard-split">
          <div className="table-card">
            <TopRetailers />
          </div>
          <div className="dashboard-right">
            <RecentOrderRequests />
            <div style={{ marginTop: '1.5rem' }}>
              <AdminRewardsWidget />
            </div>
          </div>
        </div>

        <div className="dashboard-split" style={{ marginTop: '1.5rem' }}>
          <div className="table-card" style={{ flex: 1 }}>
            <div className="section-heading" style={{ marginBottom: '0.75rem', padding: '1rem 1.5rem 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Trophy size={20} style={{ color: '#eab308' }} />
                <h3>Team Leaderboard</h3>
              </div>
            </div>
            {leaderboardLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading leaderboard...</div>
            ) : leaderboard.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No teams yet.</div>
            ) : (
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Team Name</th>
                      <th>Leader</th>
                      <th>Members</th>
                      <th>Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.slice(0, 5).map((t, idx) => (
                      <tr key={t.id}>
                        <td style={{ fontWeight: 'bold', color: idx === 0 ? '#eab308' : idx === 1 ? '#94a3b8' : idx === 2 ? '#b45309' : 'inherit' }}>
                          #{t.rank || idx + 1}
                        </td>
                        <td style={{ fontWeight: '500' }}>{t.teamName}</td>
                        <td>{t.leaderName || '—'}</td>
                        <td>{t.totalMembers || 0}</td>
                        <td className="amount">{t.teamPoints || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className="dashboard-right" style={{ flex: 1 }}>
            <RecentTransactions data={recentTx} loading={txLoading} onRefresh={loadRecentTx} />
          </div>
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <RecentActivities data={activities} loading={activityLoading} onRefresh={loadActivities} />
        </div>
      </section>
    </AdminLayout>
  );
};

export default AdminDashboard;
