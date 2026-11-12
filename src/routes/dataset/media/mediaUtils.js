// Helpers for recordings (audio/video) shown on the dataset timeline.

export const mediaOf = (dataset) => dataset?.mediaSeries ?? [];

// Start and end of everything a dataset holds, sensor data and recordings.
export const datasetBounds = (dataset) => {
  const spans = [...(dataset?.timeSeries ?? []), ...mediaOf(dataset)]
    .map((item) => [Number(item.start), Number(item.end)])
    // a series created through the device API has start > end until its
    // first samples arrive
    .filter(([start, end]) => Number.isFinite(start) && Number.isFinite(end) && start <= end);
  if (spans.length === 0) return undefined;
  return {
    start: Math.min(...spans.map(([start]) => start)),
    end: Math.max(...spans.map(([, end]) => end)),
  };
};

export const describeMedia = (dataset) => {
  const media = mediaOf(dataset);
  const count = (kind) => media.filter((item) => item.kind === kind).length;
  return [
    [count("video"), "video"],
    [count("audio"), "audio"],
  ]
    .filter(([n]) => n > 0)
    .map(([n, kind]) => `${n} ${kind}`)
    .join(" · ");
};

// 83456 -> "1:23.4"
export const formatDuration = (ms) => {
  const sign = ms < 0 ? "-" : "";
  // round first: 59.98 s is "1:00.0", not "0:60.0"
  const total = Math.round(Math.abs(ms) / 100) / 10;
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = (total % 60).toFixed(1).padStart(4, "0");
  return hours > 0
    ? `${sign}${hours}:${String(minutes).padStart(2, "0")}:${seconds}`
    : `${sign}${minutes}:${seconds}`;
};

export const formatSize = (bytes) => {
  if (!Number.isFinite(bytes)) return "";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
};

export const formatShift = (ms) =>
  `${ms > 0 ? "+" : ms < 0 ? "−" : ""}${(Math.abs(ms) / 1000).toFixed(2)} s`;

const EMPTY_WAVEFORM = [[], [], []];

// The part of a waveform that is on screen, as uPlot data [time, high, low]
// with at most `width` points. `peaks` is what the server computed:
// { rate (buckets per second), min[], max[] }, starting at media.start.
export const waveformData = (peaks, media, range, width) => {
  if (!peaks?.max?.length || !(peaks.rate > 0)) return EMPTY_WAVEFORM;
  // Quiet recordings would be a flat line at full scale, so the waveform is
  // drawn relative to its own loudest point.
  if (peaks.gain === undefined) {
    let loudest = 1;
    for (let i = 0; i < peaks.max.length; i++) {
      loudest = Math.max(loudest, peaks.max[i], -peaks.min[i]);
    }
    peaks.gain = 127 / loudest;
  }
  const gain = peaks.gain;
  const perMs = peaks.rate / 1000;
  const count = peaks.max.length;
  const first = Math.max(0, Math.floor((range.min - media.start) * perMs));
  const last = Math.min(count, Math.ceil((range.max - media.start) * perMs));
  if (last <= first) return EMPTY_WAVEFORM;
  const step = Math.max(1, Math.ceil((last - first) / Math.max(width, 1)));
  const times = [];
  const highs = [];
  const lows = [];
  for (let i = first; i < last; i += step) {
    let high = -Infinity;
    let low = Infinity;
    const end = Math.min(i + step, last);
    for (let j = i; j < end; j++) {
      if (peaks.max[j] > high) high = peaks.max[j];
      if (peaks.min[j] < low) low = peaks.min[j];
    }
    times.push(media.start + (i + (end - i) / 2) / perMs);
    highs.push(high * gain);
    lows.push(low * gain);
  }
  return [times, highs, lows];
};

