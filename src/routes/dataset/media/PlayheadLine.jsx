import React, { useEffect, useRef } from "react";

// The playhead inside one chart. It moves on every animation frame while
// playing, so it positions itself instead of going through React state.
const PlayheadLine = ({ plot, playback, knob = false }) => {
  const ref = useRef();

  const place = () => {
    const line = ref.current;
    if (!line || !plot) return;
    const { min, max } = plot.scales.x;
    const visible = playback.time >= min && playback.time <= max;
    line.style.display = visible ? "block" : "none";
    if (visible) {
      line.style.transform = `translateX(${plot.valToPos(playback.time, "x")}px)`;
    }
  };

  // the chart re-renders this when it is zoomed, panned or resized
  useEffect(place);
  useEffect(() => playback.subscribe(place), [playback, plot]);

  return (
    <div
      className={`media-playhead ${knob ? "media-playhead--knob" : ""}`}
      ref={ref}
      aria-hidden
    />
  );
};

export default PlayheadLine;
