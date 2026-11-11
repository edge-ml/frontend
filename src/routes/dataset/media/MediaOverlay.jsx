import React, { useEffect, useRef } from "react";
import PlayheadLine from "./PlayheadLine";

// What a recording's row draws over its timeline: where the recording lies,
// a bar to move the playhead, and the playhead itself.
//
// The chart listens for clicks (labels) and drags (panning) with native
// listeners on an ancestor. The handlers here are native too, since React's
// run only after those and could not keep events from reaching them.
const MediaOverlay = ({ plot, playback, media, aligning, onShift }) => {
  const scrubRef = useRef();
  const extentRef = useRef();
  const latest = useRef({});
  latest.current = { plot, playback, media, aligning, onShift };

  const { min, max } = plot.scales.x;
  const left = plot.valToPos(Math.max(media.start, min), "x");
  const right = plot.valToPos(Math.min(media.end, max), "x");
  const visible = media.end > min && media.start < max;

  useEffect(() => {
    const bar = scrubRef.current;
    let pointerId;
    const seek = (event) => {
      const { plot, playback } = latest.current;
      const bounds = plot.over.getBoundingClientRect();
      const x = Math.min(Math.max(event.clientX - bounds.left, 0), bounds.width);
      playback.seek(plot.posToVal(x, "x"));
    };
    const down = (event) => {
      if (event.button !== 0) return;
      event.stopPropagation();
      event.preventDefault();
      pointerId = event.pointerId;
      bar.setPointerCapture(pointerId);
      seek(event);
    };
    const move = (event) => {
      if (event.pointerId === pointerId) seek(event);
    };
    const up = (event) => {
      if (event.pointerId !== pointerId) return;
      bar.releasePointerCapture(pointerId);
      pointerId = undefined;
    };
    const click = (event) => event.stopPropagation();
    bar.addEventListener("pointerdown", down);
    bar.addEventListener("pointermove", move);
    bar.addEventListener("pointerup", up);
    bar.addEventListener("pointercancel", up);
    bar.addEventListener("click", click);
    return () => {
      bar.removeEventListener("pointerdown", down);
      bar.removeEventListener("pointermove", move);
      bar.removeEventListener("pointerup", up);
      bar.removeEventListener("pointercancel", up);
      bar.removeEventListener("click", click);
    };
  }, []);

  // While aligning, the recording can be dragged along the timeline.
  useEffect(() => {
    const extent = extentRef.current;
    let drag;
    const down = (event) => {
      if (!latest.current.aligning || event.button !== 0) return;
      event.stopPropagation();
      event.preventDefault();
      drag = { pointerId: event.pointerId, x: event.clientX };
      extent.setPointerCapture(event.pointerId);
    };
    const move = (event) => {
      if (!drag || event.pointerId !== drag.pointerId) return;
      const { plot, onShift } = latest.current;
      const span = plot.scales.x.max - plot.scales.x.min;
      const delta = ((event.clientX - drag.x) / plot.over.clientWidth) * span;
      drag.x = event.clientX;
      onShift(delta);
    };
    const up = (event) => {
      if (!drag || event.pointerId !== drag.pointerId) return;
      extent.releasePointerCapture(drag.pointerId);
      drag = undefined;
    };
    const click = (event) => {
      if (latest.current.aligning) event.stopPropagation();
    };
    extent.addEventListener("pointerdown", down);
    extent.addEventListener("pointermove", move);
    extent.addEventListener("pointerup", up);
    extent.addEventListener("pointercancel", up);
    extent.addEventListener("click", click);
    return () => {
      extent.removeEventListener("pointerdown", down);
      extent.removeEventListener("pointermove", move);
      extent.removeEventListener("pointerup", up);
      extent.removeEventListener("pointercancel", up);
      extent.removeEventListener("click", click);
    };
  }, []);

  return (
    <div className="media-overlay">
      <div
        ref={extentRef}
        className={`media-extent ${aligning ? "media-extent--aligning" : ""}`}
        style={{
          display: visible ? "block" : "none",
          left: `${left}px`,
          width: `${Math.max(right - left, 2)}px`,
        }}
      />
      <div
        ref={scrubRef}
        className="media-scrub"
        role="slider"
        aria-label={`Playback position in ${media.name}`}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={Math.round(playback.time)}
        title="Click or drag to move the playhead"
      />
      <PlayheadLine plot={plot} playback={playback} />
    </div>
  );
};

export default MediaOverlay;
