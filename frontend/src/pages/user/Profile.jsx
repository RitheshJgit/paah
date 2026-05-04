import React, { useEffect, useState } from 'react';
import { getProfile } from '../../features/user/userAPI';

/* ═══════════════════════════════════════════
   SVG ICON LIBRARY
═══════════════════════════════════════════ */
const Icon = {
  User: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"
        d="M4 18a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
      <circle cx="12" cy="7" r="3" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  ),
  Mail: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" d="M2 7l10 7 10-7" />
    </svg>
  ),
  Team: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path stroke="currentColor" strokeWidth="1.6" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.6" />
      <path stroke="currentColor" strokeWidth="1.6" d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Shield: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path stroke="currentColor" strokeWidth="1.6" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" d="M9 12l2 2 4-4" />
    </svg>
  ),
  Credit: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6" />
      <path stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"
        d="M12 6v2M12 16v2M9 9.5A2 2 0 0 1 11.5 8h1A1.5 1.5 0 0 1 14 9.5v0A1.5 1.5 0 0 1 12.5 11h-1A1.5 1.5 0 0 0 10 12.5v0A1.5 1.5 0 0 0 11.5 14H13a2 2 0 0 0 2-2" />
    </svg>
  ),
  Task: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" d="M9 11l3 3L22 4" />
      <path stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"
        d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  Clock: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6" />
      <path stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" d="M12 6v6l4 2" />
    </svg>
  ),
  Heart: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  Trophy: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path stroke="currentColor" strokeWidth="1.6" d="M8 21h8M12 17v4M17 3H7v8a5 5 0 0 0 10 0V3z" />
      <path stroke="currentColor" strokeWidth="1.6"
        d="M7 4H4a1 1 0 0 0-1 1v2a4 4 0 0 0 4 4M17 4h3a1 1 0 0 1 1 1v2a4 4 0 0 1-4 4" />
    </svg>
  ),
  Star: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <polygon stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"
        points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  Calendar: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  BarChart: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" d="M18 20V10M12 20V4M6 20v-6" />
    </svg>
  ),
  /* Badge-specific SVG icons — no emoji */
  Sprout: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"
        d="M12 22v-8M12 14C12 8 6 5 2 7c2 4 6 6 10 7zM12 14c0-6 6-9 10-7-2 4-6 6-10 7z" />
    </svg>
  ),
  CheckCircle: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6" />
      <path stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" d="M8 12l3 3 5-6" />
    </svg>
  ),
  Briefcase: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path stroke="currentColor" strokeWidth="1.6" d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <path stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" d="M2 12h20" />
    </svg>
  ),
  HeartFill: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  Gem: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"
        d="M2 9l3-5h14l3 5-10 11L2 9zM2 9h20M7 4l-2 5M17 4l2 5M12 20V9" />
    </svg>
  ),
  Award: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="6" stroke="currentColor" strokeWidth="1.6" />
      <path stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"
        d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" />
    </svg>
  ),
  ShieldCheck: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path stroke="currentColor" strokeWidth="1.6" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" d="M9 12l2 2 4-4" />
    </svg>
  ),
  Users: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path stroke="currentColor" strokeWidth="1.6" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.6" />
      <path stroke="currentColor" strokeWidth="1.6" d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Lock: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path stroke="currentColor" strokeWidth="1.6" d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  /* Activity type icons */
  TaskAct: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" d="M9 11l3 3L22 4" />
      <path stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"
        d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  DonateAct: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  BadgeAct: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="6" stroke="currentColor" strokeWidth="1.7" />
      <path stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"
        d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" />
    </svg>
  ),
  Pin: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path stroke="currentColor" strokeWidth="1.7"
        d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  ),
  /* Edit / Copy icons for profile detail */
  Hash: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18" />
    </svg>
  ),
};

/* ═══════════════════════════════════════════
   UTILITIES
═══════════════════════════════════════════ */
function trustColor(score) {
  if (score >= 80) return { color: '#16a34a', bg: '#dcfce7', track: '#bbf7d0', label: 'Excellent' };
  if (score >= 60) return { color: '#2563eb', bg: '#dbeafe', track: '#bfdbfe', label: 'Good' };
  if (score >= 40) return { color: '#d97706', bg: '#fef3c7', track: '#fde68a', label: 'Average' };
  return { color: '#dc2626', bg: '#fee2e2', track: '#fecaca', label: 'Low' };
}

