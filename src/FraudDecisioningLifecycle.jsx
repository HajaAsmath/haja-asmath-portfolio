import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, Sparkles, Settings, BarChart3, Workflow,
  Check, Eye, XCircle, FileCheck2, Repeat, TrendingUp,
} from 'lucide-react';

// ---------- portfolio palette ----------
const C = {
  bg:        '#f7f4ef',
  surface:   '#ede9e2',
  surface2:  '#e2ddd5',
  text:      '#0f0e0c',
  textMuted: '#3a3832',
  textFaint: '#7a7770',
  accent:    '#1a3a2a',
  accent2:   '#2d6245',
  accentLt:  '#d4ede1',
  gold:      '#b8860b',
  goldLt:    '#f5edc8',
  border:    'rgba(15, 14, 12, 0.1)',
  borderStrong: 'rgba(15, 14, 12, 0.18)',
};
const MONO  = "'DM Mono', ui-monospace, Consolas, monospace";
const SANS  = "'Syne', system-ui, sans-serif";
const SERIF = "'DM Serif Display', serif";

const VB_LANDSCAPE = { w: 1000, h: 560 };
const VB_PORTRAIT  = { w: 400, h: 1100 };

const useIsMobile = () => {
  const [m, setM] = useState(
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 640px)').matches : false
  );
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    const handler = (e) => setM(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return m;
};

const SCENARIOS = {
  approve: {
    label: 'Approve',
    pct:   '~92%',
    desc:  'Score below threshold — auto-approved and logged to the audit trail.',
    color: 'green',
  },
  manual: {
    label: 'Manual Review',
    pct:   '~6%',
    desc:  'Mid-band score routed to an analyst queue with the full decision context.',
    color: 'gold',
  },
  decline: {
    label: 'Decline',
    pct:   '~2%',
    desc:  'Score above hard threshold — blocked, customer notified, fully audited.',
    color: 'muted',
  },
  improvement: {
    label: 'Improvement Loop',
    pct:   'async',
    desc:  'Chargebacks, disputes and confirmed-fraud feed back into rules & scoring.',
    color: 'green',
  },
};

