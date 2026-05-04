import { useEffect, useState, useCallback } from 'react';
import {
  createTeam,
  joinTeam,
  getTeams,
  updateTeamName
} from '../../features/team/teamAPI';
import { useAuth } from '../../context/AuthContext';

/* ════════════════════════════════════════
   TEAMS PAGE — Luxury Dark Theme
   Matches Home.jsx / Leaderboard.jsx palette
════════════════════════════════════════ */

/* ── Notification toast ── */
function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3200);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`toast toast-${type}`}>
      <span className="toast-icon">
        {type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}
      </span>
      {msg}
    </div>
  );
}

/* ── Avatar initials ── */
function TeamAvatar({ name, size = 48 }) {
  const initials = (name || '?')
    .split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const COLORS = ['#1B4FD8','#7C3AED','#0E9F6E','#D97706','#0891B2','#C9A84C'];
  const bg = COLORS[(name?.charCodeAt(0) ?? 0) % COLORS.length];
  return (
    <div className="team-avatar" style={{ width: size, height: size, background: bg, fontSize: size * 0.35 }}>
      {initials}
    </div>
  );
}

/* ── Skeleton card ── */
function SkeletonCard() {
  return (
    <div className="team-card sk-card">
      <div className="sk sk-avatar-lg" />
      <div className="sk-body">
        <div className="sk sk-name" />
        <div className="sk sk-sub" />
        <div className="sk-stats-row">
          {[1,2,3,4].map(i => <div key={i} className="sk sk-stat" />)}
        </div>
      </div>
    </div>
  );
}

/* ── Stat pill ── */
function StatPill({ icon, label, value }) {
  return (
    <div className="stat-pill">
      <span className="stat-pill-icon">{icon}</span>
      <span className="stat-pill-val">{value}</span>
      <span className="stat-pill-label">{label}</span>
    </div>
  );
}

