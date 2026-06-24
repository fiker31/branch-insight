// Local data layer (no server). Keeps the original async API surface so the
// rest of the app is unchanged — the CSV is parsed and queried in-process.
import { loadCSV, queryDataset } from "./dataset";

export async function uploadCSV(file) {
  return loadCSV(file);
}

export async function fetchFiltered({ district, metric, order, page, pageSize }) {
  return queryDataset({
    district,
    metric,
    order,
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 12,
  });
}
