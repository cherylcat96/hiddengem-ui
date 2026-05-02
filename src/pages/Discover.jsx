import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGems } from '../api/gems';
import { useAuth } from '../context/AuthContext';

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
  const { user } = useAuth();
  const [gems, setGems]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [category, setCategory]   = useState('');
  const [sort, setSort]           = useState('newest');
  const [search, setSearch]       = useState('');
  const [view, setView]           = useState('feed'); // 'feed' | 'map'
  const [selectedGem, setSelectedGem] = useState(null);
  const [isMobile, setIsMobile]   = useState(window.innerWidth < 768);
  const mapRef                    = useRef(null);
  const mapInstanceRef            = useRef(null);
  const markersRef                = useRef([]);
  const infoWindowRef             = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchGems();
  }, [category, sort]);

  useEffect(() => {
    if (view === 'map' && gems.length > 0) {
      initMap();
    }
  }, [view, gems]);

  const fetchGems = async () => {
    setLoading(true);
    try {
      const params = { sort, limit: 100 };
      if (category) params.category = category;
      const res = await getGems(params);
      setGems(res.data.gems);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const initMap = () => {
    const load = () => {
      if (!mapRef.current) return;
      const validGems = gems.filter(g => g.latitude && g.longitude);
      if (validGems.length === 0) return;

      const center = {
        lat: Number(validGems[0].latitude),
        lng: Number(validGems[0].longitude),
      };

      const map = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: 10,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      mapInstanceRef.current = map;

      // Clear old markers
      markersRef.current.forEach(m => m.setMap(null));
      markersRef.current = [];

      // Close info window on map click
      map.addListener('click', () => {
        if (infoWindowRef.current) infoWindowRef.current.close();
        setSelectedGem(null);
      });

      validGems.forEach(gem => {
        const marker = new window.google.maps.Marker({
          position: { lat: Number(gem.latitude), lng: Number(gem.longitude) },
          map,
          title: gem.name,
        });

        marker.addListener('click', () => {
          setSelectedGem(gem);
          map.panTo(marker.getPosition());
        });

        markersRef.current.push(marker);
      });
    };

    if (window.google && window.google.maps) {
      load();
      return;
    }
    const existing = document.querySelector(`script[src*="maps.googleapis"]`);
    if (existing) {
      existing.addEventListener('load', load);
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_KEY}`;
    script.async = true;
    script.onload = load;
    document.head.appendChild(script);
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
        <div style={{ ...styles.navLeft, cursor: 'pointer' }} onClick={() => navigate(user ? '/discover' : '/')}>
          <div style={styles.logo}>HG</div>
          {!isMobile && <span style={styles.navBrand}>HiddenGem</span>}
        </div>
        <div style={styles.navLinks}>
          <span style={styles.navLinkActive}>Discover</span>
          <span style={styles.navLink} onClick={() => navigate('/create')}>Create</span>
          {user ? (
            <span style={styles.navLink} onClick={() => navigate(`/profile/${user.username}`)}>Profile</span>
          ) : (
            <span style={styles.navLink} onClick={() => navigate('/signin')}>Sign In</span>
          )}
        </div>
      </nav>

      {/* MOBILE FILTERS */}
      {isMobile && (
        <div style={styles.mobileFilters}>
          <div style={styles.mobileTopRow}>
            <input
              style={styles.mobileSearch}
              placeholder="Search gems..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div style={styles.viewToggle}>
              <button
                style={{ ...styles.toggleBtn, ...(view === 'feed' ? styles.toggleBtnActive : {}) }}
                onClick={() => setView('feed')}
              >Feed</button>
              <button
                style={{ ...styles.toggleBtn, ...(view === 'map' ? styles.toggleBtnActive : {}) }}
                onClick={() => setView('map')}
              >Map</button>
            </div>
          </div>
          <div style={styles.mobileCategoryRow}>
            <button
              style={{ ...styles.mobileCatBtn, ...(category === '' ? styles.mobileCatBtnActive : {}) }}
              onClick={() => setCategory('')}
            >All</button>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                style={{ ...styles.mobileCatBtn, ...(category === cat ? styles.mobileCatBtnActive : {}) }}
                onClick={() => setCategory(cat)}
              >{cat}</button>
            ))}
          </div>
          <select style={styles.mobileSelect} value={sort} onChange={e => setSort(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="most_saved">Most Saved</option>
          </select>
        </div>
      )}

      <div style={isMobile ? styles.layoutMobile : styles.layout}>

        {/* SIDEBAR — desktop only */}
        {!isMobile && (
          <aside style={styles.sidebar}>
            <div style={styles.sideSection}>
              <div style={styles.sideLabel}>View</div>
              <div style={styles.viewToggle}>
                <button
                  style={{ ...styles.toggleBtn, ...(view === 'feed' ? styles.toggleBtnActive : {}) }}
                  onClick={() => setView('feed')}
                >Feed</button>
                <button
                  style={{ ...styles.toggleBtn, ...(view === 'map' ? styles.toggleBtnActive : {}) }}
                  onClick={() => setView('map')}
                >Map</button>
              </div>
            </div>
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
                >All</button>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    style={{ ...styles.categoryBtn, ...(category === cat ? styles.categoryBtnActive : {}) }}
                    onClick={() => setCategory(cat)}
                  >{cat}</button>
                ))}
              </div>
            </div>
            <div style={styles.sideSection}>
              <div style={styles.sideLabel}>Sort by</div>
              <select style={styles.select} value={sort} onChange={e => setSort(e.target.value)}>
                <option value="newest">Newest</option>
                <option value="most_saved">Most Saved</option>
              </select>
            </div>
          </aside>
        )}

        {/* MAIN */}
        <main style={styles.main}>

          {/* MAP VIEW */}
          {view === 'map' ? (
            <div style={styles.mapWrapper}>
              <div ref={mapRef} style={styles.mapContainer} />
              {selectedGem && (
                <div style={styles.mapPreview}>
                  <button style={styles.mapPreviewClose} onClick={() => setSelectedGem(null)}>×</button>
                  {selectedGem.cover_photo && (
                    <img src={selectedGem.cover_photo} alt={selectedGem.name} style={styles.mapPreviewImg} />
                  )}
                  <div style={styles.mapPreviewBody}>
                    <div style={styles.mapPreviewTitle}>{selectedGem.name}</div>
                    <div style={styles.mapPreviewMeta}>
                      {selectedGem.category}
                      {selectedGem.location_label ? ` · ${selectedGem.location_label}` : ''}
                    </div>
                    <div style={styles.mapPreviewDesc}>{selectedGem.description}</div>
                    <button
                      style={styles.mapPreviewBtn}
                      onClick={() => navigate(`/gems/${selectedGem.gemID}`)}
                    >
                      View Gem
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <div style={styles.mainHeader}>
                <h1 style={styles.mainTitle}>
                  {category ? category + ' Gems' : 'Discover Hidden Gems'}
                </h1>
                <span style={styles.mainCount}>{filtered.length} gems</span>
              </div>

              {loading ? (
                <div style={styles.grid}>
                  {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : filtered.length === 0 ? (
                <div style={styles.empty}>No gems found. Try a different filter.</div>
              ) : (
                <div style={isMobile ? styles.gridMobile : styles.grid}>
                  {filtered.map(gem => (
                    <GemCard
                      key={gem.gemID}
                      gem={gem}
                      onClick={() => navigate(`/gems/${gem.gemID}`)}
                      navigate={navigate}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={styles.card}>
      <div style={skeletonStyles.img} />
      <div style={{ padding: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <div style={skeletonStyles.avatar} />
          <div style={{ ...skeletonStyles.line, width: '80px' }} />
          <div style={{ ...skeletonStyles.line, width: '50px', marginLeft: 'auto' }} />
        </div>
        <div style={{ ...skeletonStyles.line, width: '70%', height: '16px', marginBottom: '8px' }} />
        <div style={{ ...skeletonStyles.line, width: '100%', marginBottom: '6px' }} />
        <div style={{ ...skeletonStyles.line, width: '85%', marginBottom: '14px' }} />
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ ...skeletonStyles.line, width: '60px' }} />
          <div style={{ ...skeletonStyles.line, width: '50px', borderRadius: '9999px' }} />
        </div>
      </div>
    </div>
  );
}

function GemCard({ gem, onClick, navigate }) {
  const colors = TAG_COLORS[gem.category] || TAG_COLORS.Other;
  return (
    <div style={styles.card} onClick={onClick}>
      <div style={{ ...styles.cardImg, background: colors.bg }}>
        {gem.cover_photo
          ? <img src={gem.cover_photo} alt={gem.name} style={styles.cardImgPhoto} />
          : <span style={{ fontSize: '13px', color: colors.fg, fontWeight: '500' }}>{gem.category}</span>
        }
      </div>
      <div style={styles.cardBody}>
        <div style={styles.cardAuthor}>
          <div style={styles.avatar}>{gem.display_name?.[0] || '?'}</div>
          <span
            style={{ ...styles.cardAuthorName, cursor: 'pointer' }}
            onClick={(e) => { e.stopPropagation(); navigate(`/profile/${gem.username}`); }}
          >
            @{gem.username}
          </span>
          <span style={styles.cardTime}>{new Date(gem.created_at).toLocaleDateString()}</span>
        </div>
        <div style={styles.cardTitle}>{gem.name}</div>
        <div style={styles.cardDesc}>{gem.description}</div>
        <div style={styles.cardFooter}>
          {gem.location_label && <span style={styles.cardLocation}>{gem.location_label}</span>}
          <span style={{ ...styles.tag, background: colors.bg, color: colors.fg }}>{gem.category}</span>
          <span style={styles.saveCount}>{gem.save_count} saves</span>
        </div>
      </div>
    </div>
  );
}

const skeletonStyles = {
  img:    { height: '160px', background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' },
  avatar: { width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', flexShrink: 0 },
  line:   { height: '12px', borderRadius: '4px', background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' },
};

const styles = {
  page:              { minHeight: '100vh', background: '#F9FAFB', fontFamily: 'system-ui, sans-serif' },
  nav:               { height: '56px', background: 'white', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', position: 'sticky', top: 0, zIndex: 10 },
  navLeft:           { display: 'flex', alignItems: 'center', gap: '10px' },
  logo:              { width: '32px', height: '32px', background: '#1A9E6E', borderRadius: '6px', color: 'white', fontWeight: '700', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  navBrand:          { fontWeight: '600', fontSize: '15px', color: '#111827' },
  navLinks:          { display: 'flex', gap: '16px' },
  navLink:           { fontSize: '14px', color: '#6B7280', cursor: 'pointer', whiteSpace: 'nowrap' },
  navLinkActive:     { fontSize: '14px', color: '#1A9E6E', fontWeight: '500', cursor: 'pointer', whiteSpace: 'nowrap' },
  mobileFilters:     { background: 'white', borderBottom: '1px solid #E5E7EB', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px' },
  mobileTopRow:      { display: 'flex', gap: '8px', alignItems: 'center' },
  mobileSearch:      { flex: 1, height: '38px', border: '1px solid #E5E7EB', borderRadius: '6px', padding: '0 12px', fontSize: '13px', outline: 'none' },
  mobileCategoryRow: { display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' },
  mobileCatBtn:      { flexShrink: 0, background: 'none', border: '1px solid #E5E7EB', padding: '5px 12px', borderRadius: '9999px', fontSize: '12px', color: '#6B7280', cursor: 'pointer', whiteSpace: 'nowrap' },
  mobileCatBtnActive:{ flexShrink: 0, background: '#E8F5F0', border: '1px solid #1A9E6E', padding: '5px 12px', borderRadius: '9999px', fontSize: '12px', color: '#1A9E6E', fontWeight: '500', cursor: 'pointer', whiteSpace: 'nowrap' },
  mobileSelect:      { width: '100%', height: '36px', border: '1px solid #E5E7EB', borderRadius: '6px', padding: '0 10px', fontSize: '13px', background: 'white' },
  layout:            { display: 'flex', maxWidth: '1200px', margin: '0 auto', padding: '24px', gap: '24px' },
  layoutMobile:      { padding: '16px' },
  sidebar:           { width: '220px', flexShrink: 0 },
  sideSection:       { marginBottom: '24px' },
  sideLabel:         { fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '.06em', color: '#9CA3AF', marginBottom: '8px' },
  searchInput:       { width: '100%', height: '38px', border: '1px solid #E5E7EB', borderRadius: '6px', padding: '0 12px', fontSize: '13px', outline: 'none' },
  categoryList:      { display: 'flex', flexDirection: 'column', gap: '4px' },
  categoryBtn:       { textAlign: 'left', background: 'none', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '13px', color: '#6B7280', cursor: 'pointer' },
  categoryBtnActive: { background: '#E8F5F0', color: '#1A9E6E', fontWeight: '500' },
  select:            { width: '100%', height: '38px', border: '1px solid #E5E7EB', borderRadius: '6px', padding: '0 10px', fontSize: '13px', background: 'white' },
  viewToggle:        { display: 'flex', border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden' },
  toggleBtn:         { flex: 1, height: '34px', background: 'white', border: 'none', fontSize: '13px', color: '#6B7280', cursor: 'pointer', padding: '0 12px' },
  toggleBtnActive:   { background: '#1A9E6E', color: 'white', fontWeight: '500' },
  main:              { flex: 1, minWidth: 0 },
  mainHeader:        { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' },
  mainTitle:         { fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 },
  mainCount:         { fontSize: '13px', color: '#9CA3AF' },
  empty:             { textAlign: 'center', padding: '60px', color: '#9CA3AF' },
  grid:              { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' },
  gridMobile:        { display: 'grid', gridTemplateColumns: '1fr', gap: '16px' },
  card:              { background: 'white', border: '1px solid #E5E7EB', borderRadius: '10px', overflow: 'hidden', cursor: 'pointer' },
  cardImg:           { height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cardImgPhoto:      { width: '100%', height: '100%', objectFit: 'cover' },
  cardBody:          { padding: '14px' },
  cardAuthor:        { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' },
  avatar:            { width: '26px', height: '26px', borderRadius: '50%', background: '#1A9E6E', color: 'white', fontSize: '11px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cardAuthorName:    { fontSize: '12px', fontWeight: '500', color: '#1A9E6E' },
  cardTime:          { fontSize: '11px', color: '#9CA3AF', marginLeft: 'auto' },
  cardTitle:         { fontSize: '15px', fontWeight: '600', color: '#111827', marginBottom: '6px' },
  cardDesc:          { fontSize: '13px', color: '#6B7280', lineHeight: '1.5', marginBottom: '10px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  cardFooter:        { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
  cardLocation:      { fontSize: '11px', color: '#9CA3AF', flex: 1 },
  tag:               { fontSize: '11px', fontWeight: '500', padding: '2px 8px', borderRadius: '9999px' },
  saveCount:         { fontSize: '12px', color: '#6B7280' },
  mapWrapper:        { position: 'relative', width: '100%', height: 'calc(100vh - 56px)' },
  mapContainer:      { width: '100%', height: '100%', borderRadius: '12px' },
  mapPreview:        { position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)', width: '320px', background: 'white', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', overflow: 'hidden', zIndex: 5 },
  mapPreviewClose:   { position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.4)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  mapPreviewImg:     { width: '100%', height: '140px', objectFit: 'cover' },
  mapPreviewBody:    { padding: '14px' },
  mapPreviewTitle:   { fontSize: '15px', fontWeight: '600', color: '#111827', marginBottom: '4px' },
  mapPreviewMeta:    { fontSize: '12px', color: '#9CA3AF', marginBottom: '6px' },
  mapPreviewDesc:    { fontSize: '13px', color: '#6B7280', lineHeight: '1.5', marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  mapPreviewBtn:     { width: '100%', height: '36px', background: '#1A9E6E', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' },
};