import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/client';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('No verification token found. Please check your email link.');
      return;
    }

    api.get(`/auth/verify-email?token=${token}`)
      .then(() => {
        setStatus('success');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.error?.message || 'Verification failed. The link may have expired.');
      });
  }, []);

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '2rem'
    }}>
      {status === 'verifying' && (
        <>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <h2>Verifying your email...</h2>
        </>
      )}

      {status === 'success' && (
        <>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💎</div>
          <h2 style={{ marginBottom: '0.5rem' }}>Email Verified!</h2>
          <p style={{ color: '#666', marginBottom: '2rem' }}>
            Your account is now active. Start discovering hidden gems!
          </p>
          <Link
            to="/discover"
            style={{
              backgroundColor: '#2d6a4f',
              color: 'white',
              padding: '0.75rem 2rem',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600'
            }}
          >
            Go to Discover
          </Link>
        </>
      )}

      {status === 'error' && (
        <>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
          <h2 style={{ marginBottom: '0.5rem' }}>Verification Failed</h2>
          <p style={{ color: '#666', marginBottom: '2rem' }}>{message}</p>
          <Link
            to="/signup"
            style={{
              backgroundColor: '#2d6a4f',
              color: 'white',
              padding: '0.75rem 2rem',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600'
            }}
          >
            Back to Sign Up
          </Link>
        </>
      )}
    </div>
  );
}