import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createGem } from '../api/gems';
import client from '../api/client';

const CATEGORIES = ['Nature', 'Food', 'Art', 'Architecture', 'Historic', 'Other'];

export default function Create() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({
    name:           '',
    description:    '',
    category:       '',
    location_label: '',
    latitude:       '',
    longitude:      '',
    privacy:        'public',
    tagInput:       '',
    tags:           [],
  });
  const [photos, setPhotos]   = useState([]);
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  if (!user) {
    navigate('/signin');
    return null;
  }

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

  const handlePhoto = async (e) => {
    const file = e.target.files[0];
    if (!file || photos.length >= 3) return;

    setUploading(true);
    try {
      const data = new FormData();
      data.append('file', file);
      const res = await client.post('/uploads/photo', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPhotos(prev => [...prev, { url: res.data.url, preview: URL.createObjectURL(file) }]);
    } catch (err) {
      setErrors({ ...errors, photo: 'Upload failed. Try again.' });
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm(prev => ({
          ...prev,
          latitude:  pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
          location_label: prev.location_label || 'My current location',
        }));
      },
      () => setErrors({ ...errors, location: 'Could not get location.' })
    );
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim())        errs.name        = 'Name is required.';
    if (!form.description.trim()) errs.description = 'Description is required.';
    if (!form.category)           errs.category    = 'Category is required.';
    if (!form.latitude || !form.longitude) errs.location = 'Location is required.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) return setErrors(errs);

    setLoading(true);
    try {
      const res = await createGem({
        name:           form.name.trim(),
        description:    form.description.trim(),
        category:       form.category,
        latitude:       Number(form.latitude),
        longitude:      Number(form.longitude),
        location_label: form.location_label.trim(),
        privacy:        form.privacy,
        tags:           form.tags,
        photos:         photos.map(p => ({ url: p.url })),
      });
      navigate(`/gems/${res.data.gemID}`);
    } catch (err) {
      const apiErr = err.response?.data?.error;
      setErrors({ general: apiErr?.message || 'Something went wrong.' });
    } finally {
      setLoading(false);
    }
  };

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
          <span style={styles.navLinkActive}>Create</span>
        </div>
      </nav>

      <div style={styles.container}>
        <h1 style={styles.pageTitle}>Share a Hidden Gem</h1>

        {errors.general && (
          <div style={styles.errorBanner}>{errors.general}</div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>

          {/* PHOTOS */}
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Photos <span style={styles.optional}>(up to 3)</span></div>
            <div style={styles.photoRow}>
              {photos.map((p, i) => (
                <div key={i} style={styles.photoThumb}>
                  <img src={p.preview} alt="" style={styles.thumbImg} />
                  <button type="button" style={styles.removePhoto} onClick={() => removePhoto(i)}>×</button>
                </div>
              ))}
              {photos.length < 3 && (
                <label style={styles.photoUpload}>
                  {uploading ? '⏳' : '+'}
                  <input type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
                </label>
              )}
            </div>
            {errors.photo && <p style={styles.error}>{errors.photo}</p>}
          </div>

          {/* NAME */}
          <div style={styles.field}>
            <label style={styles.label}>Gem Name *</label>
            <input
              name="name" value={form.name} onChange={handleChange}
              placeholder="Give your hidden gem a name"
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
                  onClick={() => { setForm({ ...form, category: cat }); setErrors({ ...errors, category: '' }); }}
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
              placeholder="Describe this hidden gem — what makes it special, how to find it, best time to visit..."
              style={{ ...styles.textarea, ...(errors.description ? styles.inputError : {}) }}
              rows={5}
            />
            <div style={styles.charCount}>{form.description.length} / 300</div>
            {errors.description && <p style={styles.error}>{errors.description}</p>}
          </div>

          {/* LOCATION */}
          <div style={styles.field}>
            <label style={styles.label}>Location *</label>
            <input
              name="location_label" value={form.location_label} onChange={handleChange}
              placeholder="e.g. Forest Park, St. Louis"
              style={styles.input}
            />
            <div style={styles.coordRow}>
              <input
                name="latitude" value={form.latitude} onChange={handleChange}
                placeholder="Latitude"
                style={{ ...styles.input, ...(errors.location ? styles.inputError : {}) }}
              />
              <input
                name="longitude" value={form.longitude} onChange={handleChange}
                placeholder="Longitude"
                style={{ ...styles.input, ...(errors.location ? styles.inputError : {}) }}
              />
              <button type="button" style={styles.locationBtn} onClick={useMyLocation}>
                📍 Use my location
              </button>
            </div>
            {errors.location && <p style={styles.error}>{errors.location}</p>}
            <p style={styles.hint}>Click "Use my location" or enter coordinates manually.</p>
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

          {/* SUBMIT */}
          <div style={styles.submitRow}>
            <button type="button" style={styles.cancelBtn} onClick={() => navigate('/discover')}>
              Cancel
            </button>
            <button type="submit" style={styles.submitBtn} disabled={loading}>
              {loading ? 'Publishing...' : 'Publish Hidden Gem'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

const styles = {
  page:          { minHeight: '100vh', background: '#F9FAFB', fontFamily: 'system-ui, sans-serif' },
  nav:           { height: '56px', background: 'white', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', position: 'sticky', top: 0, zIndex: 10 },
  navLeft:       { display: 'flex', alignItems: 'center', gap: '10px' },
  logo:          { width: '32px', height: '32px', background: '#1A9E6E', borderRadius: '6px', color: 'white', fontWeight: '700', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  navBrand:      { fontWeight: '600', fontSize: '15px', color: '#111827' },
  navLinks:      { display: 'flex', gap: '24px' },
  navLink:       { fontSize: '14px', color: '#6B7280', cursor: 'pointer' },
  navLinkActive: { fontSize: '14px', color: '#1A9E6E', fontWeight: '500', cursor: 'pointer' },
  container:     { maxWidth: '680px', margin: '0 auto', padding: '32px 24px' },
  pageTitle:     { fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '24px' },
  errorBanner:   { background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px 16px', fontSize: '13px', color: '#B91C1C', marginBottom: '20px' },
  form:          { display: 'flex', flexDirection: 'column', gap: '24px' },
  section:       { background: 'white', borderRadius: '12px', padding: '20px' },
  sectionTitle:  { fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '12px' },
  optional:      { fontWeight: '400', color: '#9CA3AF', fontSize: '12px' },
  photoRow:      { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  photoThumb:    { width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', position: 'relative' },
  thumbImg:      { width: '100%', height: '100%', objectFit: 'cover' },
  removePhoto:   { position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,.5)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  photoUpload:   { width: '80px', height: '80px', border: '2px dashed #E5E7EB', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: '#9CA3AF', cursor: 'pointer' },
  field:         { background: 'white', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' },
  label:         { fontSize: '13px', fontWeight: '600', color: '#111827' },
  input:         { height: '42px', border: '1px solid #E5E7EB', borderRadius: '6px', padding: '0 12px', fontSize: '14px', outline: 'none' },
  inputError:    { borderColor: '#EF4444' },
  textarea:      { border: '1px solid #E5E7EB', borderRadius: '6px', padding: '10px 12px', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'system-ui, sans-serif' },
  charCount:     { fontSize: '11px', color: '#9CA3AF', textAlign: 'right' },
  error:         { fontSize: '12px', color: '#EF4444', margin: 0 },
  hint:          { fontSize: '12px', color: '#9CA3AF', margin: 0 },
  categoryGrid:  { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' },
  catBtn:        { padding: '10px', border: '1px solid #E5E7EB', borderRadius: '8px', background: 'white', fontSize: '13px', color: '#6B7280', cursor: 'pointer' },
  catBtnActive:  { background: '#E8F5F0', borderColor: '#1A9E6E', color: '#1A9E6E', fontWeight: '500' },
  coordRow:      { display: 'flex', gap: '8px', alignItems: 'center' },
  locationBtn:   { height: '42px', background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: '6px', padding: '0 12px', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap' },
  tagInput:      { display: 'flex', flexWrap: 'wrap', gap: '6px', border: '1px solid #E5E7EB', borderRadius: '6px', padding: '8px 10px', minHeight: '42px', alignItems: 'center' },
  tagPill:       { background: '#E8F5F0', color: '#1A9E6E', fontSize: '12px', fontWeight: '500', padding: '3px 8px', borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: '4px' },
  tagRemove:     { background: 'none', border: 'none', color: '#1A9E6E', cursor: 'pointer', fontSize: '14px', padding: 0, lineHeight: 1 },
  tagTextInput:  { border: 'none', outline: 'none', fontSize: '13px', color: '#374151', minWidth: '100px', flex: 1 },
  radioGroup:    { display: 'flex', flexDirection: 'column', gap: '10px' },
  radio:         { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#374151', cursor: 'pointer' },
  submitRow:     { display: 'flex', gap: '12px', justifyContent: 'flex-end' },
  cancelBtn:     { height: '44px', background: 'white', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '0 20px', fontSize: '14px', color: '#374151', cursor: 'pointer' },
  submitBtn:     { height: '44px', background: '#1A9E6E', color: 'white', border: 'none', borderRadius: '8px', padding: '0 24px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
};