/* ════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════ */
function ActionPage() {
  const { user, setUser } = useAuth();

  const [teams,     setTeams]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [creating,  setCreating]  = useState(false);
  const [updating,  setUpdating]  = useState(false);
  const [joiningId, setJoiningId] = useState(null);
  const [teamName,  setTeamName]  = useState('');
  const [editName,  setEditName]  = useState('');
  const [search,    setSearch]    = useState('');
  const [toast,     setToast]     = useState(null);

  const notify = useCallback((msg, type = 'success') => {
    setToast({ msg, type, key: Date.now() });
  }, []);

  /* ── Fetch ── */
  const fetchTeams = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getTeams();
      setTeams(data || []);
    } catch (err) {
      console.error(err);
      setTeams([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTeams(); }, [fetchTeams]);

  /* ── Create ── */
  const handleCreate = async () => {
    if (!teamName.trim()) return notify('Enter a team name', 'error');
    try {
      setCreating(true);
      const newTeam = await createTeam({ name: teamName });
      setUser(prev => ({ ...prev, teamId: newTeam._id }));
      setTeamName('');
      notify('Team created successfully!');
      fetchTeams();
    } catch (err) {
      notify(err.response?.data?.msg || 'Failed to create team', 'error');
    } finally {
      setCreating(false);
    }
  };

  /* ── Join ── */
  const handleJoin = async (id) => {
    try {
      setJoiningId(id);
      await joinTeam({ teamId: id });
      setUser(prev => ({ ...prev, teamId: id }));
      notify('Successfully joined team!');
      fetchTeams();
    } catch (err) {
      notify(err.response?.data?.msg || 'Failed to join team', 'error');
    } finally {
      setJoiningId(null);
    }
  };

  /* ── Update ── */
  const handleUpdate = async () => {
    if (!editName.trim()) return notify('Enter a new name', 'error');
    try {
      setUpdating(true);
      await updateTeamName(user.teamId, { name: editName });
      setEditName('');
      notify('Team name updated!');
      fetchTeams();
    } catch (err) {
      notify(err.response?.data?.msg || 'Failed to update team', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const filteredTeams = teams.filter(t =>
    t?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const myTeam = teams.find(t => t._id === user?.teamId);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@400;500;600&display=swap');

        :root {
          --navy:      #0B1F4B;
          --navy-mid:  #132254;
          --blue:      #1B4FD8;
          --blue-mid:  #3B6EF8;
          --gold:      #C9A84C;
          --white:     #FFFFFF;
          --gray-50:   #F8F9FB;
          --gray-100:  #F0F2F8;
          --gray-200:  #E4E7EF;
          --gray-400:  #9AA3B8;
          --gray-600:  #4B5675;
          --gray-900:  #0F172A;
          --green:     #0E9F6E;
          --radius:    12px;
          --radius-lg: 18px;
        }

        * { box-sizing: border-box; }

        .teams-page {
          font-family: 'DM Sans', sans-serif;
          background: var(--gray-50);
          min-height: 100vh;
          padding-bottom: 80px;
          color: var(--gray-900);
        }

        /* ════ HERO ════ */
        .teams-hero {
          background: linear-gradient(135deg, var(--navy) 0%, #162B60 60%, #1B3980 100%);
          padding: 56px 24px 80px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .teams-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 50% at 15% 60%, rgba(59,110,248,0.18) 0%, transparent 70%),
            radial-gradient(ellipse 40% 60% at 85% 20%, rgba(201,168,76,0.10) 0%, transparent 70%);
          pointer-events: none;
        }

        .teams-hero-eyebrow {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 14px;
          position: relative;
          z-index: 1;
        }

        .teams-hero h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(36px, 6vw, 60px);
          font-weight: 700;
          color: var(--white);
          line-height: 1.08;
          margin-bottom: 12px;
          position: relative;
          z-index: 1;
        }

        .teams-hero h1 em { font-style: italic; color: var(--gold); }

        .teams-hero-sub {
          font-size: 15px;
          color: rgba(255,255,255,0.5);
          max-width: 400px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        /* ════ CONTENT ════ */
        .teams-body {
          max-width: 860px;
          margin: 0 auto;
          padding: 0 20px;
        }

        /* ════ MY TEAM BANNER ════ */
        .my-team-banner {
          background: var(--white);
          border: 1px solid var(--gold);
          border-radius: var(--radius-lg);
          padding: 22px 24px;
          margin-top: -36px;
          position: relative;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 8px 28px rgba(201,168,76,0.14);
          animation: fadeUp 0.5s ease both;
        }

        .my-team-banner-info { flex: 1; min-width: 0; }

        .my-team-banner-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 3px;
        }

        .my-team-banner-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px;
          font-weight: 700;
          color: var(--navy);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .my-team-banner-sub {
          font-size: 13px;
          color: var(--gray-400);
          margin-top: 2px;
        }

        /* ════ CONTROLS CARD ════ */
        .controls-card {
          background: var(--white);
          border: 1px solid var(--gray-200);
          border-radius: var(--radius-lg);
          padding: 24px;
          margin-top: 20px;
          animation: fadeUp 0.5s ease 0.05s both;
        }

        .controls-card-title {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--blue);
          margin-bottom: 16px;
        }

        .controls-row {
          display: flex;
          gap: 10px;
        }

        @media (max-width: 480px) {
          .controls-row { flex-direction: column; }
        }

        .ctrl-input {
          flex: 1;
          padding: 11px 16px;
          border: 1px solid var(--gray-200);
          border-radius: var(--radius);
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: var(--gray-900);
          background: var(--gray-50);
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }

        .ctrl-input:focus {
          border-color: var(--blue);
          box-shadow: 0 0 0 3px rgba(27,79,216,0.08);
          background: var(--white);
        }

        .ctrl-input::placeholder { color: var(--gray-400); }

        .ctrl-btn {
          padding: 11px 22px;
          border: none;
          border-radius: var(--radius);
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .ctrl-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        .ctrl-btn-create {
          background: var(--navy);
          color: var(--white);
        }
        .ctrl-btn-create:hover:not(:disabled) { background: var(--blue); }

        .ctrl-btn-update {
          background: var(--gold);
          color: var(--navy);
        }
        .ctrl-btn-update:hover:not(:disabled) { background: #d9b85a; }

        /* ════ SEARCH BAR ════ */
        .search-wrap {
          position: relative;
          margin-top: 20px;
          animation: fadeUp 0.5s ease 0.1s both;
        }

        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--gray-400);
          pointer-events: none;
          font-size: 15px;
        }

        .search-input {
          width: 100%;
          padding: 13px 16px 13px 44px;
          border: 1px solid var(--gray-200);
          border-radius: var(--radius);
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          background: var(--white);
          color: var(--gray-900);
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }

        .search-input:focus {
          border-color: var(--blue);
          box-shadow: 0 0 0 3px rgba(27,79,216,0.08);
        }

        .search-input::placeholder { color: var(--gray-400); }

        /* ════ META ROW ════ */
        .list-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 24px 0 14px;
        }

        .list-meta-label {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--blue);
        }

        .list-meta-count {
          font-size: 13px;
          color: var(--gray-400);
        }

        /* ════ TEAM CARD ════ */
        .team-card {
          background: var(--white);
          border: 1px solid var(--gray-200);
          border-radius: var(--radius-lg);
          padding: 20px 22px;
          display: flex;
          align-items: flex-start;
          gap: 16px;
          transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
          animation: fadeUp 0.4s ease both;
        }

        .team-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(11,31,75,0.08);
          border-color: var(--blue);
        }

        .team-card.is-mine {
          border-color: var(--gold);
          box-shadow: 0 4px 20px rgba(201,168,76,0.12);
        }

        .team-card.is-mine:hover {
          border-color: var(--gold);
          box-shadow: 0 10px 28px rgba(201,168,76,0.18);
        }

        .team-avatar {
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: #fff;
          flex-shrink: 0;
          letter-spacing: 0.5px;
        }

        .team-card-body { flex: 1; min-width: 0; }

        .team-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 6px;
          flex-wrap: wrap;
        }

        .team-card-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 20px;
          font-weight: 700;
          color: var(--navy);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .team-card-mine-badge {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
          background: var(--gold);
          color: var(--navy);
          padding: 3px 10px;
          border-radius: 100px;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .team-stats-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
        }

        .stat-pill {
          display: flex;
          align-items: center;
          gap: 5px;
          background: var(--gray-50);
          border: 1px solid var(--gray-200);
          border-radius: 100px;
          padding: 4px 12px;
          font-size: 12px;
        }

        .stat-pill-icon { font-size: 13px; }
        .stat-pill-val  { font-weight: 600; color: var(--navy); }
        .stat-pill-label{ color: var(--gray-400); }

        .team-card-action {
          display: flex;
          align-items: center;
          margin-top: 14px;
        }

        /* ── Action buttons ── */
        .btn-join {
          padding: 9px 20px;
          background: var(--green);
          color: var(--white);
          border: none;
          border-radius: var(--radius);
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .btn-join:hover:not(:disabled) { background: #0b8a5f; transform: translateY(-1px); }
        .btn-join:disabled { opacity: 0.6; cursor: not-allowed; }

        .btn-taken {
          padding: 9px 16px;
          background: var(--gray-100);
          color: var(--gray-400);
          border: 1px solid var(--gray-200);
          border-radius: var(--radius);
          font-size: 13px;
          font-weight: 500;
          cursor: not-allowed;
          font-family: 'DM Sans', sans-serif;
        }

        /* ════ EMPTY ════ */
        .teams-empty {
          text-align: center;
          padding: 64px 20px;
          background: var(--white);
          border: 1px solid var(--gray-200);
          border-radius: var(--radius-lg);
        }

        .teams-empty-icon  { font-size: 44px; margin-bottom: 16px; }
        .teams-empty-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 24px; font-weight: 700;
          color: var(--navy); margin-bottom: 8px;
        }
        .teams-empty-sub { font-size: 14px; color: var(--gray-400); }

        /* ════ SKELETONS ════ */
        .sk-card {
          pointer-events: none;
          background: var(--white);
          border-radius: var(--radius-lg);
          border: 1px solid var(--gray-200);
          padding: 20px 22px;
          display: flex;
          gap: 16px;
        }

        .sk-body { flex: 1; }
        .sk-stats-row { display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap; }

        .sk {
          border-radius: 6px;
          background: linear-gradient(90deg, var(--gray-200) 25%, var(--gray-100) 50%, var(--gray-200) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }

        .sk-avatar-lg { width: 48px; height: 48px; border-radius: 14px; flex-shrink: 0; }
        .sk-name      { width: 45%; height: 20px; margin-bottom: 8px; }
        .sk-sub       { width: 30%; height: 13px; }
        .sk-stat      { width: 80px; height: 26px; border-radius: 100px; }

        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* ════ TOAST ════ */
        .toast {
          position: fixed;
          bottom: 28px;
          right: 24px;
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 13px 20px;
          border-radius: var(--radius);
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          box-shadow: 0 8px 28px rgba(0,0,0,0.14);
          animation: toastIn 0.3s ease both;
          max-width: 340px;
        }

        .toast-success { background: var(--navy); color: var(--white); }
        .toast-error   { background: #C0392B;     color: var(--white); }
        .toast-info    { background: var(--blue);  color: var(--white); }

        .toast-icon {
          width: 22px; height: 22px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px;
          flex-shrink: 0;
        }

        @keyframes toastIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ════ TEAM LIST GRID ════ */
        .teams-list { display: flex; flex-direction: column; gap: 12px; }

        /* ════ ANIMATIONS ════ */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 600px) {
          .my-team-banner { flex-direction: column; align-items: flex-start; gap: 12px; }
          .team-card { flex-direction: column; }
        }
      `}</style>

      <div className="teams-page">

        {/* ════ HERO ════ */}
        <header className="teams-hero">
          <div className="teams-hero-eyebrow">Collaboration Hub</div>
          <h1>Find Your <em>Team</em></h1>
          <p className="teams-hero-sub">
            Join forces, combine efforts, and rise together on the impact leaderboard.
          </p>
        </header>

        <div className="teams-body">

          {/* ════ MY TEAM BANNER ════ */}
          {user?.teamId && myTeam && (
            <div className="my-team-banner">
              <TeamAvatar name={myTeam.name} size={52} />
              <div className="my-team-banner-info">
                <div className="my-team-banner-label">Your Team</div>
                <div className="my-team-banner-name">{myTeam.name}</div>
                <div className="my-team-banner-sub">
                  {myTeam.members?.length || 0} members · {myTeam.totalPoints || 0} pts
                </div>
              </div>
            </div>
          )}

          {/* ════ CONTROLS ════ */}
          <div className="controls-card">
            {!user?.teamId ? (
              <>
                <div className="controls-card-title">Create a New Team</div>
                <div className="controls-row">
                  <input
                    className="ctrl-input"
                    placeholder="Enter team name…"
                    value={teamName}
                    onChange={e => setTeamName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleCreate()}
                  />
                  <button
                    className="ctrl-btn ctrl-btn-create"
                    onClick={handleCreate}
                    disabled={creating}
                  >
                    {creating ? (
                      <><span className="spinner" />Creating…</>
                    ) : (
                      <>＋ Create Team</>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="controls-card-title">Rename Your Team</div>
                <div className="controls-row">
                  <input
                    className="ctrl-input"
                    placeholder="New team name…"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleUpdate()}
                  />
                  <button
                    className="ctrl-btn ctrl-btn-update"
                    onClick={handleUpdate}
                    disabled={updating}
                  >
                    {updating ? 'Saving…' : '✎ Update Name'}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* ════ SEARCH ════ */}
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              placeholder="Search teams…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* ════ META ════ */}
          {!loading && filteredTeams.length > 0 && (
            <div className="list-meta">
              <span className="list-meta-label">All Teams</span>
              <span className="list-meta-count">{filteredTeams.length} team{filteredTeams.length !== 1 ? 's' : ''}</span>
            </div>
          )}

          {/* ════ LOADING ════ */}
          {loading && (
            <div className="teams-list" style={{ marginTop: 24 }}>
              {[1,2,3].map(i => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* ════ EMPTY ════ */}
          {!loading && filteredTeams.length === 0 && (
            <div className="teams-empty" style={{ marginTop: 24 }}>
              <div className="teams-empty-icon">🤝</div>
              <div className="teams-empty-title">
                {search ? 'No teams match your search' : 'No teams yet'}
              </div>
              <div className="teams-empty-sub">
                {search
                  ? 'Try a different name or clear the search.'
                  : 'Be the first to create a team and invite others!'}
              </div>
            </div>
          )}

          {/* ════ TEAM LIST ════ */}
          {!loading && filteredTeams.length > 0 && (
            <div className="teams-list">
              {filteredTeams.map((team, i) => {
                const isJoined = user?.teamId === team._id;
                return (
                  <div
                    key={team._id}
                    className={`team-card${isJoined ? ' is-mine' : ''}`}
                    style={{ animationDelay: `${Math.min(i * 50, 300)}ms` }}
                  >
                    <TeamAvatar name={team.name} size={48} />

                    <div className="team-card-body">
                      <div className="team-card-top">
                        <span className="team-card-name">{team.name || 'Unnamed Team'}</span>
                        {isJoined && <span className="team-card-mine-badge">Your Team</span>}
                      </div>

                      <div className="team-stats-row">
                        <StatPill icon="👥" label="Members" value={team.members?.length || 0} />
                        <StatPill icon="⭐" label="Points"  value={(team.totalPoints || 0).toLocaleString()} />
                        <StatPill icon="💰" label="Donations" value={team.acceptedDonations || 0} />
                        <StatPill icon="🛡️" label="Trust"   value={`${(team.trustScore || 0).toFixed(1)}%`} />
                      </div>

                      <div className="team-card-action">
                        {!user?.teamId ? (
                          <button
                            className="btn-join"
                            onClick={() => handleJoin(team._id)}
                            disabled={joiningId === team._id}
                          >
                            {joiningId === team._id ? '⏳ Joining…' : '＋ Join Team'}
                          </button>
                        ) : isJoined ? null : (
                          <button className="btn-taken" disabled>
                            Already in a team
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>

      {/* ════ TOAST ════ */}
      {toast && (
        <Toast
          key={toast.key}
          msg={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}

export default ActionPage;