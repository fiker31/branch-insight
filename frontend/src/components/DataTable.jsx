const METRIC_LABELS = {
  hard_faults: "Hard Faults (%)",
  supply_out: "Supply Out (%)",
  comms: "Comms (%)",
};

function PctBar({ value, color }) {
  const colors = {
    green: "bg-[#22C87A]",
    red: "bg-[#FF5A72]",
    amber: "bg-[#F0B429]",
  };
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 rounded-full bg-surface3 overflow-hidden min-w-[40px]">
        <div
          className={`h-full rounded-full ${colors[color]}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      <span className="font-mono text-[11px] text-textsec min-w-[42px] text-right">
        {value.toFixed(2)}%
      </span>
    </div>
  );
}

function MetricPill({ value }) {
  if (value === 0)
    return (
      <span className="inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium bg-[#22C87A]/10 text-[#22C87A]">
        0.00%
      </span>
    );
  if (value < 5)
    return (
      <span className="inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium bg-[#F0B429]/10 text-[#F0B429]">
        {value.toFixed(2)}%
      </span>
    );
  return (
    <span className="inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium bg-[#FF5A72]/10 text-[#FF5A72]">
      {value.toFixed(2)}%
    </span>
  );
}

export default function DataTable({ rows, metric, page, pageSize }) {
  const metricLabel = METRIC_LABELS[metric] || metric;

  if (!rows || rows.length === 0) {
    return (
      <div className="bg-surface border border-bdr rounded-xl flex items-center justify-center py-20 text-texttri text-sm">
        No records match the selected filters.
      </div>
    );
  }

  return (
    <div className="bg-surface border border-bdr rounded-xl overflow-hidden">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-surface2 border-b border-bdr2">
            <th className="px-4 py-3 text-left text-[11px] font-medium tracking-[0.07em] uppercase text-texttri w-10">
              #
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-medium tracking-[0.07em] uppercase text-texttri">
              Primary ID
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-medium tracking-[0.07em] uppercase text-texttri">
              District
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-medium tracking-[0.07em] uppercase text-texttri">
              In Service (%)
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-medium tracking-[0.07em] uppercase text-texttri">
              Out of Service (%)
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-medium tracking-[0.07em] uppercase text-accent">
              {metricLabel}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const n = (page - 1) * pageSize + i + 1;
            const metricValue = row[metric] ?? 0;
            return (
              <tr
                key={i}
                className="border-b border-bdr last:border-0 hover:bg-surface2 transition-colors"
              >
                <td className="px-4 py-3 text-texttri text-[11px] font-mono">
                  {n}
                </td>
                <td className="px-4 py-3 font-medium text-textpri text-[13px]">
                  {row.primary_id || "—"}
                </td>
                <td className="px-4 py-3 text-textsec text-xs">
                  {row.selection_text || "—"}
                </td>
                <td className="px-4 py-3">
                  <PctBar value={row.in_service} color="green" />
                </td>
                <td className="px-4 py-3">
                  <PctBar value={row.out_of_service} color="red" />
                </td>
                <td className="px-4 py-3">
                  <MetricPill value={metricValue} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