function RoleBadge({ role }) {
  const styles = {
    admin: { bg: '#fef3c7', color: '#b45309', label: 'Admin' },
    user:  { bg: '#eff6ff', color: '#1d4ed8', label: 'Member' },
  };
  const s = styles[role] || styles.user;
  return (
    <span style={{ background: s.bg, color: s.color }}
      className="role-badge">
      {s.label}
    </span>
  );
}

/* ═══════════════════════════════════════════
   SUB-COMPONENTS
═══════════════════════════════════════════ */

/* Stat Card */
function StatCard({ icon, label, value, accent, delay = 0 }) {
  return (
    <div className="stat-card" style={{ animationDelay: `${delay}ms` }}>
      <div className="stat-icon" style={{ background: accent + '15', color: accent }}>
        {icon}
      </div>
      <div className="stat-value">{value ?? '—'}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

/* Progress Bar */
function ProgressBar({ value, max, color, track }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div style={{ background: track || '#f1f3f7', borderRadius: 99, height: 7, overflow: 'hidden' }}>
      <div style={{
        width: `${pct}%`, height: '100%',
        background: color, borderRadius: 99,
        transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)',
      }} />
    </div>
  );
}

/* Profile Row */
function ProfileRow({ label, value, mono }) {
  return (
    <div className="detail-row">
      <span className="detail-label">{label}</span>
      <span className={mono ? 'detail-value mono' : 'detail-value'}>{value}</span>
    </div>
  );
}

/* Activity Item */
function ActivityItem({ item }) {
  const typeMap = {
    task:     { Icon: Icon.TaskAct,   color: '#16a34a', bg: '#dcfce7', label: 'Task' },
    donation: { Icon: Icon.DonateAct, color: '#7c3aed', bg: '#ede9fe', label: 'Donation' },
    badge:    { Icon: Icon.BadgeAct,  color: '#d97706', bg: '#fef3c7', label: 'Badge' },
    default:  { Icon: Icon.Pin,       color: '#1B4FD8', bg: '#eff6ff', label: 'Event' },
  };
  const t = typeMap[item.type] || typeMap.default;
  const date = item.date
    ? new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

  return (
    <div className="activity-item">
      <div className="activity-icon-wrap" style={{ background: t.bg, color: t.color }}>
        <t.Icon />
      </div>
      <div className="activity-body">
        <div className="activity-meta">
          <span className="activity-type-pill" style={{ background: t.bg, color: t.color }}>
            {t.label}
          </span>
          {date && <span className="activity-date">{date}</span>}
        </div>
        <p className="activity-title">{item.title || item.description}</p>
      </div>
      {item.credits && (
        <div className="activity-credits">
          <span>+{item.credits}</span>
          <span className="activity-credits-sub">pts</span>
        </div>
      )}
    </div>
  );
}

/* Milestone Badge */
const MILESTONES = [
  { icon: Icon.Sprout,     label: 'First Step',       desc: 'Joined PAAH',          color: '#16a34a', bg: '#dcfce7', check: d => true },
  { icon: Icon.CheckCircle,label: 'Task Starter',      desc: '1 task completed',     color: '#2563eb', bg: '#dbeafe', check: d => d.stats?.tasksCompleted >= 1 },
  { icon: Icon.Briefcase,  label: 'Task Pro',          desc: '10 tasks completed',   color: '#0891b2', bg: '#cffafe', check: d => d.stats?.tasksCompleted >= 10 },
  { icon: Icon.HeartFill,  label: 'First Donor',       desc: '1 donation made',      color: '#e11d48', bg: '#ffe4e6', check: d => d.stats?.donations >= 1 },
  { icon: Icon.Gem,        label: 'Generous Soul',     desc: '5 donations made',     color: '#7c3aed', bg: '#ede9fe', check: d => d.stats?.donations >= 5 },
  { icon: Icon.Award,      label: 'Top Contributor',   desc: '500+ credits earned',  color: '#b45309', bg: '#fef3c7', check: d => (d.credits ?? 0) >= 500 },
  { icon: Icon.ShieldCheck,label: 'Trusted Member',    desc: '80%+ trust score',     color: '#059669', bg: '#d1fae5', check: d => Math.max(0, Math.min(d.trustScore ?? 0, 100)) >= 80 },
  { icon: Icon.Users,      label: 'Team Player',       desc: 'Joined a team',        color: '#1d4ed8', bg: '#eff6ff', check: d => !!d.team },
];

