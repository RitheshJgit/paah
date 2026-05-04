import { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";

/* ════════════════════════════════════════════════════
   WHO WE ARE — Editorial Luxury / Dark Manifesto
   Aesthetic: Ink-on-vellum meets digital architecture
   Key detail: Staggered word-level reveals, parallax
   orbs, a ruled-line divider that draws itself, and
   founder cards that flip on hover.
════════════════════════════════════════════════════ */

/* ── Data ── */
const PARAGRAPHS = [
  {
    id: "p1",
    eyebrow: "Our Vision",
    text: "We are developers who believe that technology should go beyond solving digital problems and create measurable real-world impact. PAAH was built with the vision of transforming how people contribute to society — making every action accountable, transparent, and meaningful.",
  },
  {
    id: "p2",
    eyebrow: "Our Focus",
    text: "Our focus is not just on building features, but on building trust. By combining full-stack engineering, AI-based verification, and user-centric design, we aim to create a system where contributions are verified, rewarded, and scalable across communities.",
  },
  {
    id: "p3",
    eyebrow: "Our Journey",
    text: "What started as a project has evolved into a platform driven by purpose — empowering individuals and teams to take action and make a difference that can be seen, measured, and trusted.",
  },
  {
    id: "p4",
    eyebrow: "The Challenge",
    text: "At PAAH, we focus on solving one of the biggest challenges in social contribution platforms — trust. Many systems fail because they cannot verify whether actions are genuine. To address this, we introduced AI-based proof verification that analyzes user-submitted evidence and helps identify authenticity.",
  },
  {
    id: "p5",
    eyebrow: "The Ecosystem",
    text: "We designed a gamified ecosystem where users earn credits and build trust scores based on their contributions. This not only motivates consistent participation but also creates a transparent system where effort and impact are recognized. Leaderboards, team collaboration, and task-based engagement further strengthen community involvement.",
  },
  {
    id: "p6",
    eyebrow: "Accessibility",
    text: "PAAH supports multiple forms of contribution — from donating clothes and books to participating in structured community tasks. Our goal is to remove barriers and make it easier for anyone to contribute, regardless of their resources.",
  },
];

const FOUNDERS = [
  {
    name: "Rithesh J",
    role: "Co-Founder & Full-Stack Engineer",
    focus: "Architecture, AI Integration & Backend Systems",
    letter: "R",
    color: "#1B4FD8",
  },
  {
    name: "Santhosh K",
    role: "Co-Founder & Frontend Architect",
    focus: "UX Engineering, Design Systems & Platform Strategy",
    letter: "S",
    color: "#C9A84C",
  },
];

const PILLARS = [
  { num: "01", label: "Trust", desc: "AI-verified every step" },
  { num: "02", label: "Impact", desc: "Measurable real-world change" },
  { num: "03", label: "Access", desc: "Open to all contributors" },
  { num: "04", label: "Scale", desc: "Community-driven growth" },
];

/* ── Animated word-split text ── */
function RevealText({ text, delay = 0, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const words = text.split(" ");

  return (
    <span ref={ref} className={className} style={{ display: "block" }}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 18, filter: "blur(4px)" }}
          animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
          transition={{
            duration: 0.55,
            delay: delay + i * 0.028,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          style={{ display: "inline-block", marginRight: "0.28em" }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

/* ── Self-drawing line ── */
function DrawLine({ delay = 0, vertical = false }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div
      ref={ref}
      initial={{ scaleX: vertical ? 1 : 0, scaleY: vertical ? 0 : 1 }}
      animate={inView ? { scaleX: 1, scaleY: 1 } : {}}
      transition={{ duration: 1.1, delay, ease: [0.77, 0, 0.175, 1] }}
      style={{
        transformOrigin: vertical ? "top" : "left",
        width: vertical ? 1 : "100%",
        height: vertical ? "100%" : 1,
        background: "linear-gradient(90deg, var(--gold) 0%, rgba(201,168,76,0.2) 100%)",
        flexShrink: 0,
      }}
    />
  );
}

/* ── Founder card ── */
function FounderCard({ founder, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      className="founder-card"
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -6 }}
    >
      <div className="founder-accent" style={{ background: founder.color }} />
      <div className="founder-avatar" style={{ background: founder.color }}>
        {founder.letter}
      </div>
      <div className="founder-body">
        <div className="founder-name">{founder.name}</div>
        <div className="founder-role">{founder.role}</div>
        <div className="founder-focus">{founder.focus}</div>
      </div>
      <div className="founder-index" style={{ color: founder.color }}>
        0{index + 1}
      </div>
    </motion.div>
  );
}

/* ── Pillar item ── */
function Pillar({ pillar, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      className="pillar-item"
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <div className="pillar-num">{pillar.num}</div>
      <div className="pillar-content">
        <div className="pillar-label">{pillar.label}</div>
        <div className="pillar-desc">{pillar.desc}</div>
      </div>
      <motion.div
        className="pillar-bar"
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
      />
    </motion.div>
  );
}

/* ════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════ */
function WhoWeAre() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const orb1Y = useTransform(scrollYProgress, [0, 1], ["0%", "-25%"]);
  const orb2Y = useTransform(scrollYProgress, [0, 1], ["0%",  "20%"]);
  const orb3X = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);

  return (
    <>
      <style>{CSS}</style>

      <section className="wwa-root" ref={containerRef}>

        {/* ── Atmospheric background orbs ── */}
        <div className="wwa-bg" aria-hidden="true">
          <motion.div className="orb orb-1" style={{ y: orb1Y }} />
          <motion.div className="orb orb-2" style={{ y: orb2Y }} />
          <motion.div className="orb orb-3" style={{ x: orb3X }} />
          <div className="grain" />
          <div className="grid-overlay" />
        </div>

        <div className="wwa-inner">

          {/* ══════════ HEADER BLOCK ══════════ */}
          <div className="wwa-header">
            <motion.div
              className="wwa-eyebrow"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="eyebrow-dot" />
              About PAAH
            </motion.div>

            <div className="wwa-title-wrap">
              <motion.h2
                className="wwa-title"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                Who <em>We Are</em>
              </motion.h2>

              <motion.div
                className="wwa-title-deco"
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: 0.3 }}
              />
            </div>

            <motion.p
              className="wwa-tagline"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Builders of trust. Architects of impact.
            </motion.p>

            <div className="wwa-header-line">
              <DrawLine delay={0.5} />
            </div>
          </div>

          {/* ══════════ PILLARS ══════════ */}
          <div className="pillars-grid">
            {PILLARS.map((p, i) => <Pillar key={p.num} pillar={p} index={i} />)}
          </div>

          {/* ══════════ CONTENT COLUMNS ══════════ */}
          <div className="wwa-content">

            {/* Left: first 3 paragraphs */}
            <div className="wwa-col">
              {PARAGRAPHS.slice(0, 3).map((p, i) => (
                <div className="para-block" key={p.id}>
                  <motion.div
                    className="para-eyebrow"
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    {p.eyebrow}
                  </motion.div>
                  <RevealText text={p.text} delay={i * 0.06} className="para-text" />
                </div>
              ))}
            </div>

            {/* Center vertical rule */}
            <div className="wwa-vline" aria-hidden="true">
              <DrawLine delay={0.3} vertical />
            </div>

            {/* Right: last 3 paragraphs */}
            <div className="wwa-col">
              {PARAGRAPHS.slice(3).map((p, i) => (
                <div className="para-block" key={p.id}>
                  <motion.div
                    className="para-eyebrow"
                    initial={{ opacity: 0, x: 12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    {p.eyebrow}
                  </motion.div>
                  <RevealText text={p.text} delay={i * 0.06} className="para-text" />
                </div>
              ))}
            </div>
          </div>

          {/* ══════════ FOUNDERS ══════════ */}
          {/* <div className="founders-section">
            <div className="founders-header">
              <motion.div
                className="founders-eyebrow"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <span className="eyebrow-dot" />
                The Founders
              </motion.div>
              <div className="founders-rule">
                <DrawLine delay={0.2} />
              </div>
            </div>

            <div className="founders-grid">
              {FOUNDERS.map((f, i) => <FounderCard key={f.name} founder={f} index={i} />)}
            </div>
          </div> */}

          {/* ══════════ CLOSING QUOTE ══════════ */}
          <div className="wwa-quote-wrap">
            <motion.div
              className="wwa-quote"
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <span className="quote-mark">"</span>
              <blockquote className="quote-text">
                This platform reflects not just our skills as developers, but our
                responsibility to use technology in a way that creates real, lasting impact.
              </blockquote>
              {/* <div className="quote-attr">— Rithesh J &amp; Santhosh K, Co-Founders of PAAH</div>
              <span className="quote-mark quote-mark-close">"</span> */}
            </motion.div>
          </div>

        </div>
      </section>
    </>
  );
}

