import { useEffect, useState, useCallback } from 'react';
import {
  getPendingDonations,
  verifyDonation
} from '../../features/donation/donationAPI';


/* ══════════════════════════════════════════
   TYPE CONFIG
══════════════════════════════════════════ */
const TYPE_CFG = {
  money:   { label:'Money',   icon:'💰', color:'#059669', bg:'#ecfdf5', border:'#6ee7b7' },
  clothes: { label:'Clothes', icon:'👕', color:'#7c3aed', bg:'#f5f3ff', border:'#c4b5fd' },
  books:   { label:'Books',   icon:'📚', color:'#1d4ed8', bg:'#eff6ff', border:'#93c5fd' },
  other:   { label:'Other',   icon:'📦', color:'#d97706', bg:'#fffbeb', border:'#fcd34d' },
};

/* ══════════════════════════════════════════
   LIGHTBOX
══════════════════════════════════════════ */
function Lightbox({ src, onClose }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.92)', animation: 'lbIn .18s ease both' }}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-white text-lg transition-all"
        style={{ background: 'rgba(255,255,255,0.12)' }}
        onMouseOver={e => e.currentTarget.style.background='rgba(255,255,255,0.22)'}
        onMouseOut={e => e.currentTarget.style.background='rgba(255,255,255,0.12)'}
      >✕</button>
      <img
        src={src} alt="Proof"
        onClick={e => e.stopPropagation()}
        className="rounded-lg"
        style={{ maxWidth:'90vw', maxHeight:'85vh', objectFit:'contain', animation:'lbZoom .2s cubic-bezier(0.16,1,0.3,1) both', boxShadow:'0 24px 80px rgba(0,0,0,0.6)' }}
      />
    </div>
  );
}

/* ══════════════════════════════════════════
   TOAST
══════════════════════════════════════════ */
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3600); return () => clearTimeout(t); }, [onClose]);
  return (
    <div
      className="fixed bottom-6 right-4 z-[9998] flex items-center gap-3 px-5 py-3 rounded-lg text-sm font-medium shadow-2xl max-w-[calc(100vw-32px)]"
      style={{
        borderLeft: `3px solid ${type === 'success' ? '#16a34a' : '#dc2626'}`,
        background: type === 'success' ? '#f0fdf4' : '#fef2f2',
        color: type === 'success' ? '#166534' : '#991b1b',
        animation: 'toastIn .3s cubic-bezier(0.16,1,0.3,1) both',
      }}
    >
      {type === 'success'
        ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/></svg>
      }
      <span className="flex-1 leading-snug">{msg}</span>
    </div>
  );
}

/* ══════════════════════════════════════════
   SKELETON CARD
══════════════════════════════════════════ */
const SkeletonCard = ({ i }) => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ animation: `fadeUp .4s ease ${i * 0.06}s both` }}>
    <div className="h-52 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100" style={{ backgroundSize:'400px 100%', animation:'shimmer 1.3s infinite' }}/>
    <div className="p-5 space-y-3">
      {[70,50,40,60,80].map((w,j)=>(
        <div key={j} className="rounded" style={{ height:12, width:`${w}%`, background:'linear-gradient(90deg,#f0f1f5 25%,#e4e6ed 50%,#f0f1f5 75%)', backgroundSize:'400px 100%', animation:'shimmer 1.3s infinite' }}/>
      ))}
    </div>
  </div>
);

/* ══════════════════════════════════════════
   DONATION CARD
══════════════════════════════════════════ */
function DonationCard({ d, processingId, customPoints, onCustomPoints, onApprove, onReject, onImageClick, index }) {
  const [confirmReject, setConfirmReject] = useState(false);
  const tc = TYPE_CFG[d.type] || TYPE_CFG.other;
  const isProcessing = processingId === d._id;
  
const proofUrl = d.proofImage || null;
const date = d.createdAt
  ? new Date(d.createdAt).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    })
  : "N/A";

