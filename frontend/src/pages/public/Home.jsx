import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getPlatformStats } from "../../features/leaderboard/leaderboardAPI";

/* ═══════════════════════════════════════════
   HERO SLIDER DATA  (Unsplash — free to use)
═══════════════════════════════════════════ */
const SLIDES = [
  {
    url: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1600&auto=format&fit=crop&q=80",
    caption: "Children deserve a future free from poverty",
  },
  {
    url: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=1600&auto=format&fit=crop&q=80",
    caption: "Every act of kindness creates a ripple of change",
  },
  {
    url: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1600&auto=format&fit=crop&q=80",
    caption: "Together we can build stronger communities",
  },
  {
    url: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1600&auto=format&fit=crop&q=80",
    caption: "Real action. Real verification. Real impact.",
  },
  {
    url: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1600&auto=format&fit=crop&q=80",
    caption: "Empowering communities to rise above hardship",
  },
];

/* ─── Animated counter hook ─── */
function useCountUp(target, duration = 1800, started = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!started || target === 0) return;
    let start = null;
    let animationFrame;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(ease * target));
      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      }
    };
    animationFrame = requestAnimationFrame(step);
    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [target, started, duration]);
  return value;
}

/* ─── Stat Card (memoized) ─── */
const StatCard = React.memo(({ value, suffix = "", label, icon, delay = 0, started }) => {
  const animated = useCountUp(value, 1800, started);
  return (
    <div className="stat-card" style={{ animationDelay: `${delay}ms` }}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-number">{animated.toLocaleString()}{suffix}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
});

/* ─── Feature Card (memoized) ─── */
const FeatureCard = React.memo(({ icon, title, desc, delay = 0 }) => {
  return (
    <div className="feature-card" style={{ animationDelay: `${delay}ms` }}>
      <div className="feature-icon-wrap">{icon}</div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-desc">{desc}</p>
    </div>
  );
});

/* ─── Step (memoized) ─── */
const Step = React.memo(({ num, title, desc, delay = 0 }) => {
  return (
    <div className="step-item" style={{ animationDelay: `${delay}ms` }}>
      <div className="step-num">{num}</div>
      <div>
        <h4 className="step-title">{title}</h4>
        <p className="step-desc">{desc}</p>
      </div>
    </div>
  );
});

/* ─── Loading Skeleton ─── */
const StatsSkeleton = () => (
  <div className="stats-grid">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="stat-card skeleton">
        <div className="skeleton-icon" />
        <div className="skeleton-number" />
        <div className="skeleton-label" />
      </div>
    ))}
  </div>
);

/* ─── SVG Icons ─── */
const IcoDonate = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"
      stroke="currentColor" strokeWidth="1.6" fill="none" />
  </svg>
);
const IcoTask = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" d="M9 11l3 3L22 4" />
    <path stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"
      d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);
const IcoTeam = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path stroke="currentColor" strokeWidth="1.6" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.6" />
    <path stroke="currentColor" strokeWidth="1.6" d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IcoShield = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path stroke="currentColor" strokeWidth="1.6" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" d="M9 12l2 2 4-4" />
  </svg>
);
const IcoTrophy = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path stroke="currentColor" strokeWidth="1.6" d="M8 21h8M12 17v4M17 3H7v8a5 5 0 0 0 10 0V3z" />
    <path stroke="currentColor" strokeWidth="1.6"
      d="M7 4H4a1 1 0 0 0-1 1v2a4 4 0 0 0 4 4M17 4h3a1 1 0 0 1 1 1v2a4 4 0 0 1-4 4" />
  </svg>
);
const IcoStar = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <polygon stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"
      points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const IcoUsers = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <path stroke="currentColor" strokeWidth="1.5" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
    <path stroke="currentColor" strokeWidth="1.5" d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IcoArrow = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);
const IcoChevronLeft = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
  </svg>
);
const IcoChevronRight = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
  </svg>
);
const IcoError = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="12" cy="16" r="0.5" fill="currentColor" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

