import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGem } from '../api/gems';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

export default function GemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [gem, setGem]               = useState(null);
  const [comments, setComments]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [saved, setSaved]           = useState(false);
  const [saveCount, setSaveCount]   = useState(0);
  const [comment, setComment]       = useState('');
  const [posting, setPosting]       = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isMobile, setIsMobile]     = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchGem();
    fetchComments();
  }, [id]);

  useEffect(() => {
    if (!gem) return;
    if (window.google && window.google.maps) { initMap(); return; }
    const existing = document.querySelector(`script[src*="maps.googleapis"]`);
    if (existing) { existing.addEventListener('load', initMap); return; }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_KEY}`;
    script.async = true;
    script.onload = initMap;
    document.head.appendChild(script);
    return () => script.removeEventListener('load', initMap);
  }, [gem]);

  const initMap = () => {
    const mapEl = document.getElementById('gem-map');
    if (!mapEl || !gem) return;
    const map = new window.google.maps.Map(mapEl, {
      center: { lat: Number(gem.latitude), lng: Number(gem.longitude) },
      zoom: 15, mapTypeControl: false, streetViewControl: false, fullscreenControl: false,
    });
    new window.google.maps.Marker({
      position: { lat: Number(gem.latitude), lng: Number(gem.longitude) },
      map, title: gem.name,
    });
  };

  const fetchGem = async () => {
    try {
      const res = await getGem(id);
      setGem(res.data);
      setSaveCount(Number(res.data.save_count));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchComments = async () => {
    try {
      const res = await client.get(`/gems/${id}/comments`);
      setComments(res.data.comments);
    } catch (err) { console.error(err); }
  };

  const handleSave = async () => {
    if (!user) return navigate('/signin');
    try {
      if (saved) {
        await client.delete(`/gems/${id}/saves`);
        setSaved(false); setSaveCount(c => c - 1);
      } else {
        await client.post(`/gems/${id}/saves`);
        setSaved(true); setSaveCount(c => c + 1);
      }
    } catch (err) { console.error(err); }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/signin');
    if (!comment.trim()) return;
    setPosting(true);
    try {
      const res = await client.post(`/gems/${id}/comments`, { body: comment });
      setComments(prev => [...prev, res.data]);
      setComment('');
    } catch (err) { console.error(err); }
    finally { setPosting(false); }
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;
  if (!gem)    return <div style={styles.loading}>Gem not found.</div>;

  const TAG_COLORS = {
    Nature:       { bg: '#D1FAE5', fg: '#065F46' },
    Food:         { bg: '#FEF3C7', fg: '#92400E' },
    Art:          { bg: '#DBEAFE', fg: '#1E40AF' },
    Architecture: { bg: '#DBEAFE', fg: '#1E40AF' },
    Historic:     { bg: '#EDE9FE', fg: '#5B21B6' },
    Other:        { bg: '#F3F4F6', fg: '#374151' },
  };
  const colors = TAG_COLORS[gem.category] || TAG_COLORS.Other;

  return (
    <div style={styles.page}>

      {/* NAV */}
      <nav style={styles.nav}>
        <div style={styles.navLeft}>
          <div style={styles.logo}>HG</div>
          {!isMobile && <span style={styles.navBrand}>HiddenGem</span>}
        </div>
        <div style={styles.navLinks}>
          <span style={styles.navLink} onClick={() => navigate('/discover')}>Discover</span>
          <span style={styles.navLink} onClick={() => navigate('/create')}>Create</span>
          {user ? (
            <span style={styles.navLink} onClick={() => navigate(`/profile/${user.username}`)}>Profile</span>
          ) : (
            <span style={styles.navLink} onClick={() => navigate('/signin')}>Sign In</span>
          )}
        </div>
      </nav>

      <div style={{ ...styles.container, padding: isMobile ? '16px' : '24px' }}>

        <button style={styles.back} onClick={() => navigate('/discover')}>
          ← Back to Discover
        </button>

        <div style={{ ...styles.layout, flexDirection: isMobile ? 'column' : 'row' }}>

          {/* LEFT — main content */}
          <div style={styles.main}>

            {/* PHOTO */}
            <div style={{ ...styles.photo, background: colors.bg, height: isMobile ? '240px' : '360px' }}>
              {gem.photos && gem.photos.length > 0 ? (
                <>
                  <img src={gem.photos[photoIndex].url} alt={gem.name} style={styles.photoImg} />
                  {gem.photos.length > 1 && (
                    <div style={styles.photoDots}>
                      {gem.photos.map((_, i) => (
                        <div key={i} onClick={() => setPhotoIndex(i)}
                          style={{ ...styles.dot, ...(i === photoIndex ? styles.dotActive : {}) }} />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <span style={{ fontSize: '48px' }}>📍</span>
              )}
            </div>

            {/* CONTENT */}
            <div style={styles.content}>
              <div style={styles.metaRow}>
                <span style={{ ...styles.tag, background: colors.bg, color: colors.fg }}>{gem.category}</span>
                {gem.tags && gem.tags.map(t => (
                  <span key={t} style={styles.tagSecondary}>#{t}</span>
                ))}
              </div>
              <h1 style={{ ...styles.title, fontSize: isMobile ? '20px' : '24px' }}>{gem.name}</h1>
              <div style={styles.authorRow}>
                <div style={styles.avatar}>{gem.display_name?.[0] || '?'}</div>
                <div>
                  <div style={styles.authorName}>{gem.display_name}</div>
                  <div style={styles.authorMeta}>@{gem.username} · {new Date(gem.created_at).toLocaleDateString()}</div>
                </div>
              </div>
              {gem.location_label && <div style={styles.location}>📍 {gem.location_label}</div>}
              <p style={styles.description}>{gem.description}</p>
              <div style={{ ...styles.actionBar, flexWrap: 'wrap' }}>
                <button style={{ ...styles.actionBtn, ...(saved ? styles.actionBtnActive : {}) }} onClick={handleSave}>
                  {saved ? '🔖 Saved' : '🔖 Save'} · {saveCount}
                </button>
                <button style={styles.actionBtn}>💬 {comments.length}</button>
                <button style={styles.actionBtn} onClick={() => { navigator.clipboard.writeText(window.location.href); alert('Link copied!'); }}>
                  🔗 Share
                </button>
                {user && user.username === gem.username && (
                  <button style={{ ...styles.actionBtn, color: '#1A9E6E', borderColor: '#1A9E6E' }}
                    onClick={() => navigate(`/gems/${id}/edit`)}>
                    ✏️ Edit
                  </button>
                )}
              </div>
            </div>

            {/* MAP — show inline on mobile */}
            {isMobile && (
              <div style={styles.sideCard}>
                <div style={styles.sideCardTitle}>Location</div>
                <div id="gem-map" style={styles.mapContainer} />
                {gem.location_label && <p style={styles.sideLocation}>{gem.location_label}</p>}
                <p style={styles.sideCoords}>{Number(gem.latitude).toFixed(4)}, {Number(gem.longitude).toFixed(4)}</p>
              </div>
            )}

            {/* COMMENTS */}
            <div style={styles.commentsSection}>
              <h3 style={styles.commentsTitle}>Comments ({comments.length})</h3>
              {user && (
                <form onSubmit={handleComment} style={styles.commentForm}>
                  <div style={styles.avatar}>{user.display_name?.[0] || '?'}</div>
                  <input style={styles.commentInput} placeholder="Add a comment..."
                    value={comment} onChange={e => setComment(e.target.value)} />
                  <button type="submit" style={styles.commentBtn} disabled={posting || !comment.trim()}>
                    {posting ? '...' : 'Post'}
                  </button>
                </form>
              )}
              {comments.length === 0 ? (
                <p style={styles.noComments}>No comments yet. Be the first!</p>
              ) : (
                <div style={styles.commentList}>
                  {comments.map(c => (
                    <div key={c.commentID} style={styles.comment}>
                      <div style={styles.avatar}>{c.display_name?.[0] || '?'}</div>
                      <div style={styles.commentBody}>
                        <div style={styles.commentMeta}>
                          <span style={styles.commentAuthor}>
                            {c.display_name}
                            {c.is_author && <span style={styles.authorBadge}>Author</span>}
                          </span>
                          <span style={styles.commentTime}>{new Date(c.created_at).toLocaleDateString()}</span>
                        </div>
                        <p style={styles.commentText}>{c.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDEBAR — desktop only */}
          {!isMobile && (
            <div style={styles.sidebar}>
              <div style={styles.sideCard}>
                <div style={styles.sideCardTitle}>Location</div>
                <div style={styles.sideCardBody}>
                  <div id="gem-map" style={styles.mapContainer} />
                  {gem.location_label && <p style={styles.sideLocation}>{gem.location_label}</p>}
                  <p style={styles.sideCoords}>{Number(gem.latitude).toFixed(4)}, {Number(gem.longitude).toFixed(4)}</p>
                </div>
              </div>
              <div style={styles.sideCard}>
                <div style={styles.sideCardTitle}>Stats</div>
                <div style={styles.statRow}><span style={styles.statLabel}>Views</span><span style={styles.statValue}>{gem.view_count}</span></div>
                <div style={styles.statRow}><span style={styles.statLabel}>Saves</span><span style={styles.statValue}>{saveCount}</span></div>
                <div style={styles.statRow}><span style={styles.statLabel}>Comments</span><span style={styles.statValue}>{comments.length}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page:            { minHeight: '100vh', background: '#F9FAFB', fontFamily: 'system-ui, sans-serif' },
  loading:         { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#9CA3AF' },
  nav:             { height: '56px', background: 'white', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', position: 'sticky', top: 0, zIndex: 10 },
  navLeft:         { display: 'flex', alignItems: 'center', gap: '10px' },
  logo:            { width: '32px', height: '32px', background: '#1A9E6E', borderRadius: '6px', color: 'white', fontWeight: '700', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  navBrand:        { fontWeight: '600', fontSize: '15px', color: '#111827' },
  navLinks:        { display: 'flex', gap: '16px' },
  navLink:         { fontSize: '14px', color: '#6B7280', cursor: 'pointer', whiteSpace: 'nowrap' },
  container:       { maxWidth: '1100px', margin: '0 auto' },
  back:            { background: 'none', border: 'none', color: '#6B7280', fontSize: '13px', cursor: 'pointer', marginBottom: '16px', padding: 0 },
  layout:          { display: 'flex', gap: '24px', alignItems: 'flex-start' },
  main:            { flex: 1, minWidth: 0 },
  photo:           { width: '100%', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', marginBottom: '16px' },
  photoImg:        { width: '100%', height: '100%', objectFit: 'cover' },
  photoDots:       { position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px' },
  dot:             { width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,.5)', cursor: 'pointer' },
  dotActive:       { background: 'white' },
  content:         { background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '16px' },
  metaRow:         { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' },
  tag:             { fontSize: '12px', fontWeight: '500', padding: '3px 10px', borderRadius: '9999px' },
  tagSecondary:    { fontSize: '12px', color: '#6B7280', padding: '3px 0' },
  title:           { fontWeight: '700', color: '#111827', margin: '0 0 16px' },
  authorRow:       { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' },
  avatar:          { width: '36px', height: '36px', borderRadius: '50%', background: '#1A9E6E', color: 'white', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  authorName:      { fontSize: '14px', fontWeight: '500', color: '#111827' },
  authorMeta:      { fontSize: '12px', color: '#9CA3AF' },
  location:        { fontSize: '13px', color: '#6B7280', marginBottom: '16px' },
  description:     { fontSize: '15px', color: '#374151', lineHeight: '1.7', marginBottom: '20px' },
  actionBar:       { display: 'flex', gap: '8px', paddingTop: '16px', borderTop: '1px solid #F3F4F6' },
  actionBtn:       { display: 'flex', alignItems: 'center', gap: '6px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', color: '#374151', cursor: 'pointer' },
  actionBtnActive: { background: '#E8F5F0', borderColor: '#1A9E6E', color: '#1A9E6E' },
  commentsSection: { background: 'white', borderRadius: '12px', padding: '20px' },
  commentsTitle:   { fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 16px' },
  commentForm:     { display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px' },
  commentInput:    { flex: 1, height: '40px', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '0 12px', fontSize: '13px', outline: 'none', minWidth: 0 },
  commentBtn:      { height: '40px', background: '#1A9E6E', color: 'white', border: 'none', borderRadius: '8px', padding: '0 16px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', flexShrink: 0 },
  noComments:      { color: '#9CA3AF', fontSize: '13px', textAlign: 'center', padding: '20px 0' },
  commentList:     { display: 'flex', flexDirection: 'column', gap: '16px' },
  comment:         { display: 'flex', gap: '10px' },
  commentBody:     { flex: 1, minWidth: 0 },
  commentMeta:     { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' },
  commentAuthor:   { fontSize: '13px', fontWeight: '500', color: '#111827' },
  authorBadge:     { background: '#E8F5F0', color: '#1A9E6E', fontSize: '10px', fontWeight: '600', padding: '1px 6px', borderRadius: '9999px', marginLeft: '6px' },
  commentTime:     { fontSize: '11px', color: '#9CA3AF', marginLeft: 'auto' },
  commentText:     { fontSize: '13px', color: '#374151', lineHeight: '1.5', margin: 0 },
  sidebar:         { width: '260px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px' },
  sideCard:        { background: 'white', borderRadius: '12px', padding: '16px', marginBottom: '16px' },
  sideCardTitle:   { fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '12px' },
  sideCardBody:    { display: 'flex', flexDirection: 'column', gap: '8px' },
  mapContainer:    { width: '100%', height: '200px', borderRadius: '8px', overflow: 'hidden', marginBottom: '8px' },
  sideLocation:    { fontSize: '13px', color: '#374151', margin: 0 },
  sideCoords:      { fontSize: '11px', color: '#9CA3AF', margin: 0 },
  statRow:         { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F3F4F6' },
  statLabel:       { fontSize: '13px', color: '#6B7280' },
  statValue:       { fontSize: '13px', fontWeight: '600', color: '#111827' },
};