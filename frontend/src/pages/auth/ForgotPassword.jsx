import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import api from "../../services/api";
import { useToast, ToastContainer } from "./Toast";

const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap');

    .fp-root {
      min-height: 100vh; display: flex;
      align-items: center; justify-content: center;
      background: #f0f4ff; padding: 20px 16px;
      font-family: 'DM Sans', sans-serif;
    }
    .fp-root::before {
      content: ''; position: fixed; inset: 0;
      background-image:
        linear-gradient(rgba(29,78,216,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(29,78,216,0.04) 1px, transparent 1px);
      background-size: 40px 40px; pointer-events: none;
    }
    .fp-card {
      background: #fff; border-radius: 20px;
      border: 1px solid #e0e7ff;
      box-shadow: 0 4px 40px rgba(29,78,216,0.08), 0 1px 4px rgba(0,0,0,0.04);
      padding: 40px 36px 36px; width: 100%; max-width: 420px;
      position: relative; animation: fpIn .35s cubic-bezier(.4,0,.2,1) both;
    }
    @keyframes fpIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
    .fp-card::before {
      content: ''; position: absolute;
      top:0; left:32px; right:32px; height:3px;
      border-radius:0 0 4px 4px;
      background:linear-gradient(90deg,#1d4ed8,#60a5fa);
    }
    .fp-icon {
      width:52px; height:52px; border-radius:14px;
      background:linear-gradient(135deg,#eff6ff,#dbeafe);
      border:1px solid #bfdbfe;
      display:flex; align-items:center; justify-content:center;
      margin-bottom:20px;
    }
    .fp-title { font-family:'Playfair Display',serif; font-size:26px; color:#0f172a; margin:0 0 6px; letter-spacing:-.3px; }
    .fp-sub   { font-size:14px; color:#64748b; margin:0 0 24px; line-height:1.6; }
    .fp-label { display:block; font-size:12.5px; font-weight:600; color:#374151; margin-bottom:7px; letter-spacing:.2px; }
    .fp-input {
      width:100%; padding:11px 14px; border:1.5px solid #e2e8f0; border-radius:10px;
      font-size:14px; font-family:'DM Sans',sans-serif; color:#0f172a; background:#fafbff;
      transition:border-color .18s,box-shadow .18s,background .18s; outline:none; box-sizing:border-box;
    }
    .fp-input::placeholder { color:#b0bac9; }
    .fp-input:focus { border-color:#1d4ed8; background:#fff; box-shadow:0 0 0 3px rgba(29,78,216,.1); }
    .fp-btn {
      width:100%; padding:12px; border-radius:10px; border:none;
      background:linear-gradient(135deg,#1d4ed8,#1a3a8f); color:#fff;
      font-size:14.5px; font-weight:600; font-family:'DM Sans',sans-serif;
      cursor:pointer; margin-top:20px;
      transition:opacity .15s,transform .15s,box-shadow .15s;
      position:relative; overflow:hidden;
    }
    .fp-btn::after {
      content:''; position:absolute; inset:0;
      background:linear-gradient(90deg,transparent,rgba(255,255,255,.1),transparent);
      transform:translateX(-100%); transition:transform .5s;
    }
    .fp-btn:hover:not(:disabled)::after { transform:translateX(100%); }
    .fp-btn:hover:not(:disabled) { box-shadow:0 4px 18px rgba(29,78,216,.35); transform:translateY(-1px); }
    .fp-btn:active:not(:disabled) { transform:translateY(0); }
    .fp-btn:disabled { opacity:.55; cursor:not-allowed; }
    .fp-back { display:flex; align-items:center; justify-content:center; gap:6px; margin-top:20px; font-size:13px; color:#64748b; }
    .fp-back a { color:#1d4ed8; font-weight:600; text-decoration:none; }
    .fp-back a:hover { text-decoration:underline; }
    .fp-dots span { display:inline-block; width:5px; height:5px; border-radius:50%; background:#fff; margin:0 2px; animation:fpDot 1s ease infinite; }
    .fp-dots span:nth-child(2) { animation-delay:.15s; }
    .fp-dots span:nth-child(3) { animation-delay:.3s; }
    @keyframes fpDot { 0%,80%,100%{transform:scale(.6);opacity:.4} 40%{transform:scale(1);opacity:1} }

    /* Step indicator */
    .fp-steps { display:flex; align-items:center; margin-bottom:28px; }
    .fp-step-dot {
      width:28px; height:28px; border-radius:50%; flex-shrink:0;
      display:flex; align-items:center; justify-content:center;
      font-size:11px; font-weight:700; transition:all .2s;
    }
    .fp-step-dot.active { background:#1d4ed8; color:#fff; box-shadow:0 0 0 4px rgba(29,78,216,.15); }
    .fp-step-dot.idle   { background:#f1f5f9; color:#94a3b8; }
    .fp-step-line { flex:1; height:2px; background:#e2e8f0; margin:0 4px; }

    @media(max-width:480px){ .fp-card{padding:32px 20px 28px;border-radius:16px;} .fp-title{font-size:22px;} .fp-sub{font-size:13px;} }
    @media(max-width:360px){ .fp-card{padding:28px 14px 24px;} }
  `}</style>
);

function ForgotPassword() {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toasts, removeToast, toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { toast.warning("Email required", "Please enter your registered email address."); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { toast.error("Invalid email", "Please enter a valid email format."); return; }

    try {
      setLoading(true);
      await api.post("/auth/send-otp", { email });
      toast.success("OTP sent!", `A 6-digit code has been sent to ${email}.`);
      setTimeout(() => navigate("/reset-password", { state: { email } }), 1500);
    } catch (err) {
      toast.error("Failed to send OTP", err.response?.data?.msg || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Styles />
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="fp-root">
        <div className="fp-card">

          {/* Step indicator */}
          <div className="fp-steps">
            <div className="fp-step-dot active">1</div>
            <div className="fp-step-line" />
            <div className="fp-step-dot idle">2</div>
            <div className="fp-step-line" />
            <div className="fp-step-dot idle">3</div>
          </div>

          {/* Icon */}
          <div className="fp-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2z" stroke="#1d4ed8" strokeWidth="1.8" strokeLinejoin="round"/>
              <path d="M22 6l-10 7L2 6" stroke="#1d4ed8" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>

          <h1 className="fp-title">Forgot Password?</h1>
          <p className="fp-sub">No worries. Enter your registered email and we'll send a one-time password right away.</p>

          <form onSubmit={handleSubmit}>
            <label className="fp-label" htmlFor="fp-email">Email address</label>
            <input
              id="fp-email" type="email" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)}
              className="fp-input" autoComplete="email" autoFocus
            />
            <button type="submit" disabled={loading} className="fp-btn">
              {loading ? <span className="fp-dots"><span/><span/><span/></span> : "Send OTP →"}
            </button>
          </form>

          <div className="fp-back">
            Remember your password?&nbsp;<NavLink to="/login">Back to Login</NavLink>
          </div>

        </div>
      </div>
    </>
  );
}

export default ForgotPassword;