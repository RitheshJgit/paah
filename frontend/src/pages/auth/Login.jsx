import { useState, useEffect, useRef } from 'react';
import { loginUser } from '../../features/auth/authAPI';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { googleLogin, facebookLogin } from '../../features/auth/socialAuth';
import api from '../../services/api';

// ─── Animated background particles ───────────────────────────────────────────
function Particles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const dots = Array.from({ length: 38 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.6 + 0.4,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      o: Math.random() * 0.4 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dots.forEach(d => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0 || d.x > canvas.width) d.vx *= -1;
        if (d.y < 0 || d.y > canvas.height) d.vy *= -1;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(147,180,240,${d.o})`;
        ctx.fill();
      });

      // Draw connecting lines
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = `rgba(147,180,240,${0.12 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
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

// ─── Eye icon ─────────────────────────────────────────────────────────────────
const EyeIcon = ({ open }) => open ? (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
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

// ─── Main Login Component ─────────────────────────────────────────────────────
function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passError, setPassError] = useState('');
  const [shake, setShake] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
    const saved = localStorage.getItem('paah_remember_email');
    if (saved) { setForm(f => ({ ...f, email: saved })); setRememberMe(true); }
  }, []);

  const validate = () => {
  let valid = true;
  setEmailError('');
  setPassError('');

  if (!form.email) {
    setEmailError('Email is required.');
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    setEmailError('Please enter a valid email address.');
    valid = false;
  }

  if (!form.password) {
    setPassError('Password is required.');
    valid = false;
  }

  return valid;
};

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    if (e.target.name === 'email') setEmailError('');
    if (e.target.name === 'password') setPassError('');
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validate()) { triggerShake(); return; }

  try {
    setLoading(true);
    setError('');

    const data = await loginUser(form);

    // store token
    localStorage.setItem('token', data.token);

    // remember email
    if (rememberMe) {
      localStorage.setItem('paah_remember_email', form.email);
    } else {
      localStorage.removeItem('paah_remember_email');
    }

    // 🔥 MUST fetch user (NO fallback)
    try {
      const userRes = await api.get('/users/me', {
        headers: { Authorization: `Bearer ${data.token}` }
      });

      const fullUser = {
        ...userRes.data,
        token: data.token
      };

      login(fullUser); // ✅ correct

    } catch (err) {
      console.error("User fetch failed:", err.response?.data || err.message);

      setError("Login succeeded but failed to load profile");
      triggerShake();
      return; // ❗ STOP here
    }

    setSuccess(true);
    setTimeout(() => navigate('/'), 800);

  } catch (err) {
    const msg = err.response?.data?.msg || 'Invalid credentials. Please try again.';
    setError(msg);
    triggerShake();
  } finally {
    setLoading(false);
  }
};

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes spin { to { transform: rotate(360deg); } }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%     { transform: translateX(-8px); }
          40%     { transform: translateX(8px); }
          60%     { transform: translateX(-5px); }
          80%     { transform: translateX(5px); }
        }

        @keyframes slideLeft {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        @keyframes successPop {
          0%   { transform: scale(0.8); opacity: 0; }
          60%  { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes pulse {
          0%,100% { opacity: 1; }
          50%     { opacity: 0.5; }
        }

        .login-root {
          min-height: 100vh;
          display: flex;
          background: #0d1b3e;
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
        }

        /* ── LEFT PANEL ── */
        .left-panel {
          flex: 1;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 60px 56px;
          overflow: hidden;
        }

        .left-bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #0d1b3e 0%, #1a3a8f 60%, #0f2d6b 100%);
        }

        .left-glow {
          position: absolute;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%);
          top: -100px;
          right: -200px;
          pointer-events: none;
        }

        .left-glow-2 {
          position: absolute;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%);
          bottom: -80px;
          left: -100px;
          pointer-events: none;
        }

        .left-content {
          position: relative;
          z-index: 2;
          animation: slideLeft 0.8s cubic-bezier(0.16,1,0.3,1) both;
        }

        .brand-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          padding: 8px 16px;
          margin-bottom: 40px;
        }

        .brand-dot {
          width: 8px; height: 8px;
          background: #60a5fa;
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        .brand-label {
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #93b4f0;
          font-weight: 500;
        }

        .left-title {
          font-family: 'DM Serif Display', serif;
          font-size: 52px;
          line-height: 1.1;
          color: #ffffff;
          margin-bottom: 20px;
        }

        .left-title em {
          font-style: italic;
          color: #93b4f0;
        }

        .left-sub {
          font-size: 15px;
          color: rgba(255,255,255,0.55);
          line-height: 1.7;
          max-width: 380px;
          margin-bottom: 48px;
          font-weight: 300;
        }

        .stats-row {
          display: flex;
          gap: 32px;
        }

        .stat-item { display: flex; flex-direction: column; gap: 4px; }

        .stat-num {
          font-family: 'DM Serif Display', serif;
          font-size: 28px;
          color: #ffffff;
        }

        .stat-label {
          font-size: 11px;
          color: rgba(255,255,255,0.4);
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .stat-divider {
          width: 1px;
          background: rgba(255,255,255,0.12);
          align-self: stretch;
        }

        /* ── RIGHT PANEL ── */
        .right-panel {
          width: 480px;
          flex-shrink: 0;
          background: #f7f8fc;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 52px 48px;
          position: relative;
        }

        .right-panel::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 1px;
          background: linear-gradient(to bottom, transparent, rgba(26,58,143,0.2), transparent);
        }

        .form-wrap {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }

        .form-wrap.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .form-wrap.shake { animation: shake 0.45s ease both; }

        .form-header { margin-bottom: 36px; }

        .form-eyebrow {
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #2563eb;
          font-weight: 600;
          margin-bottom: 10px;
        }

        .form-title {
          font-family: 'DM Serif Display', serif;
          font-size: 32px;
          color: #0d1b3e;
          line-height: 1.2;
          margin-bottom: 8px;
        }

        .form-sub {
          font-size: 13.5px;
          color: #6b7280;
          font-weight: 300;
        }

        /* ── FIELDS ── */
        .field-group { margin-bottom: 18px; }

        .field-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #374151;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin-bottom: 7px;
        }

        .field-wrap {
          position: relative;
        }

        .field-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          display: flex;
          pointer-events: none;
          transition: color 0.2s;
        }

        .field-input {
          width: 100%;
          height: 48px;
          padding: 0 44px 0 44px;
          background: #ffffff;
          border: 1.5px solid #e5e7eb;
          border-radius: 0;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #111827;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .field-input::placeholder { color: #c4c9d4; }

        .field-input:focus {
          border-color: #1a3a8f;
          box-shadow: 0 0 0 3px rgba(26,58,143,0.08);
        }

        .field-input.error { border-color: #dc2626; }
        .field-input.error:focus { box-shadow: 0 0 0 3px rgba(220,38,38,0.08); }

        .eye-btn {
          position: absolute;
          right: 13px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #9ca3af;
          display: flex;
          padding: 4px;
          transition: color 0.2s;
        }

        .eye-btn:hover { color: #374151; }

        .field-error {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          color: #dc2626;
          margin-top: 5px;
          font-weight: 400;
        }

        /* ── OPTIONS ROW ── */
        .options-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .remember-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 13px;
          color: #374151;
          user-select: none;
        }

        .remember-box {
          width: 16px; height: 16px;
          border: 1.5px solid #d1d5db;
          background: white;
          appearance: none;
          cursor: pointer;
          position: relative;
          flex-shrink: 0;
          transition: border-color 0.2s, background 0.2s;
        }

        .remember-box:checked {
          background: #1a3a8f;
          border-color: #1a3a8f;
        }

        .remember-box:checked::after {
          content: '';
          position: absolute;
          left: 4px; top: 1px;
          width: 5px; height: 9px;
          border: 2px solid white;
          border-top: none; border-left: none;
          transform: rotate(45deg);
        }

        .forgot-link {
          font-size: 13px;
          color: #2563eb;
          cursor: pointer;
          font-weight: 500;
          text-decoration: none;
          border-bottom: 1px dashed transparent;
          transition: border-color 0.2s;
        }

        .forgot-link:hover { border-color: #2563eb; }

        /* ── ERROR BANNER ── */
        .error-banner {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-left: 3px solid #dc2626;
          padding: 11px 14px;
          margin-bottom: 18px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #b91c1c;
        }

        /* ── SUBMIT BUTTON ── */
        .submit-btn {
          width: 100%;
          height: 50px;
          background: #1a3a8f;
          color: white;
          border: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          position: relative;
          overflow: hidden;
          transition: background 0.2s, transform 0.1s;
          margin-bottom: 20px;
        }

        .submit-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%);
          transform: translateX(-100%);
          transition: transform 0.6s ease;
        }

        .submit-btn:hover:not(:disabled)::before { transform: translateX(100%); }
        .submit-btn:hover:not(:disabled) { background: #1e4bbd; }
        .submit-btn:active:not(:disabled) { transform: scale(0.99); }
        .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .submit-btn.success-state { background: #15803d; }

        /* ── DIVIDER ── */
        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .divider-line { flex: 1; height: 1px; background: #e5e7eb; }
        .divider-text { font-size: 11px; color: #9ca3af; letter-spacing: 0.5px; white-space: nowrap; }

        /* ── SOCIAL BUTTONS ── */
        .social-row { display: flex; gap: 10px; margin-bottom: 28px; }

        .social-btn {
          flex: 1;
          height: 44px;
          background: white;
          border: 1.5px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: #374151;
          cursor: pointer;
          font-weight: 500;
          transition: border-color 0.2s, background 0.2s;
        }

        .social-btn:hover { border-color: #9ca3af; background: #f9fafb; }

        /* ── FOOTER ── */
        .form-footer {
          text-align: center;
          font-size: 13px;
          color: #6b7280;
        }

        .form-footer a {
          color: #1a3a8f;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
        }

        .form-footer a:hover { text-decoration: underline; }

        /* ── SUCCESS ── */
        .success-overlay {
          position: absolute;
          inset: 0;
          background: #f7f8fc;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          animation: fadeUp 0.4s ease both;
          z-index: 10;
        }

        .success-icon {
          width: 64px; height: 64px;
          background: #1a3a8f;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: successPop 0.5s cubic-bezier(0.16,1,0.3,1) both;
        }

        .success-text {
          font-family: 'DM Serif Display', serif;
          font-size: 24px;
          color: #0d1b3e;
        }

        .success-sub { font-size: 14px; color: #6b7280; }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .left-panel { display: none; }
          .right-panel { width: 100%; padding: 40px 28px; }
        }
      `}</style>

      <div className="login-root">
        {/* ── LEFT PANEL ── */}
        <div className="left-panel">
          <div className="left-bg" />
          <div className="left-glow" />
          <div className="left-glow-2" />
          <Particles />

          <div className="left-content">
            <div className="brand-badge">
  <img
    src="/logo-paah.jpeg"
    alt="PAAH"
    style={{ width: 24, height: 24, objectFit: 'contain', borderRadius: 4 }}
  />
  <span className="brand-label">PAAH Platform</span>
</div>

            <h1 className="left-title">
              Where action<br />meets <em>impact.</em>
            </h1>

            <p className="left-sub">
              Join thousands of contributors verified by AI, trusted by the community,
              and united in the mission to eliminate poverty through action.
            </p>

            <div className="stats-row">
              <div className="stat-item">
                <span className="stat-num">12K+</span>
                <span className="stat-label">Contributors</span>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <span className="stat-num">48K</span>
                <span className="stat-label">Tasks Done</span>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <span className="stat-num">98%</span>
                <span className="stat-label">Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="right-panel">
          {success && (
            <div className="success-overlay">
              <div className="success-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="success-text">Welcome back!</p>
              <p className="success-sub">Redirecting to your dashboard…</p>
            </div>
          )}

          <div className={`form-wrap ${mounted ? 'visible' : ''} ${shake ? 'shake' : ''}`}>
            <div className="form-header">
  <img
    src="/logo-paah.jpeg"
    alt="PAAH Logo"
    style={{
      width: 48,
      height: 48,
      objectFit: 'contain',
      marginBottom: 16,
      display: 'block',
    }}
  />
  <p className="form-eyebrow">Secure Sign In</p>
  <h2 className="form-title">Sign in to PAAH</h2>
  <p className="form-sub">Enter your credentials to access your account.</p>
</div>

            {/* Global Error */}
            {error && (
              <div className="error-banner">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Email */}
              <div className="field-group">
                <label className="field-label" htmlFor="email">Email Address</label>
                <div className="field-wrap">
                  <span className="field-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    className={`field-input ${emailError ? 'error' : ''}`}
                    autoComplete="email"
                  />
                </div>
                {emailError && <p className="field-error">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                  {emailError}
                </p>}
              </div>

              {/* Password */}
              <div className="field-group">
                <label className="field-label" htmlFor="password">Password</label>
                <div className="field-wrap">
                  <span className="field-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0110 0v4"/>
                    </svg>
                  </span>
                  <input
                    id="password"
                    name="password"
                    type={showPass ? 'text' : 'password'}
                    placeholder="Your password"
                    value={form.password}
                    onChange={handleChange}
                    className={`field-input ${passError ? 'error' : ''}`}
                    autoComplete="current-password"
                  />
                  <button type="button" className="eye-btn" onClick={() => setShowPass(p => !p)} tabIndex={-1}>
                    <EyeIcon open={showPass} />
                  </button>
                </div>
                {passError && <p className="field-error">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                  {passError}
                </p>}
              </div>

              {/* Options */}
              <div className="options-row">
                <label className="remember-label">
                  <input
                    type="checkbox"
                    className="remember-box"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                  />
                  Remember me
                </label>
                <span className="forgot-link" onClick={() => navigate('/forgot-password')}>
                  Forgot password?
                </span>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className={`submit-btn ${success ? 'success-state' : ''}`}
                disabled={loading || success}
              >
                {loading ? <><Spinner /> Verifying…</> : success ? 'Redirecting…' : 'Sign In'}
              </button>
            </form>

            {/* Divider */}
            <div className="divider">
              <div className="divider-line" />
              <span className="divider-text">or continue with</span>
              <div className="divider-line" />
            </div>

            {/* Social */}
<div className="social-row">

  {/* GOOGLE */}
  <button
    className="social-btn"
    type="button"
    onClick={async () => {
      try {
        const res = await googleLogin();

       
        login({
  ...res.data,
  token: res.data.token
});

        navigate('/');
      } catch (err) {
        console.error(err);
        setError("Google signup/login failed");
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
    className="social-btn"
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
        setError("Facebook signup/login failed");
      }
    }}
  >
    <svg width="17" height="17" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
    Facebook
  </button>

</div>

            {/* Sign up link */}
            <p className="form-footer">
              Don't have an account?{' '}
              <a onClick={() => navigate('/signup')}>Create one free</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;