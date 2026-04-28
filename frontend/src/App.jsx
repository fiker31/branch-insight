import { useState, useCallback, useRef } from "react";
import { uploadCSV, fetchFiltered } from "./api";
import UploadScreen from "./components/UploadScreen";
import FilterBar from "./components/FilterBar";
import StatsRow from "./components/StatsRow";
import DataTable from "./components/DataTable";

const PAGE_SIZE = 12;

function Pagination({ page, totalPages, total, pageSize, onPage }) {
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  function pages() {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const left = Math.max(2, page - 2);
    const right = Math.min(totalPages - 1, page + 2);
    const result = [1];
    if (left > 2) result.push("ellipsis-left");
    for (let p = left; p <= right; p++) result.push(p);
    if (right < totalPages - 1) result.push("ellipsis-right");
    result.push(totalPages);
    return result;
  }

  const navCls =
    "min-w-[30px] px-2 py-1 rounded-md text-xs border transition-colors bg-surface2 border-bdr2 text-textsec hover:border-accent hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed";

  const pageCls = (active) =>
    `min-w-[30px] px-2 py-1 rounded-md text-xs border transition-colors ` +
    (active
      ? "bg-accent border-accent text-white font-medium"
      : "bg-surface2 border-bdr2 text-textsec hover:border-accent hover:text-accent");

  return (
    <div className="flex items-center justify-between px-6 py-3 border-t border-bdr bg-surface flex-shrink-0">
      <span className="text-xs text-texttri">
        {total > 0
          ? `Showing ${start}–${end} of ${total} records`
          : "No records"}
      </span>
      <div className="flex gap-1 items-center">
        <button className={navCls} disabled={page === 1} onClick={() => onPage(page - 1)}>
          ‹
        </button>
        {pages().map((p) =>
          typeof p === "string" ? (
            <span key={p} className="px-1 text-xs text-texttri select-none">
              …
            </span>
          ) : (
            <button key={p} className={pageCls(p === page)} onClick={() => onPage(p)}>
              {p}
            </button>
          ),
        )}
        <button className={navCls} disabled={page >= totalPages} onClick={() => onPage(page + 1)}>
          ›
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [file, setFile] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [filters, setFilters] = useState({
    district: "",
    metric: "hard_faults",
    order: "desc",
    page: 1,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const abortRef = useRef(null);

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
    const initialFilters = {
      district: defaultDistrict,
      metric: "hard_faults",
      order: "desc",
      page: 1,
    };
    setFilters(initialFilters);
    setResult(null);
    runFilter(f, initialFilters);
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
    <div className="min-h-screen flex flex-col bg-bg">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-bdr bg-surface flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent" />
            <span className="w-2 h-2 rounded-full bg-[#22C87A] opacity-70" />
            <span className="w-2 h-2 rounded-full bg-[#F0B429] opacity-50" />
            <span className="ml-1 text-[11px] font-medium tracking-[0.1em] uppercase text-texttri">
              Branch Insight
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-surface2 border border-bdr2 rounded-lg px-2.5 py-1 text-xs font-mono">
            <span className="text-[#22C87A]">●</span>
            <span className="text-textsec truncate max-w-[200px]">
              {file.name}
            </span>
          </div>
          {result && (
            <span className="text-xs text-texttri">
              {result.total} records · {districts.length} districts
            </span>
          )}
        </div>
        <button
          onClick={handleReset}
          className="text-xs text-textsec border border-bdr2 rounded-lg px-3 py-1.5 hover:border-accent hover:text-accent transition-colors"
        >
          Upload new file
        </button>
      </div>

      {/* Filter bar */}
      <FilterBar
        districts={districts}
        filters={filters}
        onChange={handleFilterChange}
      />

      {/* Content */}
      <div className="flex-1 px-6 py-4 overflow-auto">
        {error && (
          <div className="mb-4 text-sm text-[#FF5A72] bg-[#FF5A72]/10 border border-[#FF5A72]/20 rounded-lg px-4 py-2">
            {error}
          </div>
        )}

        {loading && !result && (
          <div className="flex items-center gap-2 text-texttri text-sm py-8">
            <span className="animate-spin inline-block w-4 h-4 border-2 border-bdr2 border-t-accent rounded-full" />
            Loading…
          </div>
        )}

        {result && (
          <>
            <StatsRow stats={result.stats} metric={filters.metric} />
            <div
              className={`transition-opacity duration-150 ${loading ? "opacity-50 pointer-events-none" : "opacity-100"}`}
            >
              <DataTable
                rows={result.rows}
                metric={filters.metric}
                page={filters.page}
                pageSize={PAGE_SIZE}
              />
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
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