const userName = d.userId?.name || "Unknown User";
const userInitial = userName.charAt(0).toUpperCase();

  const getDonationDetail = () => {
    if (d.type === 'money')   return `₹${d.amount?.toLocaleString('en-IN') || 0}`;
    if (d.type === 'clothes') return `${d.weight} kg of clothing`;
    if (d.type === 'books')   return `${d.quantity} book${d.quantity !== 1 ? 's' : ''}`;
    if (d.type === 'other')   return d.itemName || 'Unspecified item';
    return '—';
  };

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden group transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5"
      style={{ animation: `fadeUp .45s ease ${index * 0.07}s both`, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
    >
      {/* Proof Image */}
      <div className="relative overflow-hidden bg-gray-50" style={{ height: 200 }}>
        {proofUrl ? (
          <>
            <img
              src={proofUrl} alt="Proof"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03] cursor-zoom-in"
              onClick={() => onImageClick(proofUrl)}
            />
            {/* View overlay */}
            <div
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-zoom-in"
              style={{ background: 'rgba(0,0,0,0.35)' }}
              onClick={() => onImageClick(proofUrl)}
            >
              <div className="flex items-center gap-2 bg-white text-gray-900 text-xs font-700 px-4 py-2 rounded-full shadow-lg" style={{ fontWeight: 700, letterSpacing: '0.5px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                View Full
              </div>
            </div>
            {/* Type badge on image */}
            <div
              className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm"
              style={{ background: tc.bg + 'ee', color: tc.color, border: `1px solid ${tc.border}` }}
            >
              <span>{tc.icon}</span> {tc.label}
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-red-50">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <p className="text-red-500 text-sm font-semibold">No proof image</p>
            <p className="text-red-400 text-xs">Cannot approve without proof</p>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5">

        {/* User + date row */}
        <div className="flex items-start justify-between gap-3 mb-4">
  <div className="flex items-center gap-3 min-w-0">
    
    {/* Avatar */}
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
      style={{ background: 'linear-gradient(135deg, #1d4ed8, #1a3a8f)' }}
    >
      {userInitial}
    </div>

    {/* Name + Date */}
    <div className="min-w-0">
      <p className="font-semibold text-gray-900 text-sm truncate">
        {userName}
      </p>
      <p className="text-gray-400 text-xs">
        {date}
      </p>
    </div>
  </div>

  {/* Amount / Detail */}
  <div
    className="flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-bold"
    style={{ background: tc.bg, color: tc.color }}
  >
    {getDonationDetail()}
  </div>
</div>

        {/* Witness info */}
        <div className="bg-gray-50 rounded-xl p-3 mb-4 grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Witness</p>
            <p className="text-sm text-gray-700 font-medium truncate">{d.witnessName || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Phone</p>
            <p className="text-sm text-gray-700 font-medium">{d.witnessPhone || '—'}</p>
          </div>
        </div>

        {/* Custom points input for "other" type */}
        {d.type === 'other' && (
          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Assign Credit Points
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                placeholder="Enter points e.g. 50"
                value={customPoints[d._id] || ''}
                onChange={e => onCustomPoints(d._id, e.target.value)}
                className="flex-1 h-10 px-3 text-sm border border-gray-200 rounded-lg outline-none transition-all"
                style={{ fontFamily: 'inherit' }}
                onFocus={e => e.target.style.borderColor = '#1d4ed8'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
              <div className="flex items-center gap-1 text-xs text-gray-400 bg-gray-50 px-3 h-10 rounded-lg border border-gray-200 whitespace-nowrap">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                pts
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        {!confirmReject ? (
          <div className="flex gap-2.5">
            <button
              onClick={() => onApprove(d)}
              disabled={isProcessing || !proofUrl}
              className="flex-1 h-11 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: isProcessing ? '#6b7280' : 'linear-gradient(135deg, #059669, #047857)',
                boxShadow: isProcessing ? 'none' : '0 4px 14px rgba(5,150,105,0.35)',
              }}
              onMouseOver={e => { if(!isProcessing && proofUrl) e.currentTarget.style.transform='translateY(-1px)'; }}
              onMouseOut={e => e.currentTarget.style.transform='translateY(0)'}
            >
              {isProcessing
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Processing…</>
                : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Approve</>
              }
            </button>
            <button
              onClick={() => setConfirmReject(true)}
              disabled={isProcessing}
              className="flex-1 h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: '#fef2f2', color: '#dc2626', border: '1.5px solid #fecaca' }}
              onMouseOver={e => { if(!isProcessing) e.currentTarget.style.background='#fee2e2'; }}
              onMouseOut={e => e.currentTarget.style.background='#fef2f2'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              Reject
            </button>
          </div>
        ) : (
          /* Confirm reject UI */
          <div className="bg-red-50 rounded-xl p-3 border border-red-100">
            <p className="text-sm font-semibold text-red-700 mb-2.5 flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></svg>
              Confirm rejection?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => { onReject(d._id); setConfirmReject(false); }}
                disabled={isProcessing}
                className="flex-1 h-10 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-50"
                style={{ background: '#dc2626' }}
              >
                {isProcessing ? 'Rejecting…' : 'Yes, Reject'}
              </button>
              <button
                onClick={() => setConfirmReject(false)}
                className="flex-1 h-10 rounded-lg text-sm font-semibold text-gray-600 border border-gray-200 bg-white transition-all hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
function VerifyDonations() {
  const [donations,    setDonations]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [customPoints, setCustomPoints] = useState({});
  const [toast,        setToast]        = useState(null);
  const [lightboxSrc,  setLightboxSrc]  = useState(null);
  const [filter,       setFilter]       = useState('all');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getPendingDonations();
      const sorted = (data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setDonations(sorted);
    } catch (err) {
      console.error(err);
      setDonations([]);
      showToast('Failed to load donations.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const handleCustomPoints = (id, val) => setCustomPoints(p => ({ ...p, [id]: val }));

  const handleApprove = async (d) => {
  try {
    setProcessingId(d._id);

    let points;

    // 🔥 CASE 1: "other" → admin must enter manually
    if (d.type === 'other') {
      points = Number(customPoints[d._id]);

      if (!points || points <= 0) {
        showToast('Enter valid points for this donation.', 'error');
        return;
      }
    } 
    // 🔥 CASE 2: predefined types → use existing backend-calculated points
    else {
      if (!d.finalPoints || d.finalPoints <= 0) {
        showToast('Invalid points detected. Cannot approve.', 'error');
        return;
      }

      points = d.finalPoints;
    }

    // 🔥 API CALL
    await verifyDonation({
      donationId: d._id,
      status: 'approved',
      finalPoints: points
    });

    // 🔥 REFRESH DATA (IMPORTANT)
    await fetchData();

    // 🔥 REMOVE FROM UI LIST
    setDonations(prev => prev.filter(x => x._id !== d._id));

    showToast('Donation approved successfully!', 'success');

  } catch (err) {
    console.error("APPROVE ERROR:", err);
    showToast(err.response?.data?.msg || 'Error approving donation.', 'error');
  } finally {
    setProcessingId(null);
  }
};

  const handleReject = async (id) => {
    try {
      setProcessingId(id);
      await verifyDonation({ donationId: id, status: 'rejected', finalPoints: 0 });
      setDonations(prev => prev.filter(x => x._id !== id));
      showToast('Donation rejected.', 'error');
    } catch (err) {
      showToast(err.response?.data?.msg || 'Error rejecting donation.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const openLightbox  = useCallback(src => setLightboxSrc(src), []);
  const closeLightbox = useCallback(() => setLightboxSrc(null), []);

  const filtered = filter === 'all' ? donations : donations.filter(d => d.type === filter);

  const counts = {
    all:     donations.length,
    money:   donations.filter(d => d.type === 'money').length,
    clothes: donations.filter(d => d.type === 'clothes').length,
    books:   donations.filter(d => d.type === 'books').length,
    other:   donations.filter(d => d.type === 'other').length,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        @keyframes fadeUp   { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer  { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        @keyframes lbIn     { from{opacity:0} to{opacity:1} }
        @keyframes lbZoom   { from{transform:scale(0.9);opacity:0} to{transform:scale(1);opacity:1} }
        @keyframes toastIn  { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }
        @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.5} }
        @keyframes spin     { to{transform:rotate(360deg)} }

        .vd-root * { font-family:'DM Sans',sans-serif; box-sizing:border-box; }
        .vd-root h1,.vd-root h2,.vd-root h3 { font-family:'Syne',sans-serif; }
        .animate-spin { animation:spin .75s linear infinite; }

        /* filter pills scroll on mobile */
        .filter-scroll { overflow-x:auto; -webkit-overflow-scrolling:touch; }
        .filter-scroll::-webkit-scrollbar { display:none; }
        .filter-scroll { scrollbar-width:none; }
      `}</style>

      {lightboxSrc && <Lightbox src={lightboxSrc} onClose={closeLightbox}/>}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}

      <div className="vd-root min-h-screen bg-gray-50">

        {/* ════ HEADER ════ */}
        <div
          className="relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0d1b3e 0%, #1a3a8f 60%, #1e50b5 100%)',
            animation: 'fadeUp .6s ease both',
          }}
        >
          {/* Grid texture */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)',
            backgroundSize: '40px 40px',
          }}/>
          {/* Glow */}
          <div className="absolute pointer-events-none" style={{width:500,height:500,borderRadius:'50%',background:'radial-gradient(circle,rgba(59,130,246,0.15) 0%,transparent 70%)',top:-200,right:-100}}/>

          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-xs font-semibold tracking-widest uppercase"
              style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)', color:'#93c5fd' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" style={{animation:'pulse 2s ease infinite'}}/>
              Admin Panel
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-2">
                  Verify Donations
                </h1>
                <p className="text-blue-200 text-sm sm:text-base font-light max-w-md" style={{opacity:.7}}>
                  Review pending donation submissions and approve or reject with confidence.
                </p>
              </div>

              {/* Stats chips */}
              <div className="flex gap-3 flex-wrap">
                <div className="px-4 py-2 rounded-xl text-center" style={{background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.12)'}}>
                  <p className="text-2xl font-extrabold text-white leading-none">{donations.length}</p>
                  <p className="text-xs text-blue-300 mt-0.5 font-medium">Pending</p>
                </div>
                <button
                  onClick={fetchData}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 transition-all"
                  style={{background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)'}}
                  onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.14)'}
                  onMouseOut={e=>e.currentTarget.style.background='rgba(255,255,255,0.08)'}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M23 4v6h-6M1 20v-6h6"/>
                    <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"/>
                  </svg>
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Wave bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gray-50" style={{clipPath:'ellipse(55% 100% at 50% 100%)'}}/>
        </div>

        {/* ════ BODY ════ */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20" style={{paddingTop:28}}>

          {/* Filter pills */}
          <div className="filter-scroll flex gap-2 pb-1 mb-6" style={{animation:'fadeUp .5s ease .15s both'}}>
            {[
              { key:'all',     label:'All',     emoji:'📋', count: counts.all     },
              { key:'money',   label:'Money',   emoji:'💰', count: counts.money   },
              { key:'clothes', label:'Clothes', emoji:'👕', count: counts.clothes },
              { key:'books',   label:'Books',   emoji:'📚', count: counts.books   },
              { key:'other',   label:'Other',   emoji:'📦', count: counts.other   },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-150 flex-shrink-0"
                style={filter === f.key
                  ? { background: '#1a3a8f', color: '#fff', boxShadow: '0 4px 14px rgba(26,58,143,0.3)' }
                  : { background: '#fff', color: '#6b7280', border: '1.5px solid #e5e7eb' }
                }
              >
                <span>{f.emoji}</span>
                {f.label}
                <span
                  className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold"
                  style={filter === f.key
                    ? { background: 'rgba(255,255,255,0.2)', color: '#fff' }
                    : { background: '#f3f4f6', color: '#9ca3af' }
                  }
                >
                  {f.count}
                </span>
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {[0,1,2,3,4,5].map(i => <SkeletonCard key={i} i={i}/>)}
            </div>
          )}

          {/* Empty */}
          {!loading && filtered.length === 0 && (
            <div
              className="flex flex-col items-center justify-center py-20 text-center"
              style={{animation:'fadeUp .5s ease .2s both'}}
            >
              <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-5">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#1a3a8f" strokeWidth="1.4">
                  <path d="M9 12l2 2 4-4"/><path d="M21 12c0 5-4 9-9 9S3 17 3 12 7 3 12 3s9 4 9 9z"/>
                </svg>
              </div>
              <h3 className="text-xl font-extrabold text-gray-800 mb-2" style={{fontFamily:'Syne,sans-serif'}}>
                {filter === 'all' ? 'All clear!' : `No ${filter} donations`}
              </h3>
              <p className="text-gray-400 text-sm max-w-xs font-light leading-relaxed">
                {filter === 'all'
                  ? 'No pending donations at the moment. Check back later.'
                  : `No pending ${filter} donations to review right now.`}
              </p>
              {filter !== 'all' && (
                <button onClick={() => setFilter('all')} className="mt-4 text-sm font-semibold text-blue-700 hover:underline">
                  View all donations
                </button>
              )}
            </div>
          )}

          {/* Cards grid */}
          {!loading && filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filtered.map((d, i) => (
                <DonationCard
                  key={d._id}
                  d={d}
                  index={i}
                  processingId={processingId}
                  customPoints={customPoints}
                  onCustomPoints={handleCustomPoints}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onImageClick={openLightbox}
                />
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  );
}

export default VerifyDonations;