const METRICS = [
  { value: "hard_faults", label: "Hard Faults (%)" },
  { value: "supply_out", label: "Supply Out (%)" },
  { value: "comms", label: "Comms (%)" },
];

const ORDERS = [
  { value: "desc", label: "Descending (highest first)" },
  { value: "asc", label: "Ascending (lowest first)" },
];

const chevron = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%235C6480' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`;

const selectStyle = {
  backgroundImage: chevron,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 10px center",
};

const selectClass = [
  "w-full bg-surface2 border border-bdr2 rounded-lg",
  "text-textpri text-sm px-3 py-2 pr-8",
  "focus:outline-none focus:border-accent transition-colors",
  "cursor-pointer appearance-none",
].join(" ");

export default function FilterBar({ districts, filters, onChange }) {
  return (
    <div className="grid grid-cols-3 gap-3 px-6 py-4 border-b border-bdr bg-surface">
      {/* District — always pre-selected, no "All" option */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-medium tracking-[0.07em] uppercase text-texttri">
          District
        </label>
        <select
          className={selectClass}
          style={selectStyle}
          value={filters.district}
          onChange={(e) =>
            onChange({ ...filters, district: e.target.value, page: 1 })
          }
        >
          {districts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Sort metric */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-medium tracking-[0.07em] uppercase text-texttri">
          Sort metric
        </label>
        <select
          className={selectClass}
          style={selectStyle}
          value={filters.metric}
          onChange={(e) =>
            onChange({ ...filters, metric: e.target.value, page: 1 })
          }
        >
          {METRICS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      {/* Order */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-medium tracking-[0.07em] uppercase text-texttri">
          Order
        </label>
        <select
          className={selectClass}
          style={selectStyle}
          value={filters.order}
          onChange={(e) =>
            onChange({ ...filters, order: e.target.value, page: 1 })
          }
        >
          {ORDERS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
