import { useState, useEffect, useRef } from 'react';
import { registerUser } from '../../features/auth/authAPI';
import { useNavigate } from 'react-router-dom';
import { googleLogin, facebookLogin } from '../../features/auth/socialAuth';
import { useAuth } from '../../context/AuthContext';

// ─── Animated background particles ────────────────────────────────────────────
function Particles() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);
    const dots = Array.from({ length: 38 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 1.6 + 0.4,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      o: Math.random() * 0.4 + 0.1,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dots.forEach(d => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0 || d.x > canvas.width) d.vx *= -1;
        if (d.y < 0 || d.y > canvas.height) d.vy *= -1;
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(147,180,240,${d.o})`; ctx.fill();
      });
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x, dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath(); ctx.moveTo(dots[i].x, dots[i].y); ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = `rgba(147,180,240,${0.12 * (1 - dist / 120)})`; ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />;
}

// ─── Eye Icon ─────────────────────────────────────────────────────────────────
const EyeIcon = ({ open }) => open ? (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

// ─── Spinner ──────────────────────────────────────────────────────────────────
const Spinner = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
       style={{ animation: 'spin 0.8s linear infinite' }}>
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
  </svg>
);

// ─── Password Strength ────────────────────────────────────────────────────────
const getStrength = (pwd) => {
  const checks = {
    length:    pwd.length >= 8,
    uppercase: /[A-Z]/.test(pwd),
    lowercase: /[a-z]/.test(pwd),
    number:    /[0-9]/.test(pwd),
    special:   /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
  };
  const passed = Object.values(checks).filter(Boolean).length;
  let level = 'none';
  if (passed === 0) level = 'none';
  else if (passed <= 2) level = 'weak';
  else if (passed === 3) level = 'fair';
  else if (passed === 4) level = 'good';
  else level = 'strong';
  return { checks, passed, level };
};

const STRENGTH_CONFIG = {
  none:   { label: '',       color: '#e5e7eb', textColor: '#9ca3af', bars: 0 },
  weak:   { label: 'Weak',   color: '#dc2626', textColor: '#dc2626', bars: 1 },
  fair:   { label: 'Fair',   color: '#f59e0b', textColor: '#f59e0b', bars: 2 },
  good:   { label: 'Good',   color: '#2563eb', textColor: '#2563eb', bars: 3 },
  strong: { label: 'Strong', color: '#16a34a', textColor: '#16a34a', bars: 4 },
};

const StrengthMeter = ({ password }) => {
  const { checks, level } = getStrength(password);
  const cfg = STRENGTH_CONFIG[level];
  const requirements = [
    { key: 'length',    label: 'At least 8 characters' },
    { key: 'uppercase', label: 'One uppercase letter (A–Z)' },
    { key: 'lowercase', label: 'One lowercase letter (a–z)' },
    { key: 'number',    label: 'One number (0–9)' },
    { key: 'special',   label: 'One special character (!@#$...)' },
  ];
  if (!password) return null;
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{ flex: 1, height: 4, background: i <= cfg.bars ? cfg.color : '#e5e7eb', transition: 'background 0.3s ease' }} />
        ))}
      </div>
      {level !== 'none' && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 11.5, color: '#9ca3af' }}>Password strength</span>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: cfg.textColor, letterSpacing: '0.3px' }}>{cfg.label}</span>
        </div>
      )}
      <div style={{ background: '#f8f9fb', border: '1px solid #e8eaf0', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 7 }}>
        {requirements.map(({ key, label }) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 16, height: 16, borderRadius: '50%', flexShrink: 0, background: checks[key] ? '#16a34a' : '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.25s' }}>
              {checks[key]
                ? <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>
                : <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#9ca3af' }} />}
            </div>
            <span style={{ fontSize: 12, fontWeight: 500, color: checks[key] ? '#166534' : '#6b7280', transition: 'color 0.25s' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Legal Modal ──────────────────────────────────────────────────────────────
const TODAY = 'April 29, 2025';
const CONTACT_EMAIL = 'ritheshjayapal@gmail.com';

const TERMS_CONTENT = {
  title: 'Terms of Service',
  subtitle: 'Poverty Awareness and Action Hub (PAAH)',
  lastUpdated: TODAY,
  sections: [
    {
      num: '1',
      heading: 'Acceptance of Terms',
      body: 'By accessing or using the PAAH platform, you agree to comply with these Terms of Service. If you do not agree, you must not use the platform.',
    },
    {
      num: '2',
      heading: 'Platform Purpose',
      body: 'PAAH is a social impact platform designed to connect users, teams, and organizations to contribute to charitable activities such as donations, volunteering, and task completion.',
    },
    {
      num: '3',
      heading: 'User Responsibilities',
      bullets: [
        'You must provide accurate and truthful information.',
        'You are responsible for maintaining the confidentiality of your account.',
        'You agree not to misuse the platform for fraudulent or illegal activities.',
        'Any proof submitted (images, details) must represent genuine contributions.',
      ],
    },
    {
      num: '4',
      heading: 'AI-Based Verification',
      body: 'PAAH may use automated systems (AI) to evaluate submitted proofs:',
      bullets: [
        'AI decisions are indicative and may not be final.',
        'Admins retain the final authority to approve or reject submissions.',
        'Misuse or manipulation attempts may lead to account suspension.',
      ],
    },
    {
      num: '5',
      heading: 'Donations and Contributions',
      bullets: [
        'PAAH does not directly handle financial transactions unless explicitly stated.',
        'Users are responsible for ensuring their contributions are legitimate.',
        'Fake or misleading submissions may result in penalties.',
      ],
    },
    {
      num: '6',
      heading: 'Trust Score System',
      body: 'Trust scores are generated based on user activity and verification outcomes. Any attempt to manipulate scores may result in account restriction or removal.',
    },
    {
      num: '7',
      heading: 'Account Suspension',
      body: 'We reserve the right to suspend or terminate accounts that:',
      bullets: [
        'Violate platform rules',
        'Engage in fraudulent activities',
        'Misuse the system',
      ],
    },
    {
      num: '8',
      heading: 'Limitation of Liability',
      body: 'PAAH is provided "as is" without warranties. We are not responsible for:',
      bullets: [
        'User-generated content',
        'External transactions between users',
        'Loss of data or misuse of platform',
      ],
    },
    {
      num: '9',
      heading: 'Changes to Terms',
      body: 'We may update these terms at any time. Continued use of the platform indicates acceptance of updated terms.',
    },
    {
      num: '10',
      heading: 'Contact',
      body: `For any issues, contact us at: ${CONTACT_EMAIL}`,
    },
  ],
};

const PRIVACY_CONTENT = {
  title: 'Privacy Policy',
  subtitle: 'Poverty Awareness and Action Hub (PAAH)',
  lastUpdated: TODAY,
  sections: [
    {
      num: '1',
      heading: 'Information We Collect',
      body: 'We collect the following:',
      bullets: [
        'Name and email address',
        'Login credentials',
        'Uploaded images (for verification)',
        'Activity data (tasks, donations, participation)',
      ],
    },
    {
      num: '2',
      heading: 'How We Use Your Data',
      body: 'Your data is used to:',
      bullets: [
        'Create and manage user accounts',
        'Verify contributions (including AI-based verification)',
        'Improve platform functionality',
        'Generate trust scores and leaderboards',
      ],
    },
    {
      num: '3',
      heading: 'Data Storage',
      bullets: [
        'Your data is stored securely using database systems.',
        'We implement standard security measures to protect your data.',
        'However, no system is completely secure.',
      ],
    },
    {
      num: '4',
      heading: 'Image and Proof Data',
      bullets: [
        'Uploaded images may be processed for verification purposes.',
        'These images are used only within the platform and not sold to third parties.',
      ],
    },
    {
      num: '5',
      heading: 'Sharing of Data',
      body: 'We do not sell your personal data. We may share data only:',
      bullets: [
        'When required by law',
        'To prevent fraud or misuse',
      ],
    },
    {
      num: '6',
      heading: 'Cookies and Tracking',
      body: 'We may use cookies or local storage to:',
      bullets: [
        'Maintain login sessions',
        'Improve user experience',
      ],
    },
    {
      num: '7',
      heading: 'User Rights',
      body: 'You have the right to:',
      bullets: [
        'Access your data',
        'Request correction of your data',
        'Request deletion of your account',
      ],
    },
    {
      num: '8',
      heading: 'Data Retention',
      body: 'We retain your data as long as your account is active or as required for platform operations.',
    },
    {
      num: '9',
      heading: 'Changes to Policy',
      body: 'We may update this policy. Continued use means acceptance.',
    },
    {
      num: '10',
      heading: 'Contact',
      body: `For privacy concerns, contact: ${CONTACT_EMAIL}`,
    },
  ],
};

function LegalModal({ content, onClose }) {
  const overlayRef = useRef(null);

  // Close on overlay click
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(13,27,62,0.72)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px 16px',
        animation: 'fadeIn 0.2s ease both',
      }}
    >
      <div style={{
        background: '#fff',
        width: '100%', maxWidth: 640,
        maxHeight: '88vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 64px rgba(13,27,62,0.28)',
        animation: 'modalUp 0.3s cubic-bezier(0.16,1,0.3,1) both',
        position: 'relative',
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 28px 20px',
          borderBottom: '1.5px solid #e5e7eb',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 3, height: 20, background: '#1a3a8f', flexShrink: 0 }} />
              <span style={{ fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: '#2563eb', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                Legal Document
              </span>
            </div>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: '#0d1b3e', lineHeight: 1.2, margin: 0 }}>
              {content.title}
            </h2>
            <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4, fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}>
              {content.subtitle} · Last updated: {content.lastUpdated}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#f3f4f6', border: 'none', cursor: 'pointer',
              width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#374151', flexShrink: 0, marginLeft: 16, marginTop: 2,
              transition: 'background 0.2s, color 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#1a3a8f'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#374151'; }}
            title="Close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY: 'auto', padding: '24px 28px 28px', flex: 1 }}>
          {content.sections.map((sec) => (
            <div key={sec.num} style={{ marginBottom: 24 }}>
              {/* Section heading */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
                <span style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: 13, color: '#fff',
                  background: '#1a3a8f',
                  width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, lineHeight: 1,
                }}>
                  {sec.num}
                </span>
                <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600, color: '#0d1b3e', margin: 0 }}>
                  {sec.heading}
                </h3>
              </div>

              {/* Body text */}
              {sec.body && (
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13.5, color: '#4b5563', lineHeight: 1.7, marginBottom: sec.bullets ? 8 : 0, paddingLeft: 36 }}>
                  {sec.body}
                </p>
              )}

              {/* Bullet list */}
              {sec.bullets && (
                <ul style={{ paddingLeft: 36, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {sec.bullets.map((b, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, listStyle: 'none' }}>
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#1a3a8f', flexShrink: 0, marginTop: 7 }} />
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13.5, color: '#4b5563', lineHeight: 1.65 }}>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          {/* Bottom contact highlight */}
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderLeft: '3px solid #1a3a8f', padding: '12px 16px', marginTop: 8 }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#1e3a8a', margin: 0, fontWeight: 500 }}>
              Questions? Reach us at{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: '#1a3a8f', fontWeight: 700, textDecoration: 'none', borderBottom: '1px solid #1a3a8f' }}>
                {CONTACT_EMAIL}
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 28px', borderTop: '1.5px solid #e5e7eb', flexShrink: 0,
          display: 'flex', justifyContent: 'flex-end',
        }}>
          <button
            onClick={onClose}
            style={{
              height: 42, padding: '0 28px',
              background: '#1a3a8f', color: 'white', border: 'none',
              fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
              letterSpacing: '0.8px', textTransform: 'uppercase',
              cursor: 'pointer', transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#1e4bbd'}
            onMouseLeave={e => e.currentTarget.style.background = '#1a3a8f'}
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Signup Component ────────────────────────────────────────────────────
function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading]         = useState(false);
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors]           = useState({});
  const [globalError, setGlobalError] = useState('');
  const [shake, setShake]             = useState(false);
  const [mounted, setMounted]         = useState(false);
  const [success, setSuccess]         = useState(false);
  const [agreed, setAgreed]           = useState(false);
  const [modal, setModal]             = useState(null); // 'terms' | 'privacy' | null

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const validate = () => {
    const e = {};
    if (!form.name.trim())           e.name    = 'Full name is required.';
    else if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters.';
    if (!form.email)                 e.email   = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Please enter a valid email address.';
    const { level } = getStrength(form.password);
    if (!form.password)              e.password = 'Password is required.';
    else if (level === 'weak')       e.password = 'Password is too weak. Meet all requirements below.';
    else if (level === 'fair')       e.password = 'Password is too simple. Add more complexity.';
    if (!form.confirm)               e.confirm = 'Please confirm your password.';
    else if (form.confirm !== form.password) e.confirm = 'Passwords do not match.';
    if (!agreed)                     e.agreed  = 'You must accept the terms to continue.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    setGlobalError('');
  };

  const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 500); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) { triggerShake(); return; }
    try {
      setLoading(true); setGlobalError('');
      await registerUser({ name: form.name, email: form.email, password: form.password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      console.error(err);
      setGlobalError(err.response?.data?.msg || 'Registration failed. Please try again.');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const { level: strengthLevel } = getStrength(form.password);
  const isStrongEnough = ['good', 'strong'].includes(strengthLevel);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes modalUp { from { opacity:0; transform:translateY(32px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)} }
        @keyframes slideLeft { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }
        @keyframes successPop { 0%{transform:scale(0.8);opacity:0} 60%{transform:scale(1.05);opacity:1} 100%{transform:scale(1);opacity:1} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }

        .su-root {
          min-height: 100vh; display: flex;
          background: #0d1b3e; font-family: 'DM Sans', sans-serif; overflow: hidden;
        }

        /* ── LEFT ── */
        .su-left {
          flex: 1; position: relative;
          display: flex; flex-direction: column; justify-content: center;
          padding: 60px 56px; overflow: hidden;
        }
        .su-left-bg { position: absolute; inset: 0; background: linear-gradient(135deg, #0d1b3e 0%, #1a3a8f 60%, #0f2d6b 100%); }
        .su-glow1 { position:absolute; width:600px; height:600px; border-radius:50%; background:radial-gradient(circle,rgba(37,99,235,.18) 0%,transparent 70%); top:-100px; right:-200px; pointer-events:none; }
        .su-glow2 { position:absolute; width:400px; height:400px; border-radius:50%; background:radial-gradient(circle,rgba(59,130,246,.1) 0%,transparent 70%); bottom:-80px; left:-100px; pointer-events:none; }
        .su-left-content { position:relative; z-index:2; animation:slideLeft 0.8s cubic-bezier(0.16,1,0.3,1) both; }

        .su-brand-badge {
          display:inline-flex; align-items:center; gap:10px;
          background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.12);
          padding:8px 16px; margin-bottom:40px;
        }
        .su-brand-dot { width:8px; height:8px; background:#60a5fa; border-radius:50%; animation:pulse 2s ease-in-out infinite; }
        .su-brand-label { font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#93b4f0; font-weight:500; }

        .su-title { font-family:'DM Serif Display',serif; font-size:50px; line-height:1.1; color:#fff; margin-bottom:20px; }
        .su-title em { font-style:italic; color:#93b4f0; }
        .su-sub { font-size:15px; color:rgba(255,255,255,.55); line-height:1.7; max-width:380px; margin-bottom:44px; font-weight:300; }

        .su-features { display:flex; flex-direction:column; gap:16px; }
        .su-feat { display:flex; align-items:flex-start; gap:12px; }
        .su-feat-icon { width:34px; height:34px; background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.1); display:flex; align-items:center; justify-content:center; flex-shrink:0; color:#93b4f0; }
        .su-feat-text { display:flex; flex-direction:column; gap:2px; }
        .su-feat-title { font-size:13px; font-weight:600; color:#fff; }
        .su-feat-sub { font-size:12px; color:rgba(255,255,255,.45); font-weight:300; }

        /* ── RIGHT ── */
        .su-right {
          width: 520px; flex-shrink:0; background:#f7f8fc;
          display:flex; flex-direction:column; justify-content:center;
          padding:44px 48px; position:relative; overflow-y:auto;
        }
        .su-right::before { content:''; position:absolute; left:0; top:0; bottom:0; width:1px; background:linear-gradient(to bottom,transparent,rgba(26,58,143,.2),transparent); }

        .su-form-wrap { opacity:0; transform:translateY(24px); transition:opacity .6s ease,transform .6s ease; }
        .su-form-wrap.visible { opacity:1; transform:translateY(0); }
        .su-form-wrap.shake { animation:shake .45s ease both; }

        .su-form-header { margin-bottom:28px; }
        .su-eyebrow { font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#2563eb; font-weight:600; margin-bottom:10px; }
        .su-form-title { font-family:'DM Serif Display',serif; font-size:30px; color:#0d1b3e; line-height:1.2; margin-bottom:6px; }
        .su-form-sub { font-size:13px; color:#6b7280; font-weight:300; }

        /* FIELDS */
        .su-field { margin-bottom:16px; }
        .su-label { display:block; font-size:11.5px; font-weight:600; color:#374151; letter-spacing:.5px; text-transform:uppercase; margin-bottom:6px; }
        .su-field-wrap { position:relative; }
        .su-icon { position:absolute; left:14px; top:50%; transform:translateY(-50%); color:#9ca3af; display:flex; pointer-events:none; }
        .su-input {
          width:100%; height:46px; padding:0 44px 0 44px;
          background:#fff; border:1.5px solid #e5e7eb; border-radius:0;
          font-family:'DM Sans',sans-serif; font-size:14px; color:#111827;
          outline:none; transition:border-color .2s,box-shadow .2s;
        }
        .su-input::placeholder { color:#c4c9d4; }
        .su-input:focus { border-color:#1a3a8f; box-shadow:0 0 0 3px rgba(26,58,143,.08); }
        .su-input.err { border-color:#dc2626; }
        .su-input.err:focus { box-shadow:0 0 0 3px rgba(220,38,38,.08); }
        .su-input.ok { border-color:#16a34a; }

        .su-eye { position:absolute; right:13px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:#9ca3af; display:flex; padding:4px; transition:color .2s; }
        .su-eye:hover { color:#374151; }

        .su-err { display:flex; align-items:center; gap:5px; font-size:11.5px; color:#dc2626; margin-top:4px; font-weight:400; }

        /* ERROR BANNER */
        .su-error-banner { background:#fef2f2; border:1px solid #fecaca; border-left:3px solid #dc2626; padding:11px 14px; margin-bottom:16px; display:flex; align-items:center; gap:8px; font-size:13px; color:#b91c1c; }

        /* TERMS */
        .su-terms { display:flex; align-items:flex-start; gap:10px; margin-bottom:20px; }
        .su-terms-box { width:16px; height:16px; border:1.5px solid #d1d5db; background:white; appearance:none; cursor:pointer; position:relative; flex-shrink:0; margin-top:2px; transition:border-color .2s,background .2s; }
        .su-terms-box:checked { background:#1a3a8f; border-color:#1a3a8f; }
        .su-terms-box:checked::after { content:''; position:absolute; left:4px; top:1px; width:5px; height:9px; border:2px solid white; border-top:none; border-left:none; transform:rotate(45deg); }
        .su-terms-text { font-size:12.5px; color:#374151; line-height:1.6; }
        .su-legal-link {
          color:#1a3a8f; font-weight:600; cursor:pointer; text-decoration:none;
          border-bottom:1px dashed #1a3a8f; transition:border-color .2s, opacity .2s;
          background:none; border-top:none; border-left:none; border-right:none;
          font-family:'DM Sans',sans-serif; font-size:12.5px; padding:0;
          display:inline;
        }
        .su-legal-link:hover { opacity:0.75; }
        .su-terms-err { font-size:11.5px; color:#dc2626; margin-top:-14px; margin-bottom:16px; }

        /* SUBMIT */
        .su-btn {
          width:100%; height:50px; background:#1a3a8f; color:white; border:none;
          font-family:'DM Sans',sans-serif; font-size:14px; font-weight:600;
          letter-spacing:1px; text-transform:uppercase; cursor:pointer;
          display:flex; align-items:center; justify-content:center; gap:10px;
          position:relative; overflow:hidden; transition:background .2s,transform .1s;
          margin-bottom:20px;
        }
        .su-btn::before { content:''; position:absolute; inset:0; background:linear-gradient(90deg,transparent,rgba(255,255,255,.06),transparent); transform:translateX(-100%); transition:transform .6s ease; }
        .su-btn:hover:not(:disabled)::before { transform:translateX(100%); }
        .su-btn:hover:not(:disabled) { background:#1e4bbd; }
        .su-btn:active:not(:disabled) { transform:scale(.99); }
        .su-btn:disabled { opacity:.65; cursor:not-allowed; }
        .su-btn.success { background:#15803d; }

        /* SUCCESS OVERLAY */
        .su-success {
          position:absolute; inset:0; background:#f7f8fc;
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          gap:14px; animation:fadeUp .4s ease both; z-index:10;
        }
        .su-success-icon { width:68px; height:68px; background:#1a3a8f; border-radius:50%; display:flex; align-items:center; justify-content:center; animation:successPop .5s cubic-bezier(.16,1,.3,1) both; }
        .su-success-title { font-family:'DM Serif Display',serif; font-size:26px; color:#0d1b3e; }
        .su-success-sub { font-size:14px; color:#6b7280; }

        /* DIVIDER */
        .su-divider { display:flex; align-items:center; gap:12px; margin-bottom:18px; }
        .su-divider-line { flex:1; height:1px; background:#e5e7eb; }
        .su-divider-text { font-size:11px; color:#9ca3af; letter-spacing:.5px; white-space:nowrap; }

        /* SOCIAL */
        .su-social { display:flex; gap:10px; margin-bottom:24px; }
        .su-social-btn { flex:1; height:44px; background:white; border:1.5px solid #e5e7eb; display:flex; align-items:center; justify-content:center; gap:8px; font-family:'DM Sans',sans-serif; font-size:13px; color:#374151; cursor:pointer; font-weight:500; transition:border-color .2s,background .2s; }
        .su-social-btn:hover { border-color:#9ca3af; background:#f9fafb; }

        /* FOOTER */
        .su-footer { text-align:center; font-size:13px; color:#6b7280; }
        .su-footer a { color:#1a3a8f; font-weight:600; cursor:pointer; text-decoration:none; }
        .su-footer a:hover { text-decoration:underline; }

        /* RESPONSIVE */
        @media (max-width:900px) {
          .su-left { display:none; }
          .su-right { width:100%; padding:40px 28px; }
        }
      `}</style>

      {/* ── Legal Modals ── */}
      {modal === 'terms' && (
        <LegalModal content={TERMS_CONTENT} onClose={() => setModal(null)} />
      )}
      {modal === 'privacy' && (
        <LegalModal content={PRIVACY_CONTENT} onClose={() => setModal(null)} />
      )}

      <div className="su-root">

        {/* ── LEFT PANEL ── */}
        <div className="su-left">
          <div className="su-left-bg" />
          <div className="su-glow1" /><div className="su-glow2" />
          <Particles />
          <div className="su-left-content">
            <div className="su-brand-badge">
              <img
                src="/logo-login.png"
                alt="PAAH"
                style={{ width: 24, height: 24, objectFit: 'contain', borderRadius: 4 }}
              />
              <span className="su-brand-label">PAAH Platform</span>
            </div>
            <h1 className="su-title">Join the <em>movement</em><br />for change.</h1>
            <p className="su-sub">
              Create your account and become a verified contributor in the fight
              against poverty. Every task, every donation — it all counts.
            </p>
            <div className="su-features">
              {[
                {
                  icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
                  title: 'AI-Verified Contributions',
                  sub: 'Proof of action reviewed by Gemini AI',
                },
                {
                  icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
                  title: 'Team Collaboration',
                  sub: 'Work with your team to maximise impact',
                },
                {
                  icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
                  title: 'Trust Score & Leaderboard',
                  sub: 'Build credibility through verified action',
                },
              ].map(({ icon, title, sub }) => (
                <div className="su-feat" key={title}>
                  <div className="su-feat-icon">{icon}</div>
                  <div className="su-feat-text">
                    <span className="su-feat-title">{title}</span>
                    <span className="su-feat-sub">{sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="su-right">
          {success && (
            <div className="su-success">
              <div className="su-success-icon">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <p className="su-success-title">Account Created!</p>
              <p className="su-success-sub">Redirecting you to sign in…</p>
            </div>
          )}

          <div className={`su-form-wrap ${mounted ? 'visible' : ''} ${shake ? 'shake' : ''}`}>

            <div className="su-form-header">
              <img
                src="/logo-login.png"
                alt="PAAH Logo"
                style={{ width: 44, height: 44, objectFit: 'contain', marginBottom: 14, display: 'block' }}
              />
              <p className="su-eyebrow">Create Account</p>
              <h2 className="su-form-title">Join PAAH today</h2>
              <p className="su-form-sub">Fill in your details to get started. It's free.</p>
            </div>

            {/* Global error */}
            {globalError && (
              <div className="su-error-banner">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {globalError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>

              {/* Full Name */}
              <div className="su-field">
                <label className="su-label" htmlFor="name">Full Name</label>
                <div className="su-field-wrap">
                  <span className="su-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                  </span>
                  <input id="name" name="name" type="text" placeholder="e.g. Rithesh Kumar"
                    value={form.name} onChange={handleChange} autoComplete="name"
                    className={`su-input ${errors.name ? 'err' : form.name && !errors.name ? 'ok' : ''}`}
                  />
                </div>
                {errors.name && <p className="su-err"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>{errors.name}</p>}
              </div>

              {/* Email */}
              <div className="su-field">
                <label className="su-label" htmlFor="email">Email Address</label>
                <div className="su-field-wrap">
                  <span className="su-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </span>
                  <input id="email" name="email" type="email" placeholder="you@example.com"
                    value={form.email} onChange={handleChange} autoComplete="email"
                    className={`su-input ${errors.email ? 'err' : form.email && !errors.email ? 'ok' : ''}`}
                  />
                </div>
                {errors.email && <p className="su-err"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="su-field">
                <label className="su-label" htmlFor="password">Password</label>
                <div className="su-field-wrap">
                  <span className="su-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                    </svg>
                  </span>
                  <input id="password" name="password" type={showPass ? 'text' : 'password'}
                    placeholder="e.g. Demo@123"
                    value={form.password} onChange={handleChange} autoComplete="new-password"
                    className={`su-input ${errors.password ? 'err' : isStrongEnough ? 'ok' : ''}`}
                  />
                  <button type="button" className="su-eye" onClick={() => setShowPass(p => !p)} tabIndex={-1}>
                    <EyeIcon open={showPass} />
                  </button>
                </div>
                {errors.password && <p className="su-err"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>{errors.password}</p>}
                <StrengthMeter password={form.password} />
              </div>

              {/* Confirm Password */}
              <div className="su-field">
                <label className="su-label" htmlFor="confirm">Confirm Password</label>
                <div className="su-field-wrap">
                  <span className="su-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  </span>
                  <input id="confirm" name="confirm" type={showConfirm ? 'text' : 'password'}
                    placeholder="Re-enter your password"
                    value={form.confirm} onChange={handleChange} autoComplete="new-password"
                    className={`su-input ${errors.confirm ? 'err' : form.confirm && form.confirm === form.password ? 'ok' : ''}`}
                  />
                  <button type="button" className="su-eye" onClick={() => setShowConfirm(p => !p)} tabIndex={-1}>
                    <EyeIcon open={showConfirm} />
                  </button>
                </div>
                {errors.confirm && <p className="su-err"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>{errors.confirm}</p>}
                {form.confirm && form.confirm === form.password && !errors.confirm && (
                  <p style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'#16a34a', marginTop:4 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    Passwords match
                  </p>
                )}
              </div>

              {/* Terms & Privacy */}
              <div className="su-terms">
                <input
                  type="checkbox"
                  className="su-terms-box"
                  checked={agreed}
                  onChange={e => { setAgreed(e.target.checked); setErrors(p => ({ ...p, agreed: '' })); }}
                />
                <p className="su-terms-text">
                  I agree to the{' '}
                  <button
                    type="button"
                    className="su-legal-link"
                    onClick={() => setModal('terms')}
                  >
                    Terms of Service
                  </button>
                  {' '}and{' '}
                  <button
                    type="button"
                    className="su-legal-link"
                    onClick={() => setModal('privacy')}
                  >
                    Privacy Policy
                  </button>
                  {' '}of the PAAH platform.
                </p>
              </div>
              {errors.agreed && <p className="su-terms-err">{errors.agreed}</p>}

              {/* Submit */}
              <button type="submit" className={`su-btn ${success ? 'success' : ''}`} disabled={loading || success}>
                {loading ? <><Spinner /> Creating Account…</> : success ? 'Account Created!' : 'Create My Account'}
              </button>

            </form>

             <div className="su-divider">
              <div className="su-divider-line" /><span className="su-divider-text">or sign up with</span><div className="su-divider-line" />
            </div>

              <div className="su-social">

  {/* GOOGLE */}
  <button
    className="su-social-btn"
    type="button"
    onClick={async () => {
      try {
        const res = await googleLogin();

       
        login({
  ...res.data.user,
  token: res.data.token
});

        navigate('/');
      } catch (err) {
        console.error(err);
        setGlobalError('Google signup failed');
      }
    }}
  >
    <svg width="17" height="17" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
    Google
  </button>

  {/* FACEBOOK */}
  <button
    className="su-social-btn"
    type="button"
    onClick={async () => {
      try {
        const res = await facebookLogin();

       
        login({
  ...res.data.user,
  token: res.data.token
});

        navigate('/');
      } catch (err) {
        console.error(err);
        setGlobalError('Facebook signup failed');
      }
    }}
  >
    <svg width="17" height="17" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
    Facebook
  </button>

              </div>

            {/* Sign in link */}
            <p className="su-footer">
              Already have an account?{' '}
              <a onClick={() => navigate('/login')}>Sign in here</a>
            </p>

          </div>
        </div>
      </div>
    </>
  );
}

export default Signup;