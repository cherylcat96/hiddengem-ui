import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGems } from '../api/gems';

const CATEGORIES = ['Nature', 'Food', 'Art', 'Architecture', 'Historic', 'Other'];

const TAG_COLORS = {
  Nature:       { bg: '#D1FAE5', fg: '#065F46' },
  Food:         { bg: '#FEF3C7', fg: '#92400E' },
  Art:          { bg: '#DBEAFE', fg: '#1E40AF' },
  Architecture: { bg: '#DBEAFE', fg: '#1E40AF' },
  Historic:     { bg: '#EDE9FE', fg: '#5B21B6' },
  Other:        { bg: '#F3F4F6', fg: '#374151' },
};

export default function Discover() {
  const navigate = useNavigate();
  const [gems, setGems]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [category, setCategory]   = useState('');
  const [sort, setSort]           = useState('newest');
  const [search, setSearch]       = useState('');

  useEffect(() => {
    fetchGems();
  }, [category, sort]);

  const fetchGems = async () => {
    setLoading(true);
    try {
      const params = { sort };
      if (category) params.category = category;
      const res = await getGems(params);
      setGems(res.data.gems);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = search
    ? gems.filter(g =>
        g.name.toLowerCase().includes(search.toLowerCase()) ||
        g.description.toLowerCase().includes(search.toLowerCase())
      )
    : gems;

  return (
    <div style={styles.page}>

      {/* NAV */}
      <nav style={styles.nav}>
        <div style={styles.navLeft}>
          <div style={styles.logo}>HG</div>
          <span style={styles.navBrand}>HiddenGem</span>
        </div>
        <div style={styles.navLinks}>
          <span style={styles.navLinkActive}>Discover</span>
          <span style={styles.navLink} onClick={() => navigate('/create')}>Create</span>
        </div>
      </nav>

      <div style={styles.layout}>

        {/* SIDEBAR */}
        <aside style={styles.sidebar}>
          <div style={styles.sideSection}>
            <div style={styles.sideLabel}>Search</div>
            <input
              style={styles.searchInput}
              placeholder="Search gems..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div style={styles.sideSection}>
            <div style={styles.sideLabel}>Category</div>
            <div style={styles.categoryList}>
              <button
                style={{ ...styles.categoryBtn, ...(category === '' ? styles.categoryBtnActive : {}) }}
                onClick={() => setCategory('')}
              >
                All
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  style={{ ...styles.categoryBtn, ...(category === cat ? styles.categoryBtnActive : {}) }}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.sideSection}>
            <div style={styles.sideLabel}>Sort by</div>
            <select
              style={styles.select}
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="most_saved">Most Saved</option>
            </select>
          </div>
        </aside>

        {/* MAIN */}
        <main style={styles.main}>
          <div style={styles.mainHeader}>
            <h1 style={styles.mainTitle}>
              {category ? category + ' Gems' : 'Discover Hidden Gems'}
            </h1>
            <span style={styles.mainCount}>{filtered.length} gems</span>
          </div>

          {loading ? (
            <div style={styles.loading}>Loading gems...</div>
          ) : filtered.length === 0 ? (
            <div style={styles.empty}>No gems found. Try a different filter.</div>
          ) : (
            <div style={styles.grid}>
              {filtered.map(gem => (
                <GemCard key={gem.gemID} gem={gem} onClick={() => navigate(`/gems/${gem.gemID}`)} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function GemCard({ gem, onClick }) {
  const colors = TAG_COLORS[gem.category] || TAG_COLORS.Other;
  return (
    <div style={styles.card} onClick={onClick}>
      <div style={{ ...styles.cardImg, background: colors.bg }}>
        {gem.cover_photo
          ? <img src={gem.cover_photo} alt={gem.name} style={styles.cardImgPhoto} />
          : <span style={{ fontSize: '32px' }}>📍</span>
        }
      </div>
      <div style={styles.cardBody}>
        <div style={styles.cardAuthor}>
          <div style={styles.avatar}>{gem.display_name?.[0] || '?'}</div>
          <span style={styles.cardAuthorName}>@{gem.username}</span>
          <span style={styles.cardTime}>
            {new Date(gem.created_at).toLocaleDateString()}
          </span>
        </div>
        <div style={styles.cardTitle}>{gem.name}</div>
        <div style={styles.cardDesc}>{gem.description}</div>
        <div style={styles.cardFooter}>
          {gem.location_label && (
            <span style={styles.cardLocation}>📍 {gem.location_label}</span>
          )}
          <span style={{ ...styles.tag, background: colors.bg, color: colors.fg }}>
            {gem.category}
          </span>
          <span style={styles.saveCount}>🔖 {gem.save_count}</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page:             { minHeight: '100vh', background: '#F9FAFB', fontFamily: 'system-ui, sans-serif' },
  nav:              { height: '56px', background: 'white', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', position: 'sticky', top: 0, zIndex: 10 },
  navLeft:          { display: 'flex', alignItems: 'center', gap: '10px' },
  logo:             { width: '32px', height: '32px', background: '#1A9E6E', borderRadius: '6px', color: 'white', fontWeight: '700', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  navBrand:         { fontWeight: '600', fontSize: '15px', color: '#111827' },
  navLinks:         { display: 'flex', gap: '24px' },
  navLink:          { fontSize: '14px', color: '#6B7280', cursor: 'pointer' },
  navLinkActive:    { fontSize: '14px', color: '#1A9E6E', fontWeight: '500', cursor: 'pointer' },
  layout:           { display: 'flex', maxWidth: '1200px', margin: '0 auto', padding: '24px', gap: '24px' },
  sidebar:          { width: '220px', flexShrink: 0 },
  sideSection:      { marginBottom: '24px' },
  sideLabel:        { fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '.06em', color: '#9CA3AF', marginBottom: '8px' },
  searchInput:      { width: '100%', height: '38px', border: '1px solid #E5E7EB', borderRadius: '6px', padding: '0 12px', fontSize: '13px', outline: 'none' },
  categoryList:     { display: 'flex', flexDirection: 'column', gap: '4px' },
  categoryBtn:      { textAlign: 'left', background: 'none', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '13px', color: '#6B7280', cursor: 'pointer' },
  categoryBtnActive:{ background: '#E8F5F0', color: '#1A9E6E', fontWeight: '500' },
  select:           { width: '100%', height: '38px', border: '1px solid #E5E7EB', borderRadius: '6px', padding: '0 10px', fontSize: '13px', background: 'white' },
  main:             { flex: 1 },
  mainHeader:       { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' },
  mainTitle:        { fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 },
  mainCount:        { fontSize: '13px', color: '#9CA3AF' },
  loading:          { textAlign: 'center', padding: '60px', color: '#9CA3AF' },
  empty:            { textAlign: 'center', padding: '60px', color: '#9CA3AF' },
  grid:             { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' },
  card:             { background: 'white', border: '1px solid #E5E7EB', borderRadius: '10px', overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow .15s' },
  cardImg:          { height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cardImgPhoto:     { width: '100%', height: '100%', objectFit: 'cover' },
  cardBody:         { padding: '14px' },
  cardAuthor:       { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' },
  avatar:           { width: '26px', height: '26px', borderRadius: '50%', background: '#1A9E6E', color: 'white', fontSize: '11px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cardAuthorName:   { fontSize: '12px', fontWeight: '500', color: '#374151' },
  cardTime:         { fontSize: '11px', color: '#9CA3AF', marginLeft: 'auto' },
  cardTitle:        { fontSize: '15px', fontWeight: '600', color: '#111827', marginBottom: '6px' },
  cardDesc:         { fontSize: '13px', color: '#6B7280', lineHeight: '1.5', marginBottom: '10px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  cardFooter:       { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
  cardLocation:     { fontSize: '11px', color: '#9CA3AF', flex: 1 },
  tag:              { fontSize: '11px', fontWeight: '500', padding: '2px 8px', borderRadius: '9999px' },
  saveCount:        { fontSize: '12px', color: '#6B7280' },
};