const METRICS = [
  { value: "hard_faults", label: "Hard Faults (%)" },
  { value: "supply_out",  label: "Supply Out (%)"  },
  { value: "comms",       label: "Comms (%)"        },
];

const ORDERS = [
  { value: "desc", label: "Descending (highest first)" },
  { value: "asc",  label: "Ascending (lowest first)"   },
];

const DistrictIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><path d="M9 22V12h6v10" />
  </svg>
);
const MetricIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M18 20V10M12 20V4M6 20v-6" />
  </svg>
);
const OrderIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M3 6h18M7 12h10M11 18h2" />
  </svg>
);
const Chevron = () => (
  <svg width="9" height="5" viewBox="0 0 10 6" fill="none" className="flex-shrink-0 text-texttri">
    <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

function FilterCol({ icon, label, value, onChange, options }) {
  return (
    <div className="flex-1 flex items-center gap-3 px-5 py-3.5 border-r border-bdr last:border-0">
      <span className="text-texttri flex-shrink-0">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold tracking-[0.1em] uppercase text-texttri mb-0.5">{label}</p>
        <select
          className="w-full bg-transparent text-textpri text-sm font-medium appearance-none outline-none cursor-pointer truncate"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <Chevron />
    </div>
  );
}

export default function FilterBar({ districts, filters, onChange }) {
  return (
    <div className="flex border-b border-bdr bg-surface flex-shrink-0">
      <FilterCol
        icon={<DistrictIcon />} label="District"
        value={filters.district}
        onChange={(v) => onChange({ ...filters, district: v, page: 1 })}
        options={districts.map((d) => ({ value: d, label: d }))}
      />
      <FilterCol
        icon={<MetricIcon />} label="Sort Metric"
        value={filters.metric}
        onChange={(v) => onChange({ ...filters, metric: v, page: 1 })}
        options={METRICS}
      />
      <FilterCol
        icon={<OrderIcon />} label="Order"
        value={filters.order}
        onChange={(v) => onChange({ ...filters, order: v, page: 1 })}
        options={ORDERS}
      />
    </div>
  );
}
