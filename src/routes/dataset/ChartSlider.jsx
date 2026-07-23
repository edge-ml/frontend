import { RangeSlider } from "@mantine/core";
import React, { useEffect, useRef, useState } from "react";

const formatTimestamp = (timestamp) =>
  new Date(timestamp).toISOString().replace("T", " ").slice(0, 19);

const ChartSlider = ({ start, end, visibleRange, onRangeChange }) => {
  const [value, setValue] = useState([visibleRange.min, visibleRange.max]);
  const [isDraggingRange, setIsDraggingRange] = useState(false);
  const dragRef = useRef();
  const trackRef = useRef();
  const step = Math.max(1, Math.floor((end - start) / 1000));

  useEffect(() => {
    setValue([visibleRange.min, visibleRange.max]);
  }, [visibleRange.max, visibleRange.min]);

  if (!Number.isFinite(start) || !Number.isFinite(end) || start === end) {
    return null;
  }

  const updateRange = (nextValue) => {
    setValue(nextValue);
    onRangeChange({ min: nextValue[0], max: nextValue[1] });
  };

  const moveRange = (delta, sourceValue = value) => {
    const duration = sourceValue[1] - sourceValue[0];
    const min = Math.max(
      start,
      Math.min(end - duration, sourceValue[0] + delta)
    );
    updateRange([min, min + duration]);
  };

  const startRangeDrag = (event) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      value,
    };
    setIsDraggingRange(true);
  };

  const dragRange = (event) => {
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) return;

    event.preventDefault();
    const trackWidth = trackRef.current?.getBoundingClientRect().width;
    if (!trackWidth) return;

    const rawDelta = ((event.clientX - drag.x) / trackWidth) * (end - start);
    const snappedDelta = Math.round(rawDelta / step) * step;
    moveRange(snappedDelta, drag.value);
  };

  const finishRangeDrag = (event) => {
    if (event.pointerId !== dragRef.current?.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragRef.current = undefined;
    setIsDraggingRange(false);
  };

  const startPercent = ((value[0] - start) / (end - start)) * 100;
  const widthPercent = ((value[1] - value[0]) / (end - start)) * 100;
  const canMoveRange = value[1] - value[0] < end - start;

  return (
    <div className="timeline-navigator">
      <div className="timeline-navigator__control">
        <RangeSlider
          min={start}
          max={end}
          minRange={Math.max(1, Math.floor((end - start) / 10000))}
          step={step}
          value={value}
          onChange={updateRange}
          label={formatTimestamp}
          aria-label="Visible time range"
        />
        <div className="timeline-navigator__drag-track" ref={trackRef}>
          {canMoveRange && (
            <div
              aria-label="Move visible time range"
              aria-valuemax={end}
              aria-valuemin={start}
              aria-valuenow={value[0]}
              aria-valuetext={`${formatTimestamp(value[0])} – ${formatTimestamp(
                value[1]
              )}`}
              className={`timeline-navigator__range ${
                isDraggingRange ? "timeline-navigator__range--dragging" : ""
              }`}
              onKeyDown={(event) => {
                if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
                  return;
                }
                event.preventDefault();
                const direction = event.key === "ArrowLeft" ? -1 : 1;
                moveRange(direction * step * (event.shiftKey ? 10 : 1));
              }}
              onPointerCancel={finishRangeDrag}
              onPointerDown={startRangeDrag}
              onPointerMove={dragRange}
              onPointerUp={finishRangeDrag}
              role="slider"
              style={{
                left: `${startPercent}%`,
                width: `${widthPercent}%`,
              }}
              tabIndex={0}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChartSlider;
