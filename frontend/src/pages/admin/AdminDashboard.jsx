import { useEffect, useState, useCallback } from 'react';
import { getAllDonations, getAdminStats } from '../../features/donation/donationAPI';


// ─── Status config ─────────────────────────────────────────────────────────
const STATUS = {
  approved: { label: 'Approved', text: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200', dot: 'bg-green-500',  strip: 'bg-green-500'  },
  rejected: { label: 'Rejected', text: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-200',   dot: 'bg-red-500',    strip: 'bg-red-500'    },
  pending:  { label: 'Pending',  text: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200',dot: 'bg-yellow-400 animate-pulse', strip: 'bg-yellow-400' },
};

// ─── Lightbox ──────────────────────────────────────────────────────────────
const Lightbox = ({ src, onClose }) => {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', h); document.body.style.overflow = prev; };
  }, [onClose]);
  return (
    <div onClick={onClose} className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85" style={{animation:'fadeIn .18s ease both'}}>
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>
      <button onClick={(e)=>{e.stopPropagation();onClose();}}
        className="fixed top-4 right-4 z-[100000] w-10 h-10 rounded-full flex items-center justify-center text-white text-2xl bg-white/15 border border-white/30 backdrop-blur-sm hover:bg-white/25 transition-colors">×</button>
      <p className="fixed bottom-5 left-1/2 -translate-x-1/2 text-white/40 text-xs whitespace-nowrap pointer-events-none">Tap anywhere or press ESC to close</p>
      <img src={src} alt="Proof" onClick={(e)=>e.stopPropagation()}
        className="max-w-full max-h-[calc(100vh-80px)] object-contain rounded shadow-2xl cursor-default" />
    </div>
  );
};

// ─── Stat Card ─────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, topColor, valueClass = 'text-gray-900', icon }) => (
  <div className={`bg-white rounded-2xl border border-gray-100 border-t-2 ${topColor} p-4 sm:p-5 flex flex-col gap-1`}>
    <div className="flex items-center justify-between mb-1">
      <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">{label}</p>
      {icon && <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center text-gray-300">{icon}</div>}
    </div>
    <p className={`text-2xl sm:text-3xl font-bold leading-none ${valueClass}`} style={{fontFamily:"'Playfair Display',serif"}}>{value ?? '—'}</p>
    {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
  </div>
);

// ─── Skeleton ──────────────────────────────────────────────────────────────
const Skeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3 animate-pulse">
    <div className="flex gap-3 items-start">
      <div className="w-16 h-16 rounded-xl bg-gray-100 shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-3.5 bg-gray-100 rounded w-2/3" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-3 bg-gray-100 rounded w-1/3" />
      </div>
    </div>
  </div>
);

// ─── Donation type icon ─────────────────────────────────────────────────────
const TypeIcon = ({ type }) => {
  const icons = {
    money:    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M9 9h4.5a1.5 1.5 0 010 3H9.5a1.5 1.5 0 000 3H15"/></svg>,
    clothes:  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20.38 3.46L16 2l-4 4-4-4-4.38 1.46A2 2 0 002 5.32V10h3v11h14V10h3V5.32a2 2 0 00-1.62-1.86z"/></svg>,
    books:    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
    food:     <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3"/></svg>,
  };
  return icons[type] || <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>;
};

// ─── Donation Card ──────────────────────────────────────────────────────────
const DonationCard = ({ d, index }) => {
  const [lightbox, setLightbox] = useState(false);
  const closeLightbox = useCallback(() => setLightbox(false), []);
  const s = STATUS[d.status] || STATUS.pending;

  const date = new Date(d.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const time = new Date(d.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const detail = d.amount
    ? `₹${d.amount.toLocaleString('en-IN')}`
    : d.weight
    ? `${d.weight} kg`
    : d.quantity
    ? `${d.quantity} books`
    : d.itemName || null;

  return (
    <>
      <div
        className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md hover:shadow-blue-50 transition-all duration-200"
        style={{ animation: `fadeUp .4s ease ${index * 0.05}s both` }}
      >
        {/* Status stripe */}
        <div className={`h-1 w-full ${s.strip}`} />

        <div className="p-4 sm:p-5">
          <div className="flex gap-3 sm:gap-4">

            {/* Proof thumbnail or type icon */}
            {d.proofImage ? (
              <div
                onClick={() => setLightbox(true)}
                role="button" tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setLightbox(true)}
                aria-label="View proof"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 cursor-pointer group relative border border-gray-100"
              >
                <img
                  src={d.proofImage}
                  alt="Proof"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 3 21 3 21 9"/><line x1="21" y1="3" x2="14" y2="10"/>
                  </svg>
                </div>
              </div>
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-blue-400">
                <TypeIcon type={d.type} />
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900 truncate">{d.userId?.name || 'Unknown User'}</p>
                  <p className="text-xs text-gray-400 capitalize">{d.type} donation</p>
                </div>
                <span className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full border ${s.text} ${s.bg} ${s.border}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                  {s.label}
                </span>
              </div>

              {/* Detail chips */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {detail && (
                  <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full font-medium">
                    {detail}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-xs bg-gray-50 text-gray-500 border border-gray-100 px-2 py-0.5 rounded-full">
                  {d.finalPoints != null
                    ? <><svg className="w-3 h-3 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>{d.finalPoints} pts</>
                    : 'Points pending'}
                </span>
              </div>

              <p className="text-[10.5px] text-gray-300">{date} · {time}</p>
            </div>
          </div>
        </div>
      </div>

      {lightbox && <Lightbox src={d.proofImage} onClose={closeLightbox} />}
    </>
  );
};

// ─── Filter tab ─────────────────────────────────────────────────────────────
const FilterTab = ({ value, label, count, active, onClick }) => (
  <button
    onClick={() => onClick(value)}
    className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border transition-all duration-150 whitespace-nowrap
      ${active
        ? 'bg-[#1a3a8f] text-white border-[#1a3a8f] shadow-sm'
        : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300 hover:text-blue-700'
      }`}
  >
    {label}
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center
      ${active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
      {count}
    </span>
  </button>
);

// ─── Main ───────────────────────────────────────────────────────────────────
function AdminDashboard() {
  const [donations, setDonations] = useState([]);
  const [stats,     setStats]     = useState(null);
  const [filter,    setFilter]    = useState('all');
  const [loading,   setLoading]   = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [donationData, statsData] = await Promise.all([
        getAllDonations(),
        getAdminStats(),
      ]);
      setDonations(donationData || []);
      setStats(statsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const counts = {
    all:      donations.length,
    approved: donations.filter(d => d.status === 'approved').length,
    pending:  donations.filter(d => d.status === 'pending').length,
    rejected: donations.filter(d => d.status === 'rejected').length,
  };

  const filtered = filter === 'all' ? donations : donations.filter(d => d.status === filter);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div className="min-h-screen bg-[#f0f4ff] pb-20 font-sans">

        {/* ── Hero ── */}
        <div className="bg-gradient-to-br from-[#0d1b3e] via-[#1a3a8f] to-[#1e50b5] px-5 sm:px-10 pt-10 pb-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/[0.03] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="max-w-5xl mx-auto relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-blue-200 text-[11px] font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-300 animate-pulse" />
              Admin Panel
            </div>
            <h1 className="text-white text-2xl sm:text-3xl font-bold mb-1" style={{fontFamily:"'Playfair Display',serif"}}>
              Dashboard
            </h1>
            <p className="text-blue-200/60 text-sm font-light">
              Platform overview — donations, credits, top performers.
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-[#f0f4ff]" style={{clipPath:'ellipse(55% 100% at 50% 100%)'}} />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-2">

          {/* ── Stats grid ── */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8"
              style={{animation:'fadeUp .5s ease .1s both'}}>

              <StatCard label="Total Donations"   topColor="border-t-blue-500"   value={stats.total}        sub="All time"           valueClass="text-gray-900"
                icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/></svg>}
              />
              <StatCard label="Approved"          topColor="border-t-green-500"  value={stats.approved}     sub="Verified"           valueClass="text-green-600"
                icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>}
              />
              <StatCard label="Pending"           topColor="border-t-yellow-400" value={stats.pending}      sub="Awaiting review"    valueClass="text-yellow-600"
                icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>}
              />
              <StatCard label="Rejected"          topColor="border-t-red-500"    value={stats.rejected}     sub="Not approved"       valueClass="text-red-600"
                icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
              />
              <StatCard label="Total Credits"     topColor="border-t-blue-700"   value={stats.totalCredits} sub="Awarded to users"   valueClass="text-blue-700"
                icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>}
              />

              {/* Top User */}
              <div className="bg-white rounded-2xl border border-gray-100 border-t-2 border-t-purple-400 p-4 sm:p-5 col-span-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">Top User</p>
                  <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                  </div>
                </div>
                <p className="text-base font-bold text-gray-900 truncate" style={{fontFamily:"'Playfair Display',serif"}}>
                  {stats.topUser?.name || 'N/A'}
                </p>
                {stats.topUser?.credits != null && (
                  <p className="text-xs text-gray-400 mt-0.5">{stats.topUser.credits} pts</p>
                )}
              </div>

              {/* Top Team */}
              <div className="bg-white rounded-2xl border border-gray-100 border-t-2 border-t-indigo-400 p-4 sm:p-5 col-span-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">Top Team</p>
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <svg className="w-4 h-4 text-indigo-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
                  </div>
                </div>
                <p className="text-base font-bold text-gray-900 truncate" style={{fontFamily:"'Playfair Display',serif"}}>
                  {stats.topTeam?.name || 'N/A'}
                </p>
                {stats.topTeam?.totalPoints != null && (
                  <p className="text-xs text-gray-400 mt-0.5">{stats.topTeam.totalPoints} pts</p>
                )}
              </div>

            </div>
          )}

          {/* ── Donations section ── */}
          <div style={{animation:'fadeUp .5s ease .25s both'}}>

            {/* Section header */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h2 className="text-lg font-semibold text-gray-800" style={{fontFamily:"'Playfair Display',serif"}}>
                Donation Records
              </h2>
              <span className="text-xs bg-white border border-gray-200 text-gray-500 px-3 py-1 rounded-full font-medium">
                {filtered.length} record{filtered.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Filter tabs — horizontally scrollable on mobile */}
            <div className="flex gap-2 mb-5 overflow-x-auto pb-1 -mx-1 px-1" style={{scrollbarWidth:'none'}}>
              {[
                { value: 'all',      label: 'All'      },
                { value: 'approved', label: 'Approved' },
                { value: 'pending',  label: 'Pending'  },
                { value: 'rejected', label: 'Rejected' },
              ].map(({ value, label }) => (
                <FilterTab
                  key={value}
                  value={value}
                  label={label}
                  count={counts[value]}
                  active={filter === value}
                  onClick={setFilter}
                />
              ))}
            </div>

            {/* Loading skeletons */}
            {loading && (
              <div className="grid sm:grid-cols-2 gap-3">
                {[1,2,3,4].map(i => <Skeleton key={i} />)}
              </div>
            )}

            {/* Empty state */}
            {!loading && filtered.length === 0 && (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-16 px-8 text-center">
                <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-blue-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
                  </svg>
                </div>
                <p className="font-semibold text-gray-700 text-base mb-1" style={{fontFamily:"'Playfair Display',serif"}}>
                  No donations found
                </p>
                <p className="text-sm text-gray-400">
                  {filter === 'all' ? 'No donations have been made yet.' : `No ${filter} donations to show.`}
                </p>
              </div>
            )}

            {/* Donation grid */}
            {!loading && filtered.length > 0 && (
              <div className="grid sm:grid-cols-2 gap-3">
                {filtered.map((d, i) => (
                  <DonationCard key={d._id} d={d} index={i} />
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}

export default AdminDashboard;