import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingCart, Wifi, Layers, Mail, AlertTriangle, Inbox,
} from 'lucide-react';

// ---------- portfolio palette ----------
const C = {
  bg:        '#f7f4ef',
  surface:   '#ede9e2',
  surface2:  '#e2ddd5',
  text:      '#0f0e0c',
  textMuted: '#3a3832',
  textFaint: '#7a7770',
  accent:    '#1a3a2a',   // deep forest
  accent2:   '#2d6245',   // forest
  accentLt:  '#d4ede1',   // mint
  gold:      '#b8860b',
  goldLt:    '#f5edc8',
  border:    'rgba(15, 14, 12, 0.1)',
  borderStrong: 'rgba(15, 14, 12, 0.18)',
};

const MONO  = "'DM Mono', ui-monospace, Consolas, monospace";
const SANS  = "'Syne', system-ui, sans-serif";
const SERIF = "'DM Serif Display', serif";

// Diagram coordinate spaces — separate viewBoxes for landscape vs portrait
const VB_LANDSCAPE = { w: 800, h: 380 };
const VB_PORTRAIT  = { w: 400, h: 620 };

// Detect viewport orientation choice for the diagram (mobile = portrait layout)
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

const EGiftPipelineVisualizer = () => {
  const [mode, setMode] = useState('async');
  const [load, setLoad] = useState(8);
  const isMobile = useIsMobile();
  const VB = isMobile ? VB_PORTRAIT : VB_LANDSCAPE;

  const isAsync = mode === 'async';

  const workerCount = Math.min(12, Math.max(2, Math.ceil(load / 2) + 1));
  const throughput  = `${load.toFixed(1)}M / day`;
  const latency     = isAsync
    ? `${Math.round(80 + load * 12)}ms`
    : `${(1.8 + load * 0.6).toFixed(1)}s`;
  const compute     = isAsync ? `ASG · ${workerCount}× workers` : '1× blocking thread';
  const delivery    = isAsync ? 'RabbitMQ → SES' : 'SendGrid (sync)';

  const dotDuration = isAsync ? 1.4 : 4.2;
  const dotsPerEdge = isAsync ? Math.min(7, Math.max(3, Math.round(load * 0.5))) : 4;

  // Color tokens per node
  const Tone = {
    neutral: { border: C.text,     glow: C.borderStrong },
    forest:  { border: C.accent2,  glow: 'rgba(45,98,69,0.18)' },
    deepGreen: { border: C.accent, glow: 'rgba(26,58,42,0.20)' },
    gold:    { border: C.gold,     glow: 'rgba(184,134,11,0.22)' },
  };

  const hubTone = isAsync ? Tone.gold : Tone.gold;

  // Position table — landscape (desktop) vs portrait (mobile).
  // Same node identities, different coordinates in their respective viewBox.
  const COORDS = isMobile
    ? {
        customer: { x: 200, y: 60 },
        api:      { x: 200, y: 160 },
        hub:      { x: 165, y: 280 },
        dlq:      { x: 335, y: 280 },
        worker1:  { x: 80,  y: 410 },
        worker2:  { x: 200, y: 410 },
        workerN:  { x: 320, y: 410 },
        inbox:    { x: 200, y: 555 },
      }
    : {
        customer: { x: 70,  y: 190 },
        api:      { x: 215, y: 190 },
        hub:      { x: 375, y: 190 },
        worker1:  { x: 540, y: 50  },
        worker2:  { x: 540, y: 115 },
        workerN:  { x: 540, y: 180 },
        dlq:      { x: 540, y: 310 },
        inbox:    { x: 720, y: 190 },
      };

  const NODES = {
    customer: { ...COORDS.customer, label: 'GIFT PURCHASE',  sub: 'giftcard.com',     tone: Tone.neutral,  Icon: ShoppingCart },
    api:      { ...COORDS.api,      label: 'API GATEWAY',    sub: 'Java / EKS',       tone: Tone.neutral,  Icon: Wifi },
    hub:      { ...COORDS.hub,
                label: isAsync ? 'RABBITMQ' : 'SENDGRID',
                sub:   isAsync ? 'durable queue' : 'synchronous send',
                tone:  hubTone,
                Icon:  Layers },
    worker1:  { ...COORDS.worker1, label: 'WORKER 1', sub: 'SES consumer',           tone: Tone.forest, Icon: Mail,          dim: !isAsync },
    worker2:  { ...COORDS.worker2, label: 'WORKER 2', sub: 'SES consumer',           tone: Tone.forest, Icon: Mail,          dim: !isAsync },
    workerN:  { ...COORDS.workerN, label: 'WORKER N', sub: `${workerCount}× active`, tone: Tone.forest, Icon: Mail,          dim: !isAsync },
    dlq:      { ...COORDS.dlq,     label: 'DEAD LETTER QUEUE', sub: 'failed deliveries', tone: Tone.gold, Icon: AlertTriangle, dim: !isAsync },
    inbox:    { ...COORDS.inbox,   label: 'EMAIL DELIVERED',   sub: 'customer inbox',    tone: Tone.deepGreen, Icon: Inbox },
  };

  const EDGES = isAsync
    ? [
        { a: 'customer', b: 'api' },
        { a: 'api',      b: 'hub' },
        { a: 'hub',      b: 'worker1' },
        { a: 'hub',      b: 'worker2' },
        { a: 'hub',      b: 'workerN' },
        { a: 'hub',      b: 'dlq',     rare: true },
        { a: 'worker1',  b: 'inbox' },
        { a: 'worker2',  b: 'inbox' },
        { a: 'workerN',  b: 'inbox' },
      ]
    : [
        { a: 'customer', b: 'api' },
        { a: 'api',      b: 'hub' },
        { a: 'hub',      b: 'inbox' },
      ];

  const dotColor = isAsync ? C.accent2 : C.gold;

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
          E-Gift Delivery Pipeline
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 sm:gap-x-8 gap-y-2">
          <Metric label="THROUGHPUT" value={throughput} />
          <Metric label="P95 LATENCY" value={latency} accent={isAsync ? 'green' : 'gold'} />
          <Metric label="COMPUTE" value={compute} />
          <Metric label="DELIVERY" value={delivery} />
        </div>
      </div>

      {/* ===== Diagram panel ===== */}
      <div
        className="relative rounded-xl border overflow-hidden"
        style={{ backgroundColor: C.bg, borderColor: C.border }}
      >
          <div
            className="relative w-full"
            style={{ aspectRatio: `${VB.w} / ${VB.h}` }}
          >

          {/* connection lines */}
          <svg
            viewBox={`0 0 ${VB.w} ${VB.h}`}
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full"
          >
            {EDGES.map((e, i) => {
              const A = NODES[e.a], B = NODES[e.b];
              return (
                <line
                  key={i}
                  x1={A.x} y1={A.y} x2={B.x} y2={B.y}
                  stroke={C.text}
                  strokeWidth="0.9"
                  strokeDasharray="4 5"
                  opacity={e.rare ? 0.18 : 0.28}
                />
              );
            })}
          </svg>

          {/* nodes */}
          {Object.entries(NODES).map(([key, n]) => (
            <NodeCard key={key + n.label} node={n} vb={VB} isMobile={isMobile} />
          ))}

          {/* flowing dots, per edge */}
          {EDGES.map((e, i) => (
            <EdgeDots
              key={`${e.a}-${e.b}-${i}-${mode}`}
              from={NODES[e.a]}
              to={NODES[e.b]}
              vb={VB}
              count={e.rare ? 2 : dotsPerEdge}
              duration={e.rare ? dotDuration * 2.2 : dotDuration}
              color={e.rare ? C.gold : dotColor}
            />
          ))}
          </div>

        {/* status banner */}
        <div className="py-3 text-center" style={{ borderTop: `1px solid ${C.border}` }}>
          <span
            className="text-[11px] uppercase font-medium"
            style={{
              fontFamily: MONO,
              letterSpacing: '0.32em',
              color: isAsync ? C.accent : C.gold,
            }}
          >
            {isAsync ? '✓  Asynchronous Processing Enabled' : '✕  Synchronous Blocking — Legacy'}
          </span>
        </div>
      </div>

      {/* ===== Controls ===== */}
      <div
        className="grid grid-cols-1 md:grid-cols-[auto_1fr] items-stretch md:items-center gap-4 sm:gap-6 mt-5 sm:mt-6 p-4 sm:p-5 rounded-xl border"
        style={{ backgroundColor: C.bg, borderColor: C.border }}
      >
        <div className="flex items-center gap-3">
          <label
            className="text-[10px] uppercase font-medium whitespace-nowrap"
            style={{ fontFamily: MONO, letterSpacing: '0.16em', color: C.textFaint }}
          >
            Processing Mode
          </label>
          <div className="relative">
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="appearance-none rounded-md pl-3 pr-9 py-2 text-sm font-medium cursor-pointer border"
              style={{
                backgroundColor: C.surface,
                borderColor: C.borderStrong,
                color: C.text,
                fontFamily: MONO,
              }}
            >
              <option value="async">Asynchronous</option>
              <option value="sync">Synchronous (Legacy)</option>
            </select>
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              width="10" height="6" viewBox="0 0 10 6"
            >
              <path d="M1 1l4 4 4-4" stroke={C.textMuted} strokeWidth="1.5" fill="none" />
            </svg>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label
            className="text-[10px] uppercase font-medium whitespace-nowrap"
            style={{ fontFamily: MONO, letterSpacing: '0.16em', color: C.textFaint }}
          >
            Traffic Load (M/day)
          </label>
          <input
            type="range" min="1" max="20" step="1"
            value={load}
            onChange={(e) => setLoad(parseInt(e.target.value))}
            className="flex-1 h-1 rounded-lg appearance-none cursor-pointer"
            style={{
              accentColor: C.accent2,
              backgroundColor: C.surface2,
            }}
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

  return (
    <div
      className="absolute z-10"
      style={{
        left: `${(node.x / vb.w) * 100}%`,
        top: `${(node.y / vb.h) * 100}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div
        className="flex flex-col items-center gap-1.5 transition-opacity duration-500"
        style={{ opacity: node.dim ? 0.22 : 1 }}
      >
        <div
          className={`${padding} rounded-lg transition-all duration-500`}
          style={{
            backgroundColor: C.surface,
            border: `1.5px solid ${tone.border}`,
            color: tone.border,
            boxShadow: `0 0 0 4px ${tone.glow}`,
          }}
        >
          <Icon size={iconSize} />
        </div>
        <div className="text-center">
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
          transition={{
            duration,
            delay: i * stagger,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute w-[7px] h-[7px] rounded-full pointer-events-none"
          style={{
            backgroundColor: color,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </>
  );
};

export default EGiftPipelineVisualizer;
