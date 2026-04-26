import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

const TAG_COLORS = {
  Nature:       { bg: '#D1FAE5', fg: '#065F46' },
  Food:         { bg: '#FEF3C7', fg: '#92400E' },
  Art:          { bg: '#DBEAFE', fg: '#1E40AF' },
  Architecture: { bg: '#DBEAFE', fg: '#1E40AF' },
  Historic:     { bg: '#EDE9FE', fg: '#5B21B6' },
  Other:        { bg: '#F3F4F6', fg: '#374151' },
};

export default function Profile() {
  const { username } = useParams();
  const navigate     = useNavigate();
  const { user: me, signOut } = useAuth();

  const [profile, setProfile]       = useState(null);
  const [gems, setGems]             = useState([]);
  const [saved, setSaved]           = useState([]);
  const [tab, setTab]               = useState('gems');
  const [loading, setLoading]       = useState(true);
  const [following, setFollowing]   = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [isMobile, setIsMobile]     = useState(window.innerWidth < 768);
  const isOwn = me?.username === username;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchGems();
    if (isOwn) fetchSaved();
  }, [username]);

  const fetchProfile = async () => {
    try {
      const res = await client.get(`/users/${username}`);
      setProfile(res.data);
      setFollowing(res.data.is_following);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchGems = async () => {
    try {
      const res = await client.get(`/users/${username}/gems`);
      setGems(res.data.gems);
    } catch (err) { console.error(err); }
  };

  const fetchSaved = async () => {
    try {
      const res = await client.get('/users/me/saves');
      setSaved(res.data.gems);
    } catch (err) { console.error(err); }
  };

  const handleFollow = async () => {
    if (!me) { navigate('/signin'); return; }
    setFollowLoading(true);
    try {
      if (following) {
        await client.delete(`/users/${username}/follow`);
        setFollowing(false);
        setProfile(p => ({ ...p, follower_count: p.follower_count - 1 }));
      } else {
        await client.post(`/users/${username}/follow`);
        setFollowing(true);
        setProfile(p => ({ ...p, follower_count: p.follower_count + 1 }));
      }
    } catch (err) { console.error(err); }
    finally { setFollowLoading(false); }
  };

  const handleSignOut = () => { signOut(); navigate('/'); };

  if (loading)  return <div style={styles.loading}>Loading...</div>;
  if (!profile) return <div style={styles.loading}>User not found.</div>;

  const displayGems = tab === 'gems' ? gems : saved;

  const statsRow = (
    <div style={styles.statsRow}>
      <div style={styles.stat}>
        <div style={styles.statNum}>{profile.gem_count ?? 0}</div>
        <div style={styles.statLabel}>Gems</div>
      </div>
      <div style={styles.stat}>
        <div style={styles.statNum}>{profile.follower_count ?? 0}</div>
        <div style={styles.statLabel}>Followers</div>
      </div>
      <div style={styles.stat}>
        <div style={styles.statNum}>{profile.following_count ?? 0}</div>
        <div style={styles.statLabel}>Following</div>
      </div>
    </div>
  );

  const followBtn = !isOwn && me && (
    <button
      style={following ? styles.followingBtn : styles.followBtn}
      onClick={handleFollow}
      disabled={followLoading}
    >
      {followLoading ? '...' : following ? 'Following' : 'Follow'}
    </button>
  );

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
          {me && <span style={styles.navLink} onClick={handleSignOut}>Sign Out</span>}
        </div>
      </nav>

      <div style={{ ...styles.container, padding: isMobile ? '16px' : '32px 24px' }}>

        {/* MOBILE */}
        {isMobile ? (
          <div style={styles.mobileProfile}>
            <div style={styles.mobileProfileTop}>
              <div style={styles.avatar}>
                {profile.avatar_url
                  ? <img src={profile.avatar_url} alt="" style={styles.avatarImg} />
                  : <span style={styles.avatarInitial}>{profile.display_name?.[0]}</span>
                }
              </div>
              <div style={styles.mobileProfileInfo}>
                <div style={styles.profileName}>{profile.display_name}</div>
                <div style={styles.profileUsername}>@{profile.username}</div>
                {statsRow}
              </div>
            </div>
            {profile.bio && <p style={styles.profileBio}>{profile.bio}</p>}
            <div style={styles.profileMeta}>
              Member since {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
            {followBtn}
            {isOwn && (
              <button style={styles.signOutBtn} onClick={handleSignOut}>Sign Out</button>
            )}
          </div>
        ) : (
          <div style={styles.layout}>
            {/* DESKTOP sidebar */}
            <aside style={styles.sidebar}>
              <div style={styles.profileCard}>
                <div style={styles.avatar}>
                  {profile.avatar_url
                    ? <img src={profile.avatar_url} alt="" style={styles.avatarImg} />
                    : <span style={styles.avatarInitial}>{profile.display_name?.[0]}</span>
                  }
                </div>
                <div style={styles.profileName}>{profile.display_name}</div>
                <div style={styles.profileUsername}>@{profile.username}</div>
                {profile.bio && <p style={styles.profileBio}>{profile.bio}</p>}
                {statsRow}
                <div style={styles.profileMeta}>
                  Member since {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
                {followBtn}
                {isOwn && (
                  <button style={styles.signOutBtn} onClick={handleSignOut}>Sign Out</button>
                )}
              </div>
            </aside>

            {/* DESKTOP main */}
            <main style={styles.main}>
              <GemGrid
                tab={tab} setTab={setTab}
                gems={gems} saved={saved}
                displayGems={displayGems}
                isOwn={isOwn} navigate={navigate}
              />
            </main>
          </div>
        )}

        {/* MOBILE gem grid */}
        {isMobile && (
          <GemGrid
            tab={tab} setTab={setTab}
            gems={gems} saved={saved}
            displayGems={displayGems}
            isOwn={isOwn} navigate={navigate}
          />
        )}
      </div>
    </div>
  );
}

function GemGrid({ tab, setTab, gems, saved, displayGems, isOwn, navigate }) {
  return (
    <div>
      <div style={styles.tabs}>
        <button style={{ ...styles.tab, ...(tab === 'gems' ? styles.tabActive : {}) }} onClick={() => setTab('gems')}>
          My Gems ({gems.length})
        </button>
        {isOwn && (
          <button style={{ ...styles.tab, ...(tab === 'saved' ? styles.tabActive : {}) }} onClick={() => setTab('saved')}>
            Saved ({saved.length})
          </button>
        )}
      </div>

      {displayGems.length === 0 ? (
        <div style={styles.empty}>
          {tab === 'gems'
            ? isOwn
              ? <><p>You haven't shared any gems yet.</p><button style={styles.createBtn} onClick={() => navigate('/create')}>Share your first gem</button></>
              : <p>This user hasn't shared any gems yet.</p>
            : <p>You haven't saved any gems yet. <span style={styles.link} onClick={() => navigate('/discover')}>Browse the map</span></p>
          }
        </div>
      ) : (
        <div style={styles.grid}>
          {displayGems.map(gem => (
            <GemCard
              key={gem.gemID}
              gem={gem}
              isOwn={isOwn && tab === 'gems'}
              onClick={() => navigate(`/gems/${gem.gemID}`)}
              onEdit={() => navigate(`/gems/${gem.gemID}/edit`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function GemCard({ gem, isOwn, onClick, onEdit }) {
  const colors = TAG_COLORS[gem.category] || TAG_COLORS.Other;
  return (
    <div style={styles.card}>
      <div style={{ ...styles.cardImg, background: colors.bg, cursor: 'pointer' }} onClick={onClick}>
        {gem.cover_photo
          ? <img src={gem.cover_photo} alt={gem.name} style={styles.cardImgPhoto} />
          : <span style={{ fontSize: '14px', color: colors.fg, fontWeight: '500' }}>{gem.category}</span>
        }
      </div>
      <div style={styles.cardBody}>
        <div style={styles.cardTitle} onClick={onClick}>{gem.name}</div>
        <div style={styles.cardDesc}>{gem.description}</div>
        <div style={styles.cardFooter}>
          <span style={{ ...styles.tag, background: colors.bg, color: colors.fg }}>{gem.category}</span>
          <span style={styles.saveCount}>{gem.save_count} saves</span>
          {isOwn && <button style={styles.editBtn} onClick={onEdit}>Edit</button>}
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
  layout:          { display: 'flex', gap: '28px', alignItems: 'flex-start' },
  sidebar:         { width: '240px', flexShrink: 0 },
  profileCard:     { background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #E5E7EB', textAlign: 'center' },
  mobileProfile:   { background: 'white', borderRadius: '12px', padding: '16px', border: '1px solid #E5E7EB', marginBottom: '16px' },
  mobileProfileTop:{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' },
  mobileProfileInfo:{ flex: 1 },
  avatar:          { width: '72px', height: '72px', borderRadius: '50%', background: '#1A9E6E', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', overflow: 'hidden', flexShrink: 0 },
  avatarImg:       { width: '100%', height: '100%', objectFit: 'cover' },
  avatarInitial:   { fontSize: '28px', fontWeight: '700', color: 'white' },
  profileName:     { fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '4px' },
  profileUsername: { fontSize: '13px', color: '#9CA3AF', marginBottom: '8px' },
  profileBio:      { fontSize: '13px', color: '#6B7280', lineHeight: '1.6', marginBottom: '12px' },
  statsRow:        { display: 'flex', gap: '16px', padding: '12px 0', borderTop: '1px solid #F3F4F6', borderBottom: '1px solid #F3F4F6', marginBottom: '12px', justifyContent: 'center' },
  stat:            { textAlign: 'center' },
  statNum:         { fontSize: '20px', fontWeight: '700', color: '#111827' },
  statLabel:       { fontSize: '12px', color: '#9CA3AF' },
  profileMeta:     { fontSize: '12px', color: '#9CA3AF', marginBottom: '12px' },
  followBtn:       { width: '100%', height: '38px', background: '#1A9E6E', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: 'white', cursor: 'pointer', marginBottom: '8px' },
  followingBtn:    { width: '100%', height: '38px', background: 'white', border: '1px solid #1A9E6E', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#1A9E6E', cursor: 'pointer', marginBottom: '8px' },
  signOutBtn:      { width: '100%', height: '38px', background: 'white', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', color: '#6B7280', cursor: 'pointer' },
  main:            { flex: 1 },
  tabs:            { display: 'flex', gap: '4px', borderBottom: '1px solid #E5E7EB', marginBottom: '24px' },
  tab:             { padding: '10px 16px', background: 'none', border: 'none', borderBottom: '2px solid transparent', fontSize: '14px', color: '#6B7280', cursor: 'pointer', marginBottom: '-1px' },
  tabActive:       { color: '#1A9E6E', borderBottomColor: '#1A9E6E', fontWeight: '500' },
  empty:           { textAlign: 'center', padding: '60px 20px', color: '#9CA3AF', fontSize: '14px' },
  createBtn:       { marginTop: '12px', height: '40px', background: '#1A9E6E', color: 'white', border: 'none', borderRadius: '8px', padding: '0 20px', fontSize: '14px', cursor: 'pointer' },
  link:            { color: '#1A9E6E', cursor: 'pointer' },
  grid:            { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' },
  card:            { background: 'white', border: '1px solid #E5E7EB', borderRadius: '10px', overflow: 'hidden' },
  cardImg:         { height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cardImgPhoto:    { width: '100%', height: '100%', objectFit: 'cover' },
  cardBody:        { padding: '12px' },
  cardTitle:       { fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '4px', cursor: 'pointer' },
  cardDesc:        { fontSize: '12px', color: '#6B7280', lineHeight: '1.5', marginBottom: '8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  cardFooter:      { display: 'flex', alignItems: 'center', gap: '8px' },
  tag:             { fontSize: '11px', fontWeight: '500', padding: '2px 8px', borderRadius: '9999px' },
  saveCount:       { fontSize: '12px', color: '#6B7280', marginLeft: 'auto' },
  editBtn:         { fontSize: '12px', color: '#1A9E6E', background: 'none', border: '1px solid #1A9E6E', borderRadius: '6px', padding: '3px 10px', cursor: 'pointer' },
};