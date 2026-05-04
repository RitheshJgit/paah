import { useEffect, useState, useRef, useCallback } from 'react';
import { getMyTasks, submitTaskProof, completeTask } from '../../features/task/taskAPI';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const BASE_URL =
  (import.meta.env.VITE_API_URL || 'http://localhost:8000')
    .replace('/api', '');

/* ══════════════════════════════════════════
   STATUS CONFIG
══════════════════════════════════════════ */
const STATUS = {
  approved: { label:'Approved',       color:'#166534', bg:'#dcfce7', dot:'#16a34a', accent:'#16a34a' },
  pending:  { label:'Pending Review', color:'#92400e', bg:'#fef3c7', dot:'#f59e0b', accent:'#f59e0b' },
  rejected: { label:'Rejected',       color:'#991b1b', bg:'#fee2e2', dot:'#dc2626', accent:'#dc2626' },
};

/* ══════════════════════════════════════════
   IMAGE LIGHTBOX  ← fixes the scroll-lock bug
══════════════════════════════════════════ */
function Lightbox({ src, onClose }) {
  /* unlock body scroll when unmounted */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';          // lock while open
    return () => { document.body.style.overflow = prev; }; // restore on close
  }, []);

  /* close on Escape */
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position:'fixed', inset:0, zIndex:9999,
        background:'rgba(0,0,0,0.88)',
        display:'flex', alignItems:'center', justifyContent:'center',
        padding:16,
        animation:'lbFadeIn .2s ease both',
      }}
    >
      <button
        onClick={onClose}
        style={{
          position:'absolute', top:16, right:16,
          width:40, height:40, border:'none', borderRadius:'50%',
          background:'rgba(255,255,255,0.12)', color:'#fff',
          fontSize:20, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
          transition:'background .15s',
        }}
        onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.22)'}
        onMouseOut={e=>e.currentTarget.style.background='rgba(255,255,255,0.12)'}
      >✕</button>
      <img
        src={src}
        alt="Proof"
        onClick={e=>e.stopPropagation()} /* prevent close on img click */
        style={{
          maxWidth:'90vw', maxHeight:'85vh',
          objectFit:'contain', borderRadius:4,
          animation:'lbZoom .2s cubic-bezier(0.16,1,0.3,1) both',
          boxShadow:'0 20px 60px rgba(0,0,0,0.5)',
        }}
      />
    </div>
  );
}

/* ══════════════════════════════════════════
   STATUS BADGE
══════════════════════════════════════════ */
const StatusBadge = ({ status }) => {
  const s = STATUS[status] || STATUS.pending;
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:5,
      background:s.bg, color:s.color, padding:'4px 10px',
      fontSize:10.5, fontWeight:700, letterSpacing:'0.6px', textTransform:'uppercase',
      borderRadius:3, flexShrink:0,
    }}>
      <span style={{width:6,height:6,borderRadius:'50%',background:s.dot,flexShrink:0}}/>
      {s.label}
    </span>
  );
};

/* ══════════════════════════════════════════
   STEP INDICATOR
══════════════════════════════════════════ */
const StepIndicator = ({ step }) => {
  const steps = ['Accept','Submit Proof','Under Review','Complete'];
  return (
    <div style={{display:'flex',alignItems:'center',gap:0,marginBottom:16,overflowX:'auto',paddingBottom:2}}>
      {steps.map((label,i) => {
        const idx=i+1, done=idx<step, active=idx===step;
        return (
          <div key={i} style={{display:'flex',alignItems:'center',flex:i<steps.length-1?1:'unset',minWidth:0}}>
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,flexShrink:0}}>
              <div style={{
                width:26,height:26,borderRadius:'50%',flexShrink:0,
                background:done?'#1a3a8f':active?'#2563eb':'#e5e7eb',
                border:active?'2px solid #1a3a8f':'2px solid transparent',
                display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.3s',
              }}>
                {done
                  ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  : <span style={{fontSize:10,fontWeight:700,color:active?'#fff':'#9ca3af'}}>{idx}</span>
                }
              </div>
              <span style={{
                fontSize:8.5,letterSpacing:'0.3px',textTransform:'uppercase',fontWeight:600,
                color:done?'#1a3a8f':active?'#1a3a8f':'#9ca3af',whiteSpace:'nowrap',
              }}>{label}</span>
            </div>
            {i<steps.length-1 && (
              <div style={{
                flex:1,height:2,margin:'-12px 3px 0',minWidth:8,
                background:done?'#1a3a8f':'#e5e7eb',transition:'background 0.3s',
              }}/>
            )}
          </div>
        );
      })}
    </div>
  );
};

