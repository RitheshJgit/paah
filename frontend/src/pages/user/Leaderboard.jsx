import { useEffect, useState, useCallback } from 'react';
import {
  getSmartUsers,
  getSmartTeams,
  getMonthlyLeaderboard
} from '../../features/leaderboard/leaderboardAPI';

/* ── Tab limits ── */
const TAB_LIMITS = { individuals: 10, teams: 10, monthly: 5 };

/* ── SVG Icons ── */
const IconUser = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
);
const IconTeam = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="7" r="3"/><path d="M3 20c0-3 2.7-5 6-5s6 2 6 5"/>
    <circle cx="17" cy="7" r="3"/><path d="M21 20c0-3-2.7-5-6-5"/>
  </svg>
);
const IconCalendar = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconTrophy = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3h12l-1 7a5 5 0 01-10 0L6 3z"/>
    <path d="M6 5H3a1 1 0 00-1 1c0 2.2 1.5 4 3.5 4.5"/>
    <path d="M18 5h3a1 1 0 011 1c0 2.2-1.5 4-3.5 4.5"/>
    <path d="M12 16v4M8 20h8"/>
  </svg>
);
const IconWarning = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const IconRefresh = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/>
    <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
  </svg>
);

/* Medal SVG badges for ranks 1/2/3 */
const MedalBadge = ({ rank }) => {
  const colors = {
    0: { outer: '#C9A84C', inner: '#F5D77A', text: '#7A5500' },
    1: { outer: '#8A9BB0', inner: '#C8D6E3', text: '#3A4A5A' },
    2: { outer: '#B07040', inner: '#D9A878', text: '#5A2C00' },
  };
  const c = colors[rank];
  if (!c) return null;
  return (
    <svg width="30" height="30" viewBox="0 0 22 22" style={{ display: 'block' }}>
      <circle cx="5" cy="5" r="10" fill={c.outer}/>
      <circle cx="14" cy="14" r="10" fill={c.inner}/>
      <text x="11" y="15" textAnchor="middle" fontSize="20" fontWeight="100"
        fontFamily="'Cormorant Garamond',serif" fill={c.text}>
        {rank + 1}
      </text>
    </svg>
  );
};

const TABS = [
  { id: 'individuals', label: 'Individuals', Icon: IconUser  },
  { id: 'teams',       label: 'Teams',       Icon: IconTeam  },
  { id: 'monthly',     label: 'Monthly',     Icon: IconCalendar },
];

const RANK_COLORS = [
  { border: '#C9A84C', bg: 'rgba(201,168,76,0.07)',  glow: '0 0 20px rgba(201,168,76,0.22)', text: '#C9A84C' },
  { border: '#A8B8C8', bg: 'rgba(168,184,200,0.06)', glow: '0 0 16px rgba(168,184,200,0.14)', text: '#7A8FA0' },
  { border: '#C07840', bg: 'rgba(192,120,64,0.06)',  glow: '0 0 16px rgba(192,120,64,0.12)', text: '#C07840' },
];

const AVATAR_COLORS = ['#1B4FD8','#7C3AED','#0E9F6E','#D97706','#DC2626','#0891B2','#BE185D','#065F46'];

function getInitials(name) {
  return (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}
function getAvatarColor(name) {
  return AVATAR_COLORS[(name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];
}

/* ── Avatar ── */
function Avatar({ name, rank, size = 42 }) {
  const bg = rank < 3 ? RANK_COLORS[rank].border : getAvatarColor(name);
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: bg, color: '#fff', fontWeight: 700,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.33, position: 'relative',
    }}>
      {getInitials(name)}
    </div>
  );
}

/* ── Skeleton ── */
function SkeletonRow() {
  return (
    <div className="lb-row lb-skeleton">
      <div className="lb-rank-col"><div className="sk sk-rank" /></div>
      <div className="sk sk-avatar" />
      <div className="lb-info"><div className="sk sk-name" /><div className="sk sk-sub" /></div>
      <div className="sk sk-score" />
    </div>
  );
}

