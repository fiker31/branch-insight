# Branch Insight

ATM performance analytics dashboard. Upload a Managed Client Performance Report CSV and explore per-district metrics with filtering, sorting, and pagination.

---

## Prerequisites

- Python 3.10+
- Node.js 18+

---

## 1 — Backend (Flask)

```bash
cd backend
```

Create and activate a virtual environment:

```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# macOS / Linux
python -m venv .venv
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the server:

```bash
python app.py
```

The API runs at **http://localhost:5000**.

---

## 2 — Frontend (React + Vite)

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The app runs at **http://localhost:5173**.

---

## Usage

1. Open **http://localhost:5173** in your browser
2. Upload a CSV file with the following columns:

   | Column | Description |
   |---|---|
   | Selection Text | District name |
   | Primary ID | ATM identifier |
   | Location | Branch location |
   | In Service(%) | Uptime percentage |
   | Out of Service(%) | Downtime percentage |
   | Hard Faults(%) | Hard fault rate |
   | Supply Out(%) | Cash-out rate |
   | Comms(%) | Communication fault rate |
   | Host Down(%) | Host downtime rate |
   | Daily Balance(%) | Daily balance rate |

3. Select a district, metric, and sort order to explore the data

---

## Project Structure

```
branch-insight/
├── backend/
│   ├── app.py              # Flask API
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── App.jsx         # Main app + pagination
    │   ├── api.js          # API client
    │   └── components/
    │       ├── DataTable.jsx
    │       ├── FilterBar.jsx
    │       ├── StatsRow.jsx
    │       └── UploadScreen.jsx
    └── package.json
```
