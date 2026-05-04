import { NavLink } from 'react-router-dom';

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-6 h-6">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9 12l2 2 4-4"/>
      </svg>
    ),
    title: 'AI-Based Verification',
    desc:  'Every contribution is validated using AI-driven analysis to ensure authenticity and prevent fraud.',
    accent: 'border-t-blue-500',
    iconBg: 'bg-blue-50 text-blue-600',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-6 h-6">
        <path d="M18 20V10M12 20V4M6 20v-6"/>
      </svg>
    ),
    title: 'Gamified Impact System',
    desc:  'Users earn credits, build trust scores, and climb leaderboards through real-world actions.',
    accent: 'border-t-indigo-500',
    iconBg: 'bg-indigo-50 text-indigo-600',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-6 h-6">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
    title: 'Community Collaboration',
    desc:  'Teams, NGOs, and individuals collaborate to maximise impact and drive meaningful change.',
    accent: 'border-t-sky-500',
    iconBg: 'bg-sky-50 text-sky-600',
  },
];

const FOUNDERS = [
  {
    name:  'Rithesh J',
    role:  'Advanced Application Developer',
    bio:   'Leads the vision and full-stack development of PAAH, focusing on building scalable systems that combine technology with real-world social impact.',
    initials: 'RJ',
  },
  {
    name:  'Santhosh K',
    role:  'Web Developer',
    bio:   'Focuses on frontend architecture and user experience, ensuring that the platform is intuitive, responsive, and engaging for all users.',
    initials: 'SK',
  },
];

