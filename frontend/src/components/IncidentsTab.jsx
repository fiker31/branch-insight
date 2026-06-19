import { useState } from "react";
import { PieChart, Pie, Cell } from "recharts";

/* Incident types — order = slice / column order in the report. */
const INCIDENT_TYPES = [
  { key: "escalated", label: "Escalated-to-Technical team",         color: "#16264d" },
  { key: "informed",  label: "Informed Branch manager/ Senior staff", color: "#22a884" },
  { key: "solved",    label: "Solved Case",                         color: "#3b82f6" },
];

const todayISO = () => new Date().toISOString().slice(0, 10);

/* "2026-06-02" -> "02/06/2026" */
function formatDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

const EMPTY_FORM = {
  district: "East Addis District",
  date: todayISO(),
  escalated: "",
  informed: "",
  solved: "",
};

/* ── Icons ─────────────────────────────────────────────────────── */
const Ic = {
  bank: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3 21h18M4 21V10M20 21V10M3 10l9-6 9 6M9 21v-6h6v6" />
    </svg>
  ),
  users: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  check: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="9" /><path d="M8.5 12.5l2.5 2.5 4.5-5" />
    </svg>
  ),
  trend: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3 17l6-6 4 4 7-7M14 8h7v7" />
    </svg>
  ),
  headset: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M4 14v-2a8 8 0 0116 0v2M4 14a2 2 0 002 2h1v-5H6a2 2 0 00-2 2zM20 14a2 2 0 01-2 2h-1v-5h1a2 2 0 012 2zM18 16v1a4 4 0 01-4 4h-2" />
    </svg>
  ),
  user: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="8" r="4" /><path d="M4 21v-1a6 6 0 016-6h4a6 6 0 016 6v1" />
    </svg>
  ),
  doc: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h6" />
    </svg>
  ),
  shield: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" />
    </svg>
  ),
  calendar: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
};

const ROW_ICONS = { escalated: Ic.headset, informed: Ic.user, solved: Ic.check };

/* ── Donut slice % label ───────────────────────────────────────── */
const RAD = Math.PI / 180;
function sliceLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * RAD);
  const y = cy + r * Math.sin(-midAngle * RAD);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight={700}>
      {Math.round(percent * 100)}%
    </text>
  );
}