/* ══════════════════════════════════════════
   TOAST
══════════════════════════════════════════ */
const Toast = ({ msg, type, onClose }) => {
  useEffect(()=>{ const t=setTimeout(onClose,3800); return ()=>clearTimeout(t); },[onClose]);
  return (
    <div style={{
      position:'fixed',bottom:24,right:16,zIndex:10000,
      display:'flex',alignItems:'center',gap:10,
      padding:'12px 18px',
      fontFamily:"'Outfit',sans-serif",fontSize:14,fontWeight:500,
      borderLeft:`3px solid ${type==='success'?'#16a34a':'#dc2626'}`,
      background:type==='success'?'#f0fdf4':'#fef2f2',
      color:type==='success'?'#166534':'#991b1b',
      boxShadow:'0 8px 30px rgba(0,0,0,0.14)',
      animation:'toastIn 0.35s cubic-bezier(0.16,1,0.3,1) both',
      maxWidth:'calc(100vw - 32px)',
      borderRadius:4,
    }}>
      {type==='success'
        ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      }
      <span style={{flex:1,lineHeight:1.4}}>{msg}</span>
    </div>
  );
};

/* ══════════════════════════════════════════
   SKELETON
══════════════════════════════════════════ */
const SkeletonCard = () => (
  <div style={{background:'#fff',border:'1px solid #e8eaf0',padding:20}}>
    {[75,55,40,30,80].map((w,i)=>(
      <div key={i} style={{
        height:i===0?18:12,width:`${w}%`,
        background:'linear-gradient(90deg,#f0f1f5 25%,#e4e6ed 50%,#f0f1f5 75%)',
        backgroundSize:'400px 100%',animation:'shimmer 1.2s infinite',
        marginBottom:10,borderRadius:2,
      }}/>
    ))}
  </div>
);

/* ══════════════════════════════════════════
   NO TEAM STATE
══════════════════════════════════════════ */
const NoTeamState = ({ onNavigate }) => (
  <div style={{
    minHeight:'100vh',background:'#f4f5f7',display:'flex',
    alignItems:'center',justifyContent:'center',
    fontFamily:"'Outfit',sans-serif",padding:20,
  }}>
    <div style={{
      background:'#fff',border:'1px solid #e8eaf0',borderTop:'3px solid #1a3a8f',
      padding:'40px 28px',maxWidth:380,width:'100%',textAlign:'center',
    }}>
      <div style={{
        width:72,height:72,background:'#f0f4ff',borderRadius:'50%',
        display:'flex',alignItems:'center',justifyContent:'center',
        margin:'0 auto 18px',color:'#1a3a8f',
      }}>
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
        </svg>
      </div>
      <p style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:'#0d1b3e',margin:'0 0 8px'}}>Not in a Team</p>
      <p style={{fontSize:13.5,color:'#6b7280',fontWeight:300,lineHeight:1.7,margin:'0 0 24px'}}>
        You must be part of a team before you can access and submit tasks.
      </p>
      <button onClick={onNavigate} style={{
        width:'100%',height:48,background:'#1a3a8f',color:'#fff',
        border:'none',fontFamily:"'Outfit',sans-serif",fontSize:13,
        fontWeight:600,letterSpacing:'1px',textTransform:'uppercase',cursor:'pointer',
      }}
        onMouseOver={e=>e.currentTarget.style.background='#1e4bbd'}
        onMouseOut={e=>e.currentTarget.style.background='#1a3a8f'}
      >Browse Teams</button>
    </div>
  </div>
);

