import React, { useState, useMemo } from 'react';
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

// Diagram coordinate space (matches SVG viewBox)
const VB_W = 800;
const VB_H = 380;

const EGiftPipelineVisualizer = () => {
  const [mode, setMode] = useState('async');
  const [load, setLoad] = useState(8);

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

  const NODES = {
    customer: { x: 70,  y: 190, label: 'GIFT PURCHASE',  sub: 'giftcard.com',     tone: Tone.neutral,  Icon: ShoppingCart },
    api:      { x: 215, y: 190, label: 'API GATEWAY',    sub: 'Java / EKS',       tone: Tone.neutral,  Icon: Wifi },
    hub:      { x: 375, y: 190,
                label: isAsync ? 'RABBITMQ' : 'SENDGRID',
                sub:   isAsync ? 'durable queue' : 'synchronous send',
                tone:  hubTone,
                Icon:  Layers },
    worker1:  { x: 540, y: 50,  label: 'WORKER 1', sub: 'SES consumer',           tone: Tone.forest, Icon: Mail,          dim: !isAsync },
    worker2:  { x: 540, y: 115, label: 'WORKER 2', sub: 'SES consumer',           tone: Tone.forest, Icon: Mail,          dim: !isAsync },
    workerN:  { x: 540, y: 180, label: 'WORKER N', sub: `${workerCount}× active`, tone: Tone.forest, Icon: Mail,          dim: !isAsync },
    dlq:      { x: 540, y: 310, label: 'DEAD LETTER QUEUE', sub: 'failed deliveries', tone: Tone.gold, Icon: AlertTriangle, dim: !isAsync },
    inbox:    { x: 720, y: 190, label: 'EMAIL DELIVERED',   sub: 'customer inbox',    tone: Tone.deepGreen, Icon: Inbox },
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
      className="w-full p-8 rounded-2xl border"
      style={{
        backgroundColor: C.surface,
        borderColor: C.border,
        color: C.text,
        fontFamily: SANS,
      }}
    >
      {/* ===== Header strip ===== */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
        <h2
          className="text-xl"
          style={{ fontFamily: SERIF, color: C.text, fontWeight: 400, letterSpacing: '-0.01em' }}
        >
          E-Gift Delivery Pipeline
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-2">
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
        <div className="relative w-full" style={{ aspectRatio: `${VB_W} / ${VB_H}` }}>

          {/* connection lines */}
          <svg
            viewBox={`0 0 ${VB_W} ${VB_H}`}
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
            <NodeCard key={key + n.label} node={n} />
          ))}

          {/* flowing dots, per edge */}
          {EDGES.map((e, i) => (
            <EdgeDots
              key={`${e.a}-${e.b}-${i}-${mode}`}
              from={NODES[e.a]}
              to={NODES[e.b]}
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
        className="grid grid-cols-1 md:grid-cols-[auto_1fr] items-center gap-6 mt-6 p-5 rounded-xl border"
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

const NodeCard = ({ node }) => {
  const { Icon, tone } = node;

  return (
    <div
      className="absolute z-10"
      style={{
        left: `${(node.x / VB_W) * 100}%`,
        top: `${(node.y / VB_H) * 100}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div
        className="flex flex-col items-center gap-2 transition-opacity duration-500"
        style={{ opacity: node.dim ? 0.22 : 1 }}
      >
        <div
          className="p-3 rounded-lg transition-all duration-500"
          style={{
            backgroundColor: C.surface,
            border: `1.5px solid ${tone.border}`,
            color: tone.border,
            boxShadow: `0 0 0 4px ${tone.glow}`,
          }}
        >
          <Icon size={20} />
        </div>
        <div className="text-center">
          <div
            className="text-[10px] font-medium whitespace-nowrap"
            style={{ fontFamily: MONO, letterSpacing: '0.05em', color: C.text }}
          >
            {node.label}
          </div>
          <div
            className="text-[9px] mt-0.5 whitespace-nowrap"
            style={{ fontFamily: MONO, color: C.textFaint }}
          >
            {node.sub}
          </div>
        </div>
      </div>
    </div>
  );
};

const EdgeDots = ({ from, to, count, duration, color }) => {
  const fromPct = useMemo(() => ({ x: (from.x / VB_W) * 100, y: (from.y / VB_H) * 100 }), [from.x, from.y]);
  const toPct   = useMemo(() => ({ x: (to.x   / VB_W) * 100, y: (to.y   / VB_H) * 100 }), [to.x, to.y]);
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
