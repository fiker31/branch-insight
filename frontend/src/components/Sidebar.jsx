const NAV = [
  {
    label: "Dashboard",
    active: true,
    icon: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  },
  {
    label: "Terminals",
    icon: "M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM8 12h.01M12 12h.01M16 12h.01",
  },
  {
    label: "Map View",
    icon: "M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2C20 17.5 12 22 12 22zm0-8a3 3 0 100-6 3 3 0 000 6z",
  },
  {
    label: "Alerts",
    badge: 12,
    icon: "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9m-4.27 13a2 2 0 01-3.46 0",
  },
  {
    label: "Reports",
    icon: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
  },
  {
    label: "Analytics",
    icon: "M18 20V10M12 20V4M6 20v-6",
  },
  {
    label: "Settings",
    icon: "M12 15a3 3 0 100-6 3 3 0 000 6zm6.93-3c0-.36-.03-.72-.08-1.06l2.3-1.8-2.2-3.8-2.7 1.02a7.93 7.93 0 00-1.84-1.06L14 2h-4l-.41 2.3a7.93 7.93 0 00-1.84 1.06L5.05 4.34l-2.2 3.8 2.3 1.8A8.3 8.3 0 005.07 12c0 .36.03.72.08 1.06l-2.3 1.8 2.2 3.8 2.7-1.02c.57.41 1.19.76 1.84 1.06L10 22h4l.41-2.3a7.93 7.93 0 001.84-1.06l2.7 1.02 2.2-3.8-2.3-1.8c.05-.34.08-.7.08-1.06z",
  },
];

function Icon({ d }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
}

export default function Sidebar() {
  return (
    <div className="w-[160px] flex-shrink-0 bg-[#0D0F16] border-r border-bdr flex flex-col py-4">
      <div className="flex items-center gap-2 px-4 mb-6">
        <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="white">
            <path d="M10 2L2 17h16L10 2z" />
          </svg>
        </div>
        <span className="text-[11px] font-bold tracking-widest uppercase text-textpri leading-tight">
          Branch<br />
          <span className="text-accent">Insight</span>
        </span>
      </div>

      <nav className="flex flex-col gap-0.5 px-2 flex-1">
        {NAV.map((item) => (
          <button
            key={item.label}
            className={`relative flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-left transition-colors text-xs font-medium ${
              item.active
                ? "bg-accent/15 text-accent"
                : "text-texttri hover:text-textsec hover:bg-surface2"
            }`}
          >
            <Icon d={item.icon} />
            <span>{item.label}</span>
            {item.badge && (
              <span className="ml-auto w-5 h-5 rounded-full bg-[#FF5A72] text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="px-3 pt-3 border-t border-bdr mt-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            AA
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-textpri truncate">Admin User</p>
            <p className="text-[10px] text-texttri truncate">Super Admin</p>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5C6480" strokeWidth="2" strokeLinecap="round" className="ml-auto flex-shrink-0">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      </div>
    </div>
  );
}
