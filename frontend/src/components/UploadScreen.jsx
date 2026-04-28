import { useRef, useState } from "react";

export default function UploadScreen({ onUpload }) {
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleFile(file) {
    if (!file || !file.name.endsWith(".csv")) {
      setError("Please upload a valid .csv file.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await onUpload(file);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 gap-8 bg-bg">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-accent" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#22C87A] opacity-70" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#F0B429] opacity-50" />
        <span className="ml-2 text-xs font-medium tracking-[0.12em] uppercase text-textsec">
          Branch Insight
        </span>
      </div>

      {/* Title */}
      <div className="text-center">
        <h1 className="text-3xl font-semibold leading-tight text-textpri">
          ATM Performance <span className="text-accent">Analytics</span>
        </h1>
        <p className="mt-3 text-sm text-textsec max-w-sm mx-auto leading-relaxed">
          Upload your Managed Client Performance Report to filter, sort, and
          explore district data instantly.
        </p>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current.click()}
        className={`
          relative w-full max-w-md border-[1.5px] border-dashed rounded-2xl
          px-8 py-12 flex flex-col items-center gap-4 cursor-pointer
          transition-all duration-200
          ${
            dragging
              ? "border-accent bg-accent/10"
              : "border-bdr2 bg-surface hover:border-accent hover:bg-accent/5"
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />

        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-surface2 border border-bdr2 flex items-center justify-center">
          <svg
            className="w-6 h-6 stroke-accent"
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>

        <div className="text-center">
          <p className="text-sm font-medium text-textpri">
            {loading ? "Processing…" : "Drop your CSV file here"}
          </p>
          <p className="text-xs text-texttri font-mono mt-1">
            Managed_Client_Performance_Report.csv
          </p>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            inputRef.current.click();
          }}
          className="bg-accent hover:bg-accent2 transition-colors text-white text-sm font-medium px-5 py-2 rounded-lg"
        >
          {loading ? "Loading…" : "Browse file"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="text-sm text-[#FF5A72] bg-[#FF5A72]/10 border border-[#FF5A72]/20 rounded-lg px-4 py-2">
          {error}
        </div>
      )}

      {/* Footer hint */}
      <div className="flex items-center gap-2 text-xs text-texttri">
        <span>Processed locally</span>
        <span className="w-1 h-1 rounded-full bg-texttri" />
        <span>No data uploaded to cloud</span>
        <span className="w-1 h-1 rounded-full bg-texttri" />
        <span>CSV only</span>
      </div>
    </div>
  );
}
