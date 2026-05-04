import { useEffect, useState, useMemo } from 'react';
import { getTasks, acceptTask } from '../../features/task/taskAPI';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

/* ══════════════════════════════════════════
   ICONS
══════════════════════════════════════════ */
const Ico = {
  Search: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.8"/>
      <path stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" d="M21 21l-4.35-4.35"/>
    </svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" d="M20 6L9 17l-5-5"/>
    </svg>
  ),
  Clock: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.7"/>
      <path stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" d="M12 6v6l4 2"/>
    </svg>
  ),
  Award: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="6" stroke="currentColor" strokeWidth="1.7"/>
      <path stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12"/>
    </svg>
  ),
  Users: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path stroke="currentColor" strokeWidth="1.7" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.7"/>
      <path stroke="currentColor" strokeWidth="1.7" d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Tag: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"
        d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
      <circle cx="7" cy="7" r="1.5" fill="currentColor"/>
    </svg>
  ),
  Lock: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.7"/>
      <path stroke="currentColor" strokeWidth="1.7" d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  ArrowRight: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  ),
  Refresh: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
        d="M23 4v6h-6M1 20v-6h6"/>
      <path stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
        d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
    </svg>
  ),
  Alert: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"
        d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="12" cy="17" r="1" fill="currentColor"/>
    </svg>
  ),
  ListDone: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" d="M9 11l3 3L22 4"/>
      <path stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"
        d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </svg>
  ),
  Grid: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8"/>
      <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8"/>
      <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8"/>
      <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8"/>
    </svg>
  ),
  List: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
    </svg>
  ),
};

/* ══════════════════════════════════════════
   CONFIG
══════════════════════════════════════════ */
const PRIORITY = {
  high:   { label: 'High',   color: '#dc2626', bg: '#fef2f2', dot: '#dc2626' },
  medium: { label: 'Medium', color: '#d97706', bg: '#fffbeb', dot: '#d97706' },
  low:    { label: 'Low',    color: '#16a34a', bg: '#f0fdf4', dot: '#16a34a' },
};
const TYPE_COLORS = {
  donation:  { color: '#9333ea', bg: '#faf5ff' },
  community: { color: '#0891b2', bg: '#ecfeff' },
  education: { color: '#1d4ed8', bg: '#eff6ff' },
  health:    { color: '#16a34a', bg: '#f0fdf4' },
  default:   { color: '#64748b', bg: '#f8fafc' },
};
const getTypeStyle = (type) => TYPE_COLORS[type?.toLowerCase()] || TYPE_COLORS.default;

