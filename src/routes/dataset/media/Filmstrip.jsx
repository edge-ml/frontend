import React, { useEffect, useRef } from "react";
import { thumbnailAt } from "./useVideoThumbnails";

// Pictures of a video along its row, so that what happens when can be seen
// without playing it. Drawn again whenever the chart is panned or zoomed and
// when another picture arrives (the parent re-renders then).
const Filmstrip = ({ plot, media, frames, height }) => {
  const ref = useRef();
  const { min, max } = plot.scales.x;
  const left = Math.max(0, plot.valToPos(Math.max(media.start, min), "x"));
  const right = plot.valToPos(Math.min(media.end, max), "x");
  const width = Math.max(0, Math.round(right - left));
  const available = frames ? frames.filter(Boolean).length : 0;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || width === 0 || height <= 0) return;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    const context = canvas.getContext("2d");
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);

    const sample = frames?.find(Boolean);
    const aspect = sample
      ? sample.width / sample.height
      : media.meta?.width && media.meta?.height
        ? media.meta.width / media.meta.height
        : 16 / 9;
    const tile = Math.max(8, height * aspect);
    // Tiles are counted from the start of the recording, not from the edge
    // of the screen, so they stay put while panning.
    const origin = plot.valToPos(media.start, "x");
    const first = Math.floor((left - origin) / tile);
    const last = Math.ceil((left + width - origin) / tile);
    for (let k = first; k < last; k++) {
      const x = origin + k * tile;
      const time = plot.posToVal(x + tile / 2, "x") - media.start;
      const frame = thumbnailAt(frames, time, media.durationMs);
      if (frame) context.drawImage(frame, x - left, 0, tile, height);
    }
  });

  return (
    <canvas
      ref={ref}
      className="media-filmstrip"
      data-frames={available}
      style={{
        display: width > 0 && height > 0 ? "block" : "none",
        left: `${left}px`,
        width: `${width}px`,
        height: `${height}px`,
      }}
      aria-hidden
    />
  );
};

export default Filmstrip;
