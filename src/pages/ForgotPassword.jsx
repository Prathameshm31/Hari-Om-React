import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import api from '../api/client';

const OTP_LENGTH = 6;
const OTP_DURATION_SECONDS = 300;
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_RESENDS = 3;

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [stage, setStage] = useState('request');
  const [timeLeft, setTimeLeft] = useState(OTP_DURATION_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [inputError, setInputError] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const inputsRef = useRef([]);

  useEffect(() => {
    if (stage !== 'otp') return;
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, stage]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const validateIdentifier = () => {
    if (!identifier.trim()) {
      setInputError('Please enter your registered email or mobile number.');
      return false;
    }
    return true;
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!validateIdentifier()) return;

    setIsLoading(true);
    setError('');
    setInfo('');

    try {
      await api.post('/auth/forgot-password', { emailOrMobile: identifier.trim() });
      setStage('otp');
      setTimeLeft(OTP_DURATION_SECONDS);
      setCanResend(false);
      setResendCount(0);
      setInfo('If an account exists for this email/mobile number, a password reset OTP has been sent to your registered email.');
      setOtp(Array(OTP_LENGTH).fill(''));
      setTimeout(() => inputsRef.current[0]?.focus(), 100);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
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

  const handleVerifyOtp = async () => {
    const otpValue = otp.join('');
    if (otpValue.length < OTP_LENGTH) {
      setError('Please enter the 6-digit OTP.');
      return;
    }

    setIsLoading(true);
    setError('');
    setInfo('');

    try {
      const res = await api.post('/auth/verify-forgot-password-otp', {
        emailOrMobile: identifier.trim(),
        otp: otpValue,
      });
      const resetToken = res.data.resetToken;
      navigate('/reset-password', { state: { resetToken } });
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || isLoading) return;
    if (resendCount >= MAX_RESENDS) {
      setError('Maximum OTP resend attempts reached. Please try again later.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await api.post('/auth/forgot-password', { emailOrMobile: identifier.trim() });
      setResendCount((prev) => prev + 1);
      setOtp(Array(OTP_LENGTH).fill(''));
      setTimeLeft(OTP_DURATION_SECONDS);
      setCanResend(false);
      setInfo('A new OTP has been sent to your registered email.');
      inputsRef.current[0]?.focus();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend the OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeIdentifier = (e) => {
    setIdentifier(e.target.value);
    if (inputError) setInputError('');
    if (error) setError('');
  };

  const resendInSeconds = RESEND_COOLDOWN_SECONDS - (OTP_DURATION_SECONDS - timeLeft);

  return (
    <div className="auth-layout">
      <div className="auth-card animate-fade-in">
        <div className="auth-header">
          <img className="logo-image" src="/IMG_0600.png" alt="Hari Om Enterprises" />
          <h2 className="auth-title">Forgot Password</h2>
          <p className="auth-subtitle">
            {stage === 'request'
              ? 'Enter your registered email or mobile number and we will send you a one-time password to reset your account.'
              : `A password reset OTP has been sent to your registered email for ${identifier}.`}
          </p>
        </div>

        {error && (
          <div className="text-error" style={{ marginBottom: '1rem', textAlign: 'center', background: '#fef2f2', padding: '0.5rem', borderRadius: '0.25rem' }}>
            {error}
          </div>
        )}

        {info && (
          <div className="text-success" style={{ marginBottom: '1rem', textAlign: 'center', background: '#f0fdf4', padding: '0.75rem', borderRadius: '0.25rem', fontWeight: '500' }}>
            {info}
          </div>
        )}

        {stage === 'request' ? (
          <form onSubmit={handleSendOtp}>
            <Input
              id="identifier"
              type="text"
              label="Email or Mobile Number"
              placeholder="Enter your registered email or mobile"
              value={identifier}
              onChange={handleChangeIdentifier}
              error={inputError}
            />

            <Button type="submit" isLoading={isLoading} style={{ marginBottom: '1.5rem' }}>
              Send OTP
            </Button>

            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
              Remembered your password?{' '}
              <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '500', textDecoration: 'none' }}>
                Back to Login
              </Link>
            </div>
          </form>
        ) : (
          <>
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

            <Button type="button" onClick={handleVerifyOtp} isLoading={isLoading} style={{ marginBottom: '1rem' }}>
              Verify OTP
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleResend}
              disabled={!canResend || isLoading || resendCount >= MAX_RESENDS}
              style={{ marginBottom: '1.5rem', width: '100%', justifyContent: 'center' }}
            >
              {resendCount >= MAX_RESENDS
                ? 'Maximum resends reached'
                : canResend
                  ? 'Resend OTP'
                  : `Resend OTP in ${formatTime(Math.max(resendInSeconds, 0))}`}
            </Button>

            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
              <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '500', textDecoration: 'none' }}>
                Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;