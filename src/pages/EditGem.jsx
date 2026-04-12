import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getGem } from '../api/gems';
import client from '../api/client';

const CATEGORIES = ['Nature', 'Food', 'Art', 'Architecture', 'Historic', 'Other'];

export default function EditGem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({
    name: '', description: '', category: '',
    location_label: '', privacy: 'public',
    tagInput: '', tags: [],
  });
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errors, setErrors]     = useState({});
  const [stats, setStats]       = useState({ view_count: 0, save_count: 0 });

  useEffect(() => {
    fetchGem();
  }, [id]);

  const fetchGem = async () => {
    try {
      const res = await getGem(id);
      const gem = res.data;

      // Redirect if not owner
      if (user && gem.username !== user.username) {
        navigate(`/gems/${id}`);
        return;
      }

      setForm({
        name:           gem.name || '',
        description:    gem.description || '',
        category:       gem.category || '',
        location_label: gem.location_label || '',
        privacy:        gem.privacy || 'public',
        tagInput:       '',
        tags:           gem.tags || [],
      });
      setStats({
        view_count: gem.view_count || 0,
        save_count: gem.save_count || 0,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleTagKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = form.tagInput.trim().replace(/^#/, '');
      if (tag && !form.tags.includes(tag) && form.tags.length < 5) {
        setForm({ ...form, tags: [...form.tags, tag], tagInput: '' });
      }
    }
  };

  const removeTag = (tag) => {
    setForm({ ...form, tags: form.tags.filter(t => t !== tag) });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim())        return setErrors({ name: 'Name is required.' });
    if (!form.description.trim()) return setErrors({ description: 'Description is required.' });
    if (!form.category)           return setErrors({ category: 'Category is required.' });

    setSaving(true);
    try {
      await client.patch(`/gems/${id}`, {
        name:           form.name.trim(),
        description:    form.description.trim(),
        category:       form.category,
        location_label: form.location_label.trim(),
        privacy:        form.privacy,
        tags:           form.tags,
      });
      navigate(`/gems/${id}`);
    } catch (err) {
      const apiErr = err.response?.data?.error;
      setErrors({ general: apiErr?.message || 'Something went wrong.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this gem? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await client.delete(`/gems/${id}`);
      navigate(`/profile/${user.username}`);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.page}>

      {/* NAV */}
      <nav style={styles.nav}>
        <div style={styles.navLeft}>
          <div style={styles.logo}>HG</div>
          <span style={styles.navBrand}>HiddenGem</span>
        </div>
        <div style={styles.navLinks}>
          <span style={styles.navLink} onClick={() => navigate('/discover')}>Discover</span>
          <span style={styles.navLink} onClick={() => navigate(`/profile/${user?.username}`)}>Profile</span>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.header}>
          <button style={styles.back} onClick={() => navigate(`/gems/${id}`)}>← Back</button>
          <h1 style={styles.pageTitle}>Edit Gem</h1>
        </div>

        <div style={styles.layout}>

          {/* FORM */}
          <form onSubmit={handleSave} style={styles.form}>
            {errors.general && <div style={styles.errorBanner}>{errors.general}</div>}

            {/* NAME */}
            <div style={styles.field}>
              <label style={styles.label}>Gem Name *</label>
              <input
                name="name" value={form.name} onChange={handleChange}
                style={{ ...styles.input, ...(errors.name ? styles.inputError : {}) }}
              />
              {errors.name && <p style={styles.error}>{errors.name}</p>}
            </div>

            {/* CATEGORY */}
            <div style={styles.field}>
              <label style={styles.label}>Category *</label>
              <div style={styles.categoryGrid}>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat} type="button"
                    style={{ ...styles.catBtn, ...(form.category === cat ? styles.catBtnActive : {}) }}
                    onClick={() => setForm({ ...form, category: cat })}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              {errors.category && <p style={styles.error}>{errors.category}</p>}
            </div>

            {/* DESCRIPTION */}
            <div style={styles.field}>
              <label style={styles.label}>Description *</label>
              <textarea
                name="description" value={form.description} onChange={handleChange}
                style={{ ...styles.textarea, ...(errors.description ? styles.inputError : {}) }}
                rows={5}
              />
              <div style={styles.charCount}>{form.description.length} / 300</div>
              {errors.description && <p style={styles.error}>{errors.description}</p>}
            </div>

            {/* LOCATION */}
            <div style={styles.field}>
              <label style={styles.label}>Location label</label>
              <input
                name="location_label" value={form.location_label} onChange={handleChange}
                placeholder="e.g. Forest Park, St. Louis"
                style={styles.input}
              />
            </div>

            {/* TAGS */}
            <div style={styles.field}>
              <label style={styles.label}>Tags <span style={styles.optional}>(up to 5, press Enter)</span></label>
              <div style={styles.tagInput}>
                {form.tags.map(t => (
                  <span key={t} style={styles.tagPill}>
                    #{t}
                    <button type="button" style={styles.tagRemove} onClick={() => removeTag(t)}>×</button>
                  </span>
                ))}
                {form.tags.length < 5 && (
                  <input
                    name="tagInput" value={form.tagInput}
                    onChange={handleChange} onKeyDown={handleTagKey}
                    placeholder="Add a tag..."
                    style={styles.tagTextInput}
                  />
                )}
              </div>
            </div>

            {/* PRIVACY */}
            <div style={styles.field}>
              <label style={styles.label}>Privacy</label>
              <div style={styles.radioGroup}>
                <label style={styles.radio}>
                  <input type="radio" name="privacy" value="public" checked={form.privacy === 'public'} onChange={handleChange} />
                  Public — visible to everyone
                </label>
                <label style={styles.radio}>
                  <input type="radio" name="privacy" value="private" checked={form.privacy === 'private'} onChange={handleChange} />
                  Private — only you
                </label>
              </div>
            </div>

            {/* ACTIONS */}
            <div style={styles.actions}>
              <button
                type="button"
                style={styles.deleteBtn}
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Post'}
              </button>
              <div style={styles.rightActions}>
                <button type="button" style={styles.cancelBtn} onClick={() => navigate(`/gems/${id}`)}>
                  Cancel
                </button>
                <button type="submit" style={styles.saveBtn} disabled={saving}>
                  {saving ? 'Saving...' : 'Update Post'}
                </button>
              </div>
            </div>
          </form>

          {/* STATS SIDEBAR */}
          <div style={styles.sidebar}>
            <div style={styles.statsCard}>
              <div style={styles.statsTitle}>Post Statistics</div>
              <div style={styles.statRow}>
                <span style={styles.statLabel}>Views</span>
                <span style={styles.statValue}>{stats.view_count}</span>
              </div>
              <div style={styles.statRow}>
                <span style={styles.statLabel}>Saves</span>
                <span style={styles.statValue}>{stats.save_count}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

const styles = {
  page:         { minHeight: '100vh', background: '#F9FAFB', fontFamily: 'system-ui, sans-serif' },
  loading:      { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#9CA3AF' },
  nav:          { height: '56px', background: 'white', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', position: 'sticky', top: 0, zIndex: 10 },
  navLeft:      { display: 'flex', alignItems: 'center', gap: '10px' },
  logo:         { width: '32px', height: '32px', background: '#1A9E6E', borderRadius: '6px', color: 'white', fontWeight: '700', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  navBrand:     { fontWeight: '600', fontSize: '15px', color: '#111827' },
  navLinks:     { display: 'flex', gap: '24px' },
  navLink:      { fontSize: '14px', color: '#6B7280', cursor: 'pointer' },
  container:    { maxWidth: '900px', margin: '0 auto', padding: '32px 24px' },
  header:       { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' },
  back:         { background: 'none', border: 'none', color: '#6B7280', fontSize: '13px', cursor: 'pointer', padding: 0 },
  pageTitle:    { fontSize: '22px', fontWeight: '700', color: '#111827', margin: 0 },
  layout:       { display: 'flex', gap: '24px', alignItems: 'flex-start' },
  form:         { flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' },
  errorBanner:  { background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px 16px', fontSize: '13px', color: '#B91C1C' },
  field:        { background: 'white', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid #E5E7EB' },
  label:        { fontSize: '13px', fontWeight: '600', color: '#111827' },
  optional:     { fontWeight: '400', color: '#9CA3AF', fontSize: '12px' },
  input:        { height: '42px', border: '1px solid #E5E7EB', borderRadius: '6px', padding: '0 12px', fontSize: '14px', outline: 'none' },
  inputError:   { borderColor: '#EF4444' },
  textarea:     { border: '1px solid #E5E7EB', borderRadius: '6px', padding: '10px 12px', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'system-ui, sans-serif' },
  charCount:    { fontSize: '11px', color: '#9CA3AF', textAlign: 'right' },
  error:        { fontSize: '12px', color: '#EF4444', margin: 0 },
  categoryGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' },
  catBtn:       { padding: '10px', border: '1px solid #E5E7EB', borderRadius: '8px', background: 'white', fontSize: '13px', color: '#6B7280', cursor: 'pointer' },
  catBtnActive: { background: '#E8F5F0', borderColor: '#1A9E6E', color: '#1A9E6E', fontWeight: '500' },
  tagInput:     { display: 'flex', flexWrap: 'wrap', gap: '6px', border: '1px solid #E5E7EB', borderRadius: '6px', padding: '8px 10px', minHeight: '42px', alignItems: 'center' },
  tagPill:      { background: '#E8F5F0', color: '#1A9E6E', fontSize: '12px', fontWeight: '500', padding: '3px 8px', borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: '4px' },
  tagRemove:    { background: 'none', border: 'none', color: '#1A9E6E', cursor: 'pointer', fontSize: '14px', padding: 0, lineHeight: 1 },
  tagTextInput: { border: 'none', outline: 'none', fontSize: '13px', color: '#374151', minWidth: '100px', flex: 1 },
  radioGroup:   { display: 'flex', flexDirection: 'column', gap: '10px' },
  radio:        { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#374151', cursor: 'pointer' },
  actions:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px' },
  deleteBtn:    { height: '44px', background: 'white', border: '1px solid #EF4444', color: '#EF4444', borderRadius: '8px', padding: '0 20px', fontSize: '14px', cursor: 'pointer' },
  rightActions: { display: 'flex', gap: '12px' },
  cancelBtn:    { height: '44px', background: 'white', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '0 20px', fontSize: '14px', color: '#374151', cursor: 'pointer' },
  saveBtn:      { height: '44px', background: '#1A9E6E', color: 'white', border: 'none', borderRadius: '8px', padding: '0 24px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
  sidebar:      { width: '220px', flexShrink: 0 },
  statsCard:    { background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #E5E7EB' },
  statsTitle:   { fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '16px' },
  statRow:      { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F3F4F6' },
  statLabel:    { fontSize: '13px', color: '#6B7280' },
  statValue:    { fontSize: '13px', fontWeight: '600', color: '#111827' },
};