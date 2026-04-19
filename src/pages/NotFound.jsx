import { Link } from 'react-router-dom';

export default function NotFound() {
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
      <h1 style={{ fontSize: '6rem', margin: 0, color: '#2d6a4f' }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>This gem doesn't exist</h2>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        The page you're looking for has gone off the map.
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
        Back to Discover
      </Link>
    </div>
  );
}