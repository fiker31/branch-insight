import { useMemo } from "react";
import { PieChart, Pie, Cell } from "recharts";

/* ── Ring gauge (SVG) ─────────────────────────────────── */
function RingGauge({ pct, color, size = 80 }) {
  const r    = size / 2 - 7;
  const circ = 2 * Math.PI * r;
  const off  = circ - (Math.min(Math.max(pct, 0), 100) / 100) * circ;
  const c    = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={c} cy={c} r={r} fill="none" stroke="var(--c-surf3)" strokeWidth="6" />
      <circle
        cx={c} cy={c} r={r} fill="none"
        stroke={color} strokeWidth="6"
        strokeDasharray={circ} strokeDashoffset={off}
        strokeLinecap="round"
        transform={`rotate(-90 ${c} ${c})`}
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
    </svg>
  );
}

/* ── Sparkline (SVG) ──────────────────────────────────── */
function Sparkline({ data, color }) {
  if (!data || data.length < 2) return null;
  const w = 72, h = 28;
  const max   = Math.max(...data, 0.01);
  const min   = Math.min(...data);
  const range = max - min || 1;
  const pts   = data.map((v, i) => [
    (i / (data.length - 1)) * w,
    h - ((v - min) / range) * (h - 4) - 2,
  ]);
  const d    = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${d} L${w},${h} L0,${h} Z`;
  const id   = color.replace("#", "sg");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0"    />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function fakeSpark(base) {
  let v = base * 0.75;
  return Array.from({ length: 7 }, (_, i) => {
    v = Math.max(0, Math.min(100, v + Math.sin(i * 1.8 + base * 0.05) * base * 0.18));
    return i === 6 ? base : Math.round(v * 10) / 10;
  });
}

/* ── Individual stat cards ───────────────────────────── */
function InServiceCard({ stats }) {
  const spark = useMemo(() => fakeSpark(stats.avg_in_service), [stats.avg_in_service]);
  return (
    <div className="bg-surface border border-bdr rounded-xl p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-2">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22C87A" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
            <span className="text-[10px] font-semibold tracking-[0.1em] uppercase text-texttri">Avg In-Service</span>
          </div>
          <div className="text-[26px] font-bold text-[#22C87A] leading-none mb-1">{stats.avg_in_service}%</div>
          <div className="text-[10px] text-texttri mb-3">{stats.in_service_count ?? "—"} of {stats.total} terminals</div>
          <Sparkline data={spark} color="#22C87A" />
        </div>
        <RingGauge pct={stats.avg_in_service} color="#22C87A" />
      </div>
    </div>
  );
}

function OutServiceCard({ stats }) {
  const spark = useMemo(() => fakeSpark(stats.avg_out_service), [stats.avg_out_service]);
  return (
    <div className="bg-surface border border-bdr rounded-xl p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-2">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FF5A72" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
            <span className="text-[10px] font-semibold tracking-[0.1em] uppercase text-texttri">Avg Out-of-Service</span>
          </div>
          <div className="text-[26px] font-bold text-[#FF5A72] leading-none mb-1">{stats.avg_out_service}%</div>
          <div className="text-[10px] text-texttri mb-3">{stats.out_service_count ?? "—"} of {stats.total} terminals</div>
          <Sparkline data={spark} color="#FF5A72" />
        </div>
        <RingGauge pct={stats.avg_out_service} color="#FF5A72" />
      </div>
    </div>
  );
}

function ServiceDistCard({ stats }) {
  const inCount  = stats.in_service_count  ?? 0;
  const outCount = stats.out_service_count ?? 0;
  const pieData  = [
    { name: "In Service",     value: inCount  },
    { name: "Out of Service", value: outCount },
  ].filter((d) => d.value > 0);

  return (
    <div className="bg-surface border border-bdr rounded-xl p-5">
      <div className="text-[10px] font-semibold tracking-[0.1em] uppercase text-texttri mb-3">
        Service Distribution
      </div>
      <div className="flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <PieChart width={110} height={110}>
            <Pie
              data={pieData.length ? pieData : [{ name: "empty", value: 1 }]}
              cx={55} cy={55}
              innerRadius={33} outerRadius={50}
              startAngle={90} endAngle={-270}
              dataKey="value" strokeWidth={2}
              stroke="var(--c-surface)"
            >
              <Cell fill="#22C87A" />
              <Cell fill={pieData.length > 1 ? "#FF5A72" : "#222631"} />
            </Pie>
          </PieChart>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-sm font-bold text-textpri leading-none">{stats.total}</span>
            <span className="text-[9px] text-texttri">total</span>
          </div>
        </div>
        <div className="flex flex-col gap-2.5 text-xs">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="w-2 h-2 rounded-full bg-[#22C87A] flex-shrink-0" />
              <span className="text-textsec">In Service</span>
            </div>
            <p className="font-bold text-textpri pl-3.5">
              {inCount} <span className="text-texttri font-normal text-[10px]">({stats.avg_in_service}%)</span>
            </p>
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="w-2 h-2 rounded-full bg-[#FF5A72] flex-shrink-0" />
              <span className="text-textsec">Out of Service</span>
            </div>
            <p className="font-bold text-textpri pl-3.5">
              {outCount} <span className="text-texttri font-normal text-[10px]">({stats.avg_out_service}%)</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const METRIC_LABELS = { hard_faults: "Hard Fault", supply_out: "Supply Out", comms: "Comms" };

function MetricIssuesCard({ stats, metric }) {
  const label = METRIC_LABELS[metric] || "Metric";
  const spark = useMemo(() => fakeSpark(stats.metric_avg || 0), [stats.metric_avg]);
  return (
    <div className="bg-surface border border-bdr rounded-xl p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-2">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#F0B429" strokeWidth="2.5" strokeLinecap="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" />
            </svg>
            <span className="text-[10px] font-semibold tracking-[0.1em] uppercase text-texttri">{label} Issues</span>
          </div>
          <div className="text-[26px] font-bold text-[#F0B429] leading-none mb-1">{stats.metric_issues}</div>
          <div className="text-[10px] text-texttri mb-3">of {stats.total} terminals</div>
          <Sparkline data={spark} color="#F0B429" />
        </div>
        <RingGauge pct={(stats.metric_issues / (stats.total || 1)) * 100} color="#F0B429" />
      </div>
    </div>
  );
}

export default function StatsCards({ stats }) {
  if (!stats) return null;
  return (
    <>
      <InServiceCard   stats={stats} />
      <OutServiceCard  stats={stats} />
      <ServiceDistCard stats={stats} />
    </>
  );
}
