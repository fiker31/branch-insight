import { useState, useCallback, useRef } from "react";
import { uploadCSV, fetchFiltered } from "./api";
import UploadScreen from "./components/UploadScreen";
import FilterBar from "./components/FilterBar";
import StatsCards from "./components/StatsCards";
import Charts from "./components/Charts";
import DataTable from "./components/DataTable";

const PAGE_SIZE = 12;

/* ── Pagination ──────────────────────────────────────────── */
function Pagination({ page, totalPages, total, pageSize, onPage }) {
  const start = (page - 1) * pageSize + 1;
  const end   = Math.min(page * pageSize, total);

  function pages() {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const left  = Math.max(2, page - 2);
    const right = Math.min(totalPages - 1, page + 2);
    const r = [1];
    if (left > 2) r.push("el");
    for (let p = left; p <= right; p++) r.push(p);
    if (right < totalPages - 1) r.push("er");
    r.push(totalPages);
    return r;
  }

  const navCls =
    "min-w-[30px] px-2 py-1 rounded-md text-xs border transition-colors bg-surface2 border-bdr2 text-textsec hover:border-accent hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed";
  const pageCls = (a) =>
    `min-w-[30px] px-2 py-1 rounded-md text-xs border transition-colors ` +
    (a ? "bg-accent border-accent text-white font-medium"
       : "bg-surface2 border-bdr2 text-textsec hover:border-accent hover:text-accent");

  return (
    <div className="flex items-center justify-between px-6 py-3 border-t border-bdr bg-surface flex-shrink-0">
      <span className="text-xs text-texttri">
        {total > 0 ? `Showing ${start}–${end} of ${total} records` : "No records"}
      </span>
      <div className="flex gap-1 items-center">
        <button className={navCls} disabled={page === 1} onClick={() => onPage(page - 1)}>‹</button>
        {pages().map((p) =>
          typeof p === "string"
            ? <span key={p} className="px-1 text-xs text-texttri select-none">…</span>
            : <button key={p} className={pageCls(p === page)} onClick={() => onPage(p)}>{p}</button>
        )}
        <button className={navCls} disabled={page >= totalPages} onClick={() => onPage(page + 1)}>›</button>
      </div>
    </div>
  );
}

/* ── Theme toggle buttons ────────────────────────────────── */
function ThemeToggle({ isDark, onToggle }) {
  return (
    <div className="flex items-center gap-0.5 bg-surface2 border border-bdr rounded-xl p-0.5">
      <button
        onClick={() => !isDark && onToggle()}
        title="Dark mode"
        className={`p-1.5 rounded-lg transition-colors ${isDark ? "bg-surface3 text-accent" : "text-texttri hover:text-textsec"}`}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      </button>
      <button
        onClick={() => isDark && onToggle()}
        title="Light mode"
        className={`p-1.5 rounded-lg transition-colors ${!isDark ? "bg-surface3 text-accent" : "text-texttri hover:text-textsec"}`}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      </button>
    </div>
  );
}

/* ── App ─────────────────────────────────────────────────── */
export default function App() {
  const [file, setFile]         = useState(null);
  const [districts, setDistricts] = useState([]);
  const [filters, setFilters]   = useState({ district: "", metric: "hard_faults", order: "desc", page: 1 });
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [isDark, setIsDark]     = useState(true);
  const abortRef = useRef(null);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("light", !next);
  }

  const runFilter = useCallback(async (currentFile, currentFilters) => {
    if (!currentFile || !currentFilters.district) return;
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    setError("");
    try {
      const data = await fetchFiltered({
        file: currentFile,
        district: currentFilters.district,
        metric: currentFilters.metric,
        order: currentFilters.order,
        page: currentFilters.page,
        pageSize: PAGE_SIZE,
      });
      if (!ctrl.signal.aborted) setResult(data);
    } catch (e) {
      if (!ctrl.signal.aborted) setError(e.message);
    } finally {
      if (!ctrl.signal.aborted) setLoading(false);
    }
  }, []);

  async function handleUpload(f) {
    const meta = await uploadCSV(f);
    setFile(f);
    setDistricts(meta.districts);
    const defaultDistrict = meta.default_district || meta.districts[0] || "";
    const init = { district: defaultDistrict, metric: "hard_faults", order: "desc", page: 1 };
    setFilters(init);
    setResult(null);
    runFilter(f, init);
  }

  function handleFilterChange(newFilters) {
    setFilters(newFilters);
    runFilter(file, newFilters);
  }

  function handleReset() {
    setFile(null);
    setDistricts([]);
    setFilters({ district: "", metric: "hard_faults", order: "desc", page: 1 });
    setResult(null);
    setError("");
  }

  if (!file) return <UploadScreen onUpload={handleUpload} />;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-bg">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-bdr bg-surface flex-shrink-0 gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 20 20">
              <path d="M10 2L2 17h16L10 2z" fill="#4F6EF7" />
            </svg>
            <span className="text-[11px] font-bold tracking-[0.15em] uppercase text-textpri">
              Branch <span className="text-accent">Insight</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-surface2 border border-bdr2 rounded-lg px-2.5 py-1 text-xs font-mono max-w-[220px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C87A] flex-shrink-0" />
            <span className="text-textsec truncate">{file.name}</span>
          </div>

          {result && (
            <span className="text-xs text-texttri flex-shrink-0">
              {result.total} records · {districts.length} district{districts.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <ThemeToggle isDark={isDark} onToggle={toggleTheme} />

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 bg-accent hover:bg-accent2 text-white text-xs font-semibold rounded-lg px-3 py-1.5 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
            </svg>
            Upload new file
          </button>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <FilterBar districts={districts} filters={filters} onChange={handleFilterChange} />

      {/* ── Cards row — stationary ── */}
      {result && (
        <div className={`px-5 pt-5 pb-4 flex-shrink-0 transition-opacity duration-150 ${loading ? "opacity-50 pointer-events-none" : ""}`}>
          <div className="grid grid-cols-4 gap-4">
            <StatsCards stats={result.stats} />
            <Charts     stats={result.stats} />
          </div>
        </div>
      )}

      {/* ── Table — scrollable ── */}
      <div className="flex-1 overflow-y-auto px-5 pb-5">
        {error && (
          <div className="text-sm text-[#FF5A72] bg-[#FF5A72]/10 border border-[#FF5A72]/20 rounded-lg px-4 py-2 mb-4">
            {error}
          </div>
        )}

        {loading && !result && (
          <div className="flex items-center gap-2 text-texttri text-sm py-12">
            <span className="animate-spin inline-block w-4 h-4 border-2 border-bdr2 border-t-accent rounded-full" />
            Loading…
          </div>
        )}

        {result && (
          <div className={`transition-opacity duration-150 ${loading ? "opacity-50 pointer-events-none" : ""}`}>
            <DataTable
              rows={result.rows}
              metric={filters.metric}
              page={filters.page}
              pageSize={PAGE_SIZE}
              total={result.total}
            />
          </div>
        )}
      </div>

      {/* ── Pagination ── */}
      {result && result.total_pages > 1 && (
        <Pagination
          page={filters.page}
          totalPages={result.total_pages}
          total={result.total}
          pageSize={PAGE_SIZE}
          onPage={(p) => handleFilterChange({ ...filters, page: p })}
        />
      )}
    </div>
  );
}
