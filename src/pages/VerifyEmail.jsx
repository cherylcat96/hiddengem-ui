import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('pending');
      return;
    }

    api.get(`/auth/verify-email?token=${token}`)
      .then(() => setStatus('success'))
      .catch((err) => {
        setMessage(err.response?.data?.error?.message || 'Verification failed. The link may have expired.');
        setStatus('error');
      });
  }, [searchParams]);

  // Auto-redirect to discover after success
  useEffect(() => {
    if (status !== 'success') return;
    if (countdown === 0) {
      navigate('/discover');
      return;
    }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [status, countdown, navigate]);

  if (!status) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
        <h2>Verifying your email...</h2>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
        <h2 style={{ marginBottom: '0.5rem' }}>Check your email!</h2>
        <p style={{ color: '#666', marginBottom: '2rem', maxWidth: '400px' }}>
          We sent a verification link to your email address. Click the link to activate your account.
        </p>
        <Link to="/signin" style={{ color: '#2d6a4f', textDecoration: 'underline' }}>
          Already verified? Sign in
        </Link>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💎</div>
        <h2 style={{ marginBottom: '0.5rem' }}>Email Verified!</h2>
        <p style={{ color: '#666', marginBottom: '0.5rem' }}>Your account is now active. Start discovering hidden gems!</p>
        <p style={{ color: '#999', marginBottom: '2rem', fontSize: '0.875rem' }}>
          Redirecting in {countdown} second{countdown !== 1 ? 's' : ''}...
        </p>
        <Link to="/discover" style={{ backgroundColor: '#2d6a4f', color: 'white', padding: '0.75rem 2rem', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>
          Go to Discover now
        </Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
      <h2 style={{ marginBottom: '0.5rem' }}>Verification Failed</h2>
      <p style={{ color: '#666', marginBottom: '2rem' }}>{message}</p>
      <Link to="/signup" style={{ backgroundColor: '#2d6a4f', color: 'white', padding: '0.75rem 2rem', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>
        Back to Sign Up
      </Link>
    </div>
  );
}