// Keeps the audio/video elements of a dataset in step with one playhead.
//
// The playhead is a unix-ms position on the dataset timeline. Every recording
// has a `start` on that timeline, so its own position is `playhead - start`.
// The playhead moves ~60 times a second while playing, so it is kept out of
// React state: views subscribe and update themselves.

// Elements drifting further than this from the playhead are re-seeked.
const MAX_DRIFT_SECONDS = 0.3;

export const RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

export class Playback {
  constructor() {
    this.time = 0;
    this.playing = false;
    this.rate = 1;
    this.range = { min: 0, max: 1 };
    this.entries = new Map(); // media id -> { element, media }
    this.timeListeners = new Set();
    this.stateListeners = new Set();
    this.frame = undefined;
    this.lastTick = undefined;
    // Called when the playhead leaves the part of the timeline on screen.
    this.onLeaveView = undefined;
  }

  // -- subscriptions ---------------------------------------------------------
  subscribe(listener) {
    this.timeListeners.add(listener);
    return () => this.timeListeners.delete(listener);
  }

  subscribeState(listener) {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  notifyTime() {
    this.timeListeners.forEach((listener) => listener(this.time));
  }

  notifyState() {
    this.stateListeners.forEach((listener) => listener());
  }

  // -- setup -----------------------------------------------------------------
  setRange(range) {
    this.range = range;
    const clamped = Math.min(Math.max(this.time, range.min), range.max);
    if (clamped !== this.time) {
      this.time = clamped;
      this.syncAll(true);
      this.notifyTime();
    }
  }

  register(media, element) {
    this.entries.set(media._id, { media, element });
    this.sync(this.entries.get(media._id), true);
    return () => {
      if (this.entries.get(media._id)?.element === element) {
        this.entries.delete(media._id);
      }
    };
  }

  // The recording was moved on the timeline (or its details changed).
  updateMedia(media) {
    const entry = this.entries.get(media._id);
    if (!entry) return;
    const moved = entry.media.start !== media.start;
    entry.media = media;
    if (moved) this.sync(entry, true);
  }

  // -- element sync ----------------------------------------------------------
  covers(media, time = this.time) {
    return time >= media.start && time < media.start + media.durationMs;
  }

  sync(entry, hard) {
    const { element, media } = entry;
    const local = (this.time - media.start) / 1000;
    if (!this.covers(media)) {
      if (!element.paused) element.pause();
      // rest on the nearest end so the right frame shows when paused
      const edge = local < 0 ? 0 : media.durationMs / 1000;
      if (hard && Math.abs(element.currentTime - edge) > 0.05) {
        element.currentTime = edge;
      }
      return;
    }
    if (hard || Math.abs(element.currentTime - local) > MAX_DRIFT_SECONDS) {
      element.currentTime = local;
    }
    if (element.playbackRate !== this.rate) element.playbackRate = this.rate;
    if (this.playing && element.paused) {
      const started = element.play();
      // autoplay rules or a missing source reject; playback then simply
      // continues without this element
      if (started?.catch) started.catch(() => {});
    } else if (!this.playing && !element.paused) {
      element.pause();
    }
  }

  syncAll(hard) {
    this.entries.forEach((entry) => this.sync(entry, hard));
  }

  // -- controls --------------------------------------------------------------
  seek(time) {
    if (!Number.isFinite(time)) return;
    this.time = Math.min(Math.max(time, this.range.min), this.range.max);
    this.syncAll(true);
    this.notifyTime();
  }

  // Length of one picture of the video under the playhead (of any video, if
  // none is there), in ms; 1/30 s without a video.
  frameMs() {
    const videos = [...this.entries.values()]
      .map(({ media }) => media)
      .filter((media) => media.kind === "video" && media.meta?.fps > 0);
    const video = videos.find((media) => this.covers(media)) ?? videos[0];
    return 1000 / (video?.meta.fps ?? 30);
  }

  setRate(rate) {
    this.rate = rate;
    this.syncAll(false);
    this.notifyState();
  }

  play() {
    if (this.playing) return;
    if (this.time >= this.range.max - 1) this.time = this.range.min;
    this.playing = true;
    this.lastTick = undefined;
    this.syncAll(true);
    this.notifyState();
    this.notifyTime();
    this.frame = requestAnimationFrame(this.tick);
  }

  pause() {
    if (!this.playing) return;
    this.playing = false;
    if (this.frame !== undefined) cancelAnimationFrame(this.frame);
    this.frame = undefined;
    this.syncAll(false);
    this.notifyState();
  }

  toggle() {
    if (this.playing) this.pause();
    else this.play();
  }

  tick = (now) => {
    if (!this.playing) return;
    const elapsed = this.lastTick === undefined ? 0 : now - this.lastTick;
    this.lastTick = now;
    this.advance(elapsed);
    if (this.playing) this.frame = requestAnimationFrame(this.tick);
  };

  // One step of playback; `elapsed` is the wall-clock time since the last one.
  advance(elapsed) {
    // A recording that is playing sets the pace, so that sound and picture
    // stay continuous and buffering holds the playhead. Between recordings
    // the wall clock does.
    const leader = [...this.entries.values()].find(
      ({ element, media }) =>
        this.covers(media) && !element.paused && !element.ended
    );
    if (leader) {
      this.time = leader.media.start + leader.element.currentTime * 1000;
    } else {
      this.time += elapsed * this.rate;
    }
    if (this.time >= this.range.max) {
      this.time = this.range.max;
      this.pause();
    } else {
      this.syncAll(false);
    }
    this.onLeaveView?.(this.time);
    this.notifyTime();
  }

  destroy() {
    this.pause();
    this.entries.clear();
    this.timeListeners.clear();
    this.stateListeners.clear();
  }
}
