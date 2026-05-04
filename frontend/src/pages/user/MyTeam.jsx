import { useEffect, useState } from 'react';
import { getMyTeam, changeLeader, leaveTeam } from '../../features/team/teamAPI';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// ─── Toast ─────────────────────────────────────────────────────────────────────
const Toast = ({ msg, type, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3800); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '13px 20px', fontFamily: "'Outfit',sans-serif", fontSize: 14, fontWeight: 500,
      borderLeft: `3px solid ${type === 'success' ? '#16a34a' : '#dc2626'}`,
      background: type === 'success' ? '#f0fdf4' : '#fef2f2',
      color: type === 'success' ? '#166534' : '#991b1b',
      boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
      animation: 'toastIn 0.35s cubic-bezier(0.16,1,0.3,1) both',
    }}>
      {type === 'success'
        ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      }
      {msg}
    </div>
  );
};

// ─── Confirm Modal ─────────────────────────────────────────────────────────────
const ConfirmModal = ({ title, message, confirmLabel, danger, onConfirm, onCancel }) => (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 9998, padding: 24, animation: 'fadeIn 0.2s ease',
  }}>
    <div style={{
      background: '#fff', maxWidth: 400, width: '100%',
      border: '1px solid #e8eaf0', borderTop: `3px solid ${danger ? '#dc2626' : '#1a3a8f'}`,
      fontFamily: "'Outfit',sans-serif",
    }}>
      <div style={{ padding: '22px 24px 18px', borderBottom: '1px solid #f0f1f5' }}>
        <p style={{ margin: '0 0 6px', fontFamily: "'Playfair Display',serif", fontSize: 18, color: '#0d1b3e' }}>{title}</p>
        <p style={{ margin: 0, fontSize: 13.5, color: '#6b7280', fontWeight: 300, lineHeight: 1.6 }}>{message}</p>
      </div>
      <div style={{ padding: '16px 24px', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button onClick={onCancel} style={{
          padding: '9px 20px', background: '#fff', border: '1.5px solid #e5e7eb',
          fontFamily: "'Outfit',sans-serif", fontSize: 13, fontWeight: 500, cursor: 'pointer',
          color: '#374151', transition: 'border-color 0.2s',
        }}
          onMouseOver={e => e.currentTarget.style.borderColor = '#9ca3af'}
          onMouseOut={e => e.currentTarget.style.borderColor = '#e5e7eb'}
        >
          Cancel
        </button>
        <button onClick={onConfirm} style={{
          padding: '9px 20px', background: danger ? '#dc2626' : '#1a3a8f',
          border: 'none', fontFamily: "'Outfit',sans-serif", fontSize: 13,
          fontWeight: 600, cursor: 'pointer', color: '#fff',
          letterSpacing: '0.5px', transition: 'background 0.2s',
        }}
          onMouseOver={e => e.currentTarget.style.background = danger ? '#b91c1c' : '#1e4bbd'}
          onMouseOut={e => e.currentTarget.style.background = danger ? '#dc2626' : '#1a3a8f'}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

// ─── Skeleton ──────────────────────────────────────────────────────────────────
const Shimmer = ({ h = 14, w = '100%', mb = 10 }) => (
  <div style={{
    height: h, width: w, marginBottom: mb, borderRadius: 2,
    background: 'linear-gradient(90deg,#f0f1f5 25%,#e4e6ed 50%,#f0f1f5 75%)',
    backgroundSize: '400px 100%', animation: 'shimmer 1.2s infinite',
  }} />
);

// ─── No Team State ─────────────────────────────────────────────────────────────
const NoTeamState = ({ onNavigate }) => (
  <div style={{
    minHeight: '100vh', background: '#f4f5f7', display: 'flex',
    alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit',sans-serif", padding: 24,
  }}>
    <div style={{
      background: '#fff', border: '1px solid #e8eaf0', borderTop: '3px solid #1a3a8f',
      padding: '52px 40px', maxWidth: 400, width: '100%', textAlign: 'center',
    }}>
      <div style={{
        width: 72, height: 72, background: '#f0f4ff', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 20px', color: '#1a3a8f',
      }}>
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
        </svg>
      </div>
      <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, color: '#0d1b3e', margin: '0 0 8px' }}>
        Not in a Team
      </p>
      <p style={{ fontSize: 14, color: '#6b7280', fontWeight: 300, lineHeight: 1.7, margin: '0 0 28px' }}>
        You are not currently a member of any team. Join or create a team to collaborate and complete tasks together.
      </p>
      <button onClick={onNavigate} style={{
        width: '100%', height: 48, background: '#1a3a8f', color: '#fff',
        border: 'none', fontFamily: "'Outfit',sans-serif", fontSize: 13,
        fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer',
      }}
        onMouseOver={e => e.currentTarget.style.background = '#1e4bbd'}
        onMouseOut={e => e.currentTarget.style.background = '#1a3a8f'}
      >
        Browse Teams
      </button>
    </div>
  </div>
);