/* ── The infographic report (matches the spec image) ───────────── */
function ReportInfographic({ report }) {
  const { district, date, counts, total, percents } = report;
  const pieData = INCIDENT_TYPES.map((t) => ({ name: t.label, value: counts[t.key], color: t.color }));

  const metrics = [
    { icon: Ic.users, value: total,                 label: "Total Incidents Resolved", sub: null },
    { icon: Ic.check, value: counts.solved,         label: "Solved Cases",             sub: `${percents.solved}%` },
    { icon: Ic.trend, value: "100%",                label: "Overall Resolution",       sub: null },
  ];

  const SectionHead = ({ children }) => (
    <div className="bg-[#13294f] text-white text-center text-xs font-bold tracking-[0.12em] uppercase py-3 rounded-t-xl">
      {children}
    </div>
  );

  return (
    <div className="min-h-full w-full bg-[#eef3fa]">
      <div className="w-full">
        {/* ── Header band ── */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#0b1c3f] via-[#13294f] to-[#1c4f96] px-7 py-7">
          <div className="absolute -right-10 top-0 h-full w-1/2 bg-gradient-to-l from-[#2f6fed]/30 to-transparent skew-x-12 pointer-events-none" />
          <div className="relative flex items-start justify-between gap-6">
            <div className="flex items-start gap-4 min-w-0">
              <div className="w-14 h-14 rounded-full bg-[#2f6fed] flex items-center justify-center flex-shrink-0">
                {Ic.bank({ width: 26, height: 26, className: "text-white" })}
              </div>
              <div className="min-w-0">
                <p className="text-[#6fa8ff] text-xs font-bold tracking-[0.18em] uppercase">{district}</p>
                <h1 className="text-white text-2xl sm:text-3xl font-bold leading-tight mt-1">
                  Incidents Resolved by Digital<br className="hidden sm:block" /> Channel Monitoring Team
                </h1>
                <p className="flex items-center gap-2 text-[#6fa8ff] text-xs font-bold tracking-[0.12em] uppercase mt-3">
                  {Ic.calendar({ width: 14, height: 14 })} As of {formatDate(date)}
                </p>
              </div>
            </div>
            {/* Bank logo (PNG) */}
            <div className="hidden lg:flex items-center bg-white rounded-xl px-5 py-3 flex-shrink-0">
              <img
                src="/bank_of_abyssinia.png"
                alt="Bank of Abyssinia"
                className="h-14 w-auto object-contain"
              />
            </div>
          </div>
        </div>

        {/* ── Padded body ── */}
        <div className="p-6 sm:p-8">

        {/* ── Three columns ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Key metrics */}
          <div className="bg-white rounded-xl shadow-sm border border-[#e2e8f4]">
            <SectionHead>Key Metrics</SectionHead>
            <div className="p-5 divide-y divide-[#eef2f9]">
              {metrics.map((m, i) => (
                <div key={i} className="flex items-center gap-4 py-4 first:pt-1 last:pb-1">
                  <div className="w-11 h-11 rounded-full bg-[#eaf1ff] flex items-center justify-center flex-shrink-0 text-[#2f6fed]">
                    {m.icon({ width: 22, height: 22 })}
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-[#13294f] leading-none">{m.value}</p>
                    <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#5a6b8c] mt-1">{m.label}</p>
                    {m.sub && <p className="text-xs font-bold text-[#22a884] mt-0.5">{m.sub}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Donut */}
          <div className="flex flex-col items-center">
            <p className="text-xs font-bold tracking-[0.12em] uppercase text-[#2f6fed] text-center">
              Incident Resolution Breakdown
            </p>
            <span className="block w-10 h-0.5 bg-[#2f6fed] rounded-full mx-auto mt-1 mb-2" />
            <div className="relative">
              <PieChart width={260} height={260}>
                <Pie
                  data={pieData}
                  cx={125} cy={125}
                  innerRadius={72} outerRadius={115}
                  startAngle={90} endAngle={-270}
                  dataKey="value"
                  stroke="#fff" strokeWidth={3}
                  labelLine={false} label={sliceLabel}
                  isAnimationActive={false}
                >
                  {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
              </PieChart>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-extrabold text-[#13294f] leading-none">{total}</span>
                <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#5a6b8c] mt-1">Total<br />Incidents</span>
              </div>
            </div>
            {/* legend */}
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-4">
              {INCIDENT_TYPES.map((t) => (
                <div key={t.key} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ background: t.color }} />
                  <span className="text-[11px] text-[#5a6b8c] font-medium">{t.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-[#e2e8f4]">
            <SectionHead>Detailed Breakdown</SectionHead>
            <div className="p-5 divide-y divide-[#eef2f9]">
              {INCIDENT_TYPES.map((t) => (
                <div key={t.key} className="flex items-center gap-3 py-3.5 first:pt-1">
                  <div className="w-10 h-10 rounded-full bg-[#eaf1ff] flex items-center justify-center flex-shrink-0 text-[#2f6fed]">
                    {ROW_ICONS[t.key]({ width: 19, height: 19 })}
                  </div>
                  <p className="flex-1 text-sm font-semibold text-[#3a4868] leading-snug">{t.label}</p>
                  <div className="text-right">
                    <p className="text-xl font-extrabold text-[#13294f] leading-none">{counts[t.key]}</p>
                    <p className="text-xs font-bold text-[#2f6fed] mt-0.5">{percents[t.key]}%</p>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-3 py-3.5">
                <div className="w-10 h-10 rounded-full bg-[#eaf1ff] flex items-center justify-center flex-shrink-0 text-[#2f6fed]">
                  {Ic.doc({ width: 19, height: 19 })}
                </div>
                <p className="flex-1 text-sm font-semibold text-[#3a4868]">Total Incident</p>
                <div className="text-right">
                  <p className="text-xl font-extrabold text-[#13294f] leading-none">{total}</p>
                  <p className="text-xs font-bold text-[#2f6fed] mt-0.5">100%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Commitment footer ── */}
        <div className="relative overflow-hidden mt-5 bg-white rounded-xl border border-[#e2e8f4] shadow-sm px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* decorative dot grid (right edge) */}
          <div
            className="pointer-events-none hidden md:block absolute right-0 top-0 h-full w-36 opacity-70"
            style={{
              backgroundImage: "radial-gradient(#c3d3ef 1.4px, transparent 1.4px)",
              backgroundSize: "11px 11px",
            }}
          />
          <div className="flex items-start gap-4 flex-1">
            <div className="w-11 h-11 rounded-full bg-[#13294f] flex items-center justify-center flex-shrink-0">
              {Ic.shield({ width: 22, height: 22, className: "text-white" })}
            </div>
            <div>
              <p className="text-xs font-bold tracking-[0.1em] uppercase text-[#13294f]">Our Commitment</p>
              <p className="text-sm text-[#5a6b8c] mt-1 leading-relaxed max-w-xl">
                Our digital channel monitoring team remains committed to timely resolution,
                continuous improvement, and delivering exceptional service to our customers.
              </p>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-3 sm:border-l sm:border-[#e2e8f4] sm:pl-5">
            <div className="w-10 h-10 rounded-full bg-[#13294f] flex items-center justify-center flex-shrink-0 text-white">
              {Ic.calendar({ width: 19, height: 19 })}
            </div>
            <div>
              <p className="text-xs text-[#5a6b8c]">Data as of</p>
              <p className="text-sm font-bold text-[#2f6fed]">{formatDate(date)}</p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

/* ── Form + report tab ────────────────────────────────────────── */
export default function IncidentsTab() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    const counts = {};
    let total = 0;
    for (const t of INCIDENT_TYPES) {
      const n = Number(form[t.key]);
      if (form[t.key] === "" || Number.isNaN(n) || n < 0) {
        setError(`Please enter a valid number for "${t.label}".`);
        return;
      }
      counts[t.key] = n;
      total += n;
    }

    if (total === 0) {
      setError("Total incidents cannot be zero — enter at least one incident.");
      return;
    }

    const percents = {};
    for (const t of INCIDENT_TYPES) {
      percents[t.key] = Math.round((counts[t.key] / total) * 100);
    }

    setError("");
    setReport({ district: form.district.trim() || "—", date: form.date, counts, total, percents });
  }

  /* After submit: show ONLY the designed report page (fills the area below the tab bar). */
  if (report) {
    return (
      <div className="flex-1 min-h-0 overflow-y-auto bg-[#eef3fa]">
        <ReportInfographic report={report} />
      </div>
    );
  }

  const inputCls =
    "w-full bg-surface2 border border-bdr2 rounded-lg px-3 py-2 text-sm text-textpri outline-none focus:border-accent transition-colors";
  const labelCls =
    "block text-[11px] font-semibold tracking-[0.08em] uppercase text-texttri mb-1.5";

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-6 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold text-textpri">
          Incidents <span className="text-accent">Report</span>
        </h1>
        <p className="mt-1 text-sm text-textsec">
          Enter the number of incidents per type. Total and percentages are
          calculated automatically.
        </p>

        {/* ── Form ── */}
        <form
          onSubmit={handleSubmit}
          className="mt-6 bg-surface border border-bdr rounded-xl p-6"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>District</label>
              <input
                className={inputCls}
                value={form.district}
                onChange={(e) => setField("district", e.target.value)}
                placeholder="e.g. East Addis District"
              />
            </div>
            <div>
              <label className={labelCls}>As of date</label>
              <input
                type="date"
                className={inputCls}
                value={form.date}
                onChange={(e) => setField("date", e.target.value)}
              />
            </div>
          </div>

          <p className="mt-6 mb-3 text-[11px] font-semibold tracking-[0.08em] uppercase text-texttri">
            Number of incidents
          </p>
          <div className="grid grid-cols-3 gap-4">
            {INCIDENT_TYPES.map((t) => (
              <div key={t.key}>
                <label className={labelCls}>{t.label}</label>
                <input
                  type="number"
                  min="0"
                  className={inputCls}
                  value={form[t.key]}
                  onChange={(e) => setField(t.key, e.target.value)}
                  placeholder="0"
                />
              </div>
            ))}
          </div>

          {error && (
            <div className="mt-4 text-sm text-[#FF5A72] bg-[#FF5A72]/10 border border-[#FF5A72]/20 rounded-lg px-4 py-2">
              {error}
            </div>
          )}

          <div className="mt-6 flex items-center gap-3">
            <button
              type="submit"
              className="bg-accent hover:bg-accent2 text-white text-sm font-semibold rounded-lg px-5 py-2.5 transition-colors"
            >
              Submit
            </button>
            <button
              type="button"
              onClick={() => {
                setForm(EMPTY_FORM);
                setError("");
              }}
              className="text-sm font-medium text-textsec hover:text-textpri transition-colors px-3 py-2.5"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
