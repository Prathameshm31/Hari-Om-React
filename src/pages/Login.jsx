import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import api from '../api/client';

const Login = () => {
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!formData.identifier) newErrors.identifier = 'Email or Mobile Number is required';
    if (!formData.password) newErrors.password = 'Password is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsLoading(true);
    setLoginError('');

    try {
      const response = await api.post('/auth/login', {
        emailOrMobile: formData.identifier,
        password: formData.password
      });

      const { token, user } = response.data;
      login(user, token);
      navigate('/');
    } catch (error) {
      setLoginError(error.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    // Clear error when user types
    if (errors[id]) setErrors(prev => ({ ...prev, [id]: '' }));
    if (loginError) setLoginError('');
  };

  return (
    <div className="auth-layout">
      <div className="auth-card animate-fade-in">
        <div className="auth-header">
          <h1 className="auth-logo">Hari Om <span>Enterprises</span></h1>
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Please sign in to your account</p>
        </div>

        {loginError && <div className="text-error" style={{ marginBottom: '1rem', textAlign: 'center', background: '#fef2f2', padding: '0.5rem', borderRadius: '0.25rem' }}>{loginError}</div>}

        <form onSubmit={handleSubmit}>
          <Input 
            id="identifier"
            type="text"
            label="Email or Mobile Number"
            placeholder="Enter your email or mobile"
            value={formData.identifier}
            onChange={handleChange}
            error={errors.identifier}
          />

          <Input 
            id="password"
            type="password"
            label="Password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
            <Button type="button" variant="text" style={{ fontSize: '0.875rem' }}>
              Forgot Password?
            </Button>
          </div>

          <Button type="submit" isLoading={isLoading} style={{ marginBottom: '1.5rem' }}>
            Login
          </Button>

          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '500', textDecoration: 'none' }}>
              Register here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
