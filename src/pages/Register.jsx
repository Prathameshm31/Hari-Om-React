import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import api from '../api/client';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^[0-9]{10}$/; // Basic 10 digit validation

    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    
    if (!formData.mobile) {
      newErrors.mobile = 'Mobile Number is required';
    } else if (!mobileRegex.test(formData.mobile)) {
      newErrors.mobile = 'Enter a valid 10-digit mobile number';
    }

    if (!formData.email) {
      newErrors.email = 'Email Address is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsLoading(true);
    setRegisterError('');

    try {
      await api.post('/auth/register-request', {
        fullName: formData.fullName,
        companyName: formData.companyName,
        mobileNumber: formData.mobile,
        email: formData.email,
        password: formData.password
      });

      navigate(`/verify-otp?email=${encodeURIComponent(formData.email)}`);

    } catch (error) {
      setRegisterError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    // Clear error when user types
    if (errors[id]) setErrors(prev => ({ ...prev, [id]: '' }));
    if (registerError) setRegisterError('');
  };

  return (
    <div className="auth-layout" style={{ padding: '2rem 1rem' }}>
      <div className="auth-card animate-fade-in" style={{ maxWidth: '600px' }}>
        <div className="auth-header">
          <img className="logo-image" src="/IMG_0600.png" alt="Hari Om Enterprises" />
          <h2 className="auth-title">Create an Account</h2>
          <p className="auth-subtitle">Join us to manage your enterprise</p>
        </div>

        {registerError && (
          <div className="text-error" style={{ marginBottom: '1.5rem', textAlign: 'center', background: '#fef2f2', padding: '0.5rem', borderRadius: '0.25rem' }}>
            {registerError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <Input 
                  id="fullName"
                  type="text"
                  label="Full Name"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  error={errors.fullName}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <Input 
                  id="companyName"
                  type="text"
                  label="Company Name (Optional)"
                  placeholder="Enter your company name"
                  value={formData.companyName}
                  onChange={handleChange}
                />
              </div>

              <Input 
                id="mobile"
                type="tel"
                label="Mobile Number"
                placeholder="10-digit number"
                value={formData.mobile}
                onChange={handleChange}
                error={errors.mobile}
              />

              <Input 
                id="email"
                type="email"
                label="Email Address"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
              />

              <Input 
                id="password"
                type="password"
                label="Password"
                placeholder="Min 8 characters"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
              />

              <Input 
                id="confirmPassword"
                type="password"
                label="Confirm Password"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
              />
            </div>

            <Button type="submit" isLoading={isLoading} style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
              Register
            </Button>

            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '500', textDecoration: 'none' }}>
                Login here
              </Link>
            </div>
          </form>
      </div>
    </div>
  );
};

export default Register;
