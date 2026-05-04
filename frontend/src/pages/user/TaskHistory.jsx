import { useEffect, useState, useRef, useCallback } from 'react';
import { getMyTasks } from '../../features/task/taskAPI';

const BASE_URL =
  (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace('/api', '');

// ─── Status config ─────────────────────────────────────────────────────────
const STATUS = {
  approved: { label: 'Approved',       color: '#166534', bg: '#dcfce7', dot: '#16a34a', accent: '#16a34a' },
  pending:  { label: 'Pending Review', color: '#92400e', bg: '#fef3c7', dot: '#f59e0b', accent: '#f59e0b' },
  rejected: { label: 'Rejected',       color: '#991b1b', bg: '#fee2e2', dot: '#dc2626', accent: '#dc2626' },
};

// ─── Status Badge ───────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const s = STATUS[status] || STATUS.pending;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: s.bg, color: s.color, padding: '4px 10px',
      fontSize: 10.5, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase',
      borderRadius: 4, flexShrink: 0,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      {s.label}
    </span>
  );
};

// ─── Skeleton Card ──────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div style={{ background: '#fff', border: '1px solid #e8eaf0', padding: 24, borderRadius: 2 }}>
    {[80, 60, 40, 30].map((w, i) => (
      <div key={i} style={{
        height: i === 0 ? 18 : 13, width: `${w}%`,
        background: 'linear-gradient(90deg,#f0f1f5 25%,#e4e6ed 50%,#f0f1f5 75%)',
        backgroundSize: '400px 100%', animation: 'shimmer 1.2s infinite',
        marginBottom: 12, borderRadius: 2,
      }} />
    ))}
  </div>
);

// ─── Empty State ────────────────────────────────────────────────────────────
const EmptyState = ({ tab }) => (
  <div style={{
    gridColumn: '1 / -1', background: '#fff',
    border: '1px dashed #d1d5db', padding: '56px 32px', textAlign: 'center',
  }}>
    <div style={{
      width: 68, height: 68, borderRadius: '50%', background: '#f0f4ff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      margin: '0 auto 18px', color: '#1a3a8f',
    }}>
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
        <rect x="9" y="3" width="6" height="4" rx="1"/>
        <path d="M9 12h6M9 16h4"/>
      </svg>
    </div>
    <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, color: '#0d1b3e', margin: '0 0 6px' }}>
      No tasks found
    </p>
    <p style={{ fontSize: 13.5, color: '#9ca3af', fontWeight: 300, maxWidth: 260, margin: '0 auto', lineHeight: 1.6 }}>
      {tab === 'all' ? 'You have not submitted any tasks yet.' : `No ${tab} tasks to display right now.`}
    </p>
  </div>
);

// ─── Lightbox ───────────────────────────────────────────────────────────────
const Lightbox = ({ src, onClose }) => {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.92)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 99999, padding: 16, boxSizing: 'border-box',
        animation: 'lbFadeIn 0.18s ease both',
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        aria-label="Close preview"
        style={{
          position: 'fixed', top: 14, right: 14,
          width: 44, height: 44, borderRadius: '50%',
          background: 'rgba(255,255,255,0.15)',
          border: '1.5px solid rgba(255,255,255,0.3)',
          color: '#fff', fontSize: 24, lineHeight: 1,
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100000, backdropFilter: 'blur(4px)',
          transition: 'background 0.15s', padding: 0,
        }}
        onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.28)'}
        onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
      >
        ×
      </button>

      {/* Hint */}
      <div style={{
        position: 'fixed', bottom: 18, left: '50%', transform: 'translateX(-50%)',
        color: 'rgba(255,255,255,0.4)', fontSize: 11.5, letterSpacing: '0.5px',
        pointerEvents: 'none', whiteSpace: 'nowrap',
      }}>
        Tap outside or press ESC to close
      </div>

      {/* Image */}
      <img
        src={src}
        alt="Proof fullsize"
        style={{
          maxWidth: '100%',
          maxHeight: 'calc(100vh - 80px)',
          objectFit: 'contain',
          borderRadius: 4,
          boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
          display: 'block',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

// ─── Proof Image thumbnail ──────────────────────────────────────────────────
const ProofImage = ({ src }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setOpen(true)}
        aria-label="View proof image"
        style={{ cursor: 'pointer', position: 'relative', marginTop: 14, overflow: 'hidden', borderRadius: 2 }}
      >
        <img
          src={src}
          alt="Proof of completion"
          style={{ width: '100%', height: 150, objectFit: 'cover', display: 'block', transition: 'transform 0.3s' }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.04)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 55%)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end',
          padding: '10px',
        }}>
          <div style={{
            background: 'rgba(0,0,0,0.6)', color: '#fff',
            fontSize: 10.5, padding: '5px 11px', letterSpacing: '0.4px',
            display: 'flex', alignItems: 'center', gap: 5, borderRadius: 2,
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 3 21 3 21 9"/>
              <polyline points="9 21 3 21 3 15"/>
              <line x1="21" y1="3" x2="14" y2="10"/>
              <line x1="3" y1="21" x2="10" y2="14"/>
            </svg>
            VIEW PROOF
          </div>
        </div>
      </div>

      {open && <Lightbox src={src} onClose={() => setOpen(false)} />}
    </>
  );
};

