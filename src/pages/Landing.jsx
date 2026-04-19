import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={styles.page}>

      {/* NAV */}
      <nav style={styles.nav}>
        <div style={styles.navLeft}>
          <div style={styles.logo}>HG</div>
          <span style={styles.navBrand}>HiddenGem</span>
        </div>
        <div style={styles.navRight}>
          <button style={styles.navSignIn} onClick={() => navigate('/signin')}>Sign In</button>
          <button style={styles.navSignUp} onClick={() => navigate('/signup')}>
            {isMobile ? 'Join' : 'Get Started Free'}
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ ...styles.hero, flexDirection: isMobile ? 'column' : 'row', padding: isMobile ? '40px 20px' : '80px 40px', gap: isMobile ? '32px' : '60px' }}>
        <div style={styles.heroInner}>
          <div style={styles.heroBadge}>Community-powered discovery</div>
          <h1 style={{ ...styles.heroTitle, fontSize: isMobile ? '32px' : '48px' }}>
            Find the places<br />locals actually love
          </h1>
          <p style={{ ...styles.heroSubtitle, fontSize: isMobile ? '15px' : '17px' }}>
            HiddenGem is a community map of authentic local spots — hidden waterfalls,
            secret cafés, forgotten architecture — shared by real people, not algorithms.
          </p>
          <div style={{ ...styles.heroActions, flexDirection: isMobile ? 'column' : 'row' }}>
            <button style={styles.heroCTA} onClick={() => navigate('/signup')}>
              Start Discovering
            </button>
            <button style={styles.heroSecondary} onClick={() => navigate('/discover')}>
              Browse the map
            </button>
          </div>
        </div>
        {!isMobile && (
          <div style={styles.heroVisual}>
            <div style={styles.mockCard}>
              <div style={styles.mockImg} />
              <div style={styles.mockBody}>
                <div style={styles.mockTag}>Nature</div>
                <div style={styles.mockTitle}>Secret Waterfall Trail</div>
                <div style={styles.mockMeta}>📍 Forest Park · 🔖 24 saves</div>
              </div>
            </div>
            <div style={{ ...styles.mockCard, ...styles.mockCardOffset }}>
              <div style={{ ...styles.mockImg, background: '#FEF3C7' }} />
              <div style={styles.mockBody}>
                <div style={{ ...styles.mockTag, background: '#FEF3C7', color: '#92400E' }}>Food</div>
                <div style={styles.mockTitle}>Secret Speakeasy Café</div>
                <div style={styles.mockMeta}>📍 Maplewood · 🔖 31 saves</div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* HOW IT WORKS */}
      <section style={{ ...styles.how, padding: isMobile ? '48px 20px' : '80px 40px' }}>
        <h2 style={styles.sectionTitle}>How it works</h2>
        <div style={{ ...styles.steps, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '16px' : '32px' }}>
          {[
            { num: '1', title: 'Discover', desc: 'Browse community-submitted gems near you. Filter by category, search by location.' },
            { num: '2', title: 'Share', desc: 'Submit a place you love. Add photos, a description, and pin it on the map.' },
            { num: '3', title: 'Save', desc: 'Bookmark gems to your personal list. Plan your next adventure.' },
          ].map(step => (
            <div key={step.num} style={styles.step}>
              <div style={styles.stepNum}>{step.num}</div>
              <div style={styles.stepTitle}>{step.title}</div>
              <div style={styles.stepDesc}>{step.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section style={{ ...styles.cats, padding: isMobile ? '48px 20px' : '80px 40px' }}>
        <h2 style={styles.sectionTitle}>Explore by category</h2>
        <div style={{ ...styles.catGrid, gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(6, 1fr)' }}>
          {[
            { label: 'Nature',       emoji: '🌿', bg: '#D1FAE5', fg: '#065F46' },
            { label: 'Food',         emoji: '☕', bg: '#FEF3C7', fg: '#92400E' },
            { label: 'Art',          emoji: '🎨', bg: '#DBEAFE', fg: '#1E40AF' },
            { label: 'Architecture', emoji: '🏛️', bg: '#DBEAFE', fg: '#1E40AF' },
            { label: 'Historic',     emoji: '🏺', bg: '#EDE9FE', fg: '#5B21B6' },
            { label: 'Other',        emoji: '✨', bg: '#F3F4F6', fg: '#374151' },
          ].map(cat => (
            <div
              key={cat.label}
              style={{ ...styles.catCard, background: cat.bg }}
              onClick={() => navigate(`/discover?category=${cat.label}`)}
            >
              <div style={styles.catEmoji}>{cat.emoji}</div>
              <div style={{ ...styles.catLabel, color: cat.fg }}>{cat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section style={{ ...styles.banner, padding: isMobile ? '48px 20px' : '80px 40px' }}>
        <h2 style={{ ...styles.bannerTitle, fontSize: isMobile ? '22px' : '30px' }}>Ready to find your next hidden gem?</h2>
        <p style={styles.bannerSub}>Join the community and start discovering places worth finding.</p>
        <button style={styles.bannerBtn} onClick={() => navigate('/signup')}>
          Create a free account
        </button>
      </section>

      {/* FOOTER */}
      <footer style={{ ...styles.footer, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '16px' : '0', padding: isMobile ? '24px 20px' : '24px 40px', textAlign: isMobile ? 'center' : 'left' }}>
        <div style={styles.footerLeft}>
          <div style={styles.logo}>HG</div>
          <span style={styles.footerBrand}>HiddenGem</span>
        </div>
        <div style={styles.footerLinks}>
          <span style={styles.footerLink} onClick={() => navigate('/discover')}>Discover</span>
          <span style={styles.footerLink} onClick={() => navigate('/signup')}>Sign Up</span>
          <span style={styles.footerLink} onClick={() => navigate('/signin')}>Sign In</span>
        </div>
      </footer>

    </div>
  );
}

const styles = {
  page:           { minHeight: '100vh', background: 'white', fontFamily: 'system-ui, sans-serif' },
  nav:            { height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', borderBottom: '1px solid #F3F4F6', position: 'sticky', top: 0, background: 'white', zIndex: 10 },
  navLeft:        { display: 'flex', alignItems: 'center', gap: '10px' },
  logo:           { width: '32px', height: '32px', background: '#1A9E6E', borderRadius: '6px', color: 'white', fontWeight: '700', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  navBrand:       { fontWeight: '700', fontSize: '16px', color: '#111827' },
  navRight:       { display: 'flex', gap: '8px', alignItems: 'center' },
  navSignIn:      { background: 'none', border: 'none', fontSize: '14px', color: '#6B7280', cursor: 'pointer', fontWeight: '500' },
  navSignUp:      { background: '#1A9E6E', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 14px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', whiteSpace: 'nowrap' },
  hero:           { display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1100px', margin: '0 auto' },
  heroInner:      { flex: 1 },
  heroBadge:      { display: 'inline-block', background: '#E8F5F0', color: '#0A6344', fontSize: '12px', fontWeight: '600', padding: '4px 12px', borderRadius: '9999px', marginBottom: '20px' },
  heroTitle:      { fontWeight: '800', color: '#111827', lineHeight: '1.15', margin: '0 0 20px' },
  heroSubtitle:   { color: '#6B7280', lineHeight: '1.7', margin: '0 0 32px', maxWidth: '480px' },
  heroActions:    { display: 'flex', gap: '12px' },
  heroCTA:        { height: '48px', background: '#1A9E6E', color: 'white', border: 'none', borderRadius: '10px', padding: '0 28px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' },
  heroSecondary:  { height: '48px', background: 'white', color: '#374151', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '0 24px', fontSize: '15px', fontWeight: '500', cursor: 'pointer' },
  heroVisual:     { flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-end' },
  mockCard:       { background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden', width: '280px', boxShadow: '0 4px 12px rgba(0,0,0,.08)' },
  mockCardOffset: { marginRight: '32px' },
  mockImg:        { height: '120px', background: '#D1FAE5' },
  mockBody:       { padding: '12px' },
  mockTag:        { display: 'inline-block', background: '#D1FAE5', color: '#065F46', fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '9999px', marginBottom: '6px' },
  mockTitle:      { fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '4px' },
  mockMeta:       { fontSize: '12px', color: '#9CA3AF' },
  how:            { background: '#F9FAFB' },
  sectionTitle:   { textAlign: 'center', fontSize: '28px', fontWeight: '700', color: '#111827', margin: '0 0 48px' },
  steps:          { display: 'flex', maxWidth: '900px', margin: '0 auto', justifyContent: 'center' },
  step:           { flex: 1, textAlign: 'center', padding: '32px 24px', background: 'white', borderRadius: '12px', border: '1px solid #E5E7EB' },
  stepNum:        { width: '40px', height: '40px', background: '#1A9E6E', color: 'white', borderRadius: '50%', fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' },
  stepTitle:      { fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '8px' },
  stepDesc:       { fontSize: '14px', color: '#6B7280', lineHeight: '1.6' },
  cats:           { maxWidth: '1100px', margin: '0 auto' },
  catGrid:        { display: 'grid', gap: '12px' },
  catCard:        { borderRadius: '12px', padding: '24px 12px', textAlign: 'center', cursor: 'pointer' },
  catEmoji:       { fontSize: '28px', marginBottom: '8px' },
  catLabel:       { fontSize: '13px', fontWeight: '600' },
  banner:         { background: '#0A6344', textAlign: 'center' },
  bannerTitle:    { fontWeight: '700', color: 'white', margin: '0 0 12px' },
  bannerSub:      { fontSize: '16px', color: '#9FE1CB', margin: '0 0 28px' },
  bannerBtn:      { height: '48px', background: 'white', color: '#0A6344', border: 'none', borderRadius: '10px', padding: '0 28px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' },
  footer:         { display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F3F4F6' },
  footerLeft:     { display: 'flex', alignItems: 'center', gap: '8px' },
  footerBrand:    { fontWeight: '600', fontSize: '14px', color: '#374151' },
  footerLinks:    { display: 'flex', gap: '24px' },
  footerLink:     { fontSize: '13px', color: '#6B7280', cursor: 'pointer' },
};