const BASE = "http://localhost:5000/api";

export async function uploadCSV(file) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE}/upload`, { method: "POST", body: form });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Upload failed");
  }
  return res.json();
}

export async function fetchFiltered({
  file,
  district,
  metric,
  order,
  page,
  pageSize,
}) {
  const form = new FormData();
  form.append("file", file);
  form.append("district", district);
  form.append("metric", metric);
  form.append("order", order);
  form.append("page", page);
  form.append("page_size", pageSize ?? 12);
  const res = await fetch(`${BASE}/filter`, { method: "POST", body: form });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Filter failed");
  }
  return res.json();
}
