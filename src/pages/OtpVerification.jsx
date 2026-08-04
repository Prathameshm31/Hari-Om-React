import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../components/Button';
import api from '../api/client';

const OTP_LENGTH = 6;
const OTP_DURATION_SECONDS = 300;
const RESEND_COOLDOWN_SECONDS = 60;

const OtpVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get('email') || '';

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [timeLeft, setTimeLeft] = useState(OTP_DURATION_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const inputsRef = useRef([]);

  useEffect(() => {
    if (!email) {
      navigate('/register', { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleOtpChange = (index, value) => {
    if (/^\d$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (index < OTP_LENGTH - 1) inputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!digits) return;
    e.preventDefault();
    const newOtp = Array(OTP_LENGTH).fill('');
    digits.split('').forEach((digit, i) => { newOtp[i] = digit; });
    setOtp(newOtp);
    inputsRef.current[Math.min(digits.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join('');
    if (otpValue.length < OTP_LENGTH) {
      setError('Please enter the 6-digit OTP.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.post('/auth/verify-registration-otp', { email, otp: otpValue });
      setSuccess(res.data.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || isLoading) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/auth/resend-registration-otp', { email });
      setOtp(Array(OTP_LENGTH).fill(''));
      setTimeLeft(OTP_DURATION_SECONDS);
      setCanResend(false);
      inputsRef.current[0]?.focus();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resendInSeconds = RESEND_COOLDOWN_SECONDS - (OTP_DURATION_SECONDS - timeLeft);

  return (
    <div className="auth-layout">
      <div className="auth-card animate-fade-in">
        <div className="auth-header">
          <h1 className="auth-logo">Hari Om <span>Enterprises</span></h1>
          <h2 className="auth-title">Verify OTP</h2>
          <p className="auth-subtitle">
            An approval OTP has been sent to the Hari Om admin for <strong>{email}</strong>.
            Please enter the OTP received from the admin to complete your registration.
          </p>
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

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.5rem',
            marginBottom: '1rem',
            marginTop: '0.5rem',
          }}
          onPaste={handleOtpPaste}
        >
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputsRef.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(index, e)}
              style={{
                width: '3rem',
                height: '3.25rem',
                textAlign: 'center',
                fontSize: '1.5rem',
                fontWeight: '600',
                borderRadius: 'var(--radius-lg)',
                border: `1px solid ${error ? 'var(--error)' : 'var(--border-color)'}`,
                outline: 'none',
                background: 'var(--bg-main)',
                color: 'var(--text-main)',
              }}
            />
          ))}
        </div>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          {timeLeft > 0 ? (
            <>OTP expires in <strong style={{ color: timeLeft <= 60 ? 'var(--error)' : 'var(--text-main)' }}>{formatTime(timeLeft)}</strong></>
          ) : (
            <>OTP has expired. Please request a new one.</>
          )}
        </div>

        <Button type="button" onClick={handleVerify} isLoading={isLoading} style={{ marginBottom: '1rem' }}>
          Verify OTP
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={handleResend}
          disabled={!canResend || isLoading}
          style={{ marginBottom: '1.5rem', width: '100%', justifyContent: 'center' }}
        >
          {canResend
            ? 'Resend OTP'
            : `Resend OTP in ${formatTime(Math.max(resendInSeconds, 0))}`}
        </Button>

        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
          Changed your mind?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '500', textDecoration: 'none' }}>
            Back to registration
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;
