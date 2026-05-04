import { useEffect, useState, useCallback } from 'react';
import { getPendingTasks, verifyTask } from '../../features/task/taskAPI';

const BASE_URL =
  (import.meta.env.VITE_API_URL || 'http://localhost:8000')
    .replace('/api', '');
    

// ─── Lightbox ─────────────────────────────────────────────────────────────────
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

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85"
      style={{ animation: 'lbIn 0.18s ease both' }}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="fixed top-4 right-4 z-[100000] w-10 h-10 rounded-full flex items-center justify-center text-white text-2xl bg-white/15 border border-white/30 backdrop-blur-sm hover:bg-white/25 transition-colors"
        aria-label="Close"
      >×</button>
      <p className="fixed bottom-5 left-1/2 -translate-x-1/2 text-white/40 text-xs whitespace-nowrap pointer-events-none">
        Tap anywhere or press ESC to close
      </p>
      <img
        src={src}
        alt="Proof fullsize"
        onClick={(e) => e.stopPropagation()}
        className="max-w-full max-h-[calc(100vh-80px)] object-contain rounded shadow-2xl cursor-default"
      />
    </div>
  );
};

// ─── Reject Modal ─────────────────────────────────────────────────────────────
const RejectModal = ({ onConfirm, onCancel, loading }) => {
  const [reason, setReason] = useState('');

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', handler);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = prev;
    };
  }, [onCancel]);

  return (
    <div
      onClick={onCancel}
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-100"
        style={{ animation: 'lbIn 0.18s ease both' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-base">Reject Submission</h3>
            <p className="text-xs text-gray-400">Provide a reason for the volunteer</p>
          </div>
        </div>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          placeholder="e.g. Proof image is unclear, location doesn't match task requirements…"
          className="w-full px-3.5 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl outline-none resize-none
            focus:border-red-400 focus:ring-2 focus:ring-red-100 placeholder:text-gray-300 transition-all"
        />

        <div className="flex gap-3 mt-4">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={loading || !reason.trim()}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Rejecting…' : 'Confirm Reject'}
          </button>
        </div>
      </div>
    </div>
  );
};



// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3 animate-pulse">
    <div className="h-4 bg-gray-100 rounded w-3/4" />
    <div className="h-3 bg-gray-100 rounded w-1/2" />
    <div className="h-32 bg-gray-100 rounded-xl" />
    <div className="flex gap-3">
      <div className="h-9 bg-gray-100 rounded-xl flex-1" />
      <div className="h-9 bg-gray-100 rounded-xl flex-1" />
    </div>
  </div>
);