/* ════════════════════════════════════════
   MAIN
════════════════════════════════════════ */
function Leaderboard() {
  const [tab,     setTab]     = useState('individuals');
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      let res;
      if (tab === 'individuals') res = await getSmartUsers();
      else if (tab === 'teams')  res = await getSmartTeams();
      else                       res = await getMonthlyLeaderboard();
      const clean = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      // Apply limit
      setData(clean.slice(0, TAB_LIMITS[tab]));
    } catch (err) {
      console.error('Leaderboard Error:', err);
      setData([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getPoints = (item) => {
    if (tab === 'teams')   return item.totalPoints ?? 0;
    if (tab === 'monthly') return item.total ?? 0;
    return item.credits ?? item.score ?? 0;
  };

  const getSub = (item) => {
    if (tab === 'teams')   return item.memberCount ? `${item.memberCount} members` : 'Team';
    if (tab === 'monthly') return item.month ?? 'This month';
    return item.trustScore != null ? `Trust ${item.trustScore}%` : 'Individual';
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,400&family=DM+Sans:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        :root {
          --navy:      #0B1F4B;
          --navy-mid:  #132254;
          --blue:      #1B4FD8;
          --gold:      #C9A84C;
          --white:     #FFFFFF;
          --gray-50:   #F8F9FB;
          --gray-100:  #F0F2F8;
          --gray-200:  #E4E7EF;
          --gray-400:  #9AA3B8;
          --gray-600:  #4B5675;
          --gray-900:  #0F172A;
          --radius:    12px;
          --radius-lg: 18px;
        }

        .lb-page {
          font-family: 'DM Sans', sans-serif;
          background: var(--gray-50);
          min-height: 100vh;
          padding-bottom: 80px;
          color: var(--gray-900);
        }

        /* ── Hero ── */
        .lb-hero {
          background: linear-gradient(135deg, var(--navy) 0%, #162B60 60%, #1B3980 100%);
          padding: 52px 24px 80px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .lb-hero::before {
          content: '';
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 60% 50% at 20% 50%, rgba(59,110,248,0.18) 0%, transparent 70%),
            radial-gradient(ellipse 40% 60% at 80% 30%, rgba(201,168,76,0.10) 0%, transparent 70%);
          pointer-events: none;
        }
        .lb-hero-eyebrow {
          font-size: 10.5px; font-weight: 600; letter-spacing: 2.5px;
          text-transform: uppercase; color: var(--gold);
          margin-bottom: 14px; position: relative; z-index: 1;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .lb-hero-eyebrow-line {
          width: 28px; height: 1px; background: var(--gold); opacity: 0.5;
        }
        .lb-hero h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(32px, 6vw, 60px);
          font-weight: 700; color: var(--white);
          line-height: 1.1; margin: 0 0 12px;
          position: relative; z-index: 1;
        }
        .lb-hero h1 em { font-style: italic; color: var(--gold); }
        .lb-hero-sub {
          font-size: 14px; color: rgba(255,255,255,0.48);
          max-width: 380px; margin: 0 auto;
          position: relative; z-index: 1; line-height: 1.65;
        }

        /* ── Tabs ── */
        .lb-tabs-wrap {
          display: flex; justify-content: center;
          padding: 0 16px; margin-top: -26px;
          position: relative; z-index: 10;
        }
        .lb-tabs {
          display: inline-flex;
          background: var(--white);
          border: 1px solid var(--gray-200);
          border-radius: 100px; padding: 5px; gap: 4px;
          box-shadow: 0 8px 32px rgba(11,31,75,0.10);
          max-width: 100%; overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .lb-tabs::-webkit-scrollbar { display: none; }
        .lb-tab {
          padding: 10px 20px; border-radius: 100px; border: none;
          background: transparent;
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px; font-weight: 500;
          color: var(--gray-400); cursor: pointer;
          transition: all 0.2s ease;
          display: flex; align-items: center; gap: 7px;
          white-space: nowrap; flex-shrink: 0;
        }
        .lb-tab:hover:not(.active) { color: var(--navy); background: var(--gray-50); }
        .lb-tab.active { background: var(--navy); color: var(--white); box-shadow: 0 4px 14px rgba(11,31,75,0.25); }
        .lb-tab svg { flex-shrink: 0; }

        /* ── Content ── */
        .lb-content {
          max-width: 720px; margin: 36px auto 0; padding: 0 16px;
        }

        .lb-meta {
          display: flex; align-items: center;
          justify-content: space-between; margin-bottom: 18px;
        }
        .lb-meta-label {
          font-size: 11px; font-weight: 600; letter-spacing: 1.5px;
          text-transform: uppercase; color: var(--blue);
        }
        .lb-meta-count { font-size: 12.5px; color: var(--gray-400); }

        /* ── Podium ── */
        .lb-podium {
          display: grid;
          grid-template-columns: 1fr 1.08fr 1fr;
          gap: 10px; margin-bottom: 24px;
          align-items: end;
        }
        .lb-podium-card {
          background: var(--white);
          border: 1px solid var(--gray-200);
          border-radius: var(--radius-lg);
          padding: 20px 12px 18px;
          text-align: center;
          position: relative; overflow: visible;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .lb-podium-card:hover { transform: translateY(-4px); }
        .lb-podium-card.rank-0 {
          border-color: var(--gold);
          box-shadow: 0 0 0 1px rgba(201,168,76,0.3), 0 8px 28px rgba(201,168,76,0.18);
          padding-top: 26px;
        }
        .lb-podium-card.rank-1 {
          border-color: #A8B8C8;
          box-shadow: 0 0 16px rgba(168,184,200,0.14);
        }
        .lb-podium-card.rank-2 {
          border-color: #C07840;
          box-shadow: 0 0 16px rgba(192,120,64,0.12);
        }

        /* Corner rank badge */
        .lb-corner-badge {
          position: absolute;
          top: -1px; left: -1px;
          z-index: 2;
          line-height: 1;
        }

        .lb-podium-avatar-wrap {
          position: relative;
          width: 52px; height: 52px;
          margin: 0 auto 10px;
        }
        .lb-podium-avatar {
          width: 52px; height: 52px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; font-weight: 700; color: #fff;
        }
        .lb-podium-name {
          font-size: 12.5px; font-weight: 600; color: var(--navy);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          margin-bottom: 5px;
        }
        .lb-podium-pts {
          font-family: 'Cormorant Garamond', serif;
          font-size: 20px; font-weight: 700; line-height: 1;
        }
        .lb-podium-pts-unit {
          font-size: 10.5px; font-weight: 500;
          color: var(--gray-400); margin-left: 2px;
          font-family: 'DM Sans', sans-serif;
        }
        .lb-podium-sub {
          font-size: 10.5px; color: var(--gray-400); margin-top: 3px;
        }

        @media (max-width: 480px) {
          .lb-podium { gap: 7px; }
          .lb-podium-card { padding: 16px 8px 14px; border-radius: 12px; }
          .lb-podium-card.rank-0 { padding-top: 20px; }
          .lb-podium-avatar-wrap { width: 38px; height: 38px; }
          .lb-podium-avatar { width: 38px; height: 38px; font-size: 13px; }
          .lb-podium-pts { font-size: 17px; }
          .lb-podium-name { font-size: 11px; }
          .lb-podium-sub { display: none; }
        }

        /* ── Divider ── */
        .lb-divider {
          display: flex; align-items: center; gap: 12px;
          margin: 22px 0 14px;
          color: var(--gray-400); font-size: 11px;
          font-weight: 600; letter-spacing: 1.2px; text-transform: uppercase;
        }
        .lb-divider::before, .lb-divider::after {
          content: ''; flex: 1; height: 1px; background: var(--gray-200);
        }

        /* ── List rows ── */
        .lb-list { display: flex; flex-direction: column; gap: 9px; }
        .lb-row {
          background: var(--white);
          border: 1px solid var(--gray-200);
          border-radius: var(--radius);
          padding: 13px 16px;
          display: grid;
          grid-template-columns: 40px 44px 1fr auto;
          align-items: center; gap: 12px;
          transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
          animation: rowIn 0.4s ease both;
          position: relative;
        }
        .lb-row:hover {
          transform: translateX(4px);
          box-shadow: 0 4px 16px rgba(11,31,75,0.07);
          border-color: var(--blue);
        }

        /* Top-3 row highlight strip */
        .lb-row.top-rank {
          border-left-width: 3px;
        }

        @keyframes rowIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .lb-rank-col {
          display: flex; align-items: center; justify-content: center;
        }
        .lb-rank-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 19px; font-weight: 700;
          color: var(--gray-400); line-height: 1;
          text-align: center;
        }
        .lb-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
        .lb-name {
          font-size: 13.5px; font-weight: 600; color: var(--navy);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .lb-sub { font-size: 11.5px; color: var(--gray-400); }

        .lb-score {
          font-family: 'Cormorant Garamond', serif;
          font-size: 21px; font-weight: 700; color: var(--navy);
          white-space: nowrap; text-align: right; line-height: 1;
        }
        .lb-score-unit {
          font-size: 10.5px; font-weight: 500;
          color: var(--gray-400); margin-left: 2px;
          font-family: 'DM Sans', sans-serif;
        }

        /* ── Skeleton ── */
        .lb-skeleton { pointer-events: none; }
        .sk {
          border-radius: 6px;
          background: linear-gradient(90deg, var(--gray-200) 25%, var(--gray-100) 50%, var(--gray-200) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }
        .sk-avatar { width: 44px; height: 44px; border-radius: 50%; }
        .sk-rank   { width: 22px; height: 20px; border-radius: 4px; }
        .sk-name   { width: 55%; height: 13px; margin-bottom: 6px; }
        .sk-sub    { width: 35%; height: 10px; }
        .sk-score  { width: 56px; height: 20px; border-radius: 4px; justify-self: end; }

        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* ── Empty / Error ── */
        .lb-empty, .lb-error {
          text-align: center; padding: 60px 20px;
          background: var(--white);
          border: 1px solid var(--gray-200);
          border-radius: var(--radius-lg);
        }
        .lb-error { border-color: #fde8e8; }
        .lb-empty-icon, .lb-error-icon {
          color: var(--gray-400); margin: 0 auto 16px;
          display: flex; align-items: center; justify-content: center;
        }
        .lb-empty-title, .lb-error-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px; font-weight: 700; color: var(--navy); margin-bottom: 8px;
        }
        .lb-error-title { color: #c0392b; font-family: 'DM Sans', sans-serif; font-size: 16px; }
        .lb-empty-sub, .lb-error-sub { font-size: 13.5px; color: var(--gray-400); margin-bottom: 20px; }
        .lb-retry-btn {
          padding: 9px 22px; background: var(--navy); color: var(--white);
          border: none; border-radius: var(--radius);
          font-family: 'DM Sans', sans-serif; font-size: 13.5px; font-weight: 500;
          cursor: pointer; transition: background 0.15s;
          display: inline-flex; align-items: center; gap: 7px;
        }
        .lb-retry-btn:hover { background: var(--blue); }

        /* ── Responsive ── */
        @media (max-width: 600px) {
          .lb-hero { padding: 38px 16px 68px; }
          .lb-content { padding: 0 12px; margin-top: 28px; }
          .lb-tab { padding: 9px 14px; font-size: 13px; }
          .lb-row { padding: 11px 12px; gap: 10px; grid-template-columns: 32px 38px 1fr auto; }
          .lb-rank-num { font-size: 17px; }
          .lb-name { font-size: 13px; }
          .lb-score { font-size: 18px; }
        }

        @media (max-width: 400px) {
          .lb-tab { padding: 8px 11px; font-size: 12px; gap: 5px; }
          .lb-row { grid-template-columns: 28px 34px 1fr auto; gap: 8px; padding: 10px; }
          .lb-sub { display: none; }
        }
      `}</style>

      <div className="lb-page">

        {/* ── Hero ── */}
        <header className="lb-hero">
          <div className="lb-hero-eyebrow">
            <span className="lb-hero-eyebrow-line" />
            Live Rankings
            <span className="lb-hero-eyebrow-line" />
          </div>
          <h1>The <em>Hall of</em><br />Champions</h1>
          <p className="lb-hero-sub">Verified contributions, real scores, transparent rankings — updated live.</p>
        </header>

        {/* ── Tabs ── */}
        <div className="lb-tabs-wrap">
          <div className="lb-tabs" role="tablist">
            {TABS.map(t => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                className={`lb-tab${tab === t.id ? ' active' : ''}`}
                onClick={() => setTab(t.id)}
              >
                <t.Icon />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content ── */}
        <main className="lb-content">

          {!loading && !error && data.length > 0 && (
            <div className="lb-meta">
              <span className="lb-meta-label">
                {TABS.find(t => t.id === tab)?.label} — Top {TAB_LIMITS[tab]}
              </span>
              <span className="lb-meta-count">{data.length} entries</span>
            </div>
          )}

          {loading && (
            <div className="lb-list">
              {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
            </div>
          )}

          {!loading && error && (
            <div className="lb-error">
              <div className="lb-error-icon"><IconWarning /></div>
              <div className="lb-error-title">Failed to load rankings</div>
              <div className="lb-error-sub">Something went wrong. Please try again.</div>
              <button className="lb-retry-btn" onClick={fetchData}>
                <IconRefresh /> Retry
              </button>
            </div>
          )}

          {!loading && !error && data.length === 0 && (
            <div className="lb-empty">
              <div className="lb-empty-icon"><IconTrophy /></div>
              <div className="lb-empty-title">No rankings yet</div>
              <div className="lb-empty-sub">
                {tab === 'monthly'
                  ? 'No data available for this month yet.'
                  : 'Be the first to make your mark on the leaderboard.'}
              </div>
            </div>
          )}

          {!loading && !error && data.length > 0 && (() => {
            const top3 = data.slice(0, Math.min(3, data.length));
            const rest = data.slice(3);

            // Podium order: 2nd | 1st | 3rd
            const podiumOrder = [
              top3[1] ? { item: top3[1], rank: 1 } : null,
              top3[0] ? { item: top3[0], rank: 0 } : null,
              top3[2] ? { item: top3[2], rank: 2 } : null,
            ].filter(Boolean);

            return (
              <>
                {/* ── Podium ── */}
                {top3.length >= 2 && (
                  <div className="lb-podium">
                    {podiumOrder.map(({ item, rank }) => {
                      const pts = getPoints(item);
                      const bg  = RANK_COLORS[rank].border;
                      return (
                        <div
                          key={item._id ?? rank}
                          className={`lb-podium-card rank-${rank}`}
                          style={{ animationDelay: `${rank * 60}ms` }}
                        >
                          {/* Corner medal badge */}
                          <div className="lb-corner-badge">
                            <MedalBadge rank={rank} />
                          </div>

                          <div className="lb-podium-avatar-wrap">
                            <div className="lb-podium-avatar" style={{ background: bg }}>
                              {getInitials(item.name)}
                            </div>
                          </div>

                          <div className="lb-podium-name">{item.name || 'Unknown'}</div>
                          <div className="lb-podium-pts" style={{ color: RANK_COLORS[rank].text }}>
                            {pts.toLocaleString()}
                            <span className="lb-podium-pts-unit">pts</span>
                          </div>
                          <div className="lb-podium-sub">{getSub(item)}</div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Single entry — just a row */}
                {top3.length === 1 && (
                  <div className="lb-list">
                    {data.map((item, i) => (
                      <div
                        key={item._id ?? i}
                        className="lb-row"
                        style={{
                          animationDelay: `${i * 50}ms`,
                          ...(i < 3 ? {
                            borderLeftColor: RANK_COLORS[i].border,
                            background: RANK_COLORS[i].bg,
                          } : {}),
                        }}
                      >
                        <div className="lb-rank-col">
                          {i < 3
                            ? <MedalBadge rank={i} />
                            : <span className="lb-rank-num">{i + 1}</span>
                          }
                        </div>
                        <Avatar name={item.name} rank={i} />
                        <div className="lb-info">
                          <span className="lb-name">{item.name || 'Unknown'}</span>
                          <span className="lb-sub">{getSub(item)}</span>
                        </div>
                        <div className="lb-score" style={i < 3 ? { color: RANK_COLORS[i].text } : {}}>
                          {getPoints(item).toLocaleString()}
                          <span className="lb-score-unit">pts</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Remaining rows (rank 4+) */}
                {rest.length > 0 && (
                  <>
                    <div className="lb-divider">Rankings</div>
                    <div className="lb-list">
                      {rest.map((item, i) => {
                        const rank  = i + 3;
                        const delay = Math.min(i * 40, 300);
                        return (
                          <div
                            key={item._id ?? rank}
                            className="lb-row"
                            style={{ animationDelay: `${delay}ms` }}
                          >
                            <div className="lb-rank-col">
                              <span className="lb-rank-num">{rank + 1}</span>
                            </div>
                            <Avatar name={item.name} rank={rank} />
                            <div className="lb-info">
                              <span className="lb-name">{item.name || 'Unknown'}</span>
                              <span className="lb-sub">{getSub(item)}</span>
                            </div>
                            <div className="lb-score">
                              {getPoints(item).toLocaleString()}
                              <span className="lb-score-unit">pts</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </>
            );
          })()}

        </main>
      </div>
    </>
  );
}

export default Leaderboard;