/* ════════════════════════════════════════
   STYLES
════════════════════════════════════════ */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400;1,600;1,700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

  :root {
    --navy:      #0B1F4B;
    --navy-mid:  #132254;
    --blue:      #1B4FD8;
    --blue-mid:  #3B6EF8;
    --gold:      #C9A84C;
    --gold-dim:  rgba(201,168,76,0.12);
    --white:     #FFFFFF;
    --off-white: #F4F2ED;
    --gray-200:  #E4E7EF;
    --gray-400:  #9AA3B8;
    --gray-600:  #4B5675;
  }

  /* ════ ROOT ════ */
  .wwa-root {
    position: relative;
    background: var(--navy);
    overflow: hidden;
    padding: 120px 0 100px;
    font-family: 'DM Sans', sans-serif;
    color: var(--white);
  }

  /* ════ ATMOSPHERIC BG ════ */
  .wwa-bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
  }

  .orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(90px);
    opacity: 0.35;
    will-change: transform;
  }

  .orb-1 {
    width: 620px; height: 620px;
    background: radial-gradient(circle, rgba(27,79,216,0.7) 0%, transparent 70%);
    top: -180px; left: -160px;
  }

  .orb-2 {
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(201,168,76,0.5) 0%, transparent 70%);
    bottom: 40px; right: -100px;
  }

  .orb-3 {
    width: 380px; height: 380px;
    background: radial-gradient(circle, rgba(59,110,248,0.4) 0%, transparent 70%);
    top: 50%; right: 15%;
    transform: translateY(-50%);
  }

  /* Grain texture */
  .grain {
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
    opacity: 0.4;
    mix-blend-mode: overlay;
  }

  /* Subtle grid */
  .grid-overlay {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
    background-size: 80px 80px;
  }

  /* ════ INNER ════ */
  .wwa-inner {
    position: relative;
    z-index: 1;
    max-width: 1160px;
    margin: 0 auto;
    padding: 0 40px;
  }

  @media (max-width: 768px) {
    .wwa-inner { padding: 0 20px; }
  }

  /* ════ HEADER ════ */
  .wwa-header {
    margin-bottom: 72px;
  }

  .wwa-eyebrow, .founders-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 20px;
  }

  .eyebrow-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--gold);
    flex-shrink: 0;
    box-shadow: 0 0 8px var(--gold);
  }

  .wwa-title-wrap {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    margin-bottom: 20px;
  }

  .wwa-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(52px, 9vw, 100px);
    font-weight: 700;
    line-height: 0.95;
    color: var(--white);
    letter-spacing: -1px;
    margin: 0;
  }

  .wwa-title em {
    font-style: italic;
    color: transparent;
    -webkit-text-stroke: 1.5px var(--gold);
  }

  .wwa-title-deco {
    width: 4px;
    height: 80px;
    background: linear-gradient(to bottom, var(--gold), transparent);
    border-radius: 2px;
    transform-origin: top;
    flex-shrink: 0;
    margin-top: 8px;
  }

  .wwa-tagline {
    font-family: 'Cormorant Garamond', serif;
    font-style: italic;
    font-size: clamp(18px, 2.5vw, 24px);
    color: rgba(255,255,255,0.45);
    margin-bottom: 32px;
    font-weight: 400;
    letter-spacing: 0.5px;
  }

  .wwa-header-line { width: 100%; }

  /* ════ PILLARS ════ */
  .pillars-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    overflow: hidden;
    margin-bottom: 80px;
  }

  @media (max-width: 768px) {
    .pillars-grid { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 480px) {
    .pillars-grid { grid-template-columns: 1fr; }
  }

  .pillar-item {
    padding: 28px 24px 24px;
    position: relative;
    overflow: hidden;
    border-right: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.02);
    transition: background 0.3s ease;
  }

  .pillar-item:last-child { border-right: none; }

  .pillar-item:hover {
    background: rgba(255,255,255,0.05);
  }

  .pillar-num {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: var(--gold);
    letter-spacing: 2px;
    margin-bottom: 10px;
    opacity: 0.8;
  }

  .pillar-label {
    font-family: 'Cormorant Garamond', serif;
    font-size: 24px;
    font-weight: 700;
    color: var(--white);
    margin-bottom: 4px;
    line-height: 1;
  }

  .pillar-desc {
    font-size: 12px;
    color: rgba(255,255,255,0.4);
    font-weight: 400;
  }

  .pillar-bar {
    position: absolute;
    bottom: 0; left: 0;
    height: 2px;
    width: 100%;
    background: linear-gradient(90deg, var(--gold), transparent);
    transform-origin: left;
  }

  /* ════ CONTENT ════ */
  .wwa-content {
    display: grid;
    grid-template-columns: 1fr 40px 1fr;
    gap: 0 40px;
    margin-bottom: 80px;
    align-items: start;
  }

  @media (max-width: 900px) {
    .wwa-content {
      grid-template-columns: 1fr;
      gap: 0;
    }
    .wwa-vline { display: none; }
  }

  .wwa-col {
    display: flex;
    flex-direction: column;
    gap: 44px;
  }

  .wwa-vline {
    display: flex;
    justify-content: center;
    padding-top: 8px;
    min-height: 100%;
  }

  .para-block { position: relative; }

  .para-eyebrow {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 10px;
    opacity: 0.8;
  }

  .para-text {
    font-size: 15px;
    line-height: 1.85;
    color: rgba(255,255,255,0.62);
    font-weight: 300;
  }

  /* ════ FOUNDERS ════ */
  .founders-section { margin-bottom: 80px; }

  .founders-header {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 32px;
  }

  .founders-rule { flex: 1; }

  .founders-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  @media (max-width: 640px) {
    .founders-grid { grid-template-columns: 1fr; }
  }

  .founder-card {
    position: relative;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    padding: 28px 24px 24px;
    overflow: hidden;
    display: flex;
    align-items: flex-start;
    gap: 16px;
    cursor: default;
    transition: border-color 0.3s ease, background 0.3s ease;
  }

  .founder-card:hover {
    border-color: rgba(201,168,76,0.35);
    background: rgba(201,168,76,0.04);
  }

  /* Colored left accent bar */
  .founder-accent {
    position: absolute;
    top: 0; left: 0;
    width: 3px; height: 100%;
    border-radius: 3px 0 0 3px;
    opacity: 0.7;
  }

  .founder-avatar {
    width: 48px; height: 48px;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Cormorant Garamond', serif;
    font-size: 22px; font-weight: 700;
    color: var(--white);
    flex-shrink: 0;
  }

  .founder-body { flex: 1; min-width: 0; }

  .founder-name {
    font-family: 'Cormorant Garamond', serif;
    font-size: 22px; font-weight: 700;
    color: var(--white); margin-bottom: 4px;
    line-height: 1;
  }

  .founder-role {
    font-size: 12px; font-weight: 600;
    color: var(--gold); margin-bottom: 6px;
    letter-spacing: 0.3px;
  }

  .founder-focus {
    font-size: 12.5px;
    color: rgba(255,255,255,0.4);
    line-height: 1.5;
  }

  .founder-index {
    font-family: 'Cormorant Garamond', serif;
    font-size: 44px;
    font-weight: 300;
    opacity: 0.18;
    line-height: 1;
    align-self: flex-end;
    flex-shrink: 0;
  }

  /* ════ CLOSING QUOTE ════ */
  .wwa-quote-wrap {
    position: relative;
    padding: 0 40px;
  }

  @media (max-width: 640px) {
    .wwa-quote-wrap { padding: 0; }
  }

  .wwa-quote {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(201,168,76,0.2);
    border-radius: 20px;
    padding: 52px 56px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }

  @media (max-width: 640px) {
    .wwa-quote { padding: 36px 28px; }
  }

  /* Glow behind quote */
  .wwa-quote::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 60% 50% at 50% 50%, rgba(201,168,76,0.07) 0%, transparent 70%);
    pointer-events: none;
  }

  .quote-mark {
    font-family: 'Cormorant Garamond', serif;
    font-size: 120px;
    line-height: 0.5;
    color: var(--gold);
    opacity: 0.25;
    display: block;
    user-select: none;
  }

  .quote-mark-close {
    line-height: 0.3;
    text-align: right;
  }

  .quote-text {
    font-family: 'Cormorant Garamond', serif;
    font-style: italic;
    font-size: clamp(20px, 3vw, 28px);
    font-weight: 400;
    color: rgba(255,255,255,0.88);
    line-height: 1.6;
    margin: 0 0 20px;
    position: relative;
    z-index: 1;
    max-width: 720px;
    margin-left: auto;
    margin-right: auto;
  }

  .quote-attr {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    letter-spacing: 1.5px;
    color: var(--gold);
    opacity: 0.7;
    text-transform: uppercase;
    position: relative; z-index: 1;
  }
`;

export default WhoWeAre;