// ─── Task Card ────────────────────────────────────────────────────────────────
const TaskCard = ({ task, onApprove, onReject, processingId }) => {
  const [lightbox, setLightbox] = useState(false);
  const closeLightbox = useCallback(() => setLightbox(false), []);

  const deadline   = task.taskId?.deadline;
  const isExpired  = deadline && new Date(deadline) < new Date();

  const isProcessing = processingId === task._id;

  const canApprove = !!task.proofImage;

  const date = deadline
    ? new Date(deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;
  const time = deadline
    ? new Date(deadline).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:shadow-blue-50 transition-all duration-200 overflow-hidden flex flex-col">

        {/* Status stripe */}
        <div className={`h-1 w-full ${isExpired ? 'bg-red-400' : 'bg-yellow-400'}`} />

        <div className="p-5 flex flex-col gap-4 flex-1">

          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-semibold text-gray-900 text-base leading-snug flex-1 min-w-0" style={{ fontFamily: "'Playfair Display', serif" }}>
              {task.taskId?.title || 'Unknown Task'}
            </h2>
            <span className={`shrink-0 inline-flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full
              ${isExpired ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-yellow-50 text-yellow-600 border border-yellow-100'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isExpired ? 'bg-red-400' : 'bg-yellow-400 animate-pulse'}`} />
              {isExpired ? 'Expired' : 'Pending'}
            </span>
          </div>

          {/* Meta chips */}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-full font-medium">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h7"/></svg>
              {task.taskId?.type || 'N/A'}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs bg-green-50 text-green-700 border border-green-100 px-2.5 py-1 rounded-full font-medium">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
              {task.taskId?.creditPoints || 0} pts
            </span>
            {date && (
              <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border
                ${isExpired ? 'bg-red-50 text-red-600 border-red-100' : 'bg-gray-50 text-gray-600 border-gray-100'}`}>
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                {date} · {time}
              </span>
            )}
          </div>

          {/* User + Witness */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl px-3 py-2.5">
              <p className="text-[9.5px] uppercase tracking-wider font-semibold text-gray-400 mb-0.5">Volunteer</p>
              <p className="text-sm font-medium text-gray-800 truncate">{task.userId?.name || 'Unknown'}</p>
            </div>
            <div className="bg-gray-50 rounded-xl px-3 py-2.5">
              <p className="text-[9.5px] uppercase tracking-wider font-semibold text-gray-400 mb-0.5">Witness</p>
              <p className="text-sm font-medium text-gray-800 truncate">{task.witnessName || 'N/A'}</p>
              {task.witnessPhone && (
                <p className="text-[11px] text-gray-400">{task.witnessPhone}</p>
              )}
            </div>
          </div>

          

          {/* Proof image */}
          {task.proofImage ? (
            <div
              onClick={() => setLightbox(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setLightbox(true)}
              aria-label="View proof image"
              className="relative cursor-pointer overflow-hidden rounded-xl group"
            >
              <img
                src={task.proofImage}
                alt="Proof of completion"
                className="w-full h-40 object-cover block group-hover:scale-[1.03] transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end justify-end p-2.5">
                <span className="flex items-center gap-1.5 bg-black/50 text-white text-[10.5px] font-medium px-2.5 py-1 rounded-md backdrop-blur-sm">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
                    <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
                  </svg>
                  VIEW PROOF
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3.5 py-3 text-sm text-red-500 font-medium">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              No proof image uploaded
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-auto pt-1">
            <button
              onClick={() => onApprove(task._id)}
              disabled={isProcessing || !canApprove}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold
                bg-green-500 hover:bg-green-600 text-white
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-all duration-150 active:scale-[0.98]"
            >
              {isProcessing ? (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
                </svg>
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
              {isProcessing ? 'Processing…' : 'Approve'}
            </button>

            <button
              onClick={() => onReject(task._id)}
              disabled={isProcessing}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold
                bg-red-50 hover:bg-red-500 text-red-500 hover:text-white border border-red-200 hover:border-red-500
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-all duration-150 active:scale-[0.98]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Reject
            </button>
          </div>

        </div>
      </div>

      {lightbox && <Lightbox src={task.proofImage} onClose={closeLightbox} />}
    </>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
function VerifyTasks() {
  const [tasks,        setTasks]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null); // id to reject

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getPendingTasks();
      setTasks((data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      console.error(err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      setProcessingId(id);
      await verifyTask({ submissionId: id, status: 'approved' });
      setTasks(prev => prev.filter(t => t._id !== id));
    } catch (err) {
      alert(err.response?.data?.msg || 'Error approving task');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectConfirm = async (reason) => {
    if (!rejectTarget) return;
    try {
      setProcessingId(rejectTarget);
      await verifyTask({ submissionId: rejectTarget, status: 'rejected', rejectReason: reason });
      setTasks(prev => prev.filter(t => t._id !== rejectTarget));
      setRejectTarget(null);
    } catch (err) {
      alert(err.response?.data?.msg || 'Error rejecting task');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&display=swap');
        @keyframes lbIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      <div className="min-h-screen bg-[#f0f4ff] pb-20 font-sans">

        {/* ── Hero header ── */}
        <div className="bg-gradient-to-br from-[#0d1b3e] via-[#1a3a8f] to-[#1e50b5] px-5 sm:px-10 pt-10 pb-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-white/[0.03] -translate-y-1/2 translate-x-1/4" />
          <div className="max-w-5xl mx-auto relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-blue-200 text-[11px] font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-300 animate-pulse" />
              Admin Panel
            </div>
            <h1 className="text-white text-2xl sm:text-3xl font-bold mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
              Verify Submissions
            </h1>
            <p className="text-blue-200/60 text-sm font-light">
              Review and action pending volunteer task submissions.
            </p>
          </div>
          {/* Bottom curve */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-[#f0f4ff]" style={{ clipPath: 'ellipse(55% 100% at 50% 100%)' }} />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-2">

          {/* Stats bar */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Total Pending', value: tasks.length, color: 'border-t-yellow-400' },
              { label: 'Expired',       value: tasks.filter(t => t.taskId?.deadline && new Date(t.taskId.deadline) < new Date()).length, color: 'border-t-red-400' },
              
            ].map(({ label, value, color }) => (
              <div key={label} className={`bg-white rounded-xl border border-gray-100 border-t-2 ${color} px-3 py-3 sm:px-5 sm:py-4`}>
                <p className="text-[9.5px] sm:text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-0.5">{label}</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Section title */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
              Submission Queue
            </h2>
            <span className="text-xs bg-white border border-gray-200 text-gray-500 px-3 py-1 rounded-full font-medium">
              {tasks.length} pending
            </span>
          </div>

          {/* Loading */}
          {loading && (
            <div className="grid sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} />)}
            </div>
          )}

          {/* Empty */}
          {!loading && tasks.length === 0 && (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-16 px-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <p className="font-semibold text-gray-700 text-lg mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                All clear!
              </p>
              <p className="text-sm text-gray-400">No pending submissions right now. Check back later.</p>
            </div>
          )}

          {/* Grid */}
          {!loading && tasks.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-4">
              {tasks.map(task => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onApprove={handleApprove}
                  onReject={(id) => setRejectTarget(id)}
                  processingId={processingId}
                />
              ))}
            </div>
          )}

        </div>
      </div>

      {/* Reject modal */}
      {rejectTarget && (
        <RejectModal
          onConfirm={handleRejectConfirm}
          onCancel={() => setRejectTarget(null)}
          loading={processingId === rejectTarget}
        />
      )}
    </>
  );
}

export default VerifyTasks;