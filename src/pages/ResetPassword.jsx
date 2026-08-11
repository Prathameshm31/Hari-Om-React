import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import api from '../api/client';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const resetToken = location.state?.resetToken || '';

  const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!resetToken) {
      navigate('/forgot-password', { replace: true });
    }
  }, [resetToken, navigate]);

  const validate = () => {
    const newErrors = {};
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters long';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) setErrors((prev) => ({ ...prev, [id]: '' }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.post('/auth/reset-password', {
        resetToken,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });
      setSuccess(res.data.message);
      setTimeout(() => navigate('/login', { replace: true }), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset your password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card animate-fade-in">
        <div className="auth-header">
          <img className="logo-image" src="/IMG_0600.png" alt="Hari Om Enterprises" />
          <h2 className="auth-title">Set a New Password</h2>
          <p className="auth-subtitle">Choose a strong new password for your account.</p>
        </div>

        {error && (
          <div className="text-error" style={{ marginBottom: '1rem', textAlign: 'center', background: '#fef2f2', padding: '0.5rem', borderRadius: '0.25rem' }}>
            {error}
          </div>
        )}

        {success && (
          <div className="text-success" style={{ marginBottom: '1rem', textAlign: 'center', background: '#f0fdf4', padding: '0.75rem', borderRadius: '0.25rem', fontWeight: '500' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input
            id="newPassword"
            type="password"
            label="New Password"
            placeholder="Enter a new password (min 8 characters)"
            value={formData.newPassword}
            onChange={handleChange}
            error={errors.newPassword}
          />

          <Input
            id="confirmPassword"
            type="password"
            label="Confirm New Password"
            placeholder="Re-enter your new password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
          />

          <Button type="submit" isLoading={isLoading} style={{ marginBottom: '1.5rem' }}>
            Reset Password
          </Button>

          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '500', textDecoration: 'none' }}>
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;