import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

/* ═══════════════════════════════════════════
   ICONS
═══════════════════════════════════════════ */
const Ico = {
  Twitter: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  LinkedIn: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  Instagram: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  ),
  Mail: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 7 10 7 10-7" />
    </svg>
  ),
  Phone: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.58 3.5 2 2 0 0 1 3.55 1.32h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.07 6.07l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  Location: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  ),
  ArrowRight: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
};

/* ═══════════════════════════════════════════
   ALL PUBLIC + USER ROUTES (no admin)
═══════════════════════════════════════════ */
const NAV_COLS = [
  {
    title: 'Discover',
    links: [
      { label: 'Home',        to: '/' },
      { label: 'About PAAH',  to: '/about' },
      { label: 'Who We Are',  to: '/who-we-are' },
      { label: 'Leaderboard', to: '/leaderboard' },
    ],
  },
  {
    title: 'My Space',
    links: [
      { label: 'Dashboard',   to: '/dashboard' },
      { label: 'Profile',     to: '/profile' },
      { label: 'My Team',     to: '/my-team' },
      { label: 'Find a Team', to: '/team-search' },
    ],
  },
  {
    title: 'Tasks',
    links: [
      { label: 'Browse Tasks', to: '/tasks' },
      { label: 'My Tasks',     to: '/my-tasks' },
      { label: 'Task History', to: '/task-history' },
      { label: 'AI Verifier',  to: '/ai-verify' },
    ],
  },
  {
    title: 'Act Now',
    links: [
      { label: 'Donate',      to: '/donate' },
      { label: 'Join a Team', to: '/teams' },
      { label: 'Sign Up',     to: '/signup' },
      { label: 'Log In',      to: '/login' },
    ],
  },
];

const SOCIALS = [
  { name: 'Twitter',   href: 'https://twitter.com',   Icon: Ico.Twitter },
  { name: 'LinkedIn',  href: 'https://linkedin.com',  Icon: Ico.LinkedIn },
  { name: 'Instagram', href: 'https://instagram.com', Icon: Ico.Instagram },
];

const LEGAL = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Use',   href: '/terms' },
  { label: 'Accessibility',  href: '/accessibility' },
];

/* ═══════════════════════════════════════════
   NEWSLETTER
═══════════════════════════════════════════ */
function Newsletter() {
  const [email, setEmail]   = useState('');
  const [status, setStatus] = useState('idle');

  const submit = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) { setStatus('error'); return; }
    setStatus('loading');
    setTimeout(() => { setStatus('success'); setEmail(''); }, 1100);
  };

  return (
    <div className="nl-wrap">
      <h3 className="ft-col-title">Stay Updated</h3>
      <p className="nl-sub">Impact reports &amp; community news, straight to your inbox.</p>
      {status === 'success' ? (
        <div className="nl-success"><Ico.Check /> Subscribed — thank you!</div>
      ) : (
        <form onSubmit={submit} className="nl-form" noValidate>
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); if (status === 'error') setStatus('idle'); }}
            placeholder="your@email.com"
            className={`nl-input ${status === 'error' ? 'nl-err-border' : ''}`}
          />
          <button
            type="submit"
            className="nl-btn"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? <span className="nl-spinner" /> : <Ico.ArrowRight />}
          </button>
        </form>
      )}
      {status === 'error' && <p className="nl-err-msg">Please enter a valid email.</p>}
    </div>
  );
}

