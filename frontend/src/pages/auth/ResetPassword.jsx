import { useState } from "react";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import api from "../../services/api";
import { useToast, ToastContainer } from "./Toast";

const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap');

    .rp-root {
      min-height:100vh; display:flex; align-items:center; justify-content:center;
      background:#f0f4ff; padding:20px 16px; font-family:'DM Sans',sans-serif;
    }
    .rp-root::before {
      content:''; position:fixed; inset:0;
      background-image:
        linear-gradient(rgba(29,78,216,0.04) 1px,transparent 1px),
        linear-gradient(90deg,rgba(29,78,216,0.04) 1px,transparent 1px);
      background-size:40px 40px; pointer-events:none;
    }
    .rp-card {
      background:#fff; border-radius:20px; border:1px solid #e0e7ff;
      box-shadow:0 4px 40px rgba(29,78,216,.08),0 1px 4px rgba(0,0,0,.04);
      padding:40px 36px 36px; width:100%; max-width:440px;
      position:relative; animation:rpIn .35s cubic-bezier(.4,0,.2,1) both;
    }
    @keyframes rpIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
    .rp-card::before {
      content:''; position:absolute; top:0; left:32px; right:32px; height:3px;
      border-radius:0 0 4px 4px; background:linear-gradient(90deg,#1d4ed8,#60a5fa);
    }

    /* Steps */
    .rp-steps { display:flex; align-items:center; margin-bottom:28px; }
    .rp-step-dot {
      width:28px; height:28px; border-radius:50%; flex-shrink:0;
      display:flex; align-items:center; justify-content:center;
      font-size:11px; font-weight:700;
    }
    .rp-step-dot.done   { background:#1d4ed8; color:#fff; }
    .rp-step-dot.active { background:#dbeafe; color:#1d4ed8; box-shadow:0 0 0 3px rgba(29,78,216,.15); }
    .rp-step-dot.idle   { background:#f1f5f9; color:#94a3b8; }
    .rp-step-line       { flex:1; height:2px; margin:0 4px; }
    .rp-step-line.done  { background:#1d4ed8; }
    .rp-step-line.idle  { background:#e2e8f0; }

    /* Icon */
    .rp-icon {
      width:52px; height:52px; border-radius:14px;
      background:linear-gradient(135deg,#eff6ff,#dbeafe);
      border:1px solid #bfdbfe;
      display:flex; align-items:center; justify-content:center; margin-bottom:20px;
    }
    .rp-title { font-family:'Playfair Display',serif; font-size:26px; color:#0f172a; margin:0 0 6px; letter-spacing:-.3px; }
    .rp-sub   { font-size:14px; color:#64748b; margin:0 0 22px; line-height:1.6; }

    /* Field */
    .rp-field  { margin-bottom:14px; }
    .rp-label  { display:block; font-size:12.5px; font-weight:600; color:#374151; margin-bottom:7px; letter-spacing:.2px; }
    .rp-wrap   { position:relative; }
    .rp-input  {
      width:100%; padding:11px 14px; border:1.5px solid #e2e8f0; border-radius:10px;
      font-size:14px; font-family:'DM Sans',sans-serif; color:#0f172a; background:#fafbff;
      transition:border-color .18s,box-shadow .18s,background .18s; outline:none; box-sizing:border-box;
    }
    .rp-input.padded { padding-right:42px; }
    .rp-input::placeholder { color:#b0bac9; }
    .rp-input:focus { border-color:#1d4ed8; background:#fff; box-shadow:0 0 0 3px rgba(29,78,216,.1); }

    /* Eye button */
    .rp-eye {
      position:absolute; right:12px; top:50%; transform:translateY(-50%);
      background:none; border:none; padding:4px; cursor:pointer;
      color:#94a3b8; display:flex; align-items:center; transition:color .15s;
    }
    .rp-eye:hover { color:#1d4ed8; }

    /* OTP hint */
    .rp-hint {
      display:inline-flex; align-items:center; gap:5px;
      font-size:11.5px; color:#1d4ed8; background:#eff6ff; border-radius:6px;
      padding:3px 9px; margin-top:6px;
    }

    /* OTP boxes */
    .rp-otp-row { display:flex; gap:8px; }
    .rp-otp-box {
      flex:1; min-width:0; height:48px; text-align:center;
      border:1.5px solid #e2e8f0; border-radius:10px;
      font-size:18px; font-weight:700; color:#0f172a; background:#fafbff;
      transition:border-color .18s,box-shadow .18s;
      outline:none; font-family:'DM Sans',sans-serif;
    }
    .rp-otp-box:focus { border-color:#1d4ed8; box-shadow:0 0 0 3px rgba(29,78,216,.1); background:#fff; }
    .rp-otp-box.filled { border-color:#1d4ed8; background:#eff6ff; }

    /* Strength bar */
    .rp-bars { display:flex; gap:4px; margin-top:7px; }
    .rp-bar  { height:3px; flex:1; border-radius:10px; background:#e2e8f0; transition:background .3s; }
    .rp-bar.s1 { background:#ef4444; }
    .rp-bar.s2 { background:#f97316; }
    .rp-bar.s3 { background:#eab308; }
    .rp-bar.s4 { background:#22c55e; }
    .rp-strength-label { font-size:11px; margin-top:4px; font-weight:500; }
    .rp-strength-label.s1{color:#ef4444} .rp-strength-label.s2{color:#f97316}
    .rp-strength-label.s3{color:#eab308} .rp-strength-label.s4{color:#22c55e}

    /* Match indicator */
    .rp-match { font-size:11.5px; margin-top:5px; font-weight:500; }
    .rp-match.ok  { color:#22c55e; }
    .rp-match.err { color:#ef4444; }

    /* Divider */
    .rp-divider { height:1px; background:#f1f5f9; margin:16px 0; }

    /* Button */
    .rp-btn {
      width:100%; padding:12px; border-radius:10px; border:none;
      background:linear-gradient(135deg,#1d4ed8,#1a3a8f); color:#fff;
      font-size:14.5px; font-weight:600; font-family:'DM Sans',sans-serif;
      cursor:pointer; transition:opacity .15s,transform .15s,box-shadow .15s;
      position:relative; overflow:hidden;
    }
    .rp-btn::after {
      content:''; position:absolute; inset:0;
      background:linear-gradient(90deg,transparent,rgba(255,255,255,.1),transparent);
      transform:translateX(-100%); transition:transform .5s;
    }
    .rp-btn:hover:not(:disabled)::after { transform:translateX(100%); }
    .rp-btn:hover:not(:disabled) { box-shadow:0 4px 18px rgba(29,78,216,.35); transform:translateY(-1px); }
    .rp-btn:active:not(:disabled) { transform:translateY(0); }
    .rp-btn:disabled { opacity:.55; cursor:not-allowed; }

    .rp-back { display:flex; align-items:center; justify-content:center; gap:6px; margin-top:20px; font-size:13px; color:#64748b; }
    .rp-back a { color:#1d4ed8; font-weight:600; text-decoration:none; }
    .rp-back a:hover { text-decoration:underline; }

    .rp-dots span { display:inline-block; width:5px; height:5px; border-radius:50%; background:#fff; margin:0 2px; animation:rpDot 1s ease infinite; }
    .rp-dots span:nth-child(2){animation-delay:.15s} .rp-dots span:nth-child(3){animation-delay:.3s}
    @keyframes rpDot { 0%,80%,100%{transform:scale(.6);opacity:.4} 40%{transform:scale(1);opacity:1} }

    @media(max-width:480px){
      .rp-card{padding:32px 20px 28px;border-radius:16px;max-width:100%;}
      .rp-title{font-size:22px;} .rp-sub{font-size:13px;}
      .rp-otp-box{height:44px;font-size:16px;}
    }
    @media(max-width:360px){
      .rp-card{padding:28px 14px 24px;}
      .rp-otp-row{gap:6px;}
    }
  `}</style>
);

/* ── Eye icons ── */
const EyeOpen = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

/* ── Strength scorer ── */
function getStrength(pwd) {
  let s = 0;
  if (pwd.length >= 8) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/[0-9]/.test(pwd)) s++;
  if (/[@$!%*?&]/.test(pwd)) s++;
  return s;
}
const strengthLabel = ['','Weak','Fair','Good','Strong'];

/* ── OTP 6-box input ── */
function OtpInput({ value, onChange }) {
  const digits = (value + '      ').slice(0, 6).split('');

  const handleKey = (e, idx) => {
    const key = e.key;
    if (key === 'Backspace') {
      const next = value.slice(0, idx) + value.slice(idx + 1);
      onChange(next);
      if (idx > 0) document.getElementById(`otp-${idx - 1}`)?.focus();
      return;
    }
    if (!/^\d$/.test(key)) return;
    const next = value.slice(0, idx) + key + value.slice(idx + 1);
    onChange(next.slice(0, 6).replace(/\s/g, ''));
    if (idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6);
    onChange(pasted);
    document.getElementById(`otp-${Math.min(pasted.length, 5)}`)?.focus();
  };

  return (
    <div className="rp-otp-row">
      {digits.map((d, i) => (
        <input
          key={i}
          id={`otp-${i}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d.trim()}
          onChange={() => {}} // handled by onKeyDown
          onKeyDown={e => handleKey(e, i)}
          onPaste={handlePaste}
          onFocus={e => e.target.select()}
          className={`rp-otp-box${d.trim() ? ' filled' : ''}`}
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
        />
      ))}
    </div>
  );
}

function ResetPassword() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { toasts, removeToast, toast } = useToast();

  const [form, setForm] = useState({
    email:           location.state?.email || '',
    otp:             '',
    password:        '',
    confirmPassword: '',
  });
  const [loading,  setLoading]  = useState(false);
  const [showPwd,  setShowPwd]  = useState(false);
  const [showCPwd, setShowCPwd] = useState(false);

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  const strength = getStrength(form.password);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.otp || !form.password || !form.confirmPassword) {
      toast.warning("Incomplete form", "Please fill in all fields before submitting."); return;
    }
    if (form.otp.length < 6) {
      toast.error("Invalid OTP", "Please enter the complete 6-digit OTP."); return;
    }
    if (!passwordRegex.test(form.password)) {
      toast.error("Weak password", "Must be 8+ chars with uppercase, lowercase, number & special character."); return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords don't match", "Please make sure both password fields are identical."); return;
    }

    try {
      setLoading(true);
      await api.post("/auth/reset-password-otp", {
        email: form.email, otp: form.otp, password: form.password,
      });
      toast.success("Password reset!", "Your password has been updated. Redirecting to login…");
      setTimeout(() => navigate("/login"), 1800);
    } catch (err) {
      toast.error("Reset failed", err.response?.data?.msg || "Invalid or expired OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const pwdMatch = form.confirmPassword.length > 0;

  return (
    <>
      <Styles />
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="rp-root">
        <div className="rp-card">

          {/* Step indicator */}
          <div className="rp-steps">
            <div className="rp-step-dot done">✓</div>
            <div className="rp-step-line done" />
            <div className="rp-step-dot active">2</div>
            <div className="rp-step-line idle" />
            <div className="rp-step-dot idle">3</div>
          </div>

          {/* Icon */}
          <div className="rp-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="11" width="18" height="11" rx="2" stroke="#1d4ed8" strokeWidth="1.8"/>
              <path d="M7 11V7a5 5 0 0110 0v4" stroke="#1d4ed8" strokeWidth="1.8" strokeLinecap="round"/>
              <circle cx="12" cy="16" r="1.5" fill="#1d4ed8"/>
            </svg>
          </div>

          <h1 className="rp-title">Reset Password</h1>
          <p className="rp-sub">Enter the OTP sent to your email and choose a strong new password.</p>

          <form onSubmit={handleSubmit}>

            {/* EMAIL */}
            <div className="rp-field">
              <label className="rp-label" htmlFor="rp-email">Email address</label>
              <input
                id="rp-email" name="email" type="email" placeholder="you@example.com"
                value={form.email} onChange={handleChange}
                className="rp-input" autoComplete="email"
              />
            </div>

            {/* OTP — 6 individual boxes */}
            <div className="rp-field">
              <label className="rp-label">One-Time Password</label>
              <OtpInput value={form.otp} onChange={otp => setForm(p => ({ ...p, otp }))} />
              {form.otp.length > 0 && form.otp.length < 6 && (
                <div className="rp-hint">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
                  {6 - form.otp.length} more digit{6 - form.otp.length !== 1 ? 's' : ''} needed
                </div>
              )}
            </div>

            <div className="rp-divider" />

            {/* NEW PASSWORD */}
            <div className="rp-field">
              <label className="rp-label" htmlFor="rp-pwd">New Password</label>
              <div className="rp-wrap">
                <input
                  id="rp-pwd" name="password" type={showPwd ? "text" : "password"}
                  placeholder="Min 8 chars — e.g. DemoPass@123"
                  value={form.password} onChange={handleChange}
                  className="rp-input padded" autoComplete="new-password"
                />
                <button type="button" className="rp-eye" onClick={() => setShowPwd(p => !p)} tabIndex={-1}
                  aria-label={showPwd ? "Hide" : "Show"}>
                  {showPwd ? <EyeOff/> : <EyeOpen/>}
                </button>
              </div>
              {form.password.length > 0 && (
                <>
                  <div className="rp-bars">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`rp-bar${strength >= i ? ` s${strength}` : ''}`} />
                    ))}
                  </div>
                  <div className={`rp-strength-label s${strength}`}>{strengthLabel[strength]} password</div>
                </>
              )}
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="rp-field">
              <label className="rp-label" htmlFor="rp-cpwd">Confirm Password</label>
              <div className="rp-wrap">
                <input
                  id="rp-cpwd" name="confirmPassword" type={showCPwd ? "text" : "password"}
                  placeholder="Re-enter your new password"
                  value={form.confirmPassword} onChange={handleChange}
                  className="rp-input padded" autoComplete="new-password"
                  style={{
                    borderColor: pwdMatch
                      ? form.confirmPassword === form.password ? '#22c55e' : '#ef4444'
                      : undefined,
                  }}
                />
                <button type="button" className="rp-eye" onClick={() => setShowCPwd(p => !p)} tabIndex={-1}
                  aria-label={showCPwd ? "Hide" : "Show"}>
                  {showCPwd ? <EyeOff/> : <EyeOpen/>}
                </button>
              </div>
              {pwdMatch && (
                <div className={`rp-match ${form.confirmPassword === form.password ? 'ok' : 'err'}`}>
                  {form.confirmPassword === form.password ? '✓ Passwords match' : '✗ Passwords do not match'}
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className="rp-btn">
              {loading
                ? <span className="rp-dots"><span/><span/><span/></span>
                : "Reset Password →"
              }
            </button>
          </form>

          <div className="rp-back">
            Remembered it?&nbsp;<NavLink to="/login">Back to Login</NavLink>
          </div>

        </div>
      </div>
    </>
  );
}

export default ResetPassword;