// ─── Task Card (Grid mode) ──────────────────────────────────────────────────
const TaskCard = ({ task, index }) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.06 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const s = STATUS[task.status] || STATUS.pending;
  const date = task.updatedAt
    ? new Date(task.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'N/A';
  const time = task.updatedAt
    ? new Date(task.updatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div
      ref={ref}
      style={{
        background: '#ffffff', border: '1px solid #e8eaf0',
        borderTop: `3px solid ${s.accent}`, borderRadius: 2,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(22px)',
        transition: `opacity 0.5s ease ${index * 0.06}s, transform 0.5s ease ${index * 0.06}s, box-shadow 0.2s`,
      }}
      onMouseOver={e => e.currentTarget.style.boxShadow = '0 6px 24px rgba(26,58,143,0.09)'}
      onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
    >
      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #f0f1f5' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
          <h2 style={{
            fontFamily: "'Playfair Display',serif", fontSize: 15.5,
            color: '#0d1b3e', margin: 0, lineHeight: 1.35, flex: 1, minWidth: 0,
          }}>
            {task.taskId?.title || 'Unknown Task'}
          </h2>
          <StatusBadge status={task.status} />
        </div>
        <p style={{ fontSize: 13, color: '#6b7280', margin: 0, lineHeight: 1.6, fontWeight: 300 }}>
          {task.taskId?.description || 'No description available.'}
        </p>
      </div>

      <div style={{ padding: '12px 16px 16px' }}>
        <div style={{ display: 'flex', gap: 18, marginBottom: 12, flexWrap: 'wrap' }}>
          <div>
            <p style={{ margin: '0 0 2px', fontSize: 9.5, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.7px', fontWeight: 600 }}>Last Updated</p>
            <p style={{ margin: 0, fontSize: 13, color: '#374151', fontWeight: 500 }}>
              {date} {time && <span style={{ color: '#9ca3af', fontWeight: 400 }}>· {time}</span>}
            </p>
          </div>
          {task.taskId?.creditPoints !== undefined && (
            <div>
              <p style={{ margin: '0 0 2px', fontSize: 9.5, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.7px', fontWeight: 600 }}>Credits</p>
              <p style={{ margin: 0, fontSize: 13, color: '#374151', fontWeight: 500 }}>{task.taskId.creditPoints} pts</p>
            </div>
          )}
        </div>

        {task.status === 'approved' && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#f0fdf4', border: '1px solid #bbf7d0',
            borderLeft: '3px solid #16a34a', padding: '9px 12px', marginBottom: 10, borderRadius: 2,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <p style={{ margin: 0, fontSize: 12.5, color: '#166534', fontWeight: 600 }}>
              +{task.taskId?.creditPoints || 0} credits earned.
            </p>
          </div>
        )}

        {task.status === 'rejected' && task.rejectReason && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca',
            borderLeft: '3px solid #dc2626', padding: '9px 12px', marginBottom: 10, borderRadius: 2,
          }}>
            <p style={{ margin: '0 0 2px', fontSize: 9.5, color: '#dc2626', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Rejection Reason</p>
            <p style={{ margin: 0, fontSize: 12.5, color: '#b91c1c' }}>{task.rejectReason}</p>
          </div>
        )}

        {task.status === 'pending' && (
          <div style={{
            background: '#fffbeb', border: '1px solid #fde68a',
            borderLeft: '3px solid #f59e0b', padding: '9px 12px', marginBottom: 10,
            display: 'flex', alignItems: 'center', gap: 8, borderRadius: 2,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p style={{ margin: 0, fontSize: 12.5, color: '#92400e' }}>Awaiting admin review.</p>
          </div>
        )}

        {task.proofImage && (
  <ProofImage src={task.proofImage} />
)}
      </div>
    </div>
  );
};

// ─── Task Row (List mode) ───────────────────────────────────────────────────
const TaskRow = ({ task, index }) => {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.04 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const s = STATUS[task.status] || STATUS.pending;
  const date = task.updatedAt
    ? new Date(task.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'N/A';
  const time = task.updatedAt
    ? new Date(task.updatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div
      ref={ref}
      style={{
        background: '#fff', border: '1px solid #e8eaf0',
        borderLeft: `3px solid ${s.accent}`, borderRadius: 2, overflow: 'hidden',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: `opacity 0.45s ease ${index * 0.04}s, transform 0.45s ease ${index * 0.04}s, box-shadow 0.2s`,
      }}
      onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(26,58,143,0.08)'}
      onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
    >
      {/* Row summary — always visible */}
      <div
        onClick={() => setExpanded(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '14px 16px', cursor: 'pointer', userSelect: 'none',
          flexWrap: 'wrap',
        }}
      >
        {/* Title */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontFamily: "'Playfair Display',serif", fontSize: 14.5,
            color: '#0d1b3e', margin: 0, lineHeight: 1.3,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {task.taskId?.title || 'Unknown Task'}
          </p>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9ca3af', fontWeight: 400 }}>
            {date}{time ? ` · ${time}` : ''}
          </p>
        </div>

        {/* Credits */}
        {task.taskId?.creditPoints !== undefined && (
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <p style={{ margin: 0, fontSize: 12.5, color: '#374151', fontWeight: 600 }}>{task.taskId.creditPoints} pts</p>
          </div>
        )}

        {/* Badge */}
        <StatusBadge status={task.status} />

        {/* Chevron */}
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="#9ca3af" strokeWidth="2"
          style={{ flexShrink: 0, transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ borderTop: '1px solid #f0f1f5', padding: '14px 16px 16px', background: '#fafafa' }}>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 12px', lineHeight: 1.6, fontWeight: 300 }}>
            {task.taskId?.description || 'No description available.'}
          </p>

          {task.status === 'approved' && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#f0fdf4', border: '1px solid #bbf7d0',
              borderLeft: '3px solid #16a34a', padding: '9px 12px', marginBottom: 10, borderRadius: 2,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <p style={{ margin: 0, fontSize: 12.5, color: '#166534', fontWeight: 600 }}>
                +{task.taskId?.creditPoints || 0} credits earned.
              </p>
            </div>
          )}

          {task.status === 'rejected' && task.rejectReason && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              borderLeft: '3px solid #dc2626', padding: '9px 12px', marginBottom: 10, borderRadius: 2,
            }}>
              <p style={{ margin: '0 0 2px', fontSize: 9.5, color: '#dc2626', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Rejection Reason</p>
              <p style={{ margin: 0, fontSize: 12.5, color: '#b91c1c' }}>{task.rejectReason}</p>
            </div>
          )}

          {task.status === 'pending' && (
            <div style={{
              background: '#fffbeb', border: '1px solid #fde68a',
              borderLeft: '3px solid #f59e0b', padding: '9px 12px', marginBottom: 10,
              display: 'flex', alignItems: 'center', gap: 8, borderRadius: 2,
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p style={{ margin: 0, fontSize: 12.5, color: '#92400e' }}>Awaiting admin review.</p>
            </div>
          )}

          {task.proofImage && (
  <ProofImage src={task.proofImage} />
)}
        </div>
      )}
    </div>
  );
};

// ─── View Toggle Icons ──────────────────────────────────────────────────────
const GridIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
  </svg>
);
const ListIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

// ─── Main Page ──────────────────────────────────────────────────────────────
function TaskHistory() {
  const [tasks, setTasks]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getMyTasks();
      const arr = Array.isArray(data) ? data : [];
      // Sort most recent first
      arr.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
      setTasks(arr);
    } catch (err) {
      console.error(err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const TABS = ['all', 'approved', 'pending', 'rejected'];
  const filtered = tab === 'all' ? tasks : tasks.filter(t => t.status === tab);

  const counts = {
    all:      tasks.length,
    approved: tasks.filter(t => t.status === 'approved').length,
    pending:  tasks.filter(t => t.status === 'pending').length,
    rejected: tasks.filter(t => t.status === 'rejected').length,
  };

  const totalCredits = tasks
    .filter(t => t.status === 'approved')
    .reduce((sum, t) => sum + (t.taskId?.creditPoints || 0), 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Outfit:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position:  400px 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes lbFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes pulse {
          0%,100% { opacity: 1; } 50% { opacity: 0.45; }
        }

        .th-root {
          min-height: 100vh;
          background: #f4f5f7;
          font-family: 'Outfit', sans-serif;
          padding-bottom: 80px;
        }

        /* ── HERO ── */
        .th-hero {
          background: linear-gradient(135deg, #0d1b3e 0%, #1a3a8f 55%, #1e50b5 100%);
          padding: 52px 48px 72px;
          position: relative; overflow: hidden;
          animation: fadeUp 0.7s ease 0.05s both;
        }
        .th-hero::before {
          content: '';
          position: absolute;
          width: 500px; height: 500px; border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%);
          top: -180px; right: -80px;
        }
        .th-hero::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0; height: 40px;
          background: #f4f5f7;
          clip-path: ellipse(55% 100% at 50% 100%);
        }
        .th-hero-inner { max-width: 1100px; margin: 0 auto; position: relative; z-index: 1; }

        .th-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12);
          padding: 6px 14px; font-size: 11px; letter-spacing: 2px;
          text-transform: uppercase; color: #93b4f0; font-weight: 500; margin-bottom: 20px;
        }
        .th-eyebrow-dot {
          width: 6px; height: 6px; background: #60a5fa;
          border-radius: 50%; animation: pulse 2s ease infinite;
        }
        .th-title {
          font-family: 'Playfair Display', serif;
          font-size: 42px; color: #fff; margin: 0 0 10px; line-height: 1.15;
        }
        .th-title em { font-style: italic; color: #93b4f0; }
        .th-sub {
          font-size: 15px; color: rgba(255,255,255,0.5);
          font-weight: 300; max-width: 420px; line-height: 1.7; margin: 0;
        }

        /* ── STATS ── */
        .th-stats {
          max-width: 1100px; margin: -28px auto 0;
          padding: 0 48px;
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px;
          position: relative; z-index: 2;
          animation: fadeUp 0.6s ease 0.2s both;
        }
        .th-stat {
          background: #fff; border: 1px solid #e8eaf0;
          border-top: 3px solid #1a3a8f;
          padding: 18px 20px;
        }
        .th-stat-label { font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 600; margin: 0 0 4px; }
        .th-stat-value { font-family: 'Playfair Display', serif; font-size: 26px; color: #0d1b3e; line-height: 1; }
        .th-stat-sub   { font-size: 11.5px; color: #6b7280; margin-top: 3px; }

        /* ── BODY ── */
        .th-body {
          max-width: 1100px; margin: 36px auto 0; padding: 0 48px;
          animation: fadeUp 0.6s ease 0.35s both;
        }

        /* ── TOP ROW ── */
        .th-toprow {
          display: flex; align-items: center;
          justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;
        }
        .th-toprow-left  { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .th-page-title   { font-family: 'Playfair Display', serif; font-size: 22px; color: #0d1b3e; margin: 0; }
        .th-count        { font-size: 12px; color: #9ca3af; background: #f3f4f6; padding: 4px 12px; font-weight: 500; border-radius: 2px; }

        /* ── VIEW TOGGLE ── */
        .th-view-toggle {
          display: flex; gap: 0;
          border: 1px solid #e8eaf0; background: #fff; overflow: hidden; border-radius: 2px;
        }
        .th-view-btn {
          padding: 8px 11px; background: transparent; border: none;
          cursor: pointer; color: #9ca3af; display: flex; align-items: center;
          transition: background 0.15s, color 0.15s;
          border-right: 1px solid #e8eaf0;
        }
        .th-view-btn:last-child { border-right: none; }
        .th-view-btn.active { background: #1a3a8f; color: #fff; }
        .th-view-btn:not(.active):hover { background: #f3f4f6; color: #374151; }

        /* ── TABS ── */
        .th-tabs {
          display: flex; gap: 0; margin-bottom: 20px;
          border: 1px solid #e8eaf0; width: fit-content;
          max-width: 100%; overflow-x: auto;
          -webkit-overflow-scrolling: touch; scrollbar-width: none;
        }
        .th-tabs::-webkit-scrollbar { display: none; }
        .th-tab {
          padding: 10px 16px; font-family: 'Outfit', sans-serif;
          font-size: 12.5px; font-weight: 500;
          background: #fff; border: none; color: #6b7280; cursor: pointer;
          border-right: 1px solid #e8eaf0;
          transition: background 0.15s, color 0.15s;
          display: flex; align-items: center; gap: 6px;
          white-space: nowrap; flex-shrink: 0;
        }
        .th-tab:last-child { border-right: none; }
        .th-tab.active { background: #1a3a8f; color: #fff; }
        .th-tab.active .tab-pill { background: rgba(255,255,255,0.25); color: #fff; }
        .tab-pill {
          font-size: 10px; font-weight: 700;
          background: #f3f4f6; color: #6b7280;
          padding: 1px 7px; border-radius: 10px;
          min-width: 20px; text-align: center;
        }

        /* ── GRID ── */
        .th-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; }

        /* ── LIST ── */
        .th-list { display: flex; flex-direction: column; gap: 10px; }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .th-stats { grid-template-columns: repeat(2, 1fr); }
          .th-grid  { grid-template-columns: 1fr; }
        }

        @media (max-width: 768px) {
          .th-hero  { padding: 32px 20px 56px; }
          .th-title { font-size: 30px; }
          .th-sub   { font-size: 13.5px; }
          .th-stats { padding: 0 20px; gap: 10px; }
          .th-body  { padding: 0 20px; }
          .th-stat  { padding: 14px; }
          .th-stat-value { font-size: 22px; }
        }

        @media (max-width: 480px) {
          .th-hero  { padding: 22px 14px 50px; }
          .th-title { font-size: 22px; }
          .th-sub   { font-size: 13px; }
          .th-eyebrow { font-size: 9.5px; padding: 5px 10px; }
          .th-stats {
            padding: 0 14px;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px; margin-top: -18px;
          }
          .th-body  { padding: 0 14px; margin-top: 22px; }
          .th-stat  { padding: 11px 12px; }
          .th-stat-value { font-size: 19px; }
          .th-stat-label { font-size: 9px; }
          .th-stat-sub   { font-size: 10.5px; }
          .th-page-title { font-size: 17px; }
          .th-tab   { padding: 9px 11px; font-size: 11.5px; }
          .th-grid  { gap: 12px; }
          .th-list  { gap: 8px; }
        }
      `}</style>

      <div className="th-root">

        {/* ── HERO ── */}
        <div className="th-hero">
          <div className="th-hero-inner">
            <div className="th-eyebrow">
              <div className="th-eyebrow-dot" />
              <span>PAAH Platform</span>
            </div>
            <h1 className="th-title">Your task <em>journey,</em><br />on record.</h1>
            <p className="th-sub">
              A complete verified log of every task you have submitted,
              reviewed, and completed on the PAAH platform.
            </p>
          </div>
        </div>

        {/* ── STATS ── */}
        <div className="th-stats">
          <div className="th-stat">
            <p className="th-stat-label">Total Submitted</p>
            <p className="th-stat-value">{counts.all}</p>
            <p className="th-stat-sub">All tasks</p>
          </div>
          <div className="th-stat" style={{ borderTopColor: '#16a34a' }}>
            <p className="th-stat-label">Approved</p>
            <p className="th-stat-value" style={{ color: '#166534' }}>{counts.approved}</p>
            <p className="th-stat-sub">Verified by admin</p>
          </div>
          <div className="th-stat" style={{ borderTopColor: '#f59e0b' }}>
            <p className="th-stat-label">Pending</p>
            <p className="th-stat-value" style={{ color: '#92400e' }}>{counts.pending}</p>
            <p className="th-stat-sub">Awaiting review</p>
          </div>
          <div className="th-stat" style={{ borderTopColor: '#1a3a8f' }}>
            <p className="th-stat-label">Credits Earned</p>
            <p className="th-stat-value">{totalCredits}</p>
            <p className="th-stat-sub">From approved tasks</p>
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="th-body">

          <div className="th-toprow">
            <div className="th-toprow-left">
              <h2 className="th-page-title">Submission Log</h2>
              <span className="th-count">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</span>
            </div>

            {/* View toggle */}
            <div className="th-view-toggle">
              <button
                className={`th-view-btn${viewMode === 'grid' ? ' active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid view"
                aria-label="Grid view"
              >
                <GridIcon />
              </button>
              <button
                className={`th-view-btn${viewMode === 'list' ? ' active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List view"
                aria-label="List view"
              >
                <ListIcon />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="th-tabs">
            {TABS.map(t => (
              <button
                key={t}
                className={`th-tab${tab === t ? ' active' : ''}`}
                onClick={() => setTab(t)}
              >
                {t === 'all' ? 'All' : STATUS[t].label}
                <span className="tab-pill">{counts[t]}</span>
              </button>
            ))}
          </div>

          {/* Cards */}
          {loading ? (
            <div className={viewMode === 'grid' ? 'th-grid' : 'th-list'}>
              {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="th-grid"><EmptyState tab={tab} /></div>
          ) : viewMode === 'grid' ? (
            <div className="th-grid">
              {filtered.map((t, i) => <TaskCard key={t._id} task={t} index={i} />)}
            </div>
          ) : (
            <div className="th-list">
              {filtered.map((t, i) => <TaskRow key={t._id} task={t} index={i} />)}
            </div>
          )}
        </div>

      </div>
    </>
  );
}

export default TaskHistory;