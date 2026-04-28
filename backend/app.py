from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import io
import math

app = Flask(__name__)
CORS(app)

COLUMN_ALIASES = {
    "selection_text": "Selection Text",
    "primary_id":     "Primary ID",
    "location":       "Location",
    "in_service":     "In Service(%)",
    "out_of_service": "Out of Service(%)",
    "hard_faults":    "Hard Faults(%)",
    "supply_out":     "Supply Out(%)",
    "comms":          "Comms(%)",
}

def find_column(df_columns, name):
    target = name.lower().strip()
    for col in df_columns:
        if col.lower().strip() == target:
            return col
    return None

def map_columns(df):
    return {key: find_column(df.columns, name) for key, name in COLUMN_ALIASES.items()}

def parse_csv(file):
    content = file.read().decode("utf-8-sig")
    df = pd.read_csv(io.StringIO(content))
    df.columns = df.columns.str.replace(r'\s+', ' ', regex=True).str.strip()
    return df

def coerce_numerics(df, mapping):
    for field in ["in_service", "out_of_service", "hard_faults", "supply_out", "comms"]:
        col = mapping.get(field)
        if col and col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0.0)
    return df


@app.route("/api/upload", methods=["POST"])
def upload():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    if not file.filename.endswith(".csv"):
        return jsonify({"error": "Only CSV files are supported"}), 400

    try:
        df = parse_csv(file)
    except Exception as e:
        return jsonify({"error": f"Failed to parse CSV: {str(e)}"}), 400

    mapping = map_columns(df)

    if not mapping["selection_text"] or not mapping["primary_id"]:
        return jsonify({"error": "Could not find required columns (Selection Text, Primary ID)"}), 400

    df = coerce_numerics(df, mapping)

    # District = full value of Selection Text column (e.g. "District 5: Hawassa")
    districts = sorted(df[mapping["selection_text"]].dropna().unique().tolist())
    total = len(df)

    return jsonify({
        "districts":        districts,
        "default_district": districts[0] if districts else "",
        "total_records":    total,
        "column_mapping":   {k: v for k, v in mapping.items() if v},
        "message":          f"Loaded {total} records across {len(districts)} districts"
    })


@app.route("/api/filter", methods=["POST"])
def filter_data():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file      = request.files["file"]
    body      = request.form
    district  = body.get("district", "")
    metric    = body.get("metric", "hard_faults")
    order     = body.get("order", "desc")
    page      = int(body.get("page", 1))
    page_size = int(body.get("page_size", 12))

    try:
        df = parse_csv(file)
    except Exception as e:
        return jsonify({"error": f"Failed to parse CSV: {str(e)}"}), 400

    mapping = map_columns(df)
    df = coerce_numerics(df, mapping)

    # Always filter by district (district is required, never "all")
    sel_col = mapping["selection_text"]
    if district:
        df = df[df[sel_col] == district]

    metric_col = mapping.get(metric)
    if metric_col and metric_col in df.columns:
        df = df.sort_values(by=metric_col, ascending=(order == "asc"))

    total       = len(df)
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    start       = (page - 1) * page_size
    page_df     = df.iloc[start: start + page_size]

    def safe_float(val):
        try:
            return round(float(val), 2)
        except Exception:
            return 0.0

    def col_val(row, field, default=0):
        col = mapping.get(field)
        return row[col] if col and col in row.index else default

    rows = []
    for _, row in page_df.iterrows():
        rows.append({
            "primary_id":     str(col_val(row, "primary_id", "") or ""),
            "selection_text": str(col_val(row, "selection_text", "") or ""),
            "in_service":     safe_float(col_val(row, "in_service")),
            "out_of_service": safe_float(col_val(row, "out_of_service")),
            "hard_faults":    safe_float(col_val(row, "hard_faults")),
            "supply_out":     safe_float(col_val(row, "supply_out")),
            "comms":          safe_float(col_val(row, "comms")),
        })

    in_svc_col  = mapping.get("in_service")
    out_svc_col = mapping.get("out_of_service")
    met_col     = mapping.get(metric)

    stats = {
        "total":           total,
        "avg_in_service":  round(df[in_svc_col].mean(), 2)  if in_svc_col  and in_svc_col  in df.columns else 0,
        "avg_out_service": round(df[out_svc_col].mean(), 2) if out_svc_col and out_svc_col in df.columns else 0,
        "metric_issues":   int((df[met_col] > 0).sum())     if met_col     and met_col     in df.columns else 0,
        "metric_avg":      round(df[met_col].mean(), 2)     if met_col     and met_col     in df.columns else 0,
    }

    return jsonify({
        "rows":           rows,
        "total":          total,
        "page":           page,
        "page_size":      page_size,
        "total_pages":    total_pages,
        "stats":          stats,
        "column_mapping": {k: v for k, v in mapping.items() if v},
    })


if __name__ == "__main__":
    app.run(debug=True, port=5000)