function About() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');

        .about-root { font-family: 'DM Sans', sans-serif; }

        /* ── keyframes ── */
        @keyframes abFadeUp  { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes abFadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes abPulse   { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.85)} }
        @keyframes abFloat   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes abSlideR  { from{opacity:0;transform:translateX(-20px)} to{opacity:1;transform:translateX(0)} }

        .anim-hero  { animation: abFadeUp  .75s cubic-bezier(.4,0,.2,1) both; }
        .anim-sub   { animation: abFadeUp  .75s cubic-bezier(.4,0,.2,1) .15s both; }
        .anim-badge { animation: abFadeIn  .6s ease .3s both; }

        /* feature cards stagger */
        .feat-card  { animation: abFadeUp .55s ease both; }
        .feat-card:nth-child(1) { animation-delay:.05s }
        .feat-card:nth-child(2) { animation-delay:.15s }
        .feat-card:nth-child(3) { animation-delay:.25s }

        /* founder cards stagger */
        .found-card { animation: abFadeUp .55s ease both; }
        .found-card:nth-child(1) { animation-delay:.1s }
        .found-card:nth-child(2) { animation-delay:.22s }

        /* stats */
        .stat-item  { animation: abSlideR .5s ease both; }
        .stat-item:nth-child(1) { animation-delay:.05s }
        .stat-item:nth-child(2) { animation-delay:.15s }
        .stat-item:nth-child(3) { animation-delay:.25s }

        /* bg orb */
        .hero-orb {
          position:absolute; border-radius:50%; pointer-events:none;
          background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%);
          animation: abFloat 7s ease infinite;
        }
      `}</style>

      <div className="about-root bg-[#f0f4ff] min-h-screen">

        {/* ══════════════ HERO ══════════════ */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0d1b3e] via-[#1a3a8f] to-[#1e50b5] px-5 sm:px-10 pt-16 pb-24">
          {/* Decorative orbs */}
          <div className="hero-orb w-96 h-96 -top-32 -right-16" style={{animationDelay:'0s'}} />
          <div className="hero-orb w-64 h-64 bottom-0 left-8"   style={{animationDelay:'3s'}} />

          {/* Bottom curve */}
          <div className="absolute bottom-0 left-0 right-0 h-10 bg-[#f0f4ff]" style={{clipPath:'ellipse(55% 100% at 50% 100%)'}} />

          <div className="max-w-4xl mx-auto text-center relative z-10">
            {/* Eyebrow */}
            <div className="anim-badge inline-flex items-center gap-2 bg-white/10 border border-white/15 text-blue-200 text-[11px] font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-300" style={{animation:'abPulse 2s ease infinite'}} />
              About PAAH
            </div>

            <h1 className="anim-hero text-white text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-5" style={{fontFamily:"'Playfair Display',serif"}}>
              More than a platform <br />
              <em className="text-[#93b4f0] not-italic">a movement.</em>
            </h1>

            <p className="anim-sub text-blue-200/70 text-base sm:text-lg font-light max-w-2xl mx-auto leading-relaxed">
              Poverty Awareness and Action Hub bridges the gap between
              intention and real-world impact through technology, transparency,
              and community.
            </p>
          </div>
        </section>

        {/* ══════════════ MISSION + VISION ══════════════ */}
        <section className="max-w-5xl mx-auto px-5 sm:px-8 py-14">
          <div className="grid sm:grid-cols-2 gap-5">

            {/* Mission */}
            <div className="bg-white rounded-2xl border border-gray-100 border-t-2 border-t-blue-600 p-6 sm:p-8 shadow-sm">
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-4">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                Mission
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-3" style={{fontFamily:"'Playfair Display',serif"}}>
                What we set out to do
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed font-light">
                Create a transparent, accountable, and engaging ecosystem where
                individuals and communities can contribute meaningfully to society.
                By combining technology, gamification, and trust driven verification,
                PAAH ensures that every action leads to measurable impact.
              </p>
            </div>

            {/* Vision */}
            <div className="bg-white rounded-2xl border border-gray-100 border-t-2 border-t-indigo-500 p-6 sm:p-8 shadow-sm">
              <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-4">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M2 12h4M18 12h4M12 2v4M12 18v4"/></svg>
                Vision
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-3" style={{fontFamily:"'Playfair Display',serif"}}>
                Where we're headed
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed font-light">
                A world where social contributions are not just encouraged but
                verified, rewarded, and scaled globally. PAAH aims to become the
                leading platform for impact-driven communities, enabling millions to
                participate in solving real-world problems with trust and transparency.
              </p>
            </div>

          </div>
        </section>

        {/* ══════════════ STATS STRIP ══════════════ */}
        <section className="bg-gradient-to-r from-[#0d1b3e] to-[#1a3a8f] px-5 sm:px-10 py-10">
          <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4 sm:gap-8 text-center">
            {[
              { value: '10K+', label: 'Volunteers' },
              { value: '50K+', label: 'Tasks Completed' },
              { value: '₹2M+', label: 'Donations Channelled' },
            ].map(({ value, label }, i) => (
              <div key={i} className="stat-item">
                <p className="text-white text-2xl sm:text-3xl font-bold mb-1" style={{fontFamily:"'Playfair Display',serif"}}>{value}</p>
                <p className="text-blue-300/70 text-xs sm:text-sm font-light">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════ WHAT MAKES US UNIQUE ══════════════ */}
        <section className="max-w-5xl mx-auto px-5 sm:px-8 py-14">

          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-[11px] font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" style={{animation:'abPulse 2s ease infinite'}} />
              Our Difference
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900" style={{fontFamily:"'Playfair Display',serif"}}>
              What makes PAAH unique
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {FEATURES.map(({ icon, title, desc, accent, iconBg }) => (
              <div
                key={title}
                className={`feat-card bg-white rounded-2xl border border-gray-100 border-t-2 ${accent} p-6 shadow-sm hover:shadow-md hover:shadow-blue-50 transition-all duration-200`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${iconBg}`}>
                  {icon}
                </div>
                <h3 className="font-semibold text-gray-900 text-base mb-2" style={{fontFamily:"'Playfair Display',serif"}}>
                  {title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed font-light">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════ FOUNDERS ══════════════ */}
         {<section className="bg-white px-5 sm:px-8 py-14">
          <div className="max-w-4xl mx-auto">

            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-[11px] font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" style={{animation:'abPulse 2s ease infinite'}} />
                The People
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900" style={{fontFamily:"'Playfair Display',serif"}}>
                Meet the founders
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              {FOUNDERS.map(({ name, role, bio, initials }) => (
                <div
                  key={name}
                  className="found-card group bg-[#f8faff] rounded-2xl border border-gray-100 border-t-2 border-t-blue-600 p-6 sm:p-8 hover:shadow-md hover:shadow-blue-50 transition-all duration-200"
                >
                  
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-700 to-blue-500 flex items-center justify-center text-white text-xl font-bold mb-5 shadow-md shadow-blue-200 group-hover:scale-105 transition-transform duration-200" style={{fontFamily:"'Playfair Display',serif"}}>
                    {initials}
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-0.5" style={{fontFamily:"'Playfair Display',serif"}}>
                    {name}
                  </h3>
                  <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-blue-700 text-[10.5px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full mb-4">
                    {role}
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed font-light">{bio}</p>
                </div>
              ))}
            </div>

          </div>
        </section>} 

        {/* ══════════════ CTA ══════════════ */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0d1b3e] via-[#1a3a8f] to-[#1e50b5] px-5 sm:px-10 py-16 sm:py-20 text-center">
          <div className="hero-orb w-80 h-80 -top-20 -right-10" style={{animationDelay:'1s'}} />
          <div className="hero-orb w-56 h-56 -bottom-10 left-4"  style={{animationDelay:'4s'}} />

          <div className="max-w-xl mx-auto relative z-10">
            <h2 className="text-white text-2xl sm:text-3xl font-bold mb-3" style={{fontFamily:"'Playfair Display',serif"}}>
              Be part of the change
            </h2>
            <p className="text-blue-200/70 text-sm sm:text-base font-light mb-8 leading-relaxed">
              Join a growing community dedicated to making real-world impact —
              one verified action at a time.
            </p>
            <NavLink
              to="/signup"
              className="inline-flex items-center gap-2 bg-white text-blue-700 px-7 py-3 rounded-xl text-sm font-semibold
                hover:bg-blue-50 hover:shadow-lg hover:shadow-blue-900/30 transition-all duration-200 active:scale-[0.98]"
            >
              Get Started
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </NavLink>
          </div>
        </section>

      </div>
    </>
  );
}

export default About;