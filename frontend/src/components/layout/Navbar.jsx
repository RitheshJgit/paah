import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import ProfileDropdown from './ProfileDropdown';

/* ─────────────────────────────────────────────────────────────────────────────
   STYLES
───────────────────────────────────────────────────────────────────────────── */
const NavbarStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap');
    .paah-brand-font { font-family: 'Playfair Display', serif; }

    /* ── Logo ── */
    .nav-logo-img {
      height: 30px; width: auto; object-fit: contain; display: block;
      transition: opacity 0.18s, transform 0.18s;
      will-change: transform;
    }
    .nav-logo-wrap:hover .nav-logo-img { opacity: 0.82; transform: scale(1.05); }

    /* ── Desktop nav link ── */
    .nav-lk {
      font-size: 13.5px; font-weight: 500; padding: 6px 13px; border-radius: 8px;
      text-decoration: none; white-space: nowrap; color: #6b7280;
      transition: color 0.14s, background 0.14s;
      will-change: color;
    }
    .nav-lk:hover { color: #111827; background: #f9fafb; }
    .nav-lk.lk-active { color: #1d4ed8; background: #eff6ff; font-weight: 600; }

    /* ── AI Verify pill ── */
    .nav-ai-link {
      display: inline-flex; align-items: center; gap: 5px;
      font-size: 12px; font-weight: 700; padding: 5px 12px; border-radius: 7px;
      text-decoration: none; letter-spacing: 0.3px; flex-shrink: 0;
      background: linear-gradient(135deg, #1d4ed8, #1a3a8f); color: #fff !important;
      border: 1px solid transparent; position: relative; overflow: hidden;
      transition: box-shadow 0.18s, background 0.18s;
      will-change: box-shadow;
    }
    .nav-ai-link::before {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,.11), transparent);
      transform: translateX(-100%); transition: transform 0.42s ease;
    }
    .nav-ai-link:hover::before { transform: translateX(100%); }
    .nav-ai-link:hover { box-shadow: 0 2px 16px rgba(37,99,235,.38); background: linear-gradient(135deg,#2563eb,#1d4ed8); }
    .nav-ai-link.active-ai { box-shadow: 0 0 0 2px #3b82f6; }
    .nav-ai-dot {
      width: 5px; height: 5px; border-radius: 50%; background: #93c5fd;
      animation: naiPulse 1.8s ease infinite; will-change: opacity, transform;
    }
    @keyframes naiPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.72)} }

    /* ── Hamburger ── */
    .nav-hbg {
      display: none; flex-direction: column; justify-content: center; align-items: center;
      gap: 5px; width: 38px; height: 38px; background: none; border: none;
      cursor: pointer; border-radius: 8px; flex-shrink: 0;
      transition: background 0.14s; will-change: background;
    }
    .nav-hbg:hover { background: #f3f4f6; }
    .nav-hbg span {
      display: block; width: 20px; height: 2px; background: #374151; border-radius: 2px;
      transition: transform 0.26s cubic-bezier(.4,0,.2,1), opacity 0.26s cubic-bezier(.4,0,.2,1);
      transform-origin: center; will-change: transform, opacity;
    }
    .nav-hbg.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
    .nav-hbg.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
    .nav-hbg.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

    /* ── Mobile drawer ── */
    .nav-drawer {
      position: fixed; top: 64px; left: 0; right: 0; bottom: 0;
      background: #fff; z-index: 49; overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      animation: drawerIn 0.23s cubic-bezier(.32,.72,0,1) both;
      will-change: transform, opacity;
    }
    @keyframes drawerIn {
      from { opacity: 0; transform: translateY(-8px) scaleY(.97); }
      to   { opacity: 1; transform: translateY(0)    scaleY(1); }
    }
    .nav-drawer-inner { padding: 12px 18px 44px; }

    /* drawer section */
    .nd-section {
      font-size: 9.5px; font-weight: 700; letter-spacing: 1.8px;
      text-transform: uppercase; color: #c4c9d4;
      padding: 18px 6px 8px;
    }
    .nd-section:first-child { padding-top: 4px; }

    /* drawer link */
    .nd-link {
      display: flex; align-items: center; gap: 11px; padding: 11px 12px;
      border-radius: 10px; font-size: 14px; font-weight: 500; color: #374151;
      text-decoration: none; transition: background 0.11s, color 0.11s;
      will-change: background;
    }
    .nd-link:hover  { background: #f3f4f6; color: #111827; }
    .nd-link.nd-active { background: #eff6ff; color: #1d4ed8; font-weight: 600; }
    .nd-link .dicon {
      width: 32px; height: 32px; border-radius: 8px; background: #f9fafb;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      transition: background 0.11s;
    }
    .nd-link.nd-active .dicon { background: #dbeafe; }

    /* drawer AI link */
    .nd-ai {
      display: flex; align-items: center; gap: 11px; padding: 11px 12px;
      border-radius: 10px; font-size: 14px; font-weight: 600;
      text-decoration: none; color: #fff;
      background: linear-gradient(135deg, #1e3a8a, #1d4ed8);
      transition: opacity 0.14s, box-shadow 0.14s;
    }
    .nd-ai:hover { opacity: .9; box-shadow: 0 4px 18px rgba(29,78,216,.28); }
    .nd-ai .dicon { background: rgba(255,255,255,.18); }

    /* drawer user card */
    .nd-user {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 12px 10px; margin-bottom: 2px;
      background: #f8faff; border-radius: 12px; border: 1px solid #e0e7ff;
    }
    .nd-avatar {
      width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
      background: linear-gradient(135deg, #1d4ed8, #1a3a8f);
      color: #fff; font-size: 15px; font-weight: 700;
      display: flex; align-items: center; justify-content: center; letter-spacing: .5px;
    }
    .nd-uname { font-size: 14px; font-weight: 600; color: #111827; }
    .nd-urole {
      display: inline-block; margin-top: 3px; padding: 1px 8px; border-radius: 100px;
      font-size: 10px; font-weight: 600; background: #eff6ff; color: #1d4ed8; text-transform: capitalize;
    }
    .nd-divider { height: 1px; background: #f1f3f7; margin: 10px 0; }
    .nd-logout {
      display: flex; align-items: center; gap: 11px; padding: 11px 12px;
      border-radius: 10px; font-size: 14px; font-weight: 500; color: #dc2626;
      background: none; border: none; width: 100%; cursor: pointer; font-family: inherit;
      transition: background 0.11s;
    }
    .nd-logout:hover { background: #fef2f2; }
    .nd-logout .dicon { background: #fef2f2; }

    /* ── Responsive ── */
    @media (max-width: 900px) { .nav-desktop-links { display: none !important; } .nav-hbg { display: flex; } }
    @media (max-width: 380px) {
      .nav-root { padding: 0 14px !important; }
      .nav-drawer-inner { padding: 10px 14px 36px; }
      .nd-link { padding: 10px 11px; font-size: 13.5px; }
      .nav-logo-img { height: 26px; }
    }
  `}</style>
);

/* ─────────────────────────────────────────────────────────────────────────────
   ICONS
───────────────────────────────────────────────────────────────────────────── */
const Ic = {
  Home:      () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Board:     () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>,
  About:     () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>,
  Users:     () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  Login:     () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>,
  Signup:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>,
  Donate:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/></svg>,
  Teams:     () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  MyTeam:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 21v-2a6 6 0 016-6h6a6 6 0 016 6v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Tasks:     () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,
  MyTasks:   () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>,
  History:   () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 3v5h5M3.05 13A9 9 0 106 5.3"/><path d="M12 7v5l3 3"/></svg>,
  Dashboard: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  Verify:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="20 6 9 17 4 12"/></svg>,
  Create:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  AI:        () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>,
  Logout:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>,
  Profile:   () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 18a4 4 0 014-4h8a4 4 0 014 4a2 2 0 01-2 2H6a2 2 0 01-2-2Z"/><circle cx="12" cy="7" r="3"/></svg>,
};

/* ─────────────────────────────────────────────────────────────────────────────
   DRAWER LINK HELPER
───────────────────────────────────────────────────────────────────────────── */
function DL({ to, icon, label, onClick, ai = false }) {
  const { pathname } = useLocation();
  if (ai) {
    return (
      <NavLink to={to} className="nd-ai" onClick={onClick}>
        <div className="dicon">
          <span style={{ width:5,height:5,borderRadius:'50%',background:'#93c5fd',display:'block',animation:'naiPulse 1.8s ease infinite' }} />
        </div>
        {label}
      </NavLink>
    );
  }
  return (
    <NavLink to={to} className={`nd-link${pathname === to ? ' nd-active' : ''}`} onClick={onClick}>
      <div className="dicon">{icon}</div>
      {label}
    </NavLink>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   NAVBAR
───────────────────────────────────────────────────────────────────────────── */
function Navbar() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const location         = useLocation();
  const [open, setOpen]  = useState(false);
  const drawerRef        = useRef(null);
  const hamburgerRef     = useRef(null);

  const close = () => setOpen(false);

  useEffect(() => { close(); }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const fn = (e) => {
      if (!drawerRef.current?.contains(e.target) && !hamburgerRef.current?.contains(e.target)) close();
    };
    document.addEventListener('mousedown', fn);
    document.addEventListener('touchstart', fn, { passive: true });
    return () => { document.removeEventListener('mousedown', fn); document.removeEventListener('touchstart', fn); };
  }, [open]);

  const lk = ({ isActive }) => `nav-lk${isActive ? ' lk-active' : ''}`;

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase()
    : 'U';

  const isUser  = user && user.role !== 'admin';
  const isAdmin = user?.role === 'admin';

  return (
    <>
      <NavbarStyles />

      {/* ── NAV BAR ── */}
      <nav
        className="nav-root bg-white border-b border-gray-100 h-16 flex items-center justify-between px-6 sm:px-8 sticky top-0 z-50"
        style={{ boxShadow: '0 1px 0 #eff1f5' }}
      >
        {/* LOGO */}
        <div
          className="nav-logo-wrap flex items-center gap-2 cursor-pointer select-none flex-shrink-0"
          onClick={() => navigate('/')}
          role="button"
          aria-label="PAAH home"
        >
          <img
            src="/logo-login.png"
            alt="PAAH"
            className="nav-logo-img"
            onError={e => { e.currentTarget.style.display = 'none'; }}
          />
          <span className="paah-brand-font text-blue-700 text-[20px] font-bold leading-none">PAAH</span>
        </div>

        {/* DESKTOP LINKS */}
        <div className="nav-desktop-links flex items-center gap-px mx-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          <NavLink to="/"            className={lk}>Home</NavLink>
          <NavLink to="/leaderboard" className={lk}>Leaderboard</NavLink>
          <NavLink to="/about"       className={lk}>About</NavLink>
          <NavLink to="/who-we-are"  className={lk}>Who We Are</NavLink>

          {!user && <>
            <NavLink to="/login"  className={lk}>Login</NavLink>
            <NavLink to="/signup" className={lk}>Signup</NavLink>
          </>}

          {isUser && <>
            <NavLink to="/donate"       className={lk}>Donate</NavLink>
            <NavLink to="/teams"        className={lk}>Teams</NavLink>
            <NavLink to="/my-team"      className={lk}>My Team</NavLink>
            <NavLink to="/tasks"        className={lk}>Tasks</NavLink>
            <NavLink to="/my-tasks"     className={lk}>My Tasks</NavLink>
            <NavLink to="/task-history" className={lk}>History</NavLink>
          </>}

          {isAdmin && <>
            <NavLink to="/admin/history"      className={lk}>Dashboard</NavLink>
            <NavLink to="/admin/donations"    className={lk}>Donations</NavLink>
            <NavLink to="/admin/create-task"  className={lk}>Create Task</NavLink>
            <NavLink to="/admin/verify-tasks" className={lk}>Verify Tasks</NavLink>
            <NavLink to="/admin/task-history" className={lk}>History</NavLink>
          </>}

          {user && (
            <NavLink to="/ai-verify" className={({ isActive }) => `nav-ai-link${isActive ? ' active-ai' : ''}`}>
              <span className="nav-ai-dot" />AI Verify
            </NavLink>
          )}
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="hidden sm:block"><ProfileDropdown /></div>
          <button
            ref={hamburgerRef}
            className={`nav-hbg${open ? ' open' : ''}`}
            onClick={() => setOpen(p => !p)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* ── DRAWER + BACKDROP ── */}
      {open && (
        <>
          <div
            onClick={close}
            style={{
              position:'fixed', inset:0, top:64,
              background:'rgba(0,0,0,0.26)',
              backdropFilter:'blur(3px)', WebkitBackdropFilter:'blur(3px)',
              zIndex:48, animation:'_bIn .2s ease both',
            }}
          />
          <style>{`@keyframes _bIn{from{opacity:0}to{opacity:1}}`}</style>

          <div className="nav-drawer" ref={drawerRef}>
            <div className="nav-drawer-inner">

              {user && (
                <div className="nd-user">
  <div className="nd-avatar">{initials}</div>
  <div>
    <div className="nd-uname">{user.name}</div>

    <span className="nd-urole">{user.role}</span>

    {/* 🔥 ADD THIS */}
    <div style={{
      fontSize: "12px",
      marginTop: "4px",
      color: "#2563eb",
      fontWeight: "600"
    }}>
      Credits: {user.credits || 0}
    </div>
  </div>
</div>
              )}

              <div className="nd-section">Navigation</div>
              <DL to="/"            icon={<Ic.Home/>}   label="Home"        onClick={close} />
              <DL to="/leaderboard" icon={<Ic.Board/>}  label="Leaderboard" onClick={close} />
              <DL to="/about"       icon={<Ic.About/>}  label="About"       onClick={close} />
              <DL to="/who-we-are"  icon={<Ic.Users/>}  label="Who We Are"  onClick={close} />

              {!user && <>
                <div className="nd-section">Account</div>
                <DL to="/login"  icon={<Ic.Login/>}  label="Login"  onClick={close} />
                <DL to="/signup" icon={<Ic.Signup/>} label="Signup" onClick={close} />
              </>}

              {isUser && <>
                <div className="nd-section">My Account</div>
                <DL to="/profile"      icon={<Ic.Profile/>}    label="Profile"      onClick={close} />
                <DL to="/dashboard"    icon={<Ic.Dashboard/>}  label="Dashboard"    onClick={close} />
                <DL to="/donate"       icon={<Ic.Donate/>}     label="Donate"       onClick={close} />
                <DL to="/teams"        icon={<Ic.Teams/>}      label="Teams"        onClick={close} />
                <DL to="/my-team"      icon={<Ic.MyTeam/>}     label="My Team"      onClick={close} />
                <DL to="/tasks"        icon={<Ic.Tasks/>}      label="Tasks"        onClick={close} />
                <DL to="/my-tasks"     icon={<Ic.MyTasks/>}    label="My Tasks"     onClick={close} />
                <DL to="/task-history" icon={<Ic.History/>}    label="Task History" onClick={close} />
              </>}

              {isAdmin && <>
                <div className="nd-section">Admin</div>
                <DL to="/admin/history"      icon={<Ic.Dashboard/>} label="Dashboard"        onClick={close} />
                <DL to="/admin/donations"    icon={<Ic.Donate/>}    label="Verify Donations" onClick={close} />
                <DL to="/admin/create-task"  icon={<Ic.Create/>}    label="Create Task"      onClick={close} />
                <DL to="/admin/verify-tasks" icon={<Ic.Verify/>}    label="Verify Tasks"     onClick={close} />
                <DL to="/admin/task-history" icon={<Ic.History/>}   label="History"          onClick={close} />
              </>}

              {user && <>
                <div className="nd-section">AI Tools</div>
                <DL to="/ai-verify" icon={<Ic.AI/>} label="AI Verify" onClick={close} ai />
              </>}

              {user && <>
                <div className="nd-divider" style={{ marginTop: 14 }} />
                <button className="nd-logout" onClick={() => { logout(); navigate('/'); close(); }}>
                  <div className="dicon"><Ic.Logout /></div>
                  Logout
                </button>
              </>}

            </div>
          </div>
        </>
      )}
    </>
  );
}

export default Navbar;