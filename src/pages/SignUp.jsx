import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function SignUp() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [form, setForm] = useState({
    display_name: '',
    username:     '',
    email:        '',
    password:     '',
    confirm:      '',
  });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const errs = {};
    if (!form.display_name) errs.display_name = 'Display name is required.';
    if (!form.username)     errs.username     = 'Username is required.';
    if (!form.email)        errs.email        = 'Email is required.';
    if (!form.password)     errs.password     = 'Password is required.';
    if (form.password.length < 8) errs.password = 'Must be at least 8 characters.';
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) return setErrors(errs);

    setLoading(true);
    try {
      const res = await register({
        display_name: form.display_name,
        username:     form.username,
        email:        form.email,
        password:     form.password,
      });
      signIn(res.data.user, res.data.token);
      navigate('/verify-email');
    } catch (err) {
      const apiErr = err.response?.data?.error;
      if (apiErr?.fields) {
        setErrors(apiErr.fields);
      } else {
        setErrors({ general: apiErr?.message || 'Something went wrong.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>HG</div>
        <h1 style={styles.title}>Join HiddenGem</h1>
        <p style={styles.subtitle}>Discover and share authentic local experiences</p>

        {errors.general && <p style={styles.errorBanner}>{errors.general}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <Field label="Full Name"    name="display_name" type="text"     value={form.display_name} onChange={handleChange} error={errors.display_name} placeholder="Enter your full name" />
          <Field label="Username"     name="username"     type="text"     value={form.username}     onChange={handleChange} error={errors.username}     placeholder="e.g. explorer_jane" />
          <Field label="Email"        name="email"        type="email"    value={form.email}        onChange={handleChange} error={errors.email}        placeholder="Enter your email" />
          <Field label="Password"     name="password"     type="password" value={form.password}     onChange={handleChange} error={errors.password}     placeholder="At least 8 characters" />
          <Field label="Confirm Password" name="confirm"  type="password" value={form.confirm}      onChange={handleChange} error={errors.confirm}      placeholder="Repeat your password" />

          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{' '}
          <Link to="/signin" style={styles.link}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, name, type, value, onChange, error, placeholder }) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      <input
        name={name} type={type} value={value}
        onChange={onChange} placeholder={placeholder}
        style={{ ...styles.input, ...(error ? styles.inputError : {}) }}
      />
      {error && <p style={styles.error}>{error}</p>}
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
  error:       { fontSize: '12px', color: '#EF4444', margin: '0' },
  errorBanner: { background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '6px', padding: '10px 14px', fontSize: '13px', color: '#B91C1C', marginBottom: '16px' },
  btn:         { height: '44px', background: '#1A9E6E', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', marginTop: '8px' },
  footer:      { textAlign: 'center', fontSize: '13px', color: '#6B7280', marginTop: '20px' },
  link:        { color: '#1A9E6E', textDecoration: 'none', fontWeight: '500' },
};