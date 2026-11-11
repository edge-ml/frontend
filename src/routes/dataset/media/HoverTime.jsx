import React, { useEffect, useRef } from "react";
import { formatElapsed } from "./mediaUtils";

// A hairline under the pointer with the time it points at, so that a label
// boundary can be placed on an exact moment.
const HoverTime = ({ plot, origin }) => {
  const lineRef = useRef();
  const latest = useRef({});
  latest.current = { plot, origin };

  useEffect(() => {
    const over = plot.over;
    const line = lineRef.current;
    const move = (event) => {
      const { plot, origin } = latest.current;
      const bounds = over.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      if (x < 0 || x > bounds.width) {
        line.style.display = "none";
        return;
      }
      const span = plot.scales.x.max - plot.scales.x.min;
      // as fine as one pixel can tell apart
      const step = span / bounds.width < 5 ? 10 : span / bounds.width < 50 ? 100 : 1000;
      line.style.display = "block";
      line.style.transform = `translateX(${x}px)`;
      line.firstChild.textContent = formatElapsed(plot.posToVal(x, "x") - origin, step);
      // keep the text inside the plot near its right edge
      line.firstChild.style.transform =
        x > bounds.width - 70 ? "translateX(calc(-100% - 4px))" : "translateX(4px)";
    };
    const leave = () => {
      line.style.display = "none";
    };
    over.addEventListener("pointermove", move);
    over.addEventListener("pointerleave", leave);
    return () => {
      over.removeEventListener("pointermove", move);
      over.removeEventListener("pointerleave", leave);
    };
  }, [plot]);

  return (
    <div className="media-hover" ref={lineRef} aria-hidden>
      <span className="media-hover__time" />
    </div>
  );
};

export default HoverTime;