/* ═══════════════════════════════════════════
   HOME PAGE
═══════════════════════════════════════════ */
function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const statsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDonations: 0,
    totalTeams: 0,
    trustRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statsError, setStatsError] = useState(false);

  /* ── Slider auto-advance ── */
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const goSlide = useCallback((idx) => setCurrentSlide(idx), []);

  const prevSlide = useCallback(() => {
    setCurrentSlide(prev => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide(prev => (prev + 1) % SLIDES.length);
  }, []);

  /* ── fetch stats ── */
  useEffect(() => {
    let mounted = true;
    let intervalId;

    const fetchStats = async () => {
      try {
        const data = await getPlatformStats();
        if (mounted) {
          setStats(data);
          setStatsError(false);
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        if (mounted) setStatsError(true);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchStats();
    intervalId = setInterval(fetchStats, 10000);
    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, []);

  /* ── stats scroll trigger ── */
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    const el = statsRef.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, []);

  /* ── CTA routing ── */
  const handleGetStarted = useCallback(() => {
    if (!user) return navigate("/signup");
    if (user.role === "admin") return navigate("/admin/history");
    return navigate("/");
  }, [user, navigate]);

  const handlePrimaryAction = useCallback(() => {
    if (!user) return navigate("/signup");
    if (user.role === "admin") return navigate("/admin/donations");
    return navigate("/donate");
  }, [user, navigate]);

  const isAdmin = useMemo(() => user?.role === "admin", [user]);
  const isUser = useMemo(() => user?.role === "user", [user]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@400;500;600&display=swap');

        :root {
          --navy:       #0B1F4B;
          --blue:       #1B4FD8;
          --blue-light: #EEF3FF;
          --blue-mid:   #3B6EF8;
          --gold:       #C9A84C;
          --white:      #FFFFFF;
          --gray-50:    #F8F9FB;
          --gray-200:   #E4E7EF;
          --gray-400:   #9AA3B8;
          --gray-600:   #4B5675;
          --gray-900:   #0F172A;
          --radius:     12px;
          --radius-lg:  18px;
        }

        * { box-sizing: border-box; }

        .home-root {
          font-family: 'DM Sans', sans-serif;
          color: var(--gray-900);
          background: var(--white);
          overflow-x: hidden;
        }

        /* ════════ SLIDER ════════ */
        .slider-wrap {
          position: relative;
          width: 100%;
          height: 100vh;
          min-height: 560px;
          overflow: hidden;
          background: #000;
        }

        @media (max-width: 768px) {
          .slider-wrap {
            height: auto;
            aspect-ratio: 16 / 9;
            min-height: 500px;
          }
        }

        .slide {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          opacity: 0;
          transition: opacity 0.9s ease-in-out;
          will-change: opacity;
        }

        .slide.active {
          opacity: 1;
        }

        .slide::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(11,31,75,0.55) 0%,
            rgba(11,31,75,0.72) 60%,
            rgba(11,31,75,0.88) 100%
          );
          pointer-events: none;
        }

        .slider-content {
          position: absolute;
          inset: 0;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 0 24px;
        }

        @media (max-width: 768px) {
          .slider-content {
            padding: 0 16px;
            justify-content: flex-start;
            padding-top: 80px;
          }
        }

        .slider-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 100px;
          padding: 6px 18px;
          font-size: 13px;
          font-weight: 500;
          color: rgba(255,255,255,0.8);
          margin-bottom: 28px;
          animation: fadeUp 0.7s ease both;
        }

        @media (max-width: 768px) {
          .slider-badge { font-size: 11px; padding: 4px 12px; margin-bottom: 20px; }
        }

        .slider-badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--gold);
          flex-shrink: 0;
        }

        .slider-h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(38px, 6vw, 80px);
          font-weight: 700;
          line-height: 1.08;
          color: var(--white);
          margin-bottom: 20px;
          max-width: 860px;
          animation: fadeUp 0.7s ease 0.1s both;
        }

        @media (max-width: 768px) {
          .slider-h1 { font-size: clamp(28px, 5vw, 38px); margin-bottom: 12px; }
        }

        .slider-h1 em { font-style: italic; color: var(--gold); }

        .slider-caption {
          font-size: clamp(15px, 2vw, 18px);
          color: rgba(255,255,255,0.65);
          margin-bottom: 44px;
          max-width: 560px;
          line-height: 1.6;
          animation: fadeUp 0.7s ease 0.2s both;
        }

        @media (max-width: 768px) {
          .slider-caption { font-size: 13px; margin-bottom: 24px; padding: 0 10px; }
        }

        .slider-actions {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          justify-content: center;
          animation: fadeUp 0.7s ease 0.3s both;
        }

        @media (max-width: 640px) {
          .slider-actions { flex-direction: column; gap: 12px; width: 100%; max-width: 280px; }
        }

        .slider-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 3;
          width: 48px; height: 48px;
          border-radius: 50%;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.2);
          color: var(--white);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
          backdrop-filter: blur(4px);
        }

        @media (max-width: 768px) {
          .slider-arrow { width: 36px; height: 36px; }
          .slider-arrow.left { left: 12px; }
          .slider-arrow.right { right: 12px; }
        }

        .slider-arrow:hover { background: rgba(255,255,255,0.22); transform: translateY(-50%) scale(1.05); }
        .slider-arrow.left  { left: 24px; }
        .slider-arrow.right { right: 24px; }

        .slider-dots {
          position: absolute;
          bottom: 28px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 3;
          display: flex;
          gap: 8px;
        }

        @media (max-width: 768px) {
          .slider-dots { bottom: 16px; gap: 6px; }
        }

        .slider-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: rgba(255,255,255,0.35);
          cursor: pointer;
          transition: background 0.25s, width 0.25s;
          border: none;
          padding: 0;
        }

        @media (max-width: 768px) {
          .slider-dot { width: 6px; height: 6px; }
          .slider-dot.active { width: 20px; }
        }

        .slider-dot.active {
          background: var(--gold);
          width: 24px;
          border-radius: 4px;
        }

        .slider-progress {
          position: absolute;
          bottom: 0; left: 0;
          height: 3px;
          background: var(--gold);
          z-index: 3;
          animation: progress 5s linear infinite;
          transform-origin: left;
        }

        @keyframes progress {
          from { width: 0%; }
          to   { width: 100%; }
        }

        /* ════════ WELCOME SECTION (SEPARATE - BELOW SLIDER) ════════ */
        .welcome-section {
          background: linear-gradient(135deg, var(--navy) 0%, #1a2f5c 100%);
          padding: 48px 20px;
          margin-top: 0;
          position: relative;
          z-index: 5;
          border-top: 1px solid rgba(255,255,255,0.1);
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        @media (max-width: 768px) {
          .welcome-section {
            padding: 32px 16px;
          }
        }

        .welcome-container {
          max-width: 1120px;
          margin: 0 auto;
        }

        .welcome-header {
          text-align: center;
          margin-bottom: 28px;
        }

        .welcome-header h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(24px, 4vw, 36px);
          color: var(--white);
          margin-bottom: 8px;
        }

        .welcome-header p {
          font-size: 15px;
          color: rgba(255,255,255,0.7);
        }

        .welcome-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .welcome-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 12px 28px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: var(--radius);
          color: var(--white);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: 'DM Sans', sans-serif;
        }

        .welcome-action-btn:hover {
          background: rgba(255,255,255,0.2);
          transform: translateY(-2px);
          border-color: var(--gold);
        }

        @media (max-width: 640px) {
          .welcome-actions {
            flex-direction: column;
            align-items: stretch;
          }
          .welcome-action-btn {
            justify-content: center;
            padding: 10px 20px;
          }
        }

        /* ════════ BUTTONS ════════ */
        .btn-primary, .btn-outline, .btn-gold {
          display: inline-flex; 
          align-items: center; 
          justify-content: center;
          gap: 10px;
          font-size: 15px; 
          font-weight: 600;
          padding: 14px 28px; 
          border-radius: var(--radius);
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: 'DM Sans', sans-serif;
          text-decoration: none;
          white-space: nowrap;
        }

        @media (max-width: 640px) {
          .btn-primary, .btn-outline, .btn-gold {
            width: 100%;
            padding: 12px 20px;
            font-size: 14px;
            white-space: normal;
            word-break: keep-all;
          }
        }

        .btn-primary {
          background: var(--blue-mid); 
          color: var(--white);
          border: none;
        }
        .btn-primary:hover { background: #2b5ef0; transform: translateY(-1px); }
        
        .btn-outline {
          background: transparent; 
          color: rgba(255,255,255,0.85);
          border: 1px solid rgba(255,255,255,0.25);
        }
        .btn-outline:hover { 
          border-color: rgba(255,255,255,0.6); 
          color: var(--white); 
          transform: translateY(-1px); 
        }
        
        .btn-gold {
          background: var(--gold); 
          color: var(--navy);
          border: none;
          font-weight: 700;
        }
        .btn-gold:hover { background: #d9b85a; transform: translateY(-1px); }

        /* ════════ SECTIONS ════════ */
        .section-inner { 
          max-width: 1120px; 
          margin: 0 auto;
          padding: 0 20px;
        }

        @media (max-width: 768px) {
          .section-inner {
            padding: 0 16px;
          }
        }

        .section-label {
          font-size: 12px; font-weight: 600;
          letter-spacing: 1.5px; text-transform: uppercase;
          color: var(--blue); margin-bottom: 12px;
        }

        .section-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(30px, 4vw, 46px);
          font-weight: 700; color: var(--navy);
          margin-bottom: 8px; line-height: 1.15;
        }

        .section-sub {
          font-size: 16px; color: var(--gray-400);
          margin-bottom: 52px; max-width: 480px;
        }

        @media (max-width: 768px) {
          .section-sub {
            font-size: 14px;
            margin-bottom: 32px;
          }
        }

        /* STATS */
        .stats-section { 
          background: var(--gray-50); 
          padding: 80px 0;
        }

        @media (max-width: 768px) {
          .stats-section {
            padding: 48px 0;
          }
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        @media (max-width: 640px) {
          .stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            gap: 12px;
          }
        }

        .stat-card {
          background: var(--white);
          border: 1px solid var(--gray-200);
          border-radius: var(--radius-lg);
          padding: 28px 24px;
          display: flex; 
          flex-direction: column; 
          gap: 10px;
          animation: fadeUp 0.5s ease both;
          transition: box-shadow 0.2s, transform 0.2s;
        }

        @media (max-width: 640px) {
          .stat-card {
            padding: 20px 16px;
          }
        }

        .stat-card:hover { 
          transform: translateY(-3px); 
          box-shadow: 0 12px 32px rgba(27,79,216,0.08); 
        }

        .stat-icon {
          width: 44px; 
          height: 44px; 
          border-radius: 10px;
          background: var(--blue-light);
          display: flex; 
          align-items: center; 
          justify-content: center;
          color: var(--blue);
        }

        .stat-number {
          font-family: 'Cormorant Garamond', serif;
          font-size: 42px; 
          font-weight: 700;
          color: var(--navy); 
          line-height: 1;
        }

        @media (max-width: 640px) {
          .stat-number {
            font-size: 32px;
          }
        }

        .stat-label { 
          font-size: 13.5px; 
          color: var(--gray-400); 
          font-weight: 500; 
        }

        @media (max-width: 640px) {
          .stat-label {
            font-size: 12px;
          }
        }

        /* Skeletons */
        .skeleton {
          position: relative;
          overflow: hidden;
        }
        .skeleton-icon, .skeleton-number, .skeleton-label {
          background: linear-gradient(90deg, var(--gray-200) 25%, var(--gray-50) 50%, var(--gray-200) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        .skeleton-icon { width: 44px; height: 44px; border-radius: 10px; }
        .skeleton-number { width: 70%; height: 42px; margin-top: 8px; border-radius: 6px; }
        .skeleton-label { width: 50%; height: 14px; margin-top: 4px; border-radius: 4px; }
        
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* Error State */
        .stats-error {
          text-align: center;
          padding: 60px 20px;
          background: var(--white);
          border-radius: var(--radius-lg);
          border: 1px solid var(--gray-200);
        }
        .stats-error svg {
          color: var(--gray-400);
          margin-bottom: 16px;
        }
        .stats-error p {
          color: var(--gray-600);
          margin-bottom: 20px;
        }
        .retry-btn {
          padding: 8px 20px;
          background: var(--blue);
          color: white;
          border: none;
          border-radius: var(--radius);
          cursor: pointer;
          font-size: 14px;
        }

        /* FEATURES */
        .features-section { 
          padding: 80px 0; 
          background: var(--white); 
        }

        @media (max-width: 768px) {
          .features-section {
            padding: 48px 0;
          }
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
        }

        @media (max-width: 640px) {
          .features-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }

        .feature-card {
          background: var(--gray-50);
          border: 1px solid var(--gray-200);
          border-radius: var(--radius-lg);
          padding: 32px 28px;
          animation: fadeUp 0.5s ease both;
          transition: box-shadow 0.2s, transform 0.2s, border-color 0.2s;
        }

        @media (max-width: 640px) {
          .feature-card {
            padding: 24px 20px;
          }
        }

        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(11,31,75,0.07);
          border-color: var(--blue);
        }
        .feature-icon-wrap {
          width: 52px; height: 52px; border-radius: 14px;
          background: var(--navy); color: var(--gold);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px;
        }
        .feature-title { 
          font-size: 16px; 
          font-weight: 600; 
          color: var(--navy); 
          margin-bottom: 10px; 
        }
        .feature-desc { 
          font-size: 14px; 
          line-height: 1.65; 
          color: var(--gray-600); 
        }

        /* HOW IT WORKS */
        .how-section { 
          padding: 80px 0; 
          background: var(--navy); 
        }

        @media (max-width: 768px) {
          .how-section {
            padding: 48px 0;
          }
        }

        .how-section .section-label { color: var(--gold); }
        .how-section .section-title { color: var(--white); }
        .how-section .section-sub   { color: rgba(255,255,255,0.5); }

        .steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 28px;
        }

        @media (max-width: 640px) {
          .steps-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
        }

        .step-item { 
          display: flex; 
          gap: 20px; 
          animation: fadeUp 0.5s ease both; 
        }

        @media (max-width: 640px) {
          .step-item {
            gap: 16px;
          }
        }

        .step-num {
          flex-shrink: 0;
          width: 40px; height: 40px; border-radius: 10px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          color: var(--gold);
          font-family: 'Cormorant Garamond', serif;
          font-size: 20px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
        }
        .step-title { 
          font-size: 15px; 
          font-weight: 600; 
          color: var(--white); 
          margin-bottom: 6px; 
        }
        .step-desc  { 
          font-size: 13.5px; 
          line-height: 1.6; 
          color: rgba(255,255,255,0.5); 
        }

        /* CTA */
        .cta-section { 
          padding: 96px 20px; 
          background: var(--gray-50); 
          text-align: center; 
        }

        @media (max-width: 768px) {
          .cta-section {
            padding: 60px 16px;
          }
        }

        .cta-card {
          background: var(--navy);
          border-radius: 24px; 
          padding: 72px 48px;
          max-width: 760px; 
          margin: 0 auto;
          position: relative; 
          overflow: hidden;
        }

        @media (max-width: 768px) {
          .cta-card {
            padding: 40px 24px;
            border-radius: 20px;
          }
        }

        .cta-card-glow {
          position: absolute;
          width: 500px; height: 500px; border-radius: 50%;
          background: radial-gradient(circle, rgba(59,110,248,0.2) 0%, transparent 70%);
          top: -150px; right: -150px; pointer-events: none;
        }

        @media (max-width: 768px) {
          .cta-card-glow {
            width: 300px;
            height: 300px;
            top: -100px;
            right: -100px;
          }
        }

        .cta-card-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(28px, 4vw, 46px); 
          font-weight: 700;
          color: var(--white); 
          margin-bottom: 16px; 
          position: relative; 
          z-index: 1;
        }
        .cta-card-title em { font-style: italic; color: var(--gold); }
        .cta-card-sub {
          font-size: 16px; 
          color: rgba(255,255,255,0.55);
          margin-bottom: 40px; 
          position: relative; 
          z-index: 1;
          max-width: 440px; 
          margin-left: auto; 
          margin-right: auto;
        }

        @media (max-width: 768px) {
          .cta-card-sub {
            font-size: 14px;
            margin-bottom: 32px;
          }
        }

        .cta-actions {
          display: flex; 
          gap: 14px; 
          justify-content: center;
          flex-wrap: wrap; 
          position: relative; 
          z-index: 1;
        }

        @media (max-width: 640px) {
          .cta-actions {
            flex-direction: column;
            gap: 12px;
          }
        }

        /* Accessibility */
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }

        /* ANIMATIONS */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="home-root">

        {/* ════════════════ SLIDER HERO ════════════════ */}
        <section 
          className="slider-wrap"
          aria-label="Hero carousel"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Slides */}
          {SLIDES.map((slide, i) => (
            <div
              key={i}
              className={`slide${i === currentSlide ? " active" : ""}`}
              style={{ backgroundImage: `url(${slide.url})` }}
              aria-hidden={i !== currentSlide}
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${i + 1} of ${SLIDES.length}: ${slide.caption}`}
            />
          ))}

          {/* Content on top */}
          <div className="slider-content">
            <div className="slider-badge">
              <span className="slider-badge-dot" aria-hidden="true" />
              AI-verified social impact platform
            </div>

            <h1 className="slider-h1">
              Make Impact.<br />
              Earn Trust.<br />
              <em>Change Lives.</em>
            </h1>

            <p className="slider-caption">
              {SLIDES[currentSlide].caption}
            </p>

            <div className="slider-actions">
              <button className="btn-primary" onClick={handleGetStarted}>
                {user ? (isAdmin ? "Admin Dashboard" : "Go to Dashboard") : "Get Started"}
                <IcoArrow aria-hidden="true" />
              </button>
              <button className="btn-outline" onClick={() => navigate("/leaderboard")}>
                <IcoTrophy aria-hidden="true" />
                View Leaderboard
              </button>
            </div>
          </div>

          {/* Prev / Next arrows */}
          <button 
            className="slider-arrow left" 
            onClick={prevSlide} 
            aria-label="Previous slide"
          >
            <IcoChevronLeft aria-hidden="true" />
          </button>
          <button 
            className="slider-arrow right" 
            onClick={nextSlide} 
            aria-label="Next slide"
          >
            <IcoChevronRight aria-hidden="true" />
          </button>

          {/* Dot indicators */}
          <div className="slider-dots" role="tablist" aria-label="Slide controls">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                className={`slider-dot${i === currentSlide ? " active" : ""}`}
                onClick={() => goSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
                role="tab"
                aria-selected={i === currentSlide}
              />
            ))}
          </div>

          {/* Progress bar */}
          <div key={currentSlide} className="slider-progress" aria-hidden="true" />
        </section>

        {/* ════════════════ WELCOME SECTION (SEPARATE - BELOW SLIDER) ════════════════ */}
        {user && (
          <section className="welcome-section" aria-label="Welcome section">
            <div className="welcome-container">
              <div className="welcome-header">
                <h2>Welcome back, {user.name} 👋</h2>
                <p>
                  {isAdmin
                    ? "Manage donations, verify tasks, and keep the platform trusted."
                    : "Continue your journey — donate, complete tasks, and climb the board."}
                </p>
              </div>
              <div className="welcome-actions">
                {isUser && (
                  <>
                    <button className="welcome-action-btn" onClick={() => navigate("/donate")}>
                      <IcoDonate aria-hidden="true" /> Donate
                    </button>
                    <button className="welcome-action-btn" onClick={() => navigate("/tasks")}>
                      <IcoTask aria-hidden="true" /> Browse Tasks
                    </button>
                    <button className="welcome-action-btn" onClick={() => navigate("/my-team")}>
                      <IcoTeam aria-hidden="true" /> My Team
                    </button>
                    <button className="welcome-action-btn" onClick={() => navigate("/leaderboard")}>
                      <IcoTrophy aria-hidden="true" /> Leaderboard
                    </button>
                  </>
                )}
                {isAdmin && (
                  <>
                    <button className="welcome-action-btn" onClick={() => navigate("/admin/donations")}>
                      Verify Donations
                    </button>
                    <button className="welcome-action-btn" onClick={() => navigate("/admin/verify-tasks")}>
                      Verify Tasks
                    </button>
                    <button className="welcome-action-btn" onClick={() => navigate("/admin/create-task")}>
                      Create Task
                    </button>
                  </>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ════════════════ STATS ════════════════ */}
        <section className="stats-section" ref={statsRef} aria-label="Platform statistics">
          <div className="section-inner">
            <div className="section-label">Platform Impact</div>
            <h2 className="section-title">Our Numbers Speak</h2>
            <p className="section-sub">Real contributions, real verification, real change — tracked live.</p>

            <div aria-live="polite">
              {loading ? (
                <StatsSkeleton />
              ) : statsError ? (
                <div className="stats-error">
                  <IcoError aria-hidden="true" />
                  <p>Unable to load platform statistics. Please try again later.</p>
                  <button 
                    className="retry-btn" 
                    onClick={() => {
                      setLoading(true);
                      setStatsError(false);
                      getPlatformStats()
                        .then(data => setStats(data))
                        .catch(() => setStatsError(true))
                        .finally(() => setLoading(false));
                    }}
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <div className="stats-grid">
                  <StatCard value={stats.totalDonations} suffix="+" label="Verified Donations" icon={<IcoDonate />} delay={0} started={statsVisible} />
                  <StatCard value={stats.totalUsers} suffix="+" label="Active Users" icon={<IcoUsers />} delay={100} started={statsVisible} />
                  <StatCard value={stats.totalTeams} suffix="+" label="Teams Formed" icon={<IcoTeam />} delay={200} started={statsVisible} />
                  <StatCard value={stats.trustRate} suffix="%" label="Trust Rate" icon={<IcoShield />} delay={300} started={statsVisible} />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ════════════════ FEATURES ════════════════ */}
        <section className="features-section" aria-label="Platform features">
          <div className="section-inner">
            <div className="section-label">What We Offer</div>
            <h2 className="section-title">Everything You Need to Drive Change</h2>
            <p className="section-sub">A complete ecosystem for social contribution — gamified, verified, and transparent.</p>
            <div className="features-grid">
              <FeatureCard icon={<IcoDonate />} title="Donation Tracking" desc="Submit and track your donations with full transparency. Every contribution is reviewed and verified by our admin team." delay={0} />
              <FeatureCard icon={<IcoTask />} title="Task System" desc="Accept meaningful social tasks, upload proof, and earn credits once AI and admins verify your real-world impact." delay={80} />
              <FeatureCard icon={<IcoTeam />} title="Team Collaboration" desc="Create or join teams to amplify your impact. Collaborate with like-minded individuals towards shared social goals." delay={160} />
              <FeatureCard icon={<IcoShield />} title="Trust Score System" desc="Build your credibility with a transparent trust score based on verified actions, donations, and community reputation." delay={240} />
              <FeatureCard icon={<IcoTrophy />} title="Leaderboard & Ranks" desc="Healthy competition fuels action. Climb the leaderboard through genuine contributions and inspire others to do the same." delay={320} />
              <FeatureCard icon={<IcoStar />} title="AI Verification" desc="Powered by Gemini AI to analyse proof submissions and flag inconsistencies — ensuring every action is authentic." delay={400} />
            </div>
          </div>
        </section>

        {/* ════════════════ HOW IT WORKS ════════════════ */}
        <section className="how-section" aria-label="How it works">
          <div className="section-inner">
            <div className="section-label">How It Works</div>
            <h2 className="section-title">From Action to Impact</h2>
            <p className="section-sub">A simple, trust-driven workflow that ensures every contribution counts.</p>
            <div className="steps-grid">
              <Step num="1" title="Sign Up & Set Up" desc="Create your account, build your profile, and join or create a team to get started." delay={0} />
              <Step num="2" title="Accept a Task or Donate" desc="Browse available tasks that match your skills, or make a donation to a verified cause." delay={80} />
              <Step num="3" title="Submit Proof" desc="Upload evidence of your completed task or donation — photos, documents, or receipts." delay={160} />
              <Step num="4" title="AI Analyses Submission" desc="Our Gemini-powered AI scans your proof for authenticity before it reaches the admin." delay={240} />
              <Step num="5" title="Admin Verification" desc="A human admin does the final review to ensure quality, fairness, and accuracy." delay={320} />
              <Step num="6" title="Credits & Trust Earned" desc="Get rewarded with credits, climb the leaderboard, and build your trust score over time." delay={400} />
            </div>
          </div>
        </section>

        {/* ════════════════ CTA ════════════════ */}
        <section className="cta-section" aria-label="Call to action">
          <div className="cta-card">
            <div className="cta-card-glow" aria-hidden="true" />
            <h2 className="cta-card-title">Ready to <em>Make a Difference?</em></h2>
            <p className="cta-card-sub">
              {user
                ? isAdmin
                  ? "Review pending submissions and keep the platform trustworthy."
                  : "Your next task or donation could change someone's life today."
                : "Join thousands of changemakers already on PAAH."}
            </p>
            <div className="cta-actions">
              <button className="btn-gold" onClick={handlePrimaryAction}>
                {user ? (isAdmin ? "Verify Donations" : "Make a Donation") : "Join PAAH — It's Free"}
                <IcoArrow aria-hidden="true" />
              </button>
              {!user && (
                <button className="btn-outline" onClick={() => navigate("/login")}>
                  Already have an account? Login
                </button>
              )}
              {isUser && (
                <button className="btn-outline" onClick={() => navigate("/tasks")}>
                  <IcoTask aria-hidden="true" /> Browse Tasks
                </button>
              )}
            </div>
          </div>
        </section>

      </div>
    </>
  );
}

export default Home;