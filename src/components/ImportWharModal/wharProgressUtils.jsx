// Shared helpers for rendering WHAR import progress (used by the modal and the
// ongoing-import badge). Mirrors the states the whar-import service reports:
// queued -> downloading -> processing -> converting -> uploading -> done/error.

export const STEPS = ["Download", "Process", "Upload"];

// which of the 3 visible steps is active for a given backend state
export const stepIndex = (state) =>
  ({
    queued: 0,
    downloading: 0,
    processing: 1,
    converting: 1,
    uploading: 2,
    done: 3,
    error: -1,
  }[state] ?? 0);

export const isRunning = (state) =>
  ["queued", "downloading", "processing", "converting", "uploading"].includes(
    state
  );

// A real percentage when we have a count (processing loop or per-subject
// upload), otherwise null -> caller shows an indeterminate (striped) bar.
export const percentOf = (st) => {
  if (!st) return null;
  if (st.state === "processing" && st.phase_total)
    return Math.round((st.phase_current / st.phase_total) * 100);
  if (st.state === "uploading" && st.subjects_total)
    return Math.round((st.subjects_done / st.subjects_total) * 100);
  if (st.state === "done") return 100;
  return null;
};

export const fmtBytes = (n) => {
  if (!n) return null;
  const mb = n / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;
};

export const fmtElapsed = (ms) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
};

// One-line human caption for the current state.
export const captionOf = (st, elapsedMs) => {
  if (!st) return "Starting...";
  const el = fmtElapsed(elapsedMs);
  switch (st.state) {
    case "queued":
      return "Queued...";
    case "downloading": {
      const b = fmtBytes(st.downloaded_bytes);
      return `Downloading and parsing... ${el}${b ? ` · ${b} downloaded` : ""}`;
    }
    case "processing":
      return st.phase_total
        ? `${st.phase || "Processing"} (${st.phase_current}/${st.phase_total})`
        : `${st.phase || "Processing"}...`;
    case "converting":
      return "Converting to edge-ml format...";
    case "uploading":
      return st.subjects_total
        ? `Uploading ${st.subjects_done}/${st.subjects_total} subjects`
        : "Uploading...";
    case "done":
      return "Done";
    case "error":
      return "Failed";
    default:
      return st.state;
  }
};