/* ══════════════════════════════════════════
   PROOF UPLOAD FORM
══════════════════════════════════════════ */
const ProofUploadForm = ({ taskId, onSubmit, submitting }) => {
  const [witnessName,  setWitnessName]  = useState('');
  const [witnessPhone, setWitnessPhone] = useState('');
  const [file,   setFile]   = useState(null);
  const [preview,setPreview]= useState(null);
  const [errors, setErrors] = useState({});
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const f = e.target.files[0]; if (!f) return;
    setFile(f); setPreview(URL.createObjectURL(f));
    setErrors(p=>({...p,file:''}));
  };

  const validate = () => {
    const e={};
    if (!witnessName.trim())  e.name  = 'Witness name is required.';
    if (!witnessPhone.trim()) e.phone = 'Witness phone is required.';
    if (!file)                e.file  = 'Please upload a proof image.';
    setErrors(e);
    return Object.keys(e).length===0;
  };

  return (
    <div style={{marginTop:14,borderTop:'1px solid #f0f1f5',paddingTop:14}}>
      <p style={{fontSize:11,color:'#1a3a8f',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.7px',margin:'0 0 12px'}}>
        Submit Proof of Completion
      </p>

      <div style={{marginBottom:10}}>
        <label style={lbl}>Witness Full Name</label>
        <input type="text" placeholder="Enter witness name" value={witnessName}
          onChange={e=>{setWitnessName(e.target.value);setErrors(p=>({...p,name:''}));}}
          style={{...inp,borderColor:errors.name?'#dc2626':'#e5e7eb'}}/>
        {errors.name && <p style={err}>{errors.name}</p>}
      </div>

      <div style={{marginBottom:10}}>
        <label style={lbl}>Witness Phone</label>
        <input type="tel" placeholder="Enter witness phone" value={witnessPhone}
          onChange={e=>{setWitnessPhone(e.target.value);setErrors(p=>({...p,phone:''}));}}
          style={{...inp,borderColor:errors.phone?'#dc2626':'#e5e7eb'}}/>
        {errors.phone && <p style={err}>{errors.phone}</p>}
      </div>

      <div style={{marginBottom:12}}>
        <label style={lbl}>Proof Image</label>
        <div onClick={()=>fileRef.current?.click()} style={{
          border:`1.5px dashed ${errors.file?'#dc2626':'#d1d5db'}`,
          padding:'12px',textAlign:'center',cursor:'pointer',background:'#f9fafb',
        }}
          onMouseOver={e=>e.currentTarget.style.borderColor='#1a3a8f'}
          onMouseOut={e=>e.currentTarget.style.borderColor=errors.file?'#dc2626':'#d1d5db'}
        >
          {preview
            ? <img src={preview} alt="preview" style={{width:'100%',height:110,objectFit:'cover',display:'block'}}/>
            : <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" style={{margin:'0 auto 6px',display:'block'}}>
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                </svg>
                <p style={{fontSize:12,color:'#9ca3af',margin:0}}>Tap to upload proof image</p>
              </>
          }
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{display:'none'}}/>
        {errors.file && <p style={err}>{errors.file}</p>}
        {file && <p style={{fontSize:11,color:'#6b7280',marginTop:4}}>{file.name}</p>}
      </div>

      <button onClick={()=>{ if(validate()) onSubmit(taskId,file,witnessName,witnessPhone); }}
        disabled={submitting} style={{
          width:'100%',height:44,background:submitting?'#6b7280':'#1a3a8f',
          color:'#fff',border:'none',fontFamily:"'Outfit',sans-serif",
          fontSize:12,fontWeight:600,letterSpacing:'1px',textTransform:'uppercase',
          cursor:submitting?'not-allowed':'pointer',
          display:'flex',alignItems:'center',justifyContent:'center',gap:8,
        }}
        onMouseOver={e=>{if(!submitting)e.currentTarget.style.background='#1e4bbd';}}
        onMouseOut={e=>{if(!submitting)e.currentTarget.style.background='#1a3a8f';}}
      >
        {submitting
          ? <><div style={{width:14,height:14,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin 0.7s linear infinite'}}/> Submitting…</>
          : 'Submit Proof'
        }
      </button>
    </div>
  );
};

const lbl = {display:'block',fontSize:11,fontWeight:600,color:'#374151',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:5};
const inp = {width:'100%',height:42,padding:'0 11px',border:'1.5px solid #e5e7eb',background:'#fff',fontFamily:"'Outfit',sans-serif",fontSize:13.5,color:'#111827',outline:'none',borderRadius:0};
const err = {margin:'4px 0 0',fontSize:11.5,color:'#dc2626'};

/* ══════════════════════════════════════════
   TASK CARD
══════════════════════════════════════════ */
const TaskCard = ({ task, index, onComplete, onSubmitProof, submittingId, onImageClick }) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(()=>{
    const obs = new IntersectionObserver(([e])=>{ if(e.isIntersecting) setVisible(true); },{threshold:0.06});
    if(ref.current) obs.observe(ref.current);
    return ()=>obs.disconnect();
  },[]);

  const s = STATUS[task.status] || STATUS.pending;
  let step = 1;
  if (task.completed && !task.proofImage)                              step = 2;
  else if (task.completed && task.proofImage && task.status==='pending') step = 3;
  else if (task.status==='approved' || task.status==='rejected')        step = 4;

  const date = task.updatedAt
    ? new Date(task.updatedAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})
    : 'N/A';
  const isSubmitting = submittingId === task._id;
  const proofUrl = task.proofImage || null;

  return (
    <div ref={ref} style={{
      background:'#fff', border:'1px solid #e8eaf0', borderTop:`3px solid ${s.accent}`,
      opacity:visible?1:0,
      transform:visible?'translateY(0)':'translateY(18px)',
      transition:`opacity 0.5s ease ${index*0.05}s, transform 0.5s ease ${index*0.05}s, box-shadow 0.2s`,
    }}
      onMouseOver={e=>e.currentTarget.style.boxShadow='0 6px 24px rgba(26,58,143,0.09)'}
      onMouseOut={e=>e.currentTarget.style.boxShadow='none'}
    >
      {/* Header */}
      <div style={{padding:'16px 18px 12px',borderBottom:'1px solid #f0f1f5'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8,marginBottom:6,flexWrap:'wrap'}}>
          <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:16,color:'#0d1b3e',margin:0,lineHeight:1.3,flex:1,minWidth:0}}>
            {task.taskId?.title || 'Unknown Task'}
          </h2>
          <StatusBadge status={task.status}/>
        </div>
        <p style={{fontSize:13,color:'#6b7280',margin:0,lineHeight:1.6,fontWeight:300}}>
          {task.taskId?.description || 'No description available.'}
        </p>
      </div>

      {/* Body */}
      <div style={{padding:'14px 18px 18px'}}>
        <div style={{display:'flex',gap:18,marginBottom:14,flexWrap:'wrap'}}>
          <div>
            <p style={{margin:'0 0 2px',fontSize:9.5,color:'#9ca3af',textTransform:'uppercase',letterSpacing:'0.7px',fontWeight:600}}>Last Updated</p>
            <p style={{margin:0,fontSize:13,color:'#374151',fontWeight:500}}>{date}</p>
          </div>
          <div>
            <p style={{margin:'0 0 2px',fontSize:9.5,color:'#9ca3af',textTransform:'uppercase',letterSpacing:'0.7px',fontWeight:600}}>Credit Points</p>
            <p style={{margin:0,fontSize:13,color:'#374151',fontWeight:500}}>{task.taskId?.creditPoints||0} pts</p>
          </div>
        </div>

        <StepIndicator step={step}/>

        {/* Mark complete */}
        {!task.completed && task.status==='pending' && (
          <button onClick={()=>onComplete(task._id)} style={{
            width:'100%',height:44,background:'#1a3a8f',color:'#fff',border:'none',
            fontFamily:"'Outfit',sans-serif",fontSize:12,fontWeight:600,letterSpacing:'1px',
            textTransform:'uppercase',cursor:'pointer',
            display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginTop:4,
          }}
            onMouseOver={e=>e.currentTarget.style.background='#1e4bbd'}
            onMouseOut={e=>e.currentTarget.style.background='#1a3a8f'}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            Mark as Completed
          </button>
        )}

        {/* Upload proof */}
        {task.completed && !task.proofImage && task.status==='pending' && (
          <ProofUploadForm taskId={task._id} onSubmit={onSubmitProof} submitting={isSubmitting}/>
        )}

        {/* Awaiting review */}
        {task.completed && task.proofImage && task.status==='pending' && (
          <div style={{background:'#fffbeb',border:'1px solid #fde68a',borderLeft:'3px solid #f59e0b',padding:'11px 13px',display:'flex',alignItems:'center',gap:8,marginTop:4}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <p style={{margin:0,fontSize:13,color:'#92400e',fontWeight:500}}>Proof submitted — awaiting admin verification.</p>
          </div>
        )}

        {/* Approved */}
        {task.status==='approved' && (
          <div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderLeft:'3px solid #16a34a',padding:'11px 13px',display:'flex',alignItems:'center',gap:8,marginTop:4}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            <p style={{margin:0,fontSize:13,color:'#166534',fontWeight:600}}>
              Approved — +{task.taskId?.creditPoints||0} credits added.
            </p>
          </div>
        )}

        {/* Rejected */}
        {task.status==='rejected' && (
          <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderLeft:'3px solid #dc2626',padding:'11px 13px',marginTop:4}}>
            <p style={{margin:'0 0 4px',fontSize:11,color:'#dc2626',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.6px'}}>
              Submission Rejected
            </p>
            <p style={{margin:0,fontSize:13,color:'#b91c1c'}}>
              {task.rejectReason||'Your submission did not meet the required criteria.'}
            </p>
          </div>
        )}

        {/* Proof image — clickable thumbnail, opens lightbox */}
        {proofUrl && (
          <div style={{marginTop:12,borderTop:'1px solid #f0f1f5',paddingTop:10}}>
            <p style={{margin:'0 0 6px',fontSize:9.5,color:'#9ca3af',textTransform:'uppercase',letterSpacing:'0.7px',fontWeight:600}}>
              Submitted Proof
            </p>
            <div
              onClick={()=>onImageClick(proofUrl)}
              style={{cursor:'zoom-in',position:'relative',overflow:'hidden',borderRadius:2}}
              title="Click to enlarge"
            >
              <img src={proofUrl} alt="Proof" style={{width:'100%',height:130,objectFit:'cover',display:'block',transition:'transform .2s'}}
                onMouseOver={e=>e.currentTarget.style.transform='scale(1.02)'}
                onMouseOut={e=>e.currentTarget.style.transform='scale(1)'}
              />
              <div style={{
                position:'absolute',bottom:6,right:6,
                background:'rgba(0,0,0,0.55)',color:'#fff',
                fontSize:10,fontWeight:600,padding:'3px 8px',borderRadius:3,
                display:'flex',alignItems:'center',gap:4,
              }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
                View
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
function MyTasks() {
  const [tasks,        setTasks]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [submittingId, setSubmittingId] = useState(null);
  const [toast,        setToast]        = useState(null);
  const [lightboxSrc,  setLightboxSrc]  = useState(null); // ← lightbox state

  const { user } = useAuth();
  const navigate  = useNavigate();

  useEffect(()=>{ if(user?.teamId) fetchTasks(); },[user]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await getMyTasks();
      setTasks(Array.isArray(data)?data:[]);
    } catch(err) {
      console.error(err); setTasks([]);
      showToast('Failed to load tasks.','error');
    } finally { setLoading(false); }
  };

  const showToast = (msg,type='success') => setToast({msg,type});

  const handleComplete = async (id) => {
    try {
      await completeTask({submissionId:id});
      showToast('Task marked as completed.','success');
      fetchTasks();
    } catch(err) {
      showToast(err.response?.data?.msg||'Could not complete task.','error');
    }
  };

  const handleSubmitProof = async (id,file,witnessName,witnessPhone) => {
    const fd = new FormData();
    fd.append('proof',file); fd.append('submissionId',id);
    fd.append('witnessName',witnessName); fd.append('witnessPhone',witnessPhone);
    try {
      setSubmittingId(id);
      await submitTaskProof(fd);
      showToast('Proof submitted successfully.','success');
      fetchTasks();
    } catch(err) {
      showToast(err.response?.data?.msg||'Failed to submit proof.','error');
    } finally { setSubmittingId(null); }
  };

  /* open lightbox — also locks scroll */
  const openLightbox = useCallback((src) => setLightboxSrc(src), []);
  const closeLightbox = useCallback(() => setLightboxSrc(null), []);

  const counts = {
    total:    tasks.length,
    pending:  tasks.filter(t=>t.status==='pending').length,
    approved: tasks.filter(t=>t.status==='approved').length,
    credits:  tasks.filter(t=>t.status==='approved').reduce((s,t)=>s+(t.taskId?.creditPoints||0),0),
  };

  if (!user?.teamId) return <NoTeamState onNavigate={()=>navigate('/teams')}/>;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Outfit:wght@300;400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;}

        @keyframes shimmer  { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.45} }
        @keyframes spin     { to{transform:rotate(360deg)} }
        @keyframes toastIn  { from{opacity:0;transform:translateX(50px)} to{opacity:1;transform:translateX(0)} }
        @keyframes lbFadeIn { from{opacity:0} to{opacity:1} }
        @keyframes lbZoom   { from{transform:scale(0.88);opacity:0} to{transform:scale(1);opacity:1} }

        .mt-root{min-height:100vh;background:#f4f5f7;font-family:'Outfit',sans-serif;padding-bottom:80px;}

        /* HERO */
        .mt-hero{
          background:linear-gradient(135deg,#0d1b3e 0%,#1a3a8f 55%,#1e50b5 100%);
          padding:48px 48px 68px;position:relative;overflow:hidden;
          opacity:0;animation:fadeUp .7s ease .05s both;
        }
        .mt-hero::before{
          content:'';position:absolute;width:480px;height:480px;border-radius:50%;
          background:radial-gradient(circle,rgba(255,255,255,0.04) 0%,transparent 70%);
          top:-160px;right:-60px;
        }
        .mt-hero::after{
          content:'';position:absolute;bottom:0;left:0;right:0;height:36px;
          background:#f4f5f7;clip-path:ellipse(55% 100% at 50% 100%);
        }
        .mt-hero-inner{max-width:1100px;margin:0 auto;position:relative;z-index:1;}

        .mt-eyebrow{
          display:inline-flex;align-items:center;gap:8px;
          background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);
          padding:5px 13px;font-size:11px;letter-spacing:2px;text-transform:uppercase;
          color:#93b4f0;font-weight:500;margin-bottom:18px;
        }
        .mt-eyedot{width:6px;height:6px;background:#60a5fa;border-radius:50%;animation:pulse 2s ease infinite;}
        .mt-title{font-family:'Playfair Display',serif;font-size:clamp(26px,5vw,42px);color:#fff;margin:0 0 10px;line-height:1.15;}
        .mt-title em{font-style:italic;color:#93b4f0;}
        .mt-sub{font-size:14px;color:rgba(255,255,255,0.5);font-weight:300;max-width:420px;line-height:1.7;margin:0;}

        /* STATS */
        .mt-stats{
          max-width:1100px;margin:-24px auto 0;padding:0 48px;
          display:grid;grid-template-columns:repeat(4,1fr);gap:12px;
          position:relative;z-index:2;
          opacity:0;animation:fadeUp .6s ease .2s both;
        }
        .mt-stat{background:#fff;border:1px solid #e8eaf0;border-top:3px solid #1a3a8f;padding:16px 18px;}
        .mt-stat-label{font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;margin:0 0 4px;}
        .mt-stat-value{font-family:'Playfair Display',serif;font-size:24px;color:#0d1b3e;line-height:1;}
        .mt-stat-sub{font-size:11px;color:#6b7280;margin-top:3px;}

        /* BODY */
        .mt-body{
          max-width:1100px;margin:32px auto 0;padding:0 48px;
          opacity:0;animation:fadeUp .6s ease .32s both;
        }
        .mt-toprow{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;flex-wrap:wrap;gap:10px;}
        .mt-page-title{font-family:'Playfair Display',serif;font-size:21px;color:#0d1b3e;margin:0;}
        .mt-count{font-size:12px;color:#9ca3af;background:#f3f4f6;padding:3px 11px;font-weight:500;border-radius:3px;}
        .mt-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;}
        .mt-empty{
          grid-column:1/-1;background:#fff;border:1px dashed #d1d5db;
          padding:52px 24px;text-align:center;
        }
        .mt-empty-icon{
          width:64px;height:64px;background:#f0f4ff;border-radius:50%;
          display:flex;align-items:center;justify-content:center;margin:0 auto 16px;color:#1a3a8f;
        }

        /* ── RESPONSIVE ── */
        @media(max-width:860px){
          .mt-hero{padding:36px 24px 60px;}
          .mt-stats{padding:0 24px;grid-template-columns:repeat(2,1fr);}
          .mt-body{padding:0 24px;}
          .mt-grid{grid-template-columns:1fr;}
        }

        /* Mobile S — 380px and below */
        @media(max-width:480px){
          .mt-hero{padding:28px 16px 52px;}
          .mt-title{font-size:26px;}
          .mt-sub{font-size:13px;}
          .mt-stats{padding:0 16px;grid-template-columns:1fr 1fr;gap:10px;margin-top:-18px;}
          .mt-stat{padding:12px 14px;}
          .mt-stat-value{font-size:22px;}
          .mt-body{padding:0 16px;}
          .mt-toprow{margin-bottom:14px;}
          .mt-page-title{font-size:18px;}
          .mt-grid{grid-template-columns:1fr;gap:12px;}
          .mt-empty{padding:40px 16px;}
        }

        @media(max-width:360px){
          .mt-hero{padding:22px 14px 48px;}
          .mt-stats{padding:0 14px;}
          .mt-body{padding:0 14px;}
          .mt-title{font-size:22px;}
          .mt-stat-value{font-size:20px;}
        }
      `}</style>

      {/* LIGHTBOX — renders outside card, no scroll-lock issue */}
      {lightboxSrc && <Lightbox src={lightboxSrc} onClose={closeLightbox}/>}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}

      <div className="mt-root">

        {/* HERO */}
        <div className="mt-hero">
          <div className="mt-hero-inner">
            <div className="mt-eyebrow"><div className="mt-eyedot"/><span>PAAH Platform</span></div>
            <h1 className="mt-title">Your tasks,<br/>your <em>impact.</em></h1>
            <p className="mt-sub">
              Accept, complete, and submit proof for your assigned tasks.
              Every verified submission earns you credits and builds your trust score.
            </p>
          </div>
        </div>

        {/* STATS */}
        <div className="mt-stats">
          <div className="mt-stat">
            <p className="mt-stat-label">Total Tasks</p>
            <p className="mt-stat-value">{counts.total}</p>
            <p className="mt-stat-sub">Assigned to you</p>
          </div>
          <div className="mt-stat" style={{borderTopColor:'#f59e0b'}}>
            <p className="mt-stat-label">In Progress</p>
            <p className="mt-stat-value" style={{color:'#92400e'}}>{counts.pending}</p>
            <p className="mt-stat-sub">Pending or uploading</p>
          </div>
          <div className="mt-stat" style={{borderTopColor:'#16a34a'}}>
            <p className="mt-stat-label">Approved</p>
            <p className="mt-stat-value" style={{color:'#166534'}}>{counts.approved}</p>
            <p className="mt-stat-sub">Verified by admin</p>
          </div>
          <div className="mt-stat">
            <p className="mt-stat-label">Credits Earned</p>
            <p className="mt-stat-value">{counts.credits}</p>
            <p className="mt-stat-sub">From approved tasks</p>
          </div>
        </div>

        {/* BODY */}
        <div className="mt-body">
          <div className="mt-toprow">
            <h2 className="mt-page-title">Active Tasks</h2>
            <span className="mt-count">{tasks.length} task{tasks.length!==1?'s':''}</span>
          </div>

          <div className="mt-grid">
            {loading
              ? [1,2,3,4].map(i=><SkeletonCard key={i}/>)
              : tasks.length===0
                ? (
                  <div className="mt-empty">
                    <div className="mt-empty-icon">
                      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
                        <rect x="9" y="3" width="6" height="4" rx="1"/>
                        <path d="M9 12h6M9 16h4"/>
                      </svg>
                    </div>
                    <p style={{fontFamily:"'Playfair Display',serif",fontSize:19,color:'#0d1b3e',margin:'0 0 6px'}}>
                      No tasks assigned
                    </p>
                    <p style={{fontSize:13,color:'#9ca3af',fontWeight:300,maxWidth:240,margin:'0 auto',lineHeight:1.6}}>
                      Your team has no active tasks at the moment. Check back soon.
                    </p>
                  </div>
                )
                : tasks.map((t,i)=>(
                  <TaskCard
                    key={t._id}
                    task={t}
                    index={i}
                    onComplete={handleComplete}
                    onSubmitProof={handleSubmitProof}
                    submittingId={submittingId}
                    onImageClick={openLightbox}   // ← pass lightbox opener
                  />
                ))
            }
          </div>
        </div>
      </div>
    </>
  );
}

export default MyTasks;