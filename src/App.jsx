import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './routes/ProtectedRoute';
import { ToastProvider } from './components/ui/Toast';

import Login from './pages/Login';
import Register from './pages/Register';
import OtpVerification from './pages/OtpVerification';
import Dashboard from './pages/Dashboard';
import MyAccount from './pages/MyAccount';
import Profile from './pages/Profile';
import MyOrders from './pages/MyOrders';
import CreateOrder from './pages/CreateOrder';
import AdminDashboard from './pages/AdminDashboard';
import Retailers from './pages/Retailers';
import RetailerDetail from './pages/RetailerDetail';
import OrderRequests from './pages/OrderRequests';
import OrderRequestDetail from './pages/OrderRequestDetail';
import MyRewards from './pages/MyRewards';
import RewardDetail from './pages/RewardDetail';
import MyTeam from './pages/MyTeam';
import AdminRewards from './pages/AdminRewards';
import AdminTeams from './pages/AdminTeams';
import AdminTeamDetail from './pages/AdminTeamDetail';
import AdminProducts from './pages/AdminProducts';
import './styles/retailer.css';
import './styles/rewards.css';
import './styles/notifications.css';
import './styles/products.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <NotificationProvider>
            <Router>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-otp" element={<OtpVerification />} />

                <Route element={<ProtectedRoute allowedRoles={['USER', 'ADMIN']} />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/my-account" element={<MyAccount />} />
                  <Route path="/my-profile" element={<Profile />} />
                  <Route path="/orders" element={<MyOrders />} />
                  <Route path="/orders/new" element={<CreateOrder />} />
                  <Route path="/my-rewards" element={<MyRewards />} />
                  <Route path="/my-rewards/:id" element={<RewardDetail />} />
                  <Route path="/my-team" element={<MyTeam />} />
                </Route>

                <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/retailers" element={<Retailers />} />
                  <Route path="/retailers/:id" element={<RetailerDetail />} />
                  <Route path="/order-requests" element={<OrderRequests />} />
                  <Route path="/order-requests/:orderId" element={<OrderRequestDetail />} />
                  <Route path="/rewards" element={<AdminRewards />} />
                  <Route path="/teams" element={<AdminTeams />} />
                  <Route path="/teams/:id" element={<AdminTeamDetail />} />
                  <Route path="/products" element={<AdminProducts />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Router>
          </NotificationProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