/* ══════════════════════════════════════════
   TASK CARD
══════════════════════════════════════════ */
function TaskCard({ task, onAccept, disabled, reason, accepted, layout = 'grid' }) {
  const [accepting, setAccepting] = useState(false);
  const priority  = PRIORITY[task.priority?.toLowerCase()] || PRIORITY.medium;
  const typeStyle = getTypeStyle(task.type);
  const deadline  = task.deadline
    ? new Date(task.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;
  const isExpired = task.deadline && new Date(task.deadline) < new Date();

  const handleAccept = async () => {
    if (!onAccept || accepting) return;
    setAccepting(true);
    try { await onAccept(task._id); }
    finally { setAccepting(false); }
  };

  return (
    <div className={`tk-card${accepted ? ' tk-card--accepted' : ''}${disabled && !accepted ? ' tk-card--locked' : ''}${layout === 'list' ? ' tk-card--list' : ''}`}>

      <div className="tk-card-top">
        <div className="tk-badges">
          <span className="tk-badge" style={{ background: typeStyle.bg, color: typeStyle.color }}>
            <Ico.Tag /> {task.type || 'General'}
          </span>
         
        </div>
        <div className="tk-pills">
          {accepted && <span className="tk-status-pill tk-status-pill--accepted"><Ico.Check /> Accepted</span>}
          {disabled && !accepted && <span className="tk-status-pill tk-status-pill--locked"><Ico.Lock /> {reason || 'Locked'}</span>}
          {isExpired && !accepted && <span className="tk-status-pill tk-status-pill--expired">Expired</span>}
        </div>
      </div>

      <h3 className="tk-title">{task.title}</h3>
      {task.description && <p className="tk-desc">{task.description}</p>}

      <div className="tk-meta">
        {task.credits    && <span className="tk-meta-item tk-meta-credits"><Ico.Award /> {task.credits} credits</span>}
        {deadline        && <span className={`tk-meta-item${isExpired ? ' tk-meta-expired' : ''}`}><Ico.Clock /> {deadline}</span>}
        {task.maxParticipants && <span className="tk-meta-item"><Ico.Users /> {task.currentParticipants || 0}/{task.maxParticipants}</span>}
      </div>

      {!accepted && (
        <div className="tk-action">
          {onAccept && !disabled ? (
            <button className="tk-btn-accept" onClick={handleAccept} disabled={accepting}>
              {accepting ? <span className="tk-spinner" /> : <> Accept Task <Ico.ArrowRight /> </>}
            </button>
          ) : (
            <div className="tk-btn-disabled"><Ico.Lock /> {reason || 'Unavailable'}</div>
          )}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   TASKS PAGE
══════════════════════════════════════════ */
function Tasks() {
  const [tasks, setTasks]             = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [search, setSearch]           = useState('');
  const [filterType, setFilterType]   = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [layout, setLayout]           = useState('grid');
  const [activeTab, setActiveTab]     = useState('available');
  const [toast, setToast]             = useState(null);

  const { user } = useAuth();
  const navigate  = useNavigate();

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await getTasks();
      setTasks(res.tasks || []);
      setSubmissions(res.submissions || []);
    } catch {
      showToast('Failed to load tasks', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const isTaskAccepted   = (id)   => submissions.some((s) => (s.taskId?._id || s.taskId) === id);
  const isCategoryTaken  = (type) => submissions.some((s) =>
    (s.status === 'pending' || s.status === 'approved') && s.taskId?.type === type);

  const acceptedTasks = useMemo(() =>
    submissions
      .map((s) => (typeof s.taskId === 'object' ? s.taskId : tasks.find((t) => t._id === s.taskId)))
      .filter(Boolean),
    [submissions, tasks]);

  const availableTasks = useMemo(() =>
    tasks.filter((t) => !isTaskAccepted(t._id)),
    [tasks, submissions]);

  const allTypes = useMemo(() =>
    [...new Set(tasks.map((t) => t.type).filter(Boolean))],
    [tasks]);

  const filtered = useMemo(() => {
    const src = activeTab === 'available' ? availableTasks : acceptedTasks;
    return src.filter((t) => {
      const ms = !search || t.title?.toLowerCase().includes(search.toLowerCase()) || t.description?.toLowerCase().includes(search.toLowerCase());
      const mt = filterType === 'all' || t.type === filterType;
      const mp = filterPriority === 'all' || t.priority?.toLowerCase() === filterPriority;
      return ms && mt && mp;
    });
  }, [availableTasks, acceptedTasks, activeTab, search, filterType, filterPriority]);

  const handleAccept = async (id) => {
    if (!user?.teamId) {
      showToast('You must join a team to accept tasks', 'warning');
      return navigate('/teams');
    }
    try {
      await acceptTask({ taskId: id });
      showToast('Task accepted successfully!', 'success');
      await fetchTasks(true);
    } catch (err) {
      showToast(err.response?.data?.msg || 'Failed to accept task', 'error');
    }
  };

  /* ── SKELETON ── */
  if (loading) {
    return (
      <>
        <style>{STYLES}</style>
        <div className="tk-root">
          <div className="tk-header-section">
            <div className="tk-page-header">
              <div>
                <div className="tk-skeleton" style={{ width: 120, height: 34, borderRadius: 8 }} />
                <div className="tk-skeleton" style={{ width: 260, height: 16, borderRadius: 6, marginTop: 10 }} />
              </div>
            </div>
          </div>
          <div className="tk-body">
            <div className="tk-skeleton-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="tk-skeleton-card" style={{ animationDelay: `${i * 70}ms` }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div className="tk-skeleton" style={{ width: 80, height: 22, borderRadius: 100 }} />
                    <div className="tk-skeleton" style={{ width: 60, height: 22, borderRadius: 100 }} />
                  </div>
                  <div className="tk-skeleton" style={{ width: '85%', height: 22, borderRadius: 6, marginTop: 16 }} />
                  <div className="tk-skeleton" style={{ width: '100%', height: 14, borderRadius: 4, marginTop: 10 }} />
                  <div className="tk-skeleton" style={{ width: '65%', height: 14, borderRadius: 4, marginTop: 6 }} />
                  <div className="tk-skeleton" style={{ width: '100%', height: 42, borderRadius: 10, marginTop: 20 }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  const hasActiveFilters = search || filterType !== 'all' || filterPriority !== 'all';

  return (
    <>
      <style>{STYLES}</style>

      {toast && (
        <div className={`tk-toast tk-toast--${toast.type}`}>
          {toast.type !== 'warning' && <Ico.Check />}
          {toast.type === 'warning' && <Ico.Alert />}
          {toast.msg}
        </div>
      )}

      <div className="tk-root">

        {/* ════ HEADER ════ */}
        <div className="tk-header-section">
          <div className="tk-page-header">
            <div>
              <h1 className="tk-page-title">Tasks</h1>
              <p className="tk-page-sub">Browse, accept, and track your social impact tasks</p>
            </div>
            <button
              className={`tk-refresh-btn${refreshing ? ' refreshing' : ''}`}
              onClick={() => fetchTasks(true)}
              disabled={refreshing}
            >
              <Ico.Refresh />
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>

          {!user?.teamId && (
            <div className="tk-alert">
              <Ico.Alert />
              <div className="tk-alert-body">
                <strong>Team required</strong>
                <span>You must join a team before you can accept tasks.</span>
              </div>
              <button className="tk-alert-btn" onClick={() => navigate('/teams')}>
                Join a Team <Ico.ArrowRight />
              </button>
            </div>
          )}
        </div>

        <div className="tk-body">

          {/* ════ SUMMARY ════ */}
          <div className="tk-summary-strip">
            {[
              { num: availableTasks.length, label: 'Available',       cls: '' },
              { num: acceptedTasks.length,  label: 'Accepted',        cls: 'tk-summary-num--green' },
              { num: tasks.length,          label: 'Total Tasks',     cls: 'tk-summary-num--gold' },
              { num: submissions.reduce((a, s) => a + (s.taskId?.credits || 0), 0), label: 'Credits Earned', cls: 'tk-summary-num--purple' },
            ].map((item, i, arr) => (
              <>
                <div key={item.label} className="tk-summary-item">
                  <span className={`tk-summary-num ${item.cls}`}>{item.num}</span>
                  <span className="tk-summary-label">{item.label}</span>
                </div>
                {i < arr.length - 1 && <div className="tk-summary-divider" />}
              </>
            ))}
          </div>

          {/* ════ CONTROLS ════ */}
          <div className="tk-controls">
            <div className="tk-tabs">
              <button className={`tk-tab${activeTab === 'available' ? ' active' : ''}`} onClick={() => setActiveTab('available')}>
                <Ico.Grid /> Available <span className="tk-tab-count">{availableTasks.length}</span>
              </button>
              <button className={`tk-tab${activeTab === 'accepted' ? ' active' : ''}`} onClick={() => setActiveTab('accepted')}>
                <Ico.ListDone /> Accepted <span className="tk-tab-count tk-tab-count--green">{acceptedTasks.length}</span>
              </button>
            </div>

            <div className="tk-filters">
              <div className="tk-search-wrap">
                <Ico.Search />
                <input className="tk-search" placeholder="Search tasks…" value={search} onChange={(e) => setSearch(e.target.value)} />
                {search && <button className="tk-search-clear" onClick={() => setSearch('')}>✕</button>}
              </div>

              <select className="tk-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="all">All Types</option>
                {allTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>

              
              <div className="tk-layout-toggle">
                <button className={`tk-layout-btn${layout === 'grid' ? ' active' : ''}`} onClick={() => setLayout('grid')} title="Grid view"><Ico.Grid /></button>
                <button className={`tk-layout-btn${layout === 'list' ? ' active' : ''}`} onClick={() => setLayout('list')} title="List view"><Ico.List /></button>
              </div>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="tk-results-info">
              Showing <strong>{filtered.length}</strong> result{filtered.length !== 1 ? 's' : ''}
              {search && <> for "<strong>{search}</strong>"</>}
              <button className="tk-clear-filters" onClick={() => { setSearch(''); setFilterType('all'); setFilterPriority('all'); }}>
                Clear filters
              </button>
            </div>
          )}

          {/* ════ CARDS ════ */}
          {filtered.length === 0 ? (
            <div className="tk-empty">
              <div className="tk-empty-icon">{activeTab === 'available' ? '📋' : '✅'}</div>
              <h3>{activeTab === 'available' ? 'No tasks available' : 'No accepted tasks yet'}</h3>
              <p>
                {activeTab === 'available'
                  ? 'All tasks are currently locked or you\'ve accepted all available ones.'
                  : 'Accept tasks from the Available tab to see them here.'}
              </p>
              {activeTab === 'accepted' && (
                <button className="tk-empty-cta" onClick={() => setActiveTab('available')}>
                  Browse Available Tasks <Ico.ArrowRight />
                </button>
              )}
            </div>
          ) : (
            <div className={layout === 'grid' ? 'tk-grid' : 'tk-list'}>
              {filtered.map((t, i) => {
                const isAccepted      = activeTab === 'accepted';
                const categoryBlocked = !isAccepted && isCategoryTaken(t.type);
                return (
                  <div key={t._id} style={{ animationDelay: `${i * 40}ms` }} className="tk-card-wrap">
                    <TaskCard
                      task={t}
                      onAccept={!isAccepted && !categoryBlocked ? handleAccept : null}
                      disabled={categoryBlocked}
                      reason={categoryBlocked ? 'Category in progress' : ''}
                      accepted={isAccepted}
                      layout={layout}
                    />
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════
   STYLES
══════════════════════════════════════════ */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');

:root{
  --navy:#0B1F4B;--blue:#1B4FD8;--blue-m:#3B6EF8;--blue-l:#EEF3FF;
  --gold:#C9A84C;--white:#FFFFFF;--g50:#F8F9FB;--g100:#F1F3F7;
  --g200:#E4E7EF;--g400:#9AA3B8;--g600:#4B5675;--g900:#0F172A;
  --r:12px;--rl:16px;--green:#16a34a;--amber:#d97706;--red:#dc2626;
}
.tk-root{font-family:'DM Sans',sans-serif;background:var(--g50);min-height:100vh;color:var(--g900);}

/* HEADER */
.tk-header-section{background:var(--white);border-bottom:1px solid var(--g200);padding:32px 40px 24px;}
.tk-page-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:20px;gap:16px;flex-wrap:wrap;}
.tk-page-title{font-family:'Cormorant Garamond',serif;font-size:34px;font-weight:700;color:var(--navy);margin:0 0 4px;}
.tk-page-sub{font-size:14px;color:var(--g400);margin:0;}
.tk-refresh-btn{display:inline-flex;align-items:center;gap:7px;padding:9px 18px;border-radius:var(--r);background:var(--g50);border:1px solid var(--g200);font-size:13.5px;font-weight:500;color:var(--g600);cursor:pointer;transition:all 0.15s;font-family:'DM Sans',sans-serif;}
.tk-refresh-btn:hover{background:var(--g100);border-color:var(--g400);}
.tk-refresh-btn.refreshing svg{animation:spin 0.8s linear infinite;}
@keyframes spin{to{transform:rotate(360deg);}}

/* ALERT */
.tk-alert{display:flex;align-items:center;gap:14px;background:#fffbeb;border:1px solid #fde68a;border-radius:var(--r);padding:14px 18px;flex-wrap:wrap;color:#92400e;}
.tk-alert-body{flex:1;display:flex;flex-direction:column;gap:2px;}
.tk-alert-body strong{font-size:14px;font-weight:600;}
.tk-alert-body span{font-size:13px;opacity:0.8;}
.tk-alert-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:8px;background:var(--amber);color:#fff;font-size:13px;font-weight:600;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;transition:background 0.15s;white-space:nowrap;}
.tk-alert-btn:hover{background:#b45309;}

/* BODY */
.tk-body{max-width:1200px;margin:0 auto;padding:28px 40px 60px;}

/* SUMMARY */
.tk-summary-strip{background:var(--white);border:1px solid var(--g200);border-radius:var(--rl);padding:20px 28px;display:flex;align-items:center;margin-bottom:24px;flex-wrap:wrap;}
.tk-summary-item{display:flex;flex-direction:column;align-items:center;gap:4px;flex:1;min-width:80px;padding:4px 0;}
.tk-summary-num{font-family:'Cormorant Garamond',serif;font-size:30px;font-weight:700;color:var(--navy);line-height:1;}
.tk-summary-num--green{color:var(--green);}
.tk-summary-num--gold{color:var(--gold);}
.tk-summary-num--purple{color:#9333ea;}
.tk-summary-label{font-size:12px;color:var(--g400);font-weight:500;}
.tk-summary-divider{width:1px;height:40px;background:var(--g200);margin:0 8px;flex-shrink:0;}

/* CONTROLS */
.tk-controls{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:20px;}
.tk-tabs{display:flex;gap:4px;}
.tk-tab{display:inline-flex;align-items:center;gap:7px;padding:9px 18px;border-radius:10px;font-size:13.5px;font-weight:500;color:var(--g400);background:transparent;border:1px solid transparent;cursor:pointer;transition:all 0.15s;font-family:'DM Sans',sans-serif;}
.tk-tab:hover{color:var(--navy);background:var(--g100);}
.tk-tab.active{color:var(--blue);background:var(--blue-l);border-color:#c7d9ff;}
.tk-tab-count{display:inline-flex;align-items:center;justify-content:center;min-width:22px;height:20px;padding:0 6px;border-radius:100px;font-size:11px;font-weight:600;background:var(--g200);color:var(--g600);}
.tk-tab.active .tk-tab-count{background:var(--blue);color:#fff;}
.tk-tab-count--green{background:#dcfce7!important;color:#15803d!important;}

/* FILTERS */
.tk-filters{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
.tk-search-wrap{position:relative;display:flex;align-items:center;}
.tk-search-wrap>svg{position:absolute;left:12px;color:var(--g400);pointer-events:none;}
.tk-search{padding:9px 36px;border:1px solid var(--g200);border-radius:10px;font-size:13.5px;color:var(--g900);background:var(--white);outline:none;width:220px;font-family:'DM Sans',sans-serif;transition:border-color 0.15s,box-shadow 0.15s;}
.tk-search:focus{border-color:var(--blue);box-shadow:0 0 0 3px rgba(59,110,248,0.1);}
.tk-search::placeholder{color:var(--g400);}
.tk-search-clear{position:absolute;right:10px;background:none;border:none;color:var(--g400);cursor:pointer;font-size:12px;padding:2px;transition:color 0.1s;}
.tk-search-clear:hover{color:var(--g900);}
.tk-select{padding:9px 14px;border:1px solid var(--g200);border-radius:10px;font-size:13.5px;color:var(--g600);background:var(--white);outline:none;cursor:pointer;font-family:'DM Sans',sans-serif;transition:border-color 0.15s;}
.tk-select:focus{border-color:var(--blue);}
.tk-layout-toggle{display:flex;border:1px solid var(--g200);border-radius:10px;overflow:hidden;}
.tk-layout-btn{padding:9px 12px;background:var(--white);border:none;color:var(--g400);cursor:pointer;transition:all 0.15s;}
.tk-layout-btn:hover{background:var(--g100);color:var(--navy);}
.tk-layout-btn.active{background:var(--blue-l);color:var(--blue);}

/* RESULTS INFO */
.tk-results-info{font-size:13px;color:var(--g400);margin-bottom:16px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
.tk-results-info strong{color:var(--g900);}
.tk-clear-filters{background:none;border:none;color:var(--blue);font-size:13px;cursor:pointer;font-weight:500;text-decoration:underline;font-family:'DM Sans',sans-serif;}

/* GRID / LIST */
.tk-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:18px;}
.tk-list{display:flex;flex-direction:column;gap:12px;}
.tk-card-wrap{animation:fadeUp 0.4s ease both;}

/* CARD */
.tk-card{background:var(--white);border:1px solid var(--g200);border-radius:var(--rl);padding:22px;display:flex;flex-direction:column;gap:12px;transition:transform 0.18s,box-shadow 0.18s,border-color 0.18s;position:relative;overflow:hidden;}
.tk-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--blue),var(--blue-m));opacity:0;transition:opacity 0.2s;}
.tk-card:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(11,31,75,0.08);border-color:#c7d9ff;}
.tk-card:hover::before{opacity:1;}
.tk-card--accepted{border-color:#bbf7d0;background:#f0fdf4;}
.tk-card--accepted::before{background:linear-gradient(90deg,var(--green),#4ade80);}
.tk-card--locked{opacity:0.7;}
.tk-card--list{flex-direction:row;align-items:center;gap:20px;padding:18px 22px;}
.tk-card--list .tk-title{font-size:15px;margin:0;flex:1;}
.tk-card--list .tk-desc{display:none;}
.tk-card--list .tk-action{margin-top:0;margin-left:auto;min-width:160px;}

/* card internals */
.tk-card-top{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;}
.tk-badges{display:flex;gap:6px;flex-wrap:wrap;}
.tk-pills{display:flex;gap:6px;flex-wrap:wrap;}
.tk-badge{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:100px;font-size:11.5px;font-weight:600;text-transform:capitalize;}
.tk-priority{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:100px;font-size:11.5px;font-weight:600;}
.tk-priority-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;}
.tk-status-pill{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:100px;font-size:11.5px;font-weight:600;flex-shrink:0;}
.tk-status-pill--accepted{background:#dcfce7;color:#15803d;}
.tk-status-pill--locked{background:var(--g100);color:var(--g400);}
.tk-status-pill--expired{background:#fee2e2;color:#991b1b;}
.tk-title{font-size:16px;font-weight:600;color:var(--navy);line-height:1.4;margin:0;}
.tk-desc{font-size:13.5px;color:var(--g600);line-height:1.6;margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
.tk-meta{display:flex;gap:14px;flex-wrap:wrap;margin-top:2px;}
.tk-meta-item{display:inline-flex;align-items:center;gap:4px;font-size:12.5px;color:var(--g400);}
.tk-meta-credits{color:#7c3aed;font-weight:600;}
.tk-meta-expired{color:var(--red);}

/* ACTIONS */
.tk-action{margin-top:4px;}
.tk-btn-accept{width:100%;display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:11px 20px;border-radius:var(--r);background:var(--navy);color:var(--white);font-size:14px;font-weight:600;border:none;cursor:pointer;transition:background 0.15s,transform 0.1s;font-family:'DM Sans',sans-serif;}
.tk-btn-accept:hover{background:var(--blue);transform:translateY(-1px);}
.tk-btn-accept:disabled{opacity:0.6;cursor:not-allowed;transform:none;}
.tk-btn-disabled{display:inline-flex;align-items:center;justify-content:center;gap:7px;width:100%;padding:11px 20px;border-radius:var(--r);background:var(--g100);color:var(--g400);font-size:13.5px;font-weight:500;border:1px solid var(--g200);}
.tk-spinner{width:16px;height:16px;border-radius:50%;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;animation:spin 0.6s linear infinite;display:inline-block;}

/* EMPTY */
.tk-empty{text-align:center;padding:72px 20px;display:flex;flex-direction:column;align-items:center;gap:10px;}
.tk-empty-icon{font-size:52px;margin-bottom:8px;}
.tk-empty h3{font-size:18px;font-weight:600;color:var(--navy);margin:0;}
.tk-empty p{font-size:14px;color:var(--g400);margin:0;max-width:320px;}
.tk-empty-cta{margin-top:12px;display:inline-flex;align-items:center;gap:8px;padding:11px 24px;border-radius:var(--r);background:var(--blue);color:#fff;border:none;font-size:14px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:background 0.15s;}
.tk-empty-cta:hover{background:var(--navy);}

/* SKELETON */
.tk-skeleton-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:18px;padding:28px 40px;max-width:1200px;margin:0 auto;}
.tk-skeleton-card{background:var(--white);border:1px solid var(--g200);border-radius:var(--rl);padding:22px;display:flex;flex-direction:column;gap:0;animation:fadeUp 0.4s ease both;}
.tk-skeleton{background:linear-gradient(90deg,var(--g100) 25%,var(--g200) 50%,var(--g100) 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;}
@keyframes shimmer{from{background-position:200% 0;}to{background-position:-200% 0;}}

/* TOAST */
.tk-toast{position:fixed;top:20px;right:20px;z-index:9999;display:inline-flex;align-items:center;gap:10px;padding:14px 20px;border-radius:var(--r);font-size:14px;font-weight:500;box-shadow:0 8px 24px rgba(0,0,0,0.12);animation:toastIn 0.3s ease;font-family:'DM Sans',sans-serif;}
.tk-toast--success{background:#052e16;color:#bbf7d0;}
.tk-toast--error{background:#450a0a;color:#fecaca;}
.tk-toast--warning{background:#451a03;color:#fed7aa;}
@keyframes toastIn{from{opacity:0;transform:translateX(20px);}to{opacity:1;transform:translateX(0);}}

@keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}

@media(max-width:768px){
  .tk-header-section{padding:24px 20px 20px;}
  .tk-body{padding:20px 20px 48px;}
  .tk-skeleton-grid{padding:20px;}
  .tk-controls{flex-direction:column;align-items:stretch;}
  .tk-filters{flex-wrap:wrap;}
  .tk-search{width:100%;}
  .tk-grid{grid-template-columns:1fr;}
  .tk-card--list{flex-direction:column;align-items:flex-start;}
  .tk-card--list .tk-action{margin-left:0;width:100%;min-width:unset;}
}
`;

export default Tasks;