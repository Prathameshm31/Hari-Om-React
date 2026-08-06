import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import { ToastProvider } from './components/ui/Toast';

import Login from './pages/Login';
import Register from './pages/Register';
import OtpVerification from './pages/OtpVerification';
import Dashboard from './pages/Dashboard';
import MyAccount from './pages/MyAccount';
import MyOrders from './pages/MyOrders';
import CreateOrder from './pages/CreateOrder';
import AdminDashboard from './pages/AdminDashboard';
import Retailers from './pages/Retailers';
import RetailerDetail from './pages/RetailerDetail';
import OrderRequests from './pages/OrderRequests';
import OrderRequestDetail from './pages/OrderRequestDetail';
import './styles/retailer.css';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<OtpVerification />} />

            <Route element={<ProtectedRoute allowedRoles={['USER', 'ADMIN']} />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/my-account" element={<MyAccount />} />
              <Route path="/orders" element={<MyOrders />} />
              <Route path="/orders/new" element={<CreateOrder />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/retailers" element={<Retailers />} />
              <Route path="/retailers/:id" element={<RetailerDetail />} />
              <Route path="/order-requests" element={<OrderRequests />} />
              <Route path="/order-requests/:orderId" element={<OrderRequestDetail />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
