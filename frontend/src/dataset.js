// In-browser port of the former Flask/pandas backend (backend/app.py).
// Parses the uploaded CSV once, caches it, then answers filter/stat queries
// locally so the app needs no server.

import Papa from "papaparse";

const COLUMN_ALIASES = {
  selection_text: "Selection Text",
  primary_id:     "Primary ID",
  location:       "Location",
  in_service:     "In Service(%)",
  out_of_service: "Out of Service(%)",
  hard_faults:    "Hard Faults(%)",
  supply_out:     "Supply Out(%)",
  comms:          "Comms(%)",
};

let cache = null; // { rows, columns, mapping }

/* ── helpers ──────────────────────────────────────────────── */
function findColumn(columns, name) {
  const target = name.toLowerCase().trim();
  return columns.find((c) => c.toLowerCase().trim() === target) || null;
}

function mapColumns(columns) {
  const m = {};
  for (const [key, name] of Object.entries(COLUMN_ALIASES)) {
    m[key] = findColumn(columns, name);
  }
  return m;
}

// Mirrors pandas to_numeric(errors="coerce").fillna(0.0)
function toNumber(v) {
  if (v === null || v === undefined) return 0;
  const s = String(v).trim();
  if (s === "") return 0;
  const n = Number(s);
  return Number.isNaN(n) ? 0 : n;
}

function round2(x) {
  return Math.round((x + Number.EPSILON) * 100) / 100;
}

function mean(nums) {
  if (!nums || nums.length === 0) return 0;
  return round2(nums.reduce((s, x) => s + x, 0) / nums.length);
}

function countPositive(nums) {
  return nums ? nums.filter((x) => x > 0).length : 0;
}

/* ── parsing ──────────────────────────────────────────────── */
async function parseDataset(file) {
  const raw = await file.text();
  const text = raw.replace(/^﻿/, ""); // strip BOM (utf-8-sig)
  const parsed = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.replace(/\s+/g, " ").trim(),
  });
  const columns = parsed.meta.fields || [];
  return { rows: parsed.data, columns, mapping: mapColumns(columns) };
}

/* ── /api/upload equivalent ───────────────────────────────── */
export async function loadCSV(file) {
  if (!file.name.endsWith(".csv")) {
    throw new Error("Only CSV files are supported");
  }

  let ds;
  try {
    ds = await parseDataset(file);
  } catch (e) {
    throw new Error(`Failed to parse CSV: ${e.message}`);
  }

  if (!ds.mapping.selection_text || !ds.mapping.primary_id) {
    throw new Error("Could not find required columns (Selection Text, Primary ID)");
  }

  cache = ds;

  const selCol = ds.mapping.selection_text;
  const districts = [
    ...new Set(
      ds.rows
        .map((r) => r[selCol])
        .filter((v) => v !== null && v !== undefined && v !== ""),
    ),
  ].sort();
  const total = ds.rows.length;

  return {
    districts,
    default_district: districts[0] || "",
    total_records: total,
    column_mapping: cleanMapping(ds.mapping),
    message: `Loaded ${total} records across ${districts.length} districts`,
  };
}

function cleanMapping(mapping) {
  return Object.fromEntries(Object.entries(mapping).filter(([, v]) => v));
}

/* ── /api/filter equivalent ───────────────────────────────── */
export function queryDataset({ district, metric = "hard_faults", order = "desc", page = 1, pageSize = 12 }) {
  if (!cache) throw new Error("No data loaded");
  const { mapping } = cache;

  const selCol = mapping.selection_text;
  let rows = district ? cache.rows.filter((r) => r[selCol] === district) : cache.rows.slice();

  const metricCol = mapping[metric];
  if (metricCol) {
    rows = [...rows].sort((a, b) => {
      const av = toNumber(a[metricCol]);
      const bv = toNumber(b[metricCol]);
      return order === "asc" ? av - bv : bv - av;
    });
  }

  const total = rows.length;
  const totalPages = total > 0 ? Math.ceil(total / pageSize) : 1;
  const start = (page - 1) * pageSize;
  const pageRows = rows.slice(start, start + pageSize);

  const strVal = (r, field) => {
    const col = mapping[field];
    const v = col ? r[col] : "";
    return v === null || v === undefined || v === "" ? "" : String(v);
  };
  const numVal = (r, field) => {
    const col = mapping[field];
    return round2(toNumber(col ? r[col] : 0));
  };

  const outRows = pageRows.map((r) => ({
    primary_id:     strVal(r, "primary_id"),
    selection_text: strVal(r, "selection_text"),
    location:       strVal(r, "location"),
    in_service:     numVal(r, "in_service"),
    out_of_service: numVal(r, "out_of_service"),
    hard_faults:    numVal(r, "hard_faults"),
    supply_out:     numVal(r, "supply_out"),
    comms:          numVal(r, "comms"),
  }));

  // column number arrays over the FILTERED set (not just the page)
  const colNums = (field) => {
    const col = mapping[field];
    return col ? rows.map((r) => toNumber(r[col])) : null;
  };

  const inSvcNums = colNums("in_service");
  const outSvcNums = colNums("out_of_service");
  const metNums = colNums(metric);

  const inServiceCount = inSvcNums ? countPositive(inSvcNums) : 0;

  const severity = metNums
    ? {
        critical: metNums.filter((x) => x >= 100).length,
        high:     metNums.filter((x) => x >= 75 && x < 100).length,
        medium:   metNums.filter((x) => x >= 50 && x < 75).length,
        low:      metNums.filter((x) => x > 0 && x < 50).length,
      }
    : { critical: 0, high: 0, medium: 0, low: 0 };

  const stats = {
    total,
    avg_in_service:  inSvcNums ? mean(inSvcNums) : 0,
    avg_out_service: outSvcNums ? mean(outSvcNums) : 0,
    metric_issues:   metNums ? countPositive(metNums) : 0,
    metric_avg:      metNums ? mean(metNums) : 0,
    in_service_count: inServiceCount,
    out_service_count: total - inServiceCount,
    severity_breakdown: severity,
    metric_averages: {
      hard_faults: mean(colNums("hard_faults")),
      supply_out:  mean(colNums("supply_out")),
      comms:       mean(colNums("comms")),
    },
    metric_issues_all: {
      hard_faults: countPositive(colNums("hard_faults")),
      supply_out:  countPositive(colNums("supply_out")),
      comms:       countPositive(colNums("comms")),
    },
  };

  return {
    rows: outRows,
    total,
    page,
    page_size: pageSize,
    total_pages: totalPages,
    stats,
    column_mapping: cleanMapping(mapping),
  };
}