// ─── Avatar ────────────────────────────────────────────────────────────────────
const Avatar = ({ name, size = 40, isLeader = false }) => {
  const initials = name ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?';
  const colors = ['#1a3a8f','#0f766e','#7c3aed','#b45309','#be123c','#0369a1'];
  const bg = colors[(name?.charCodeAt(0) || 0) % colors.length];
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <div style={{
        width: size, height: size, background: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: 700, fontSize: size * 0.35,
        fontFamily: "'Outfit',sans-serif", letterSpacing: '0.5px',
      }}>
        {initials}
      </div>
      {isLeader && (
        <div style={{
          position: 'absolute', bottom: -3, right: -3,
          width: 16, height: 16, background: '#f59e0b',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '2px solid #fff',
        }}>
          <svg width="8" height="8" viewBox="0 0 24 24" fill="white">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </div>
      )}
    </div>
  );
};

// ─── Trust Score Bar ───────────────────────────────────────────────────────────
const TrustBar = ({ score }) => {
  const pct = Math.min(Math.max(score || 0, 0), 100);
  const color = pct >= 75 ? '#16a34a' : pct >= 40 ? '#f59e0b' : '#dc2626';
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.7px', fontWeight: 600 }}>Trust Score</span>
        <span style={{ fontSize: 12, fontWeight: 700, color }}>{pct.toFixed(1)}%</span>
      </div>
      <div style={{ height: 6, background: '#f0f1f5', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`, background: color,
          transition: 'width 1s ease',
        }} />
      </div>
    </div>
  );
};

// ─── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, accent }) => (
  <div style={{
    background: '#fff', border: '1px solid #e8eaf0',
    borderTop: `3px solid ${accent || '#1a3a8f'}`, padding: '16px 18px',
  }}>
    <p style={{ margin: '0 0 4px', fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>{label}</p>
    <p style={{ margin: 0, fontFamily: "'Playfair Display',serif", fontSize: 24, color: '#0d1b3e', lineHeight: 1 }}>{value}</p>
  </div>
);

// ─── Member Row ────────────────────────────────────────────────────────────────
const MemberRow = ({ member, isLeader, isSelf, isLeaderOfTeam, onMakeLeader, actionLoading, index }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), index * 60); return () => clearTimeout(t); }, [index]);

  return (
    <div style={{
      background: '#fff', border: '1px solid #e8eaf0',
      borderLeft: `3px solid ${isLeader ? '#f59e0b' : isSelf ? '#1a3a8f' : '#e8eaf0'}`,
      padding: '14px 18px',
      display: 'flex', alignItems: 'center', gap: 14,
      opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(14px)',
      transition: 'opacity 0.4s ease, transform 0.4s ease, box-shadow 0.2s',
    }}
      onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(26,58,143,0.08)'}
      onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
    >
      <Avatar name={member.name} size={44} isLeader={isLeader} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#0d1b3e' }}>{member.name}</p>
          {isSelf && (
            <span style={{
              fontSize: 10, fontWeight: 700, color: '#2563eb',
              background: '#eff6ff', padding: '2px 8px', letterSpacing: '0.4px', textTransform: 'uppercase',
            }}>You</span>
          )}
          {isLeader && (
            <span style={{
              fontSize: 10, fontWeight: 700, color: '#92400e',
              background: '#fef3c7', padding: '2px 8px', letterSpacing: '0.4px', textTransform: 'uppercase',
            }}>Team Leader</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>
            <span style={{ color: '#9ca3af' }}>Credits</span> &nbsp;
            <strong style={{ color: '#374151' }}>{member.credits ?? 0}</strong>
          </span>
          <span style={{ fontSize: 12, color: '#6b7280' }}>
            <span style={{ color: '#9ca3af' }}>Seniority</span> &nbsp;
            <strong style={{ color: '#374151' }}>{member.seniorityDays ?? 0} days</strong>
          </span>
          <span style={{ fontSize: 12, color: '#6b7280' }}>
            <span style={{ color: '#9ca3af' }}>Email</span> &nbsp;
            <strong style={{ color: '#374151' }}>{member.email || '—'}</strong>
          </span>
        </div>
      </div>

      {isLeaderOfTeam && !isSelf && (
        <button
          onClick={() => onMakeLeader(member._id)}
          disabled={actionLoading}
          style={{
            padding: '8px 16px', background: actionLoading ? '#e5e7eb' : '#fff',
            border: '1.5px solid #f59e0b', color: actionLoading ? '#9ca3af' : '#92400e',
            fontFamily: "'Outfit',sans-serif", fontSize: 12, fontWeight: 600,
            letterSpacing: '0.4px', cursor: actionLoading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
            transition: 'background 0.2s, color 0.2s',
          }}
          onMouseOver={e => { if (!actionLoading) { e.currentTarget.style.background = '#fef3c7'; } }}
          onMouseOut={e => { if (!actionLoading) { e.currentTarget.style.background = '#fff'; } }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          Make Leader
        </button>
      )}
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
function MyTeam() {
  const [team, setTeam]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast]             = useState(null);
  const [modal, setModal]             = useState(null); // { type: 'leave' | 'leader', payload }

  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { fetchTeam(); }, [user?.teamId]);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const data = await getMyTeam();
      setTeam(data);
    } catch (err) {
      console.error(err);
      setTeam(null);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const handleChangeLeader = async (id) => {
    try {
      setActionLoading(true);
      await changeLeader(team._id, { newLeaderId: id });
      showToast('Team leader updated successfully.', 'success');
      await fetchTeam();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.msg || 'Failed to change leader.', 'error');
    } finally {
      setActionLoading(false);
      setModal(null);
    }
  };

  const handleLeave = async () => {
    try {
      setActionLoading(true);
      await leaveTeam();
      setUser(prev => ({ ...prev, teamId: null }));
      navigate('/teams');
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.msg || 'Failed to leave team.', 'error');
    } finally {
      setActionLoading(false);
      setModal(null);
    }
  };

  const openLeaveModal  = () => setModal({ type: 'leave' });
  const openLeaderModal = (id, name) => setModal({ type: 'leader', payload: { id, name } });

  if (!loading && !team) return <NoTeamState onNavigate={() => navigate('/teams')} />;

  const isLeaderOfTeam = team?.leader?._id === user?._id;
  const members = team?.members || [];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Outfit:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes pulse {
          0%,100% { opacity: 1; } 50% { opacity: 0.45; }
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(60px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .myteam-root {
          min-height: 100vh; background: #f4f5f7;
          font-family: 'Outfit', sans-serif; padding-bottom: 80px;
        }

        /* HERO */
        .myteam-hero {
          background: linear-gradient(135deg, #0d1b3e 0%, #1a3a8f 55%, #1e50b5 100%);
          padding: 52px 48px 76px;
          position: relative; overflow: hidden;
          opacity: 0; animation: fadeUp 0.7s ease 0.05s both;
        }
        .myteam-hero::before {
          content: ''; position: absolute;
          width: 520px; height: 520px; border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%);
          top: -180px; right: -100px;
        }
        .myteam-hero::after {
          content: ''; position: absolute;
          bottom: 0; left: 0; right: 0; height: 40px;
          background: #f4f5f7; clip-path: ellipse(55% 100% at 50% 100%);
        }
        .myteam-hero-inner { max-width: 1100px; margin: 0 auto; position: relative; z-index: 1; }

        .myteam-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12);
          padding: 6px 14px; font-size: 11px; letter-spacing: 2px;
          text-transform: uppercase; color: #93b4f0; font-weight: 500; margin-bottom: 20px;
        }
        .myteam-eyebrow-dot { width: 6px; height: 6px; background: #60a5fa; border-radius: 50%; animation: pulse 2s ease infinite; }
        .myteam-hero-bottom { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; flex-wrap: wrap; }
        .myteam-title { font-family: 'Playfair Display', serif; font-size: 40px; color: #fff; margin: 0 0 8px; line-height: 1.2; }
        .myteam-title em { font-style: italic; color: #93b4f0; }
        .myteam-leader-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(245,158,11,0.15); border: 1px solid rgba(245,158,11,0.3);
          padding: 8px 16px; color: #fcd34d; font-size: 13px; font-weight: 500;
        }

        /* STATS STRIP */
        .myteam-stats {
          max-width: 1100px; margin: -28px auto 0; padding: 0 48px;
          display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px;
          position: relative; z-index: 2;
          opacity: 0; animation: fadeUp 0.6s ease 0.2s both;
        }

        /* BODY */
        .myteam-body {
          max-width: 1100px; margin: 36px auto 0; padding: 0 48px;
          display: grid; grid-template-columns: 1fr 320px; gap: 28px; align-items: start;
          opacity: 0; animation: fadeUp 0.6s ease 0.35s both;
        }

        /* MEMBERS PANEL */
        .members-panel { display: flex; flex-direction: column; gap: 10px; }

        .members-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 16px; flex-wrap: wrap; gap: 8px;
        }
        .members-title { font-family: 'Playfair Display', serif; font-size: 20px; color: #0d1b3e; margin: 0; }
        .members-count { font-size: 12px; color: #9ca3af; background: #f3f4f6; padding: 4px 12px; font-weight: 500; }

        /* SIDEBAR */
        .sidebar-card {
          background: #fff; border: 1px solid #e8eaf0;
          border-top: 3px solid #1a3a8f; padding: 22px 22px 24px;
          position: sticky; top: 24px;
        }
        .sidebar-title {
          font-family: 'Playfair Display', serif; font-size: 16px;
          color: #0d1b3e; margin: 0 0 18px; padding-bottom: 14px;
          border-bottom: 1px solid #f0f1f5;
        }
        .sidebar-row { display: flex; justify-content: space-between; align-items: center; padding: '8px 0'; margin-bottom: 12px; }
        .sidebar-label { font-size: 11px; color: '#9ca3af'; text-transform: uppercase; letter-spacing: '0.6px'; font-weight: 600; }
        .sidebar-value { font-size: 14px; color: '#0d1b3e'; font-weight: 600; }

        /* DANGER ZONE */
        .danger-zone {
          background: '#fff'; border: '1px solid #fee2e2';
          border-top: '3px solid #dc2626'; padding: '20px 22px';
          margin-top: 16px;
        }

        /* RESPONSIVE */
        @media (max-width: 960px) {
          .myteam-stats { grid-template-columns: repeat(3, 1fr); }
          .myteam-body { grid-template-columns: 1fr; }
          .myteam-hero { padding: 36px 24px 64px; }
          .myteam-stats { padding: 0 24px; }
          .myteam-body { padding: 0 24px; }
        }
        @media (max-width: 560px) {
          .myteam-title { font-size: 28px; }
          .myteam-stats { grid-template-columns: 1fr 1fr; padding: 0 16px; }
          .myteam-body { padding: 0 16px; }
          .myteam-hero { padding: 28px 18px 60px; }
        }
      `}</style>

      <div className="myteam-root">

        {/* TOAST */}
        {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

        {/* CONFIRM MODAL */}
        {modal?.type === 'leave' && (
          <ConfirmModal
            title="Leave Team"
            message="Are you sure you want to leave this team? This action cannot be undone and may disband the team if you are the only member."
            confirmLabel="Leave Team"
            danger
            onConfirm={handleLeave}
            onCancel={() => setModal(null)}
          />
        )}
        {modal?.type === 'leader' && (
          <ConfirmModal
            title="Transfer Leadership"
            message={`Are you sure you want to make ${modal.payload.name} the new team leader? You will lose your leader privileges.`}
            confirmLabel="Transfer Leadership"
            danger={false}
            onConfirm={() => handleChangeLeader(modal.payload.id)}
            onCancel={() => setModal(null)}
          />
        )}

        {/* ── HERO ── */}
        <div className="myteam-hero">
          <div className="myteam-hero-inner">
            <div className="myteam-eyebrow">
              <div className="myteam-eyebrow-dot" />
              <span>PAAH Platform</span>
            </div>
            <div className="myteam-hero-bottom">
              <div>
                {loading
                  ? <div style={{ width: 260, height: 44, background: 'rgba(255,255,255,0.1)', marginBottom: 10 }} />
                  : <h1 className="myteam-title"><em>{team?.teamName || 'Your Team'}</em></h1>
                }
                <p style={{ margin: 0, fontSize: 15, color: 'rgba(255,255,255,0.5)', fontWeight: 300, maxWidth: 400, lineHeight: 1.7 }}>
                  Collaborate, complete tasks, and build trust together. Every member's contribution matters.
                </p>
              </div>
              {!loading && isLeaderOfTeam && (
                <div className="myteam-leader-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  You are the Team Leader
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── STATS STRIP ── */}
        <div className="myteam-stats">
          {loading
            ? [1,2,3,4,5].map(i => (
                <div key={i} style={{ background: '#fff', border: '1px solid #e8eaf0', borderTop: '3px solid #1a3a8f', padding: '18px 20px' }}>
                  <Shimmer h={10} w="60%" mb={8} />
                  <Shimmer h={24} w="40%" mb={0} />
                </div>
              ))
            : <>
                <StatCard label="Members"      value={team?.totalMembers ?? '—'} />
                <StatCard label="Total Credits" value={team?.totalCredits ?? '—'} accent="#1a3a8f" />
                <StatCard label="Donations"    value={team?.totalDonations ?? '—'} accent="#0369a1" />
                <StatCard label="Verified"     value={team?.acceptedDonations ?? '—'} accent="#16a34a" />
                <StatCard label="Trust Score"  value={`${(team?.trustScore || 0).toFixed(1)}%`} accent={team?.trustScore >= 75 ? '#16a34a' : team?.trustScore >= 40 ? '#f59e0b' : '#dc2626'} />
              </>
          }
        </div>

        {/* ── BODY ── */}
        <div className="myteam-body">

          {/* ── MEMBERS LIST ── */}
          <div>
            <div className="members-header">
              <h2 className="members-title">Team Members</h2>
              <span className="members-count">{members.length} member{members.length !== 1 ? 's' : ''}</span>
            </div>

            {loading
              ? [1,2,3].map(i => (
                  <div key={i} style={{
                    background: '#fff', border: '1px solid #e8eaf0',
                    borderLeft: '3px solid #e8eaf0', padding: '14px 18px',
                    display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10,
                  }}>
                    <div style={{ width: 44, height: 44, background: '#f0f1f5', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <Shimmer h={14} w="50%" mb={8} />
                      <Shimmer h={11} w="70%" mb={0} />
                    </div>
                  </div>
                ))
              : members.length === 0
                ? (
                  <div style={{
                    background: '#fff', border: '1px dashed #d1d5db',
                    padding: '40px 24px', textAlign: 'center',
                  }}>
                    <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, color: '#0d1b3e', margin: '0 0 6px' }}>No members found</p>
                    <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>This team has no members yet.</p>
                  </div>
                )
                : members.map((m, i) => (
                  <MemberRow
                    key={m._id}
                    member={m}
                    index={i}
                    isLeader={m._id === team?.leader?._id}
                    isSelf={m._id === user?._id}
                    isLeaderOfTeam={isLeaderOfTeam}
                    onMakeLeader={(id) => openLeaderModal(id, m.name)}
                    actionLoading={actionLoading}
                  />
                ))
            }
          </div>

          {/* ── SIDEBAR ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Team Info Card */}
            <div style={{
              background: '#fff', border: '1px solid #e8eaf0',
              borderTop: '3px solid #1a3a8f', padding: '20px 22px',
            }}>
              <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, color: '#0d1b3e', margin: '0 0 16px', paddingBottom: 14, borderBottom: '1px solid #f0f1f5' }}>
                Team Overview
              </p>

              {loading
                ? [1,2,3,4].map(i => <div key={i} style={{ marginBottom: 12 }}><Shimmer h={10} w="45%" mb={5} /><Shimmer h={14} w="65%" mb={0} /></div>)
                : <>
                    {[
                      { label: 'Team Name',  value: team?.teamName },
                      { label: 'Leader',     value: team?.leader?.name },
                      { label: 'Leader Email', value: team?.leader?.email || '—' },
                      { label: 'Region',     value: team?.region || '—' },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ marginBottom: 14 }}>
                        <p style={{ margin: '0 0 3px', fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.7px', fontWeight: 600 }}>{label}</p>
                        <p style={{ margin: 0, fontSize: 13.5, color: '#1f2937', fontWeight: 500 }}>{value}</p>
                      </div>
                    ))}

                    <div style={{ marginTop: 16 }}>
                      <TrustBar score={team?.trustScore} />
                    </div>
                  </>
              }
            </div>

            {/* Danger Zone */}
            <div style={{
              background: '#fff', border: '1px solid #fee2e2', borderTop: '3px solid #dc2626', padding: '20px 22px',
            }}>
              <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, color: '#991b1b', margin: '0 0 8px' }}>
                Danger Zone
              </p>
              <p style={{ fontSize: 12.5, color: '#6b7280', margin: '0 0 16px', lineHeight: 1.6, fontWeight: 300 }}>
                Leaving the team is permanent. If you are the leader and the only member, the team will be disbanded.
              </p>
              <button
                onClick={openLeaveModal}
                disabled={actionLoading}
                style={{
                  width: '100%', height: 42,
                  background: actionLoading ? '#f3f4f6' : '#fff',
                  border: '1.5px solid #dc2626',
                  color: actionLoading ? '#9ca3af' : '#dc2626',
                  fontFamily: "'Outfit',sans-serif", fontSize: 12, fontWeight: 600,
                  letterSpacing: '0.8px', textTransform: 'uppercase',
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  transition: 'background 0.2s',
                }}
                onMouseOver={e => { if (!actionLoading) { e.currentTarget.style.background = '#fef2f2'; } }}
                onMouseOut={e => { if (!actionLoading) { e.currentTarget.style.background = '#fff'; } }}
              >
                {actionLoading
                  ? <><div style={{ width: 13, height: 13, border: '2px solid #d1d5db', borderTopColor: '#dc2626', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Processing…</>
                  : <>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
                      </svg>
                      Leave Team
                    </>
                }
              </button>
            </div>

          </div>
        </div>

      </div>
    </>
  );
}

export default MyTeam;