/* ═══════════════════════════════════════════
   FOOTER
═══════════════════════════════════════════ */
function Footer() {
  const { pathname } = useLocation();
  const year = new Date().getFullYear();

  return (
    <footer className="ft-root">
      <style>{CSS}</style>

      {/* gold shimmer rule */}
      <div className="ft-top-rule" />

      {/* ── MAIN BODY ── */}
      <div className="ft-body">

        {/* BRAND COL */}
        <div className="ft-brand">
          <div className="ft-logo">
            <span className="ft-logo-p">P</span>
            <span className="ft-logo-aah">AAH</span>
          </div>
          <p className="ft-org-name">Poverty Awareness &amp; Action Hub</p>
          <p className="ft-tagline">
            Empowering communities through transparent action, verified
            donations, and collaborative change. Every contribution tracked.
            Every impact counted.
          </p>

          <div className="ft-socials">
            {SOCIALS.map(({ name, href, Icon }) => (
              <a key={name} href={href} target="_blank" rel="noreferrer"
                className="ft-social" aria-label={name}>
                <Icon />
              </a>
            ))}
          </div>

          <div className="ft-contacts">
            <a href="mailto:support@paah.org" className="ft-contact">
              <Ico.Mail /> support@paah.org
            </a>
            <a href="tel:+919876543210" className="ft-contact">
              <Ico.Phone /> +91 98765 43210
            </a>
            <span className="ft-contact">
              <Ico.Location /> Chennai, Tamil Nadu, India
            </span>
          </div>
        </div>

        {/* NAV COLS */}
        {NAV_COLS.map(({ title, links }) => (
          <div key={title} className="ft-nav-col">
            <h3 className="ft-col-title">{title}</h3>
            <ul className="ft-link-list">
              {links.map(({ label, to }) => {
                const active = pathname === to;
                return (
                  <li key={to}>
                    <Link to={to} className={`ft-link${active ? ' ft-link--on' : ''}`}>
                      <span className="ft-pip" />
                      {label}
                      {active && <span className="ft-curr">now</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        {/* NEWSLETTER */}
        <div className="ft-nl-col">
          <Newsletter />
        </div>

      </div>

      {/* ── BOTTOM BAR ── */}
      <div className="ft-bar-wrap">
        <div className="ft-bar">
          <p className="ft-copy">© {year} PAAH — Poverty Awareness &amp; Action Hub.</p>

          <div className="ft-status">
            <span className="ft-pulse" />
            All systems operational
          </div>

          <div className="ft-legal">
            {LEGAL.map(({ label, href }, i) => (
              <span key={href} className="ft-legal-item">
                {i > 0 && <span className="ft-sep" />}
                <a href={href} className="ft-legal-link">{label}</a>
              </span>
            ))}
          </div>
        </div>
      </div>

    </footer>
  );
}

/* ═══════════════════════════════════════════
   CSS
═══════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

.ft-root {
  --gold:      #c4a882;
  --gold-dim:  #7a6a55;
  --cream:     #e8d5b8;
  --bg:        #0d0a07;
  --border:    rgba(122,106,85,0.13);
  --dim:       #3a2e22;
  --mid:       #5a4a38;

  background: var(--bg);
  color: var(--mid);
  font-family: 'DM Sans', sans-serif;
  margin-top: auto;
}

/* ── shimmer rule ── */
.ft-top-rule {
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    #3a2e20 12%,
    var(--gold) 38%,
    var(--cream) 50%,
    var(--gold) 62%,
    #3a2e20 88%,
    transparent 100%
  );
}

/* ══════════════
   BODY GRID
══════════════ */
.ft-body {
  max-width: 1200px;
  margin: 0 auto;
  padding: 52px 40px 44px;
  display: grid;
  /* brand | 4 nav cols | newsletter */
  grid-template-columns: 1.8fr 1fr 1fr 1fr 1fr 1.5fr;
  gap: 36px;
  align-items: start;
}

/* ── BRAND ── */
.ft-brand { display: flex; flex-direction: column; gap: 15px; }

.ft-logo { display: flex; align-items: baseline; line-height: 1; }
.ft-logo-p {
  font-family: 'Cormorant Garamond', serif;
  font-size: 42px; font-weight: 700; color: var(--cream); line-height: 1;
}
.ft-logo-aah {
  font-family: 'DM Sans', sans-serif;
  font-size: 22px; font-weight: 500; color: var(--gold);
  letter-spacing: 0.2em; padding-left: 3px;
}

.ft-org-name {
  font-size: 9.5px; font-weight: 500; color: var(--dim);
  text-transform: uppercase; letter-spacing: 1.8px;
  margin: -6px 0 0;
}

.ft-tagline {
  font-size: 12.5px; font-weight: 300; color: var(--dim);
  line-height: 1.9; max-width: 256px; margin: 0;
}

/* socials */
.ft-socials { display: flex; gap: 7px; }
.ft-social {
  width: 34px; height: 34px; border-radius: 8px;
  border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  color: var(--gold-dim); text-decoration: none;
  transition: color .2s, border-color .2s, background .2s, transform .18s;
}
.ft-social:hover {
  color: var(--cream); border-color: var(--gold);
  background: rgba(196,168,130,.07); transform: translateY(-2px);
}

/* contacts */
.ft-contacts { display: flex; flex-direction: column; gap: 9px; }
.ft-contact {
  display: flex; align-items: center; gap: 9px;
  font-size: 12px; font-weight: 300; color: var(--mid);
  text-decoration: none; transition: color .18s; line-height: 1.3;
}
a.ft-contact:hover { color: var(--gold); }
.ft-contact svg { flex-shrink: 0; opacity: .6; }

/* ── NAV COL ── */
.ft-nav-col { display: flex; flex-direction: column; }

.ft-col-title {
  font-size: 9.5px; font-weight: 600;
  letter-spacing: .24em; text-transform: uppercase;
  color: var(--cream); margin: 0 0 18px;
}

.ft-link-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 1px; }

.ft-link {
  display: flex; align-items: center; gap: 9px;
  font-size: 13px; color: var(--mid); text-decoration: none;
  font-weight: 400; padding: 5px 0;
  transition: color .16s, gap .18s;
  white-space: nowrap;
}
.ft-link:hover        { color: var(--gold); gap: 11px; }
.ft-link--on          { color: var(--gold); }

.ft-pip {
  width: 4px; height: 4px; border-radius: 50%;
  background: var(--dim); flex-shrink: 0;
  transition: background .16s, transform .16s;
}
.ft-link:hover .ft-pip,
.ft-link--on   .ft-pip { background: var(--gold); transform: scale(1.5); }

.ft-curr {
  margin-left: auto;
  font-size: 9px; font-weight: 600;
  text-transform: uppercase; letter-spacing: .6px;
  color: var(--gold-dim);
  background: rgba(122,106,85,.1);
  padding: 1px 7px; border-radius: 100px;
}

/* ── NEWSLETTER COL ── */
.ft-nl-col {
  border-left: 1px solid var(--border);
  padding-left: 28px;
}

.nl-wrap { display: flex; flex-direction: column; gap: 8px; }
.nl-sub  { font-size: 12px; font-weight: 300; color: var(--dim); line-height: 1.6; margin: 0 0 6px; }

.nl-form {
  display: flex; gap: 6px;
}
.nl-input {
  flex: 1; min-width: 0;
  background: rgba(255,255,255,.025);
  border: 1px solid var(--border);
  border-radius: 8px; padding: 9px 12px;
  font-family: 'DM Sans', sans-serif;
  font-size: 12.5px; color: var(--cream); outline: none;
  transition: border-color .2s;
}
.nl-input::placeholder { color: #2e2418; }
.nl-input:focus        { border-color: rgba(196,168,130,.35); }
.nl-err-border         { border-color: rgba(220,80,60,.4) !important; }

.nl-btn {
  width: 38px; height: 38px; flex-shrink: 0;
  background: rgba(122,106,85,.12);
  border: 1px solid rgba(122,106,85,.25);
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  color: var(--gold); cursor: pointer;
  transition: background .2s, border-color .2s, transform .15s;
}
.nl-btn:hover:not(:disabled) {
  background: rgba(196,168,130,.18); border-color: var(--gold); transform: scale(1.06);
}
.nl-btn:disabled { opacity: .5; cursor: not-allowed; }

.nl-spinner {
  display: block; width: 14px; height: 14px;
  border: 2px solid rgba(196,168,130,.25);
  border-top-color: var(--gold);
  border-radius: 50%;
  animation: ft-spin .7s linear infinite;
}
@keyframes ft-spin { to { transform: rotate(360deg); } }

.nl-success {
  display: flex; align-items: center; gap: 8px;
  font-size: 12.5px; font-weight: 500; color: #7ab87a;
  background: rgba(122,184,122,.07);
  border: 1px solid rgba(122,184,122,.18);
  border-radius: 8px; padding: 10px 14px;
}
.nl-err-msg { font-size: 11.5px; color: #c4735a; margin: 0; }

/* ══════════════
   BOTTOM BAR
══════════════ */
.ft-bar-wrap {
  border-top: 1px solid var(--border);
  background: rgba(0,0,0,.22);
}
.ft-bar {
  max-width: 1200px; margin: 0 auto;
  padding: 16px 40px;
  display: flex; align-items: center;
  justify-content: space-between; flex-wrap: wrap; gap: 10px;
}

.ft-copy {
  font-size: 11.5px; color: var(--dim); font-weight: 400; margin: 0;
}

.ft-status {
  display: flex; align-items: center; gap: 7px;
  font-size: 11px; color: var(--dim);
}
.ft-pulse {
  width: 7px; height: 7px; border-radius: 50%;
  background: #3d7a3d;
  box-shadow: 0 0 0 2px rgba(61,122,61,.18);
  animation: ft-pulse 2.8s ease-in-out infinite; flex-shrink: 0;
}
@keyframes ft-pulse {
  0%,100% { box-shadow: 0 0 0 2px rgba(61,122,61,.18); }
  50%     { box-shadow: 0 0 0 5px rgba(61,122,61,.06); }
}

.ft-legal { display: flex; align-items: center; flex-wrap: wrap; gap: 5px; }
.ft-legal-item { display: flex; align-items: center; gap: 5px; }
.ft-sep  { width: 3px; height: 3px; border-radius: 50%; background: #2a1e14; flex-shrink: 0; }
.ft-legal-link { font-size: 11.5px; color: var(--dim); text-decoration: none; transition: color .16s; }
.ft-legal-link:hover { color: var(--gold-dim); }

/* ══════════════════════════
   RESPONSIVE BREAKPOINTS
══════════════════════════ */

/* ── ≤1080px: collapse to 3-col nav, brand row ── */
@media (max-width: 1080px) {
  .ft-body {
    grid-template-columns: 1fr 1fr 1fr;
    row-gap: 32px;
    padding: 44px 32px 36px;
  }
  /* brand spans full width, becomes horizontal */
  .ft-brand {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: auto 1fr auto;
    grid-template-rows: auto auto;
    column-gap: 28px; row-gap: 10px;
  }
  .ft-logo     { grid-column: 1; grid-row: 1; }
  .ft-org-name { grid-column: 1; grid-row: 2; margin-top: 0; }
  .ft-tagline  { grid-column: 2; grid-row: 1 / 3; align-self: center; max-width: 100%; }
  .ft-socials  { grid-column: 3; grid-row: 1; align-self: start; justify-self: end; }
  .ft-contacts { grid-column: 3; grid-row: 2; align-self: start; }

  /* newsletter: full width, horizontal layout */
  .ft-nl-col {
    grid-column: 1 / -1;
    border-left: none;
    border-top: 1px solid var(--border);
    padding-left: 0; padding-top: 24px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    align-items: start;
  }
  .nl-wrap { display: contents; }
  .ft-col-title       { grid-column: 1; grid-row: 1; }
  .nl-sub             { grid-column: 1; grid-row: 2; }
  .nl-form            { grid-column: 1; grid-row: 3; }
  .nl-err-msg         { grid-column: 1; grid-row: 4; }
  .nl-success         { grid-column: 1 / -1; grid-row: 2; }
}

/* ── ≤768px: 2-col nav, brand stacked ── */
@media (max-width: 768px) {
  .ft-body {
    grid-template-columns: 1fr 1fr;
    padding: 36px 24px 28px;
    gap: 26px;
  }
  .ft-brand {
    grid-column: 1 / -1;
    display: flex; flex-direction: column; gap: 14px;
  }
  .ft-tagline { max-width: 100%; }

  .ft-nl-col {
    grid-column: 1 / -1;
    display: block; padding-top: 20px;
  }
  .nl-wrap { display: flex; flex-direction: column; gap: 8px; }

  .ft-bar { padding: 14px 24px; flex-direction: column; align-items: flex-start; gap: 10px; }
  .ft-status { display: none; }
}

/* ── ≤480px: single col nav ── */
@media (max-width: 480px) {
  .ft-body {
    grid-template-columns: 1fr 1fr;
    padding: 28px 18px 22px;
    gap: 20px;
  }
  .ft-brand { grid-column: 1 / -1; }
  .ft-nl-col { grid-column: 1 / -1; }

  .ft-logo-p   { font-size: 36px; }
  .ft-logo-aah { font-size: 19px; }
  .ft-tagline  { font-size: 12px; }
  .ft-link     { font-size: 12.5px; }

  .ft-bar { padding: 12px 18px; }
  .ft-copy { font-size: 11px; }
}

/* ── ≤360px: true single col ── */
@media (max-width: 360px) {
  .ft-body { grid-template-columns: 1fr; gap: 22px; }
}
`;

export default Footer;