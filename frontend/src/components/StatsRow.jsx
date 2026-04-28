const METRIC_LABELS = {
  hard_faults: "Hard Fault",
  supply_out: "Supply Out",
  comms: "Comms",
};

function Chip({ dot, label, value }) {
  const dotColors = {
    green: "bg-[#22C87A]",
    red: "bg-[#FF5A72]",
    amber: "bg-[#F0B429]",
  };
  return (
    <div className="flex items-center gap-2 bg-surface border border-bdr rounded-lg px-3 py-2 text-xs text-textsec">
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColors[dot]}`}
        />
      )}
      {label}&nbsp;
      <span className="font-semibold text-sm text-textpri">{value}</span>
    </div>
  );
}

export default function StatsRow({ stats, metric }) {
  if (!stats) return null;

  return (
    <div className="flex gap-2 flex-wrap mb-4">
      <Chip
        dot="green"
        label="Avg In-Service"
        value={`${stats.avg_in_service}%`}
      />
      <Chip
        dot="red"
        label="Avg Out-of-Service"
        value={`${stats.avg_out_service}%`}
      />
      <Chip
        dot="amber"
        label={`${METRIC_LABELS[metric] || "Metric"} issues`}
        value={`${stats.metric_issues} of ${stats.total}`}
      />
      <Chip label="Total records" value={stats.total} />
    </div>
  );
}