function MilestoneBadge({ milestone, data }) {
  const unlocked = milestone.check(data);
  const BIcon = milestone.icon;
  return (
    <div className={`milestone-card ${unlocked ? 'unlocked' : 'locked'}`}>
      <div className="milestone-icon-ring" style={
        unlocked
          ? { background: milestone.bg, color: milestone.color, borderColor: milestone.color + '40' }
          : { background: '#f3f4f6', color: '#9ca3af', borderColor: '#e5e7eb' }
      }>
        <BIcon />
      </div>
      <div className="milestone-label">{milestone.label}</div>
      <div className="milestone-desc">{milestone.desc}</div>
      {unlocked
        ? <div className="milestone-earned" style={{ color: milestone.color, background: milestone.bg }}>
            <Icon.CheckCircle /> Earned
          </div>
        : <div className="milestone-locked-badge">
            <Icon.Lock /> Locked
          </div>
      }
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN PROFILE COMPONENT
═══════════════════════════════════════════ */
function Profile() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await getProfile();
      setData(res);
    } catch (err) {
      console.log(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="profile-loading">
      <style>{CSS}</style>
      <div className="profile-spinner" />
      <p>Loading profile…</p>
    </div>
  );

  if (!data) return (
    <div className="profile-error">
      <style>{CSS}</style>
      <div className="error-icon"><Icon.Shield /></div>
      <h2>Failed to load profile</h2>
      <p>Please try refreshing the page.</p>
      <button onClick={fetchProfile} className="retry-btn">Retry</button>
    </div>
  );

  const safeTrust = Math.max(0, Math.min(data.trustScore ?? 0, 100));
  const trust = trustColor(safeTrust);
  const stats = data.stats || { tasksCompleted: 0, pendingTasks: 0, donations: 0 };
  const totalActions = (stats.tasksCompleted ?? 0) + (stats.donations ?? 0);
  const joinDate = data.createdAt
    ? new Date(data.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A';
  const initials = (data.name || 'U').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  const TABS = [
    { id: 'overview', label: 'Overview',  Ico: Icon.User },
    { id: 'activity', label: 'Activity',  Ico: Icon.Clock },
    { id: 'badges',   label: 'Badges',    Ico: Icon.Star },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div className="profile-root">

        {/* ════════ HERO BANNER ════════ */}
        <div className="banner">
          <div className="banner-glow" />
          <div className="banner-grid" />
          <div className="banner-inner">

            {/* Avatar */}
            <div className="avatar-wrap">
              <div className="avatar-ring" />
              <div className="avatar">{initials}</div>
              <div className="avatar-status" title="Active" />
            </div>

            {/* Identity block */}
            <div className="identity">
              <div className="identity-top">
                <h1 className="profile-name">{data.name}</h1>
                <RoleBadge role={data.role} />
              </div>
              <div className="meta-row">
                <span className="meta-item"><Icon.Mail />{data.email}</span>
                {data.team && <span className="meta-item"><Icon.Team />{data.team}</span>}
                <span className="meta-item"><Icon.Calendar />Joined {joinDate}</span>
              </div>
            </div>

            {/* Trust Score */}
            <div className="trust-card" style={{ borderColor: trust.color + '30' }}>
              <div className="trust-header">
                <Icon.Shield />
                <span>Trust Score</span>
              </div>
              <div className="trust-score-row">
                <span className="trust-number" style={{ color: trust.color }}>{safeTrust}</span>
                <span className="trust-pct">%</span>
                <span className="trust-label-pill" style={{ background: trust.bg, color: trust.color }}>
                  {trust.label}
                </span>
              </div>
              <div className="trust-bar-track">
                <div className="trust-bar-fill"
                  style={{ width: `${safeTrust}%`, background: trust.color }} />
              </div>
            </div>

          </div>
        </div>

        {/* ════════ BODY ════════ */}
        <div className="body-wrap">

          {/* Stat Cards */}
          <div className="stats-grid">
            <StatCard icon={<Icon.Credit />}   label="Credits"          value={data.credits}               accent="#1B4FD8" delay={0} />
            <StatCard icon={<Icon.Task />}      label="Tasks Completed"  value={stats.tasksCompleted}       accent="#16a34a" delay={50} />
            <StatCard icon={<Icon.Clock />}     label="Pending Tasks"    value={stats.pendingTasks}         accent="#d97706" delay={100} />
            <StatCard icon={<Icon.Heart />}     label="Donations Made"   value={stats.donations}            accent="#7c3aed" delay={150} />
            <StatCard icon={<Icon.Trophy />}    label="Leaderboard Rank" value={data.rank ? `#${data.rank}` : '—'} accent="#C9A84C" delay={200} />
            <StatCard icon={<Icon.BarChart />}  label="Total Actions"    value={totalActions}               accent="#0891b2" delay={250} />
          </div>

          {/* Tabs */}
          <div className="tabs-wrap">
            <div className="tabs">
              {TABS.map(t => (
                <button
                  key={t.id}
                  className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(t.id)}
                >
                  <t.Ico />
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── TAB: OVERVIEW ── */}
          {activeTab === 'overview' && (
            <div className="overview-grid tab-panel">

              {/* Profile Details */}
              <div className="card">
                <div className="card-header"><Icon.User /> Profile Details</div>
                <div className="detail-list">
                  <ProfileRow label="Full Name"    value={data.name} />
                  <ProfileRow label="Email"        value={data.email} />
                  <ProfileRow label="Role"         value={<RoleBadge role={data.role} />} />
                  <ProfileRow label="Team"         value={data.team || <span className="empty-val">No team assigned</span>} />
                  <ProfileRow label="Member Since" value={joinDate} />
                  <ProfileRow label="User ID"
                    mono
                    value={
                      <span className="id-chip">
                        <Icon.Hash />
                        {(data._id || data.id || 'N/A').slice(-10)}
                      </span>
                    }
                  />
                </div>
              </div>

              {/* Trust & Progress */}
              <div className="card">
                <div className="card-header"><Icon.Shield /> Trust &amp; Progress</div>

                <div className="progress-block">
                  <div className="progress-row">
                    <span>Trust Score</span>
                    <span style={{ color: trust.color, fontWeight: 700 }}>{safeTrust}%</span>
                  </div>
                  <ProgressBar value={safeTrust} max={100} color={trust.color} track={trust.track} />
                  <p className="progress-note">
                    Status: <strong style={{ color: trust.color }}>{trust.label}</strong> —
                    Complete more verified tasks and donations to improve.
                  </p>
                </div>

                <div className="progress-block">
                  <div className="progress-row">
                    <span>Tasks Completed</span>
                    <span style={{ color: '#16a34a', fontWeight: 700 }}>{stats.tasksCompleted} / 50</span>
                  </div>
                  <ProgressBar value={stats.tasksCompleted} max={50} color="#16a34a" track="#bbf7d0" />
                </div>

                <div className="progress-block">
                  <div className="progress-row">
                    <span>Donations Made</span>
                    <span style={{ color: '#7c3aed', fontWeight: 700 }}>{stats.donations} / 20</span>
                  </div>
                  <ProgressBar value={stats.donations} max={20} color="#7c3aed" track="#ddd6fe" />
                </div>
              </div>

              {/* Credits Summary */}
              <div className="card credits-card">
                <div className="card-header"><Icon.Credit /> Credits Summary</div>
                <div className="credits-hero">
                  <span className="credits-num">{data.credits ?? 0}</span>
                  <span className="credits-unit">credits</span>
                </div>
                <p className="credits-note">
                  Earned by completing verified tasks and making approved donations.
                  Higher credits improve your leaderboard rank.
                </p>
                <div className="credits-table">
                  <div className="credits-row">
                    <span>Tasks Completed</span>
                    <strong>{stats.tasksCompleted}</strong>
                  </div>
                  <div className="credits-row">
                    <span>Donations Made</span>
                    <strong>{stats.donations}</strong>
                  </div>
                  <div className="credits-row credits-total">
                    <span>Total Credits</span>
                    <strong style={{ color: 'var(--blue)' }}>{data.credits ?? 0}</strong>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ── TAB: ACTIVITY ── */}
          {activeTab === 'activity' && (
            <div className="tab-panel">
              <div className="card full-card">
                <div className="card-header"><Icon.Clock /> Recent Activity</div>
                {Array.isArray(data.recentActivity) && data.recentActivity.length > 0 ? (
                  <div className="activity-list">
                    {data.recentActivity.map((item, i) => (
                      <ActivityItem
                        key={item._id || item.id || `${item.type}-${i}`}
                        item={item}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon"><Icon.Clock /></div>
                    <p className="empty-title">No activity yet</p>
                    <span className="empty-sub">Complete tasks or make donations to see your history here.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── TAB: BADGES ── */}
          {activeTab === 'badges' && (
            <div className="tab-panel">

              {/* Custom Badges from API */}
              {Array.isArray(data.badges) && data.badges.length > 0 && (
                <div className="card full-card" style={{ marginBottom: 20 }}>
                  <div className="card-header"><Icon.Award /> Earned Badges</div>
                  <div className="badges-grid">
                    {data.badges.map((badge, i) => (
                      <div key={badge._id || badge.id || i} className="badge-card">
                        <div className="badge-icon-wrap">
                          <Icon.Award />
                        </div>
                        <div className="badge-name">{badge.name || badge.title}</div>
                        {badge.desc && <div className="badge-desc">{badge.desc}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Milestone Badges */}
              <div className="card full-card">
                <div className="card-header"><Icon.Trophy /> Milestone Achievements</div>
                <div className="milestones-grid">
                  {MILESTONES.map((m, i) => (
                    <MilestoneBadge key={i} milestone={m} data={{ ...data, stats }} />
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════
   CSS
═══════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');

:root {
  --navy:   #0B1F4B;
  --blue:   #1B4FD8;
  --blue-l: #EEF3FF;
  --gold:   #C9A84C;
  --white:  #FFFFFF;
  --g50:    #F7F8FB;
  --g100:   #F1F3F8;
  --g200:   #E4E7EF;
  --g300:   #CBD1E0;
  --g400:   #9AA3B8;
  --g600:   #4B5675;
  --g900:   #0F172A;
  --r:      12px;
  --rl:     16px;
  --shadow: 0 2px 16px rgba(11,31,75,0.07);
  --shadow-lg: 0 8px 32px rgba(11,31,75,0.12);
}

* { box-sizing: border-box; }

.profile-root {
  font-family: 'DM Sans', sans-serif;
  background: var(--g50);
  min-height: 100vh;
  color: var(--g900);
}

/* ── Loading ── */
.profile-loading {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; min-height: 60vh;
  gap: 16px; color: var(--g400);
  font-family: 'DM Sans', sans-serif;
}
.profile-spinner {
  width: 36px; height: 36px;
  border: 3px solid var(--g200);
  border-top-color: var(--blue);
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Error ── */
.profile-error {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; min-height: 60vh;
  gap: 10px; text-align: center; padding: 24px;
}
.error-icon { color: var(--g300); margin-bottom: 8px; }
.error-icon svg { width: 48px; height: 48px; }
.profile-error h2 { font-size: 20px; font-weight: 600; color: var(--g900); margin: 0; }
.profile-error p  { font-size: 14px; color: var(--g400); margin: 0; }
.retry-btn {
  margin-top: 12px; padding: 10px 28px;
  border-radius: 8px; background: var(--blue); color: #fff;
  font-size: 14px; font-weight: 600; border: none; cursor: pointer;
  font-family: 'DM Sans', sans-serif; transition: opacity 0.15s;
}
.retry-btn:hover { opacity: 0.88; }

/* ── Role Badge ── */
.role-badge {
  display: inline-flex; align-items: center;
  padding: 3px 12px; border-radius: 100px;
  font-size: 11.5px; font-weight: 700; letter-spacing: 0.4px;
  text-transform: capitalize;
}

/* ══════════════════════════
   BANNER
══════════════════════════ */
.banner {
  background: var(--navy);
  padding: 44px 40px 52px;
  position: relative; overflow: hidden;
}
.banner-glow {
  position: absolute;
  width: 700px; height: 700px; border-radius: 50%;
  background: radial-gradient(circle, rgba(59,110,248,0.18) 0%, transparent 65%);
  top: -300px; right: -120px; pointer-events: none;
}
.banner-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 44px 44px;
  pointer-events: none;
}
.banner-inner {
  position: relative; z-index: 1;
  max-width: 1100px; margin: 0 auto;
  display: flex; align-items: center; gap: 28px; flex-wrap: wrap;
}

/* Avatar */
.avatar-wrap { position: relative; flex-shrink: 0; }
.avatar-ring {
  position: absolute; inset: -5px; border-radius: 50%;
  border: 1.5px solid rgba(201,168,76,0.45);
  animation: pulse-ring 3s ease-in-out infinite;
}
@keyframes pulse-ring {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.6; transform: scale(1.04); }
}
.avatar {
  width: 86px; height: 86px; border-radius: 50%;
  background: linear-gradient(135deg, var(--blue) 0%, #3b5fd8 100%);
  color: #fff;
  font-family: 'Cormorant Garamond', serif;
  font-size: 32px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  position: relative; z-index: 1;
  box-shadow: 0 0 0 3px rgba(255,255,255,0.08);
}
.avatar-status {
  position: absolute; bottom: 4px; right: 4px; z-index: 2;
  width: 14px; height: 14px; border-radius: 50%;
  background: #22c55e;
  border: 2.5px solid var(--navy);
}

/* Identity */
.identity { flex: 1; min-width: 200px; }
.identity-top {
  display: flex; align-items: center; gap: 12px;
  margin-bottom: 12px; flex-wrap: wrap;
}
.profile-name {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(22px, 4vw, 34px);
  font-weight: 700; color: #fff; margin: 0;
  animation: fadeUp 0.5s ease both;
  line-height: 1.1;
}
.meta-row {
  display: flex; align-items: center; gap: 0; flex-wrap: wrap;
}
.meta-item {
  display: flex; align-items: center; gap: 6px;
  font-size: 13px; color: rgba(255,255,255,0.55);
  padding: 4px 14px 4px 0;
  margin-right: 14px;
  border-right: 1px solid rgba(255,255,255,0.1);
}
.meta-item:last-child { border-right: none; }

/* Trust Card */
.trust-card {
  background: rgba(255,255,255,0.07);
  border: 1px solid;
  border-radius: var(--rl);
  padding: 18px 22px;
  min-width: 190px;
  backdrop-filter: blur(8px);
  animation: fadeUp 0.5s ease 0.15s both;
  flex-shrink: 0;
}
.trust-header {
  display: flex; align-items: center; gap: 7px;
  font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.5);
  text-transform: uppercase; letter-spacing: 1px;
  margin-bottom: 10px;
}
.trust-header svg { width: 14px; height: 14px; }
.trust-score-row {
  display: flex; align-items: baseline; gap: 6px; margin-bottom: 12px;
}
.trust-number {
  font-family: 'Cormorant Garamond', serif;
  font-size: 42px; font-weight: 700; line-height: 1;
}
.trust-pct { font-size: 18px; color: rgba(255,255,255,0.4); font-weight: 300; }
.trust-label-pill {
  margin-left: auto;
  padding: 3px 10px; border-radius: 100px;
  font-size: 11px; font-weight: 700;
  align-self: center;
}
.trust-bar-track {
  height: 5px; background: rgba(255,255,255,0.12);
  border-radius: 99px; overflow: hidden;
}
.trust-bar-fill {
  height: 100%; border-radius: 99px;
  transition: width 1.2s cubic-bezier(0.4,0,0.2,1);
}

/* ══════════════════════════
   BODY
══════════════════════════ */
.body-wrap {
  max-width: 1100px; margin: 0 auto;
  padding: 28px 40px 64px;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 14px;
  margin-bottom: 28px;
}
.stat-card {
  background: var(--white);
  border: 1px solid var(--g200);
  border-radius: var(--rl);
  padding: 20px 18px 18px;
  display: flex; flex-direction: column; gap: 8px;
  animation: fadeUp 0.4s ease both;
  transition: transform 0.18s, box-shadow 0.18s;
  cursor: default;
}
.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
}
.stat-icon {
  width: 40px; height: 40px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.stat-value {
  font-family: 'Cormorant Garamond', serif;
  font-size: 34px; font-weight: 700;
  color: var(--navy); line-height: 1;
}
.stat-label {
  font-size: 12px; color: var(--g400); font-weight: 500; line-height: 1.3;
}

/* Tabs */
.tabs-wrap {
  border-bottom: 1px solid var(--g200);
  margin-bottom: 26px;
}
.tabs { display: flex; gap: 2px; }
.tab-btn {
  display: flex; align-items: center; gap: 7px;
  padding: 11px 20px;
  font-size: 13.5px; font-weight: 500;
  color: var(--g400); background: transparent; border: none;
  cursor: pointer; border-bottom: 2px solid transparent;
  transition: color 0.15s, border-color 0.15s;
  font-family: 'DM Sans', sans-serif;
  margin-bottom: -1px; white-space: nowrap;
}
.tab-btn svg { width: 15px; height: 15px; }
.tab-btn:hover { color: var(--navy); }
.tab-btn.active {
  color: var(--blue);
  border-bottom-color: var(--blue);
  font-weight: 600;
}

/* Tab panel */
.tab-panel { animation: fadeUp 0.3s ease both; }

/* Card */
.card {
  background: var(--white);
  border: 1px solid var(--g200);
  border-radius: var(--rl);
  padding: 26px;
  box-shadow: var(--shadow);
}
.full-card { width: 100%; }
.card-header {
  display: flex; align-items: center; gap: 8px;
  font-size: 14px; font-weight: 600; color: var(--navy);
  margin-bottom: 22px; padding-bottom: 14px;
  border-bottom: 1px solid var(--g100);
}
.card-header svg { width: 16px; height: 16px; }

/* Overview Grid */
.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 18px;
}

/* Detail List */
.detail-list { display: flex; flex-direction: column; }
.detail-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 11px 0;
  border-bottom: 1px solid var(--g100);
  gap: 16px;
}
.detail-row:last-child { border-bottom: none; }
.detail-label { font-size: 12.5px; color: var(--g400); font-weight: 500; flex-shrink: 0; }
.detail-value {
  font-size: 13.5px; color: var(--g900); font-weight: 500;
  text-align: right; word-break: break-all;
}
.detail-value.mono { font-family: 'DM Mono', monospace; }
.empty-val { color: var(--g400); font-style: italic; font-size: 13px; }
.id-chip {
  display: inline-flex; align-items: center; gap: 5px;
  font-family: 'Courier New', monospace; font-size: 11.5px;
  background: var(--g100); padding: 3px 9px; border-radius: 6px;
  color: var(--g600); border: 1px solid var(--g200);
}
.id-chip svg { width: 11px; height: 11px; }

/* Progress */
.progress-block { margin-bottom: 20px; }
.progress-block:last-child { margin-bottom: 0; }
.progress-row {
  display: flex; justify-content: space-between;
  font-size: 13px; font-weight: 500; color: var(--g600);
  margin-bottom: 8px;
}
.progress-note {
  font-size: 12px; color: var(--g400); margin-top: 8px; line-height: 1.5;
}

/* Credits */
.credits-hero {
  display: flex; align-items: baseline; gap: 8px; margin-bottom: 10px;
}
.credits-num {
  font-family: 'Cormorant Garamond', serif;
  font-size: 54px; font-weight: 700; color: var(--blue); line-height: 1;
}
.credits-unit { font-size: 15px; color: var(--g400); }
.credits-note { font-size: 12.5px; color: var(--g400); line-height: 1.6; margin-bottom: 18px; }
.credits-table {
  background: var(--g50); border-radius: var(--r);
  padding: 14px 16px; display: flex; flex-direction: column; gap: 10px;
  border: 1px solid var(--g200);
}
.credits-row {
  display: flex; justify-content: space-between;
  font-size: 13px; color: var(--g600);
}
.credits-row strong { color: var(--navy); }
.credits-total {
  border-top: 1px solid var(--g200); padding-top: 10px;
  font-weight: 600;
}

/* ══════════════════════════
   ACTIVITY
══════════════════════════ */
.activity-list { display: flex; flex-direction: column; gap: 0; }
.activity-item {
  display: flex; align-items: center; gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid var(--g100);
  transition: background 0.12s;
}
.activity-item:last-child { border-bottom: none; padding-bottom: 0; }
.activity-item:hover { background: var(--g50); margin: 0 -6px; padding-left: 6px; padding-right: 6px; border-radius: 8px; }
.activity-icon-wrap {
  width: 44px; height: 44px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.activity-body { flex: 1; min-width: 0; }
.activity-meta {
  display: flex; align-items: center; gap: 8px; margin-bottom: 4px;
}
.activity-type-pill {
  font-size: 10px; font-weight: 700; letter-spacing: 0.5px;
  padding: 2px 8px; border-radius: 100px; text-transform: uppercase;
}
.activity-date { font-size: 12px; color: var(--g400); }
.activity-title {
  font-size: 13.5px; font-weight: 500; color: var(--g900);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  margin: 0;
}
.activity-credits {
  display: flex; flex-direction: column; align-items: center;
  background: var(--blue-l); color: var(--blue);
  padding: 6px 12px; border-radius: 10px; flex-shrink: 0;
}
.activity-credits span:first-child { font-size: 15px; font-weight: 700; line-height: 1; }
.activity-credits-sub { font-size: 10px; font-weight: 600; opacity: 0.7; }

/* ══════════════════════════
   BADGES
══════════════════════════ */
/* Custom badges from API */
.badges-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 14px;
}
.badge-card {
  background: var(--g50); border: 1px solid var(--g200);
  border-radius: var(--r); padding: 18px 12px;
  text-align: center;
  transition: transform 0.15s, box-shadow 0.15s;
}
.badge-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-lg); }
.badge-icon-wrap {
  width: 52px; height: 52px; border-radius: 50%;
  background: var(--blue-l); color: var(--blue);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 12px;
}
.badge-icon-wrap svg { width: 24px; height: 24px; }
.badge-name { font-size: 13px; font-weight: 600; color: var(--navy); }
.badge-desc { font-size: 11.5px; color: var(--g400); margin-top: 4px; line-height: 1.4; }

/* Milestones */
.milestones-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 14px;
}
.milestone-card {
  border-radius: var(--r); padding: 20px 14px;
  text-align: center; border: 1px solid var(--g200);
  transition: transform 0.15s, box-shadow 0.15s;
  display: flex; flex-direction: column; align-items: center; gap: 8px;
}
.milestone-card.unlocked:hover { transform: translateY(-3px); box-shadow: var(--shadow-lg); }
.milestone-card.unlocked { background: var(--white); }
.milestone-card.locked { background: var(--g50); opacity: 0.55; }
.milestone-icon-ring {
  width: 60px; height: 60px; border-radius: 50%;
  border: 2px solid;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 4px;
  transition: transform 0.15s;
}
.milestone-card.unlocked:hover .milestone-icon-ring { transform: scale(1.08); }
.milestone-icon-ring svg { width: 26px; height: 26px; }
.milestone-label { font-size: 13px; font-weight: 700; color: var(--navy); line-height: 1.2; }
.milestone-desc  { font-size: 11.5px; color: var(--g400); line-height: 1.4; }
.milestone-earned {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 10.5px; font-weight: 700;
  padding: 3px 10px; border-radius: 100px; margin-top: 2px;
}
.milestone-earned svg { width: 11px; height: 11px; }
.milestone-locked-badge {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 10.5px; font-weight: 600;
  color: var(--g400);
  background: var(--g100); padding: 3px 10px; border-radius: 100px; margin-top: 2px;
}
.milestone-locked-badge svg { width: 11px; height: 11px; }

/* Empty State */
.empty-state {
  display: flex; flex-direction: column; align-items: center;
  padding: 52px 20px; gap: 8px; text-align: center;
}
.empty-icon { color: var(--g300); margin-bottom: 6px; }
.empty-icon svg { width: 44px; height: 44px; }
.empty-title { font-size: 15px; font-weight: 600; color: var(--g600); margin: 0; }
.empty-sub   { font-size: 13px; color: var(--g400); max-width: 300px; line-height: 1.5; }

/* Animations */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ══════════════════════════
   RESPONSIVE
══════════════════════════ */
@media (max-width: 900px) {
  .stats-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 640px) {
  .banner { padding: 28px 20px 40px; }
  .banner-inner { flex-direction: column; align-items: flex-start; gap: 20px; }
  .meta-row { gap: 0; }
  .meta-item {
    font-size: 12px;
    padding: 3px 10px 3px 0;
    margin-right: 10px;
  }
  .trust-card { width: 100%; min-width: unset; }
  .trust-number { font-size: 36px; }

  .body-wrap { padding: 18px 16px 52px; }

  .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .stat-card { padding: 16px 14px; }
  .stat-value { font-size: 28px; }
  .stat-label { font-size: 11px; }

  .tabs { overflow-x: auto; -webkit-overflow-scrolling: touch; padding-bottom: 1px; }
  .tab-btn { padding: 10px 14px; font-size: 12.5px; gap: 5px; }
  .tab-btn svg { width: 13px; height: 13px; }

  .card { padding: 18px 16px; }
  .overview-grid { grid-template-columns: 1fr; gap: 14px; }

  .activity-item { gap: 12px; padding: 14px 0; }
  .activity-icon-wrap { width: 38px; height: 38px; border-radius: 10px; }
  .activity-icon-wrap svg { width: 16px; height: 16px; }
  .activity-title { font-size: 13px; }

  .milestones-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .milestone-card { padding: 16px 10px; }
  .milestone-icon-ring { width: 50px; height: 50px; }
  .milestone-icon-ring svg { width: 22px; height: 22px; }
  .milestone-label { font-size: 12px; }

  .badges-grid { grid-template-columns: repeat(2, 1fr); }

  .credits-num { font-size: 44px; }
  .profile-name { font-size: 26px; }
}

@media (max-width: 380px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
  .milestones-grid { grid-template-columns: repeat(2, 1fr); }
  .tab-btn span { display: none; }
  .tab-btn { padding: 10px 16px; }
  .meta-item:nth-child(3) { display: none; }
}
`;

export default Profile;