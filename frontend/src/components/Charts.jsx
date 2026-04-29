import { PieChart, Pie, Cell, Tooltip } from "recharts";

const METRICS = [
  { key: "comms",       label: "Comms",       color: "#FF5A72" },
  { key: "hard_faults", label: "Hard Faults", color: "#F0B429" },
  { key: "supply_out",  label: "Supply Out",  color: "#4F6EF7" },
];

const tooltipStyle = {
  background:   "var(--v-surf2)",
  border:       "1px solid var(--v-bdr)",
  borderRadius: 8,
  fontSize:     11,
  color:        "var(--v-textpri)",
};

export default function Charts({ stats }) {
  if (!stats) return null;

  const avgs   = stats.metric_averages   || {};
  const issues = stats.metric_issues_all || {};

  const data = METRICS.map((m) => ({
    name:  m.label,
    value: issues[m.key] || 0,
    avg:   avgs[m.key]   || 0,
    color: m.color,
  }));

  const hasData = data.some((d) => d.value > 0);
  const pieData = hasData ? data.filter((d) => d.value > 0) : [{ name: "None", value: 1, color: "rgb(var(--c-surf3))", avg: 0 }];
  const total   = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="bg-surface border border-bdr rounded-xl p-4">
      <p className="text-[10px] font-semibold tracking-[0.1em] uppercase text-texttri mb-3">
        Metric Overview
      </p>

      <div className="flex items-center gap-3">
        {/* Compact donut */}
        <div className="relative flex-shrink-0">
          <PieChart width={110} height={110}>
            <Pie
              data={pieData}
              cx={55} cy={55}
              innerRadius={33} outerRadius={50}
              startAngle={90} endAngle={-270}
              dataKey="value"
              strokeWidth={2}
              stroke="var(--c-surface)"
            >
              {pieData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v, name, props) => [`avg ${props.payload.avg}%`, name]}
            />
          </PieChart>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-sm font-bold text-textpri leading-none">{total}</span>
            <span className="text-[9px] text-texttri">issues</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2.5 flex-1 min-w-0">
          {METRICS.map((m) => (
            <div key={m.key} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: m.color }} />
                <span className="text-xs text-textsec truncate">{m.label}</span>
              </div>
              <span className="font-mono text-xs font-semibold text-textpri flex-shrink-0">
                {avgs[m.key] ?? 0}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
