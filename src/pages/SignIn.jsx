import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function SignIn() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [form, setForm]     = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      return setErrors({ general: 'Email and password are required.' });
    }

    setLoading(true);
    try {
      const res = await login({ email: form.email, password: form.password });
      signIn(res.data.user, res.data.token);
      navigate('/discover');
    } catch (err) {
      const apiErr = err.response?.data?.error;
      setErrors({ general: apiErr?.message || 'Something went wrong.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>HG</div>
        <h1 style={styles.title}>Welcome back</h1>
        <p style={styles.subtitle}>Sign in to your HiddenGem account</p>

        {errors.general && <p style={styles.errorBanner}>{errors.general}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              name="email" type="email" value={form.email}
              onChange={handleChange} placeholder="Enter your email"
              style={{ ...styles.input, ...(errors.email ? styles.inputError : {}) }}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              name="password" type="password" value={form.password}
              onChange={handleChange} placeholder="Enter your password"
              style={{ ...styles.input, ...(errors.password ? styles.inputError : {}) }}
            />
          </div>

          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account?{' '}
          <Link to="/signup" style={styles.link}>Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page:        { minHeight: '100vh', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' },
  card:        { background: 'white', borderRadius: '12px', padding: '40px', width: '100%', maxWidth: '440px', boxShadow: '0 1px 3px rgba(0,0,0,.08)' },
  logo:        { width: '40px', height: '40px', background: '#1A9E6E', borderRadius: '8px', color: 'white', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' },
  title:       { textAlign: 'center', fontSize: '22px', fontWeight: '700', color: '#111827', margin: '0 0 4px' },
  subtitle:    { textAlign: 'center', fontSize: '13px', color: '#6B7280', margin: '0 0 24px' },
  form:        { display: 'flex', flexDirection: 'column', gap: '16px' },
  field:       { display: 'flex', flexDirection: 'column', gap: '6px' },
  label:       { fontSize: '13px', fontWeight: '500', color: '#374151' },
  input:       { height: '42px', border: '1px solid #E5E7EB', borderRadius: '4px', padding: '0 12px', fontSize: '14px', outline: 'none' },
  inputError:  { borderColor: '#EF4444' },
  errorBanner: { background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '6px', padding: '10px 14px', fontSize: '13px', color: '#B91C1C', marginBottom: '16px' },
  btn:         { height: '44px', background: '#1A9E6E', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', marginTop: '8px' },
  footer:      { textAlign: 'center', fontSize: '13px', color: '#6B7280', marginTop: '20px' },
  link:        { color: '#1A9E6E', textDecoration: 'none', fontWeight: '500' },
};