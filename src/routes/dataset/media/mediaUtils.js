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
  const total = Math.abs(ms) / 1000;
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

export const ACCEPTED_MEDIA =
  "audio/*,video/*,.mp4,.m4v,.mov,.webm,.mp3,.wav,.ogg,.oga,.flac,.m4a";

