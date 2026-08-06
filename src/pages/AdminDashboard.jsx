import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import TopRetailers from '../components/dashboard/TopRetailers';
import DashboardStats from '../components/dashboard/DashboardStats';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import RecentActivities from '../components/dashboard/RecentActivities';
import RecentOrderRequests from '../components/dashboard/RecentOrderRequests';
import AdminRewardsWidget from '../components/rewards/AdminRewardsWidget';
import { fetchDashboardStats, fetchRecentTransactions, fetchRecentActivities } from '../api/retailers';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [recentTx, setRecentTx] = useState([]);
  const [txLoading, setTxLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);

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

  useEffect(() => {
    loadStats();
    loadRecentTx();
    loadActivities();
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
