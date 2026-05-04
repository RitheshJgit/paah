import { useEffect, useState, useRef } from 'react';
import { createDonation, getMyDonations } from '../../features/donation/donationAPI';
import DonationForm from '../../components/forms/DonationForm';

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    pending:  { label: 'Pending Review', color: '#b45309', bg: '#fef3c7', dot: '#f59e0b' },
    approved: { label: 'Approved',       color: '#166534', bg: '#dcfce7', dot: '#16a34a' },
    rejected: { label: 'Rejected',       color: '#991b1b', bg: '#fee2e2', dot: '#dc2626' },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: s.bg, color: s.color,
      fontSize: 11, fontWeight: 600, letterSpacing: '0.4px',
      textTransform: 'uppercase', padding: '4px 10px',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      {s.label}
    </span>
  );
};

const getDisplayText = (donation) => {
  if (donation.type === 'money') {
    return `₹${(donation.amount || 0).toLocaleString('en-IN')}`;
  }

  if (donation.type === 'books') {
    return `${donation.quantity || 0} Books`;
  }

  if (donation.type === 'clothes') {
    return `${donation.weight || 0} kg Clothes`;
  }

  return '—';
};

// ─── Donation History Card ────────────────────────────────────────────────────
const HistoryCard = ({ donation, index }) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  // Fix 5: safe date — guard against null/undefined createdAt
  const date = donation.createdAt
    ? new Date(donation.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
      })
    : 'N/A';

  // Fix 1: support non-monetary donations (clothes, books, etc.)
  const displayValue = donation.amount || donation.weight || donation.quantity || 0;



  return (
    <div
      ref={ref}
      className="history-card"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.5s ease ${index * 0.07}s, transform 0.5s ease ${index * 0.07}s`,
      }}
    >
      <div className="history-card-left">
        <div className="history-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </div>
        <div className="history-info">
          <p className="history-amount">
  {getDisplayText(donation)}
</p>
          <p className="history-desc">{donation.description || 'Donation contribution'}</p>
          <p className="history-date">{date}</p>
        </div>
      </div>
      <div className="history-card-right">
        <StatusBadge status={donation.status} />
        {donation.proofImage && (
          <a
            href={donation.proofImage}
    target="_blank"
    rel="noreferrer"
    className="proof-link"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
            </svg>
            View Proof
          </a>
        )}
      </div>

    </div>
  );
};

// ─── Empty State ─────────────────────────────────────────────────────────────
const EmptyState = () => (
  <div className="empty-state">
    <div className="empty-icon">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    </div>
    <p className="empty-title">No donations yet</p>
    <p className="empty-sub">Your contribution history will appear here once you make your first donation.</p>
  </div>
);

// ─── Toast ───────────────────────────────────────────────────────────────────
const Toast = ({ msg, type, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  return (
    <div className={`toast toast-${type}`}>
      {type === 'success'
        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      }
      {msg}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
function DonationPage() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [fetching, setFetching] = useState(true);
  const [toast, setToast]       = useState(null);
  const [mounted, setMounted]   = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => { setTimeout(() => setMounted(true), 60); fetchDonations(); }, []);

  const fetchDonations = async () => {
    try { setFetching(true); const data = await getMyDonations(); setDonations(data); }
    catch (err) { console.error(err); showToast(err.response?.data?.msg || 'Failed to load donations.', 'error'); }
    finally { setFetching(false); }
  };

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const handleDonate = async (form, file) => {
    const formData = new FormData();
    Object.keys(form).forEach(key => formData.append(key, form[key]));
    if (file) formData.append('proofImage', file);
    try {
      setLoading(true);
      await createDonation(formData);
      showToast('Donation submitted successfully!', 'success');
      fetchDonations();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.msg || 'Submission failed. Please try again.', 'error');
    } finally { setLoading(false); }
  };

  const filtered = activeTab === 'all'
    ? donations
    : donations.filter(d => d.status === activeTab);

  const stats = {
    total: donations.length,
    approved: donations.filter(d => d.status === 'approved').length,
    totalAmount: donations.filter(d => d.status === 'approved').reduce((s, d) => s + (d.amount || 0), 0),
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Outfit:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        @keyframes pulse2 {
          0%,100% { transform: scale(1); }
          50%     { transform: scale(1.04); }
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(60px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .don-root {
          min-height: 100vh;
          background: #f4f5f7;
          font-family: 'Outfit', sans-serif;
          padding: 0 0 80px;
        }

        /* ── HERO HEADER ── */
        .don-hero {
          background: linear-gradient(135deg, #0d1b3e 0%, #1a3a8f 55%, #1e50b5 100%);
          padding: 52px 48px 72px;
          position: relative;
          overflow: hidden;
          opacity: 0;
          animation: fadeUp 0.7s ease 0.05s both;
        }

        .don-hero::before {
          content: '';
          position: absolute;
          width: 500px; height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%);
          top: -180px; right: -80px;
        }

        .don-hero::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 40px;
          background: #f4f5f7;
          clip-path: ellipse(55% 100% at 50% 100%);
        }

        .hero-inner {
          max-width: 1100px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          padding: 6px 14px;
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #93b4f0;
          font-weight: 500;
          margin-bottom: 20px;
        }

        .hero-eyebrow-dot {
          width: 6px; height: 6px;
          background: #60a5fa;
          border-radius: 50%;
          animation: pulse2 2s ease infinite;
        }

        .hero-title {
          font-family: 'Playfair Display', serif;
          font-size: 42px;
          color: #ffffff;
          margin: 0 0 10px;
          line-height: 1.15;
        }

        .hero-title em { font-style: italic; color: #93b4f0; }

        .hero-sub {
          font-size: 15px;
          color: rgba(255,255,255,0.52);
          font-weight: 300;
          max-width: 460px;
          line-height: 1.7;
          margin: 0;
        }

        /* ── STATS ROW ── */
        .stats-strip {
          max-width: 1100px;
          margin: -28px auto 0;
          padding: 0 48px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          position: relative;
          z-index: 2;
          opacity: 0;
          animation: fadeUp 0.6s ease 0.25s both;
        }

        .stat-card {
          background: #ffffff;
          border: 1px solid #e8eaf0;
          border-top: 3px solid #1a3a8f;
          padding: 20px 22px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-card-label {
          font-size: 10.5px;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          font-weight: 600;
        }

        .stat-card-value {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          color: #0d1b3e;
          line-height: 1;
        }

        .stat-card-sub {
          font-size: 12px;
          color: #6b7280;
        }

        /* ── MAIN GRID ── */
        .don-grid {
          max-width: 1100px;
          margin: 40px auto 0;
          padding: 0 48px;
          display: grid;
          grid-template-columns: 420px 1fr;
          gap: 28px;
          align-items: start;
        }

        /* ── FORM PANEL ── */
        .form-panel {
          background: #ffffff;
          border: 1px solid #e8eaf0;
          border-top: 3px solid #1a3a8f;
          opacity: 0;
          animation: fadeUp 0.6s ease 0.35s both;
          position: sticky;
          top: 24px;
        }

        .form-panel-header {
          padding: 22px 26px 18px;
          border-bottom: 1px solid #f0f1f5;
        }

        .form-panel-title {
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          color: #0d1b3e;
          margin: 0 0 4px;
        }

        .form-panel-sub {
          font-size: 13px;
          color: #9ca3af;
          font-weight: 300;
        }

        .form-panel-body {
          padding: 22px 26px 26px;
        }

        /* ── Override DonationForm child styles ── */
        .form-panel-body input,
        .form-panel-body textarea,
        .form-panel-body select {
          width: 100% !important;
          height: auto !important;
          padding: 11px 14px !important;
          border: 1.5px solid #e5e7eb !important;
          border-radius: 0 !important;
          font-family: 'Outfit', sans-serif !important;
          font-size: 14px !important;
          color: #111827 !important;
          background: #fff !important;
          outline: none !important;
          transition: border-color 0.2s !important;
          margin-bottom: 14px !important;
        }

        .form-panel-body input:focus,
        .form-panel-body textarea:focus {
          border-color: #1a3a8f !important;
          box-shadow: 0 0 0 3px rgba(26,58,143,0.07) !important;
        }

        .form-panel-body label {
          font-size: 11.5px !important;
          font-weight: 600 !important;
          color: #374151 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.5px !important;
          display: block !important;
          margin-bottom: 6px !important;
        }

        .form-panel-body button[type="submit"],
        .form-panel-body button:last-of-type {
          width: 100% !important;
          height: 50px !important;
          background: #1a3a8f !important;
          color: white !important;
          border: none !important;
          border-radius: 0 !important;
          font-family: 'Outfit', sans-serif !important;
          font-size: 14px !important;
          font-weight: 600 !important;
          letter-spacing: 1px !important;
          text-transform: uppercase !important;
          cursor: pointer !important;
          transition: background 0.2s !important;
          margin-top: 6px !important;
        }

        .form-panel-body button[type="submit"]:hover,
        .form-panel-body button:last-of-type:hover {
          background: #1e4bbd !important;
        }

        /* Loading overlay on form */
        .form-loading-overlay {
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }

        .form-loading-spinner {
          width: 28px; height: 28px;
          border: 3px solid #e5e7eb;
          border-top-color: #1a3a8f;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── HISTORY PANEL ── */
        .history-panel {
          opacity: 0;
          animation: fadeUp 0.6s ease 0.45s both;
        }

        .history-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .history-title {
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          color: #0d1b3e;
        }

        .history-count {
          font-size: 12px;
          color: #9ca3af;
          background: #f3f4f6;
          padding: 4px 10px;
          font-weight: 500;
        }

        /* ── TABS ── */
        .tab-row {
          display: flex;
          gap: 0;
          margin-bottom: 18px;
          border: 1px solid #e8eaf0;
          width: fit-content;
        }

        .tab-btn {
          padding: 8px 18px;
          font-family: 'Outfit', sans-serif;
          font-size: 12.5px;
          font-weight: 500;
          background: #fff;
          border: none;
          color: #6b7280;
          cursor: pointer;
          letter-spacing: 0.3px;
          border-right: 1px solid #e8eaf0;
          transition: background 0.15s, color 0.15s;
        }

        .tab-btn:last-child { border-right: none; }

        .tab-btn.active {
          background: #1a3a8f;
          color: #ffffff;
        }

        /* ── HISTORY CARD ── */
        .history-card {
          background: #ffffff;
          border: 1px solid #e8eaf0;
          border-left: 3px solid #1a3a8f;
          padding: 18px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 10px;
          transition: box-shadow 0.2s, border-color 0.2s;
        }

        .history-card:hover {
          box-shadow: 0 4px 16px rgba(26,58,143,0.08);
          border-left-color: #2563eb;
        }

        .history-card-left { display: flex; align-items: center; gap: 14px; flex: 1; min-width: 0; }

        .history-icon {
          width: 42px; height: 42px;
          background: linear-gradient(135deg, #1a3a8f, #2563eb);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .history-info { min-width: 0; }

        .history-amount {
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          color: #0d1b3e;
          margin: 0 0 2px;
        }

        .history-desc {
          font-size: 13px;
          color: #374151;
          margin: 0 0 3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 220px;
        }

        .history-date {
          font-size: 11.5px;
          color: #9ca3af;
          margin: 0;
        }

        .history-card-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
          flex-shrink: 0;
        }

        .proof-link {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          color: #2563eb;
          text-decoration: none;
          font-weight: 500;
          border-bottom: 1px dashed transparent;
          transition: border-color 0.2s;
        }

        .proof-link:hover { border-color: #2563eb; }

        /* ── SKELETON LOADER ── */
        .skeleton {
          background: linear-gradient(90deg, #f0f1f5 25%, #e8eaf0 50%, #f0f1f5 75%);
          background-size: 400px 100%;
          animation: shimmer 1.2s infinite;
          margin-bottom: 10px;
          height: 80px;
        }

        /* ── EMPTY STATE ── */
        .empty-state {
          background: #ffffff;
          border: 1px dashed #d1d5db;
          padding: 48px 32px;
          text-align: center;
        }

        .empty-icon {
          width: 64px; height: 64px;
          background: #f0f4ff;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px;
          color: #1a3a8f;
        }

        .empty-title {
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          color: #0d1b3e;
          margin: 0 0 6px;
        }

        .empty-sub {
          font-size: 13.5px;
          color: #9ca3af;
          max-width: 280px;
          margin: 0 auto;
          line-height: 1.6;
          font-weight: 300;
        }

        /* ── TOAST ── */
        .toast {
          position: fixed;
          bottom: 28px;
          right: 28px;
          z-index: 1000;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 20px;
          font-size: 14px;
          font-family: 'Outfit', sans-serif;
          font-weight: 500;
          border-left: 3px solid;
          animation: toastIn 0.35s cubic-bezier(0.16,1,0.3,1) both;
          box-shadow: 0 8px 30px rgba(0,0,0,0.12);
        }

        .toast-success {
          background: #f0fdf4;
          color: #166534;
          border-color: #16a34a;
        }

        .toast-error {
          background: #fef2f2;
          color: #991b1b;
          border-color: #dc2626;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 860px) {
          .don-hero { padding: 36px 24px 60px; }
          .stats-strip { padding: 0 24px; grid-template-columns: 1fr 1fr; }
          .don-grid { grid-template-columns: 1fr; padding: 0 24px; }
          .form-panel { position: static; }
        }

        @media (max-width: 480px) {
          .stats-strip { grid-template-columns: 1fr; }
          .hero-title { font-size: 30px; }
          .don-hero { padding: 28px 18px 56px; }
          .don-grid { padding: 0 16px; }
          .stats-strip { padding: 0 16px; }
        }
      `}</style>

      <div className="don-root">

        {/* ── TOAST ── */}
        {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

        {/* ── HERO ── */}
        <div className="don-hero">
          <div className="hero-inner">
            <div className="hero-eyebrow">
              <div className="hero-eyebrow-dot" />
              <span>PAAH Platform</span>
            </div>
            <h1 className="hero-title">Make a <em>difference</em><br />with every rupee.</h1>
            <p className="hero-sub">
              Submit verified donations, track your impact in real time, and build
              trust through transparent contribution records.
            </p>
          </div>
        </div>

        {/* ── STATS STRIP ── */}
        <div className="stats-strip">
          <div className="stat-card">
            <span className="stat-card-label">Total Donations</span>
            <span className="stat-card-value">{stats.total}</span>
            <span className="stat-card-sub">Submissions made</span>
          </div>
          <div className="stat-card">
            <span className="stat-card-label">Approved</span>
            <span className="stat-card-value">{stats.approved}</span>
            <span className="stat-card-sub">Verified by admin</span>
          </div>
          <div className="stat-card">
            <span className="stat-card-label">Total Contributed</span>
            <span className="stat-card-value">₹{stats.totalAmount.toLocaleString('en-IN')}</span>
            <span className="stat-card-sub">Approved amount</span>
          </div>
        </div>

        {/* ── MAIN GRID ── */}
        <div className="don-grid">

          {/* ── FORM PANEL ── */}
          <div className="form-panel" style={{ position: 'relative' }}>
            {loading && (
              <div className="form-loading-overlay">
                <div className="form-loading-spinner" />
              </div>
            )}
            <div className="form-panel-header">
              <h2 className="form-panel-title">New Donation</h2>
              <p className="form-panel-sub">Fill in the details and attach your proof of donation.</p>
            </div>
            <div className="form-panel-body">
              <DonationForm onSubmit={handleDonate} />
            </div>
          </div>

          {/* ── HISTORY PANEL ── */}
          <div className="history-panel">
            <div className="history-header">
              <h2 className="history-title">Donation History</h2>
              <span className="history-count">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Tabs */}
            <div className="tab-row">
              {['all', 'pending', 'approved', 'rejected'].map(tab => (
                <button
                  key={tab}
                  className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Loading Skeletons */}
            {fetching && [1, 2, 3].map(i => <div key={i} className="skeleton" />)}

            {/* List */}
            {!fetching && filtered.length === 0 && <EmptyState />}

            {!fetching && filtered.map((d, i) => (
              <HistoryCard key={d._id} donation={d} index={i} />
            ))}
          </div>

        </div>
      </div>
    </>
  );
}

export default DonationPage;