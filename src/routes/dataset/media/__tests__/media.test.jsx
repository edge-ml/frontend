import { describe, expect, it, vi } from "vitest";
import { Playback } from "../playback";
import {
  datasetBounds,
  describeMedia,
  formatDuration,
  formatShift,
  formatSize,
  rowHeight,
  waveformData,
} from "../mediaUtils";

// A stand-in for an <audio>/<video> element.
const element = () => ({
  currentTime: 0,
  paused: true,
  ended: false,
  playbackRate: 1,
  play() {
    this.paused = false;
    return Promise.resolve();
  },
  pause() {
    this.paused = true;
  },
});

const media = (overrides = {}) => ({
  _id: "m1",
  kind: "video",
  start: 10_000,
  end: 30_000,
  durationMs: 20_000,
  ...overrides,
});

const playbackWith = (...items) => {
  const playback = new Playback();
  playback.setRange({ min: 0, max: 60_000 });
  const elements = items.map((item) => {
    const el = element();
    playback.register(item, el);
    return el;
  });
  return { playback, elements };
};

describe("Playback", () => {
  it("seeks every recording to its own position", () => {
    const { playback, elements } = playbackWith(
      media(),
      media({ _id: "m2", start: 0, end: 15_000, durationMs: 15_000 })
    );
    playback.seek(12_000);
    expect(elements[0].currentTime).toBe(2);
    expect(elements[1].currentTime).toBe(12);
    // past the end of the second one: it rests on its last frame
    playback.seek(20_000);
    expect(elements[0].currentTime).toBe(10);
    expect(elements[1].currentTime).toBe(15);
  });

  it("keeps the playhead inside the dataset", () => {
    const { playback } = playbackWith(media());
    playback.seek(-5);
    expect(playback.time).toBe(0);
    playback.seek(99_000);
    expect(playback.time).toBe(60_000);
  });

  it("plays only the recordings under the playhead", () => {
    const { playback, elements } = playbackWith(media());
    playback.playing = true; // without the animation loop
    playback.advance(1000);
    expect(playback.time).toBe(1000);
    expect(elements[0].paused).toBe(true);
    playback.time = 10_500;
    playback.advance(0);
    expect(elements[0].paused).toBe(false);
    expect(elements[0].currentTime).toBe(0.5);
  });

  it("follows the clock of a playing recording", () => {
    const { playback, elements } = playbackWith(media());
    playback.playing = true;
    playback.time = 11_000;
    playback.syncAll(true);
    elements[0].currentTime = 1.4; // the element moved on by itself
    playback.advance(16);
    expect(playback.time).toBe(11_400);
  });

  it("re-seeks a recording that drifted", () => {
    const { playback, elements } = playbackWith(
      media(),
      media({ _id: "m2", start: 10_000 })
    );
    playback.playing = true;
    playback.time = 12_000;
    playback.syncAll(true);
    elements[1].currentTime = 3; // a second ahead of the first
    playback.advance(16);
    expect(elements[1].currentTime).toBe(2);
  });

  it("stops at the end and restarts from the beginning", () => {
    const { playback } = playbackWith(media());
    const raf = vi.spyOn(globalThis, "requestAnimationFrame").mockReturnValue(1);
    playback.seek(59_990);
    playback.play();
    playback.advance(100);
    expect(playback.playing).toBe(false);
    expect(playback.time).toBe(60_000);
    playback.play();
    expect(playback.time).toBe(0);
    playback.pause();
    raf.mockRestore();
  });

  it("moves a recording that is being aligned", () => {
    const { playback, elements } = playbackWith(media());
    playback.seek(12_000);
    playback.updateMedia(media({ start: 11_000, end: 31_000 }));
    expect(elements[0].currentTime).toBe(1);
  });

  it("tells views about time and state", () => {
    const { playback } = playbackWith(media());
    const onTime = vi.fn();
    const onState = vi.fn();
    const stop = playback.subscribe(onTime);
    playback.subscribeState(onState);
    playback.seek(5000);
    playback.setRate(2);
    expect(onTime).toHaveBeenCalledWith(5000);
    expect(onState).toHaveBeenCalledTimes(1);
    stop();
    playback.seek(6000);
    expect(onTime).toHaveBeenCalledTimes(1);
  });
});

describe("media helpers", () => {
  it("finds the bounds of sensor data and recordings together", () => {
    expect(datasetBounds({ timeSeries: [], mediaSeries: [] })).toBeUndefined();
    expect(
      datasetBounds({
        timeSeries: [
          { start: 2000, end: 5000 },
          // created through the device API, no samples yet
          { start: 2 ** 63, end: -1 },
        ],
        mediaSeries: [{ start: 1000, end: 4000 }],
      })
    ).toEqual({ start: 1000, end: 5000 });
    // datasets from before recordings existed have no mediaSeries
    expect(datasetBounds({ timeSeries: [{ start: 1, end: 2 }] })).toEqual({
      start: 1,
      end: 2,
    });
  });

  it("describes the recordings of a dataset", () => {
    expect(describeMedia({ timeSeries: [] })).toBe("");
    expect(
      describeMedia({
        mediaSeries: [{ kind: "audio" }, { kind: "video" }, { kind: "audio" }],
      })
    ).toBe("1 video · 2 audio");
  });

  it("formats durations, sizes and shifts", () => {
    expect(formatDuration(83_456)).toBe("1:23.5");
    expect(formatDuration(3_725_000)).toBe("1:02:05.0");
    expect(formatDuration(59_980)).toBe("1:00.0");
    expect(formatSize(200_637)).toBe("196 KB");
    expect(formatSize(4_120_902)).toBe("3.9 MB");
    expect(formatShift(1250)).toBe("+1.25 s");
    expect(formatShift(-100)).toBe("−0.10 s");
    expect(formatShift(0)).toBe("0.00 s");
  });

  it("cuts the visible part out of a waveform", () => {
    // 10 buckets per second for 10 s, starting at t = 1000
    const peaks = {
      rate: 10,
      min: Array.from({ length: 100 }, (_, i) => -i),
      max: Array.from({ length: 100 }, (_, i) => i),
    };
    const item = { start: 1000 };
    const [times, highs, lows] = waveformData(peaks, item, { min: 2000, max: 4000 }, 1000);
    expect(times).toHaveLength(20);
    expect(times[0]).toBe(2050);
    // drawn relative to the loudest point (99 -> 127)
    expect(highs[0]).toBeCloseTo((10 * 127) / 99);
    expect(lows[19]).toBeCloseTo((-29 * 127) / 99);

    // fewer pixels than buckets: neighbours are merged, extremes kept
    const [fewTimes, fewHighs] = waveformData(peaks, item, { min: 1000, max: 11_000 }, 10);
    expect(fewTimes).toHaveLength(10);
    expect(fewHighs[9]).toBeCloseTo(127);

    expect(waveformData(undefined, item, { min: 0, max: 1 }, 10)).toEqual([[], [], []]);
    expect(waveformData(peaks, item, { min: 50_000, max: 60_000 }, 10)).toEqual([[], [], []]);
  });
});

describe("row height", () => {
  it("keeps a recording without sound tall enough to label and scrub", () => {
    const silent = { kind: "video", meta: {} };
    const video = { kind: "video", meta: { audioCodec: "aac" } };
    const audio = { kind: "audio", meta: { audioCodec: "mp3" } };
    expect(rowHeight(silent)).toBeGreaterThanOrEqual(100);
    expect(rowHeight(silent, true)).toBeGreaterThan(rowHeight(silent));
    expect(rowHeight(video)).toBeGreaterThan(rowHeight(silent));
  });
});

