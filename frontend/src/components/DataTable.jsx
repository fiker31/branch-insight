import { useState, useMemo } from "react";

const METRIC_LABELS = {
  hard_faults: "Hard Faults (%)",
  supply_out:  "Supply Out (%)",
  comms:       "Comms (%)",
};

function PctBar({ value, color }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex-1 h-2 rounded-full bg-surface3 overflow-hidden min-w-[60px]">
        <div className="h-full rounded-full" style={{ width: `${Math.min(value, 100)}%`, background: color }} />
      </div>
      <span className="font-mono text-xs text-textsec min-w-[52px] text-right">{value.toFixed(2)}%</span>
    </div>
  );
}

function StatusBadge({ inService }) {
  const up = inService > 0;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${up ? "bg-[#22C87A]/10 text-[#22C87A]" : "bg-[#FF5A72]/10 text-[#FF5A72]"}`}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: up ? "#22C87A" : "#FF5A72" }} />
      {up ? "Up" : "Down"}
    </span>
  );
}

function IssueBadge({ value }) {
  if (value === 0)   return null;
  if (value >= 100)  return <span className="inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold bg-[#FF5A72]/10 text-[#FF5A72]">Critical</span>;
  if (value >= 75)   return <span className="inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold bg-[#F0B429]/10 text-[#F0B429]">High</span>;
  if (value >= 50)   return <span className="inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold bg-[#4F6EF7]/10 text-[#4F6EF7]">Medium</span>;
  return               <span className="inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold bg-[#22C87A]/10 text-[#22C87A]">Low</span>;
}

function ATMIcon({ inService }) {
  const color = inService > 0 ? "#22C87A" : "#FF5A72";
  return (
    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round">
        <rect x="2" y="3" width="20" height="18" rx="2" />
        <path d="M8 7h8M8 11h4M7 15h2" />
        <rect x="13" y="13" width="4" height="4" rx="0.5" />
      </svg>
    </div>
  );
}

const TH = ({ children, accent, center }) => (
  <th className={`px-4 py-3.5 text-left text-[10px] font-semibold tracking-[0.08em] uppercase whitespace-nowrap ${accent ? "text-accent" : "text-texttri"} ${center ? "text-center" : ""}`}>
    {children}
  </th>
);

export default function DataTable({ rows, metric, page, pageSize, total }) {
  const [search, setSearch] = useState("");
  const metricLabel = METRIC_LABELS[metric] || metric;
  const metricShort = metricLabel.replace(" (%)", "");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.primary_id?.toLowerCase().includes(q) ||
        r.location?.toLowerCase().includes(q) ||
        r.selection_text?.toLowerCase().includes(q),
    );
  }, [rows, search]);

  return (
    <div className="bg-surface border border-bdr rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-bdr">
        <p className="text-sm font-semibold text-textpri">
          Terminals <span className="text-texttri font-normal ml-1">({total ?? rows.length})</span>
        </p>
        <div className="flex items-center gap-2 bg-surface2 border border-bdr rounded-xl px-3 py-2">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-texttri">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search terminal..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-textpri placeholder-texttri outline-none w-44"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex items-center justify-center py-20 text-texttri text-sm">
          No records match your search.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-surface2 border-b border-bdr">
                <TH>#</TH>
                <TH>Terminal / Location</TH>
                <TH>District</TH>
                <TH>In Service (%)</TH>
                <TH>Out of Service (%)</TH>
                <TH accent>{metricLabel}</TH>
                <TH center>Status</TH>
                <TH center>{metricShort} Issues</TH>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => {
                const n           = (page - 1) * pageSize + i + 1;
                const metricValue = row[metric] ?? 0;
                const loc         = row.location || "";
                const metColor    = metricValue >= 75 ? "#FF5A72" : metricValue >= 25 ? "#F0B429" : "#22C87A";
                return (
                  <tr key={i} className="border-b border-bdr last:border-0 hover:bg-surface2 transition-colors">
                    <td className="px-4 py-4 text-texttri text-xs font-mono w-12">{n}</td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <ATMIcon inService={row.in_service} />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-textpri truncate">{row.primary_id || "—"}</p>
                          {loc && (
                            <p className="text-xs text-texttri truncate flex items-center gap-1 mt-0.5">
                              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2C20 17.5 12 22 12 22zm0-8a3 3 0 100-6 3 3 0 000 6z" />
                              </svg>
                              {loc}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-sm text-textsec max-w-[160px]">
                      <span className="truncate block">{row.selection_text || "—"}</span>
                    </td>

                    <td className="px-4 py-4 min-w-[160px]">
                      <PctBar value={row.in_service}    color="#22C87A" />
                    </td>
                    <td className="px-4 py-4 min-w-[160px]">
                      <PctBar value={row.out_of_service} color="#FF5A72" />
                    </td>
                    <td className="px-4 py-4 min-w-[160px]">
                      <PctBar value={metricValue} color={metColor} />
                    </td>

                    <td className="px-4 py-4 text-center">
                      <StatusBadge inService={row.in_service} />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <IssueBadge value={metricValue} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
