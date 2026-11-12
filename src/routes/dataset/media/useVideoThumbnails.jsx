import { useEffect, useState } from "react";
import { getMediaUrl } from "../../../services/ApiServices/MediaServices";

// Pictures taken at even distances over a video, to show along its timeline.
export const THUMBNAIL_COUNT = 48;
// Height they are kept at, in px; they are drawn smaller than this.
const THUMBNAIL_HEIGHT = 96;
// Give up on a picture the browser does not deliver.
const SEEK_TIMEOUT_MS = 8000;

// media id -> array of THUMBNAIL_COUNT canvases (holes until they are taken)
const cache = new Map();

// The moment picture `index` shows, in ms from the start of the video.
export const thumbnailTime = (index, durationMs) =>
  ((index + 0.5) / THUMBNAIL_COUNT) * durationMs;

// The picture to show for a moment (ms from the start): the closest one that
// has been taken, or undefined when there is none yet.
export const thumbnailAt = (frames, timeMs, durationMs) => {
  if (!frames || !(durationMs > 0)) return undefined;
  const wanted = Math.min(
    THUMBNAIL_COUNT - 1,
    Math.max(0, Math.floor((timeMs / durationMs) * THUMBNAIL_COUNT))
  );
  for (let distance = 0; distance < THUMBNAIL_COUNT; distance++) {
    const frame = frames[wanted - distance] ?? frames[wanted + distance];
    if (frame) return frame;
  }
  return undefined;
};

// Coarse first, so the strip fills evenly instead of from the left:
// 0, 24, 12, 36, 6, 18, ...
export const captureOrder = (count) => {
  const order = [];
  const seen = new Set();
  for (let step = count; step >= 1; step = Math.floor(step / 2)) {
    for (let index = 0; index < count; index += step) {
      if (!seen.has(index)) {
        seen.add(index);
        order.push(index);
      }
    }
    if (step === 1) break;
  }
  return order;
};

const capture = (url, media, frames, onFrame) => {
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  let cancelled = false;
  let timeout;

  const stop = () => {
    cancelled = true;
    window.clearTimeout(timeout);
    video.removeAttribute("src");
    video.load();
  };

  const seekTo = (seconds) =>
    new Promise((resolve) => {
      const done = (ok) => {
        window.clearTimeout(timeout);
        video.removeEventListener("seeked", seeked);
        resolve(ok);
      };
      const seeked = () => done(true);
      video.addEventListener("seeked", seeked);
      timeout = window.setTimeout(() => done(false), SEEK_TIMEOUT_MS);
      video.currentTime = seconds;
    });

  const run = async () => {
    if (!video.videoWidth || !video.videoHeight) return;
    const width = Math.round(
      (THUMBNAIL_HEIGHT * video.videoWidth) / video.videoHeight
    );
    for (const index of captureOrder(THUMBNAIL_COUNT)) {
      if (cancelled) return;
      if (frames[index]) continue;
      const ok = await seekTo(thumbnailTime(index, media.durationMs) / 1000);
      if (cancelled) return;
      if (!ok) continue;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = THUMBNAIL_HEIGHT;
      canvas.getContext("2d").drawImage(video, 0, 0, width, THUMBNAIL_HEIGHT);
      frames[index] = canvas;
      onFrame();
    }
    stop();
  };

  video.addEventListener("loadeddata", run, { once: true });
  video.addEventListener("error", stop, { once: true });
  video.src = url;
  return stop;
};

// Pictures of a video along its length. They arrive one by one: the array
// has holes while loading, and the component renders again for each.
const useVideoThumbnails = (datasetId, media) => {
  const [, setRevision] = useState(0);
  const isVideo = media.kind === "video";

  useEffect(() => {
    if (!isVideo) return undefined;
    if (!cache.has(media._id)) cache.set(media._id, new Array(THUMBNAIL_COUNT));
    const frames = cache.get(media._id);
    if (frames.filter(Boolean).length === THUMBNAIL_COUNT) return undefined;

    let stop;
    let cancelled = false;
    getMediaUrl(datasetId, media._id)
      .then((url) => {
        if (cancelled) return;
        stop = capture(url, media, frames, () =>
          setRevision((revision) => revision + 1)
        );
      })
      .catch(() => {
        // no pictures: the row still works without them
      });
    return () => {
      cancelled = true;
      stop?.();
    };
  }, [datasetId, media._id, media.durationMs, isVideo]);

  return isVideo ? cache.get(media._id) : undefined;
};

export default useVideoThumbnails;