describe("video pictures", () => {
  it("takes them coarse first and each once", async () => {
    const { captureOrder, THUMBNAIL_COUNT } = await import("../useVideoThumbnails");
    const order = captureOrder(THUMBNAIL_COUNT);
    expect(order.slice(0, 4)).toEqual([0, 24, 12, 36]);
    expect([...order].sort((a, b) => a - b)).toEqual(
      Array.from({ length: THUMBNAIL_COUNT }, (_, i) => i)
    );
  });

  it("shows the closest picture that is there", async () => {
    const { thumbnailAt, THUMBNAIL_COUNT } = await import("../useVideoThumbnails");
    const frames = new Array(THUMBNAIL_COUNT);
    expect(thumbnailAt(frames, 500, 1000)).toBeUndefined();
    frames[0] = "first";
    frames[24] = "middle";
    expect(thumbnailAt(frames, 0, 1000)).toBe("first");
    expect(thumbnailAt(frames, 520, 1000)).toBe("middle");
    expect(thumbnailAt(frames, 999, 1000)).toBe("middle");
    // outside of the recording
    expect(thumbnailAt(frames, -50, 1000)).toBe("first");
  });
});

describe("timeline zoom and axis", () => {
  const full = { min: 0, max: 3_600_000 };

  it("zooms around an anchor and stays inside the dataset", async () => {
    const { zoomRange, MIN_VISIBLE_MS } = await import("../mediaUtils");
    // the anchor keeps its place on screen (a quarter in)
    expect(zoomRange({ min: 0, max: 60_000 }, full, 0.5, 15_000)).toEqual({ min: 7500, max: 37_500 });
    // zooming out at the start does not run past it
    expect(zoomRange({ min: 0, max: 60_000 }, full, 2, 50_000)).toEqual({ min: 0, max: 120_000 });
    expect(zoomRange({ min: 0, max: 60_000 }, full, 1000, 0)).toEqual(full);
    const closest = zoomRange({ min: 1000, max: 1300 }, full, 0.01, 1100);
    expect(closest.max - closest.min).toBeCloseTo(MIN_VISIBLE_MS);
  });

  it("pans and jumps without leaving the dataset", async () => {
    const { panRange, showSpan } = await import("../mediaUtils");
    expect(panRange({ min: 1000, max: 2000 }, full, 500)).toEqual({ min: 1500, max: 2500 });
    expect(panRange({ min: 1000, max: 2000 }, full, -5000)).toEqual({ min: 0, max: 1000 });
    expect(showSpan(full, 60_000, 3_590_000)).toEqual({ min: 3_540_000, max: 3_600_000 });
    expect(showSpan({ min: 0, max: 10_000 }, 60_000, 5000)).toEqual({ min: 0, max: 10_000 });
  });

  it("opens long recordings zoomed in", async () => {
    const { initialRange } = await import("../mediaUtils");
    expect(initialRange(full, true)).toEqual({ min: 0, max: 60_000 });
    expect(initialRange(full, false)).toBe(full); // sensor data only: as before
    const short = { min: 0, max: 120_000 };
    expect(initialRange(short, true)).toBe(short);
  });

  it("spaces ticks out and labels them as elapsed time", async () => {
    const { tickStep, tickTimes, formatElapsed } = await import("../mediaUtils");
    expect(tickStep(15_000, 1500)).toBe(1000); // 15 s on screen: every second
    expect(tickStep(3_600_000, 1500)).toBe(300_000); // an hour: every 5 min
    expect(tickStep(500, 1500)).toBe(50);
    // ticks sit on multiples of the step counted from the origin
    expect(tickTimes(1_000_250, 1_002_000, 1_004_500, 1000)).toEqual([1_002_250, 1_003_250, 1_004_250]);
    expect(formatElapsed(83_456)).toBe("1:23");
    expect(formatElapsed(83_456, 500)).toBe("1:23.4");
    expect(formatElapsed(83_456, 10)).toBe("1:23.45");
    expect(formatElapsed(59_960, 100)).toBe("0:59.9");
    expect(formatElapsed(3_725_000)).toBe("1:02:05");
  });
});