const FraudDecisioningLifecycle = () => {
  const [scenario, setScenario] = useState('approve');
  const [load, setLoad] = useState(8);
  const isMobile = useIsMobile();
  const VB = isMobile ? VB_PORTRAIT : VB_LANDSCAPE;

  const Tone = {
    green:   { border: C.accent2, glow: 'rgba(45,98,69,0.18)' },
    deep:    { border: C.accent,  glow: 'rgba(26,58,42,0.22)' },
    gold:    { border: C.gold,    glow: 'rgba(184,134,11,0.22)' },
    muted:   { border: C.textMuted, glow: 'rgba(58,56,50,0.18)' },
    neutral: { border: C.text,    glow: C.borderStrong },
  };

  // -------- coordinates: landscape vs portrait
  const COORDS = isMobile
    ? {
        event:    { x: 200, y: 60 },
        enrich:   { x: 200, y: 150 },
        rules:    { x: 200, y: 240 },
        score:    { x: 200, y: 330 },
        router:   { x: 200, y: 440 },
        approve:  { x: 80,  y: 560 },
        manual:   { x: 200, y: 560 },
        decline:  { x: 320, y: 560 },
        audit:    { x: 200, y: 720 },
        feedback: { x: 200, y: 840 },
        improve:  { x: 200, y: 960 },
      }
    : {
        event:    { x: 130, y: 80 },
        enrich:   { x: 130, y: 190 },
        rules:    { x: 130, y: 300 },
        score:    { x: 130, y: 410 },
        router:   { x: 500, y: 255 },
        approve:  { x: 500, y: 90 },
        manual:   { x: 500, y: 380 },
        decline:  { x: 500, y: 500 },
        audit:    { x: 870, y: 130 },
        feedback: { x: 870, y: 280 },
        improve:  { x: 870, y: 430 },
      };

  const NODES = {
    event:    { ...COORDS.event,    label: '01 Transaction Event', sub: 'payment / order',           tone: Tone.green,   Icon: Activity },
    enrich:   { ...COORDS.enrich,   label: '02 Signal Enrichment', sub: 'internal + external risk', tone: Tone.green,   Icon: Sparkles },
    rules:    { ...COORDS.rules,    label: '03 Rule Engine',       sub: 'low-latency policy',        tone: Tone.green,   Icon: Settings },
    score:    { ...COORDS.score,    label: '04 Risk Score',        sub: 'normalized context',        tone: Tone.green,   Icon: BarChart3 },

    router:   { ...COORDS.router,   label: 'Decision Router',      sub: 'score-band routing',        tone: Tone.gold,    Icon: Workflow, shape: 'diamond' },
    approve:  { ...COORDS.approve,  label: 'Approve',              sub: SCENARIOS.approve.pct,       tone: Tone.green,   Icon: Check,    dim: scenario !== 'approve' && scenario !== 'improvement' },
    manual:   { ...COORDS.manual,   label: 'Manual Review',        sub: SCENARIOS.manual.pct,        tone: Tone.gold,    Icon: Eye,      dim: scenario !== 'manual' },
    decline:  { ...COORDS.decline,  label: 'Decline',              sub: SCENARIOS.decline.pct,       tone: Tone.muted,   Icon: XCircle,  dim: scenario !== 'decline' },

    audit:    { ...COORDS.audit,    label: '05 Decision + Audit',  sub: 'explainability / compliance', tone: Tone.deep, Icon: FileCheck2 },
    feedback: { ...COORDS.feedback, label: '06 Feedback Loop',     sub: 'chargebacks · disputes',      tone: Tone.deep, Icon: Repeat },
    improve:  { ...COORDS.improve,  label: '07 Improvements',      sub: 'safer future decisions',      tone: Tone.deep, Icon: TrendingUp },
  };

  // Edge definitions. `on` = scenarios where this edge is "active" (dot flow + bright).
  // edges without `on` are always-on (the evaluation + operate spine).
  const EDGES = [
    { a: 'event',   b: 'enrich' },
    { a: 'enrich',  b: 'rules' },
    { a: 'rules',   b: 'score' },
    { a: 'score',   b: 'router' },

    { a: 'router',  b: 'approve', on: ['approve', 'improvement'] },
    { a: 'router',  b: 'manual',  on: ['manual'] },
    { a: 'router',  b: 'decline', on: ['decline'] },

    { a: 'approve', b: 'audit',   on: ['approve', 'improvement'] },
    { a: 'manual',  b: 'audit',   on: ['manual'] },
    { a: 'decline', b: 'audit',   on: ['decline'] },

    { a: 'audit',    b: 'feedback' },
    { a: 'feedback', b: 'improve' },
  ];

  const isActive = (e) => !e.on || e.on.includes(scenario);

  // Scenario coloring of dots
  const sColor = scenario === 'manual' ? C.gold : scenario === 'decline' ? C.textMuted : C.accent2;

  // dot density + speed
  const dotsPerEdge = Math.min(6, Math.max(3, Math.round(load * 0.4)));
  const dotDuration = 1.8;

  // ---------- Path geometry for the curved feedback loop (improve -> rules)
  const feedbackPath = useMemo(() => {
    const A = COORDS.improve, B = COORDS.rules;
    // Sweep out to the right (or below in portrait), then back to rules
    if (isMobile) {
      // long vertical loop back through the right margin
      const xOff = 380;
      return `M ${A.x} ${A.y} C ${xOff} ${A.y}, ${xOff} ${B.y}, ${B.x} ${B.y}`;
    }
    const yDip = VB.h - 30;
    return `M ${A.x} ${A.y} C ${A.x} ${yDip}, ${B.x} ${yDip}, ${B.x} ${B.y}`;
  }, [isMobile, VB.h, COORDS.improve, COORDS.rules]);

  const feedbackActive = scenario === 'improvement';

  return (
    <div
      className="w-full p-4 sm:p-6 md:p-8 rounded-2xl border"
      style={{
        backgroundColor: C.surface,
        borderColor: C.border,
        color: C.text,
        fontFamily: SANS,
      }}
    >
      {/* ===== Header strip ===== */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-5 sm:mb-6 gap-4">
        <h2
          className="text-lg sm:text-xl"
          style={{ fontFamily: SERIF, color: C.text, fontWeight: 400, letterSpacing: '-0.01em' }}
        >
          Real-Time Fraud Decisioning Lifecycle
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 sm:gap-x-8 gap-y-2">
          <Metric label="THROUGHPUT" value={`${load.toFixed(1)}M / day`} />
          <Metric label="DECISION TIME" value="< 200ms" accent="green" />
          <Metric label="ROUTING" value={SCENARIOS[scenario].label} accent={SCENARIOS[scenario].color === 'gold' ? 'gold' : 'green'} />
          <Metric label="EXPLAINABLE" value="full audit trail" />
        </div>
      </div>

      {/* ===== Diagram panel ===== */}
      <div
        className="relative rounded-xl border overflow-hidden"
        style={{ backgroundColor: C.bg, borderColor: C.border }}
      >
        <div className="relative w-full" style={{ aspectRatio: `${VB.w} / ${VB.h}` }}>

          {/* lane background tints */}
          <svg
            viewBox={`0 0 ${VB.w} ${VB.h}`}
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full"
          >
            {!isMobile && (
              <>
                <rect x="20"  y="30"  width="220" height={VB.h - 60} rx="14" fill={C.accentLt} opacity="0.45" />
                <rect x="380" y="30"  width="240" height={VB.h - 60} rx="14" fill={C.goldLt}   opacity="0.45" />
                <rect x="760" y="30"  width="220" height={VB.h - 60} rx="14" fill={C.accentLt} opacity="0.45" />
                <LaneLabel x={130} y={20}  text="EVALUATE TRANSACTION" />
                <LaneLabel x={500} y={20}  text="ROUTE DECISION" />
                <LaneLabel x={870} y={20}  text="OPERATE &amp; IMPROVE" />
              </>
            )}
            {isMobile && (
              <>
                <rect x="20" y="30"  width="360" height="340" rx="14" fill={C.accentLt} opacity="0.45" />
                <rect x="20" y="390" width="360" height="240" rx="14" fill={C.goldLt}   opacity="0.45" />
                <rect x="20" y="650" width="360" height="380" rx="14" fill={C.accentLt} opacity="0.45" />
                <LaneLabel x={200} y={20}  text="EVALUATE TRANSACTION" />
                <LaneLabel x={200} y={380} text="ROUTE DECISION" />
                <LaneLabel x={200} y={640} text="OPERATE &amp; IMPROVE" />
              </>
            )}

            {/* straight edges */}
            {EDGES.map((e, i) => {
              const A = NODES[e.a], B = NODES[e.b];
              const active = isActive(e);
              return (
                <line
                  key={i}
                  x1={A.x} y1={A.y} x2={B.x} y2={B.y}
                  stroke={active ? C.text : C.text}
                  strokeWidth="1"
                  strokeDasharray="4 5"
                  opacity={active ? 0.4 : 0.15}
                />
              );
            })}

            {/* curved feedback loop */}
            <path
              d={feedbackPath}
              fill="none"
              stroke={feedbackActive ? C.accent : C.text}
              strokeWidth={feedbackActive ? 1.4 : 1}
              strokeDasharray="4 5"
              opacity={feedbackActive ? 0.7 : 0.18}
            />
            {/* arrowhead for feedback loop end at rules */}
            <FeedbackArrow at={COORDS.rules} active={feedbackActive} />
          </svg>

          {/* nodes */}
          {Object.entries(NODES).map(([key, n]) => (
            <NodeCard key={key + n.label} node={n} vb={VB} isMobile={isMobile} />
          ))}

          {/* dots: only on active edges */}
          {EDGES.filter(isActive).map((e, i) => (
            <EdgeDots
              key={`${e.a}-${e.b}-${i}-${scenario}`}
              from={NODES[e.a]}
              to={NODES[e.b]}
              vb={VB}
              count={dotsPerEdge}
              duration={dotDuration}
              color={sColor}
            />
          ))}
        </div>

        {/* status / explanation banner */}
        <div className="py-3 px-4 text-center" style={{ borderTop: `1px solid ${C.border}` }}>
          <div
            className="text-[11px] uppercase font-medium mb-0.5"
            style={{
              fontFamily: MONO,
              letterSpacing: '0.32em',
              color: SCENARIOS[scenario].color === 'gold' ? C.gold
                   : SCENARIOS[scenario].color === 'muted' ? C.textMuted
                   : C.accent,
            }}
          >
            {SCENARIOS[scenario].label}
          </div>
          <div
            className="text-[11px] sm:text-xs"
            style={{ fontFamily: SANS, color: C.textMuted }}
          >
            {SCENARIOS[scenario].desc}
          </div>
        </div>
      </div>

      {/* ===== Controls ===== */}
      <div
        className="grid grid-cols-1 md:grid-cols-[1fr_auto] items-stretch md:items-center gap-4 sm:gap-6 mt-5 sm:mt-6 p-4 sm:p-5 rounded-xl border"
        style={{ backgroundColor: C.bg, borderColor: C.border }}
      >
        {/* scenario tabs */}
        <div className="flex flex-col gap-2">
          <label
            className="text-[10px] uppercase font-medium"
            style={{ fontFamily: MONO, letterSpacing: '0.16em', color: C.textFaint }}
          >
            Scenario
          </label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(SCENARIOS).map(([key, s]) => {
              const active = scenario === key;
              const sc = s.color === 'gold' ? C.gold : s.color === 'muted' ? C.textMuted : C.accent;
              return (
                <button
                  key={key}
                  onClick={() => setScenario(key)}
                  className="px-3 py-1.5 rounded-md text-[11px] font-medium transition-all border"
                  style={{
                    fontFamily: MONO,
                    letterSpacing: '0.04em',
                    backgroundColor: active ? sc : C.surface,
                    color: active ? C.bg : C.textMuted,
                    borderColor: active ? sc : C.borderStrong,
                  }}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* traffic slider */}
        <div className="flex items-center gap-4 md:min-w-[260px]">
          <label
            className="text-[10px] uppercase font-medium whitespace-nowrap"
            style={{ fontFamily: MONO, letterSpacing: '0.16em', color: C.textFaint }}
          >
            Volume
          </label>
          <input
            type="range" min="1" max="20" step="1"
            value={load}
            onChange={(e) => setLoad(parseInt(e.target.value))}
            className="flex-1 h-1 rounded-lg appearance-none cursor-pointer"
            style={{ accentColor: C.accent2, backgroundColor: C.surface2 }}
          />
          <span
            className="text-sm font-medium min-w-[2.5ch] text-right"
            style={{ fontFamily: MONO, color: C.text }}
          >
            {load}
          </span>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// Sub-components
// ============================================================

const LaneLabel = ({ x, y, text }) => (
  <text
    x={x} y={y}
    textAnchor="middle"
    style={{
      fontFamily: MONO,
      fontSize: 9,
      letterSpacing: '0.18em',
      fill: C.textFaint,
      fontWeight: 500,
    }}
  >
    {text}
  </text>
);

const FeedbackArrow = ({ at, active }) => (
  <polygon
    points={`${at.x - 4},${at.y + 12} ${at.x + 4},${at.y + 12} ${at.x},${at.y + 4}`}
    fill={active ? C.accent : C.text}
    opacity={active ? 0.75 : 0.18}
  />
);

const Metric = ({ label, value, accent = 'neutral' }) => {
  const valueColor = accent === 'green' ? C.accent : accent === 'gold' ? C.gold : C.text;
  return (
    <div>
      <div
        className="text-[9px] uppercase font-medium"
        style={{ fontFamily: MONO, letterSpacing: '0.16em', color: C.textFaint }}
      >
        {label}
      </div>
      <div
        className="text-sm font-medium"
        style={{ fontFamily: MONO, color: valueColor }}
      >
        {value}
      </div>
    </div>
  );
};

const NodeCard = ({ node, vb, isMobile }) => {
  const { Icon, tone } = node;
  const iconSize = isMobile ? 16 : 20;
  const padding  = isMobile ? 'p-2' : 'p-3';
  const isDiamond = node.shape === 'diamond';

  return (
    <div
      className="absolute z-10"
      style={{
        left: `${(node.x / vb.w) * 100}%`,
        top:  `${(node.y / vb.h) * 100}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div
        className="flex flex-col items-center gap-1.5 transition-opacity duration-500"
        style={{ opacity: node.dim ? 0.25 : 1 }}
      >
        <div
          className={`${padding} transition-all duration-500`}
          style={{
            backgroundColor: C.surface,
            border: `1.5px solid ${tone.border}`,
            color: tone.border,
            borderRadius: isDiamond ? 6 : 8,
            transform: isDiamond ? 'rotate(45deg)' : 'none',
            boxShadow: `0 0 0 4px ${tone.glow}`,
          }}
        >
          <div style={{ transform: isDiamond ? 'rotate(-45deg)' : 'none' }}>
            <Icon size={iconSize} />
          </div>
        </div>
        <div className="text-center" style={{ marginTop: isDiamond ? 6 : 0 }}>
          <div
            className="font-medium whitespace-nowrap"
            style={{
              fontFamily: MONO,
              letterSpacing: '0.05em',
              color: C.text,
              fontSize: isMobile ? '9px' : '10px',
            }}
          >
            {node.label}
          </div>
          <div
            className="mt-0.5 whitespace-nowrap"
            style={{
              fontFamily: MONO,
              color: C.textFaint,
              fontSize: isMobile ? '8px' : '9px',
            }}
          >
            {node.sub}
          </div>
        </div>
      </div>
    </div>
  );
};

const EdgeDots = ({ from, to, vb, count, duration, color }) => {
  const fromPct = useMemo(() => ({ x: (from.x / vb.w) * 100, y: (from.y / vb.h) * 100 }), [from.x, from.y, vb.w, vb.h]);
  const toPct   = useMemo(() => ({ x: (to.x   / vb.w) * 100, y: (to.y   / vb.h) * 100 }), [to.x, to.y, vb.w, vb.h]);
  const stagger = duration / count;
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ left: `${fromPct.x}%`, top: `${fromPct.y}%`, opacity: 0 }}
          animate={{
            left:    [`${fromPct.x}%`, `${toPct.x}%`],
            top:     [`${fromPct.y}%`, `${toPct.y}%`],
            opacity: [0, 1, 1, 0],
          }}
          transition={{ duration, delay: i * stagger, repeat: Infinity, ease: 'linear' }}
          className="absolute w-[7px] h-[7px] rounded-full pointer-events-none"
          style={{ backgroundColor: color, transform: 'translate(-50%, -50%)' }}
        />
      ))}
    </>
  );
};

export default FraudDecisioningLifecycle;