// Height of a recording's row on the timeline. A recording without sound has
// no waveform, but its row still has to hold the labels and the strip that
// moves the playhead, so it must not shrink to a sliver. `roomy`: few rows on
// the page, use the space.
export const rowHeight = (media, roomy = false) => {
  if (!media.meta?.audioCodec) return roomy ? 150 : 110;
  if (media.kind === "audio") return roomy ? 280 : 190;
  return roomy ? 220 : 150;
};

export const ACCEPTED_MEDIA =
  "audio/*,video/*,.mp4,.m4v,.mov,.webm,.mp3,.wav,.ogg,.oga,.flac,.m4a";


// ---- zooming and panning the visible part of the timeline

// The closest one can zoom in.
export const MIN_VISIBLE_MS = 250;

const fitRange = (min, span, full) => {
  const fullSpan = full.max - full.min;
  if (span >= fullSpan) return { min: full.min, max: full.max };
  const start = Math.min(Math.max(min, full.min), full.max - span);
  return { min: start, max: start + span };
};

// Zooms by `factor` (< 1 zooms in), keeping the time `anchor` where it is on
// screen.
export const zoomRange = (range, full, factor, anchor) => {
  const span = range.max - range.min;
  const nextSpan = Math.min(
    Math.max(span * factor, Math.min(MIN_VISIBLE_MS, full.max - full.min)),
    full.max - full.min
  );
  const at = Number.isFinite(anchor)
    ? Math.min(Math.max(anchor, range.min), range.max)
    : range.min + span / 2;
  const position = span > 0 ? (at - range.min) / span : 0.5;
  return fitRange(at - position * nextSpan, nextSpan, full);
};

export const panRange = (range, full, delta) =>
  fitRange(range.min + delta, range.max - range.min, full);

// Shows `span` ms with `center` in the middle (as far as the ends allow).
export const showSpan = (full, span, center) =>
  fitRange(center - span / 2, Math.max(span, 1), full);

// ---- time axis relative to the start of the dataset

const STEPS_MS = [
  10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10_000, 15_000, 30_000, 60_000,
  120_000, 300_000, 600_000, 900_000, 1_800_000, 3_600_000, 7_200_000,
  14_400_000, 43_200_000, 86_400_000,
];

// Distance between ticks so that they are at least `minPx` apart.
export const tickStep = (spanMs, widthPx, minPx = 90) => {
  const needed = (spanMs * minPx) / Math.max(widthPx, 1);
  return STEPS_MS.find((step) => step >= needed) ?? STEPS_MS[STEPS_MS.length - 1];
};

export const tickTimes = (origin, min, max, step) => {
  const ticks = [];
  for (let k = Math.ceil((min - origin) / step); origin + k * step <= max; k++) {
    ticks.push(origin + k * step);
  }
  return ticks;
};

// 83456 -> "1:23" / "1:23.5" / "1:23.46", as fine as `step` needs
export const formatElapsed = (ms, step = 1000) => {
  const decimals = step >= 1000 ? 0 : step >= 100 ? 1 : 2;
  const sign = ms < 0 ? "-" : "";
  const total = Math.abs(ms) / 1000;
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  // floor, not round: 59.96 s must not print as 60.0
  const scale = 10 ** decimals;
  const seconds = (Math.floor((total % 60) * scale + 1e-6) / scale)
    .toFixed(decimals)
    .padStart(decimals ? decimals + 3 : 2, "0");
  return hours > 0
    ? `${sign}${hours}:${String(minutes).padStart(2, "0")}:${seconds}`
    : `${sign}${minutes}:${seconds}`;
};

// What to show when a dataset opens. A long recording squeezed into one
// screen is a solid block with hair-thin labels, so those start zoomed in.
export const LONG_RECORDING_MS = 5 * 60 * 1000;
export const INITIAL_SPAN_MS = 60 * 1000;

export const initialRange = (full, hasMedia) =>
  hasMedia && full.max - full.min > LONG_RECORDING_MS
    ? { min: full.min, max: full.min + INITIAL_SPAN_MS }
    : full;
