import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const AnnotationOverlay = ({
  plot,
  root,
  labels,
  selectedLabel,
  onLabelSelect,
  onBoundaryCommit,
}) => {
  const [drag, setDrag] = useState(undefined);

  useEffect(() => {
    setDrag(undefined);
  }, [selectedLabel?._id]);

  if (!plot || !root) return null;

  const timestampAtPointer = (clientX) => {
    const bounds = plot.over.getBoundingClientRect();
    const x = clamp(clientX - bounds.left, 0, bounds.width);
    return plot.posToVal(x, "x");
  };

  const visibleMin = plot.scales.x.min;
  const visibleMax = plot.scales.x.max;

  const getInterval = (label) => {
    if (drag?.labelId === label._id) {
      return { start: drag.start, end: drag.end };
    }
    return { start: label.start, end: label.end };
  };

  const updateDrag = (event) => {
    if (!drag || event.pointerId !== drag.pointerId) return drag;

    const timestamp = timestampAtPointer(event.clientX);
    const next =
      drag.boundary === "start"
        ? { ...drag, start: Math.min(timestamp, drag.end) }
        : { ...drag, end: Math.max(timestamp, drag.start) };

    setDrag(next);
    return next;
  };

  const finishDrag = (event) => {
    const next = updateDrag(event);
    if (!next) return;

    event.currentTarget.releasePointerCapture(event.pointerId);
    setDrag(undefined);
    onBoundaryCommit(next.labelId, next.start, next.end);
  };

  const cancelDrag = (event) => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    setDrag(undefined);
  };

  const startDrag = (event, label, boundary) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({
      labelId: label._id,
      boundary,
      pointerId: event.pointerId,
      start: label.start,
      end: label.end,
    });
  };

  return createPortal(
    <div className="annotation-overlay" aria-label="Dataset labels">
      {labels.map((label) => {
        if (!Number.isFinite(label.start)) return null;

        const isDraft = label._id === "draft";
        const interval = getInterval(label);
        const hasEnd = Number.isFinite(interval.end);
        const start = clamp(interval.start, visibleMin, visibleMax);
        const end = clamp(
          hasEnd ? interval.end : interval.start,
          visibleMin,
          visibleMax
        );
        const left = plot.valToPos(start, "x");
        const right = plot.valToPos(end, "x");
        const isSelected = selectedLabel?._id === label._id;

        if (
          interval.start > visibleMax ||
          (hasEnd && interval.end < visibleMin)
        ) {
          return null;
        }

        return (
          <div
            className={`annotation ${isDraft ? "annotation--draft" : ""} ${
              isSelected ? "annotation--selected" : ""
            }`}
            key={label._id}
            style={{
              "--annotation-color": label.color || "#228be6",
              left: `${left}px`,
              width: `${Math.max(hasEnd ? right - left : 0, 0)}px`,
            }}
            onClick={(event) => {
              event.stopPropagation();
              if (!isDraft) onLabelSelect(label);
            }}
            onPointerDown={(event) => event.stopPropagation()}
            role={isDraft ? undefined : "button"}
            tabIndex={isDraft ? undefined : 0}
            onKeyDown={(event) => {
              if (!isDraft && (event.key === "Enter" || event.key === " ")) {
                event.preventDefault();
                onLabelSelect(label);
              }
            }}
          >
            {hasEnd && <span className="annotation__name">{label.name}</span>}
            {isSelected && hasEnd && (
              <>
                <span
                  aria-label={`Move start of ${label.name}`}
                  className="annotation__handle annotation__handle--start"
                  onClick={(event) => event.stopPropagation()}
                  onPointerDown={(event) =>
                    startDrag(event, { ...label, ...interval }, "start")
                  }
                  onPointerMove={updateDrag}
                  onPointerUp={finishDrag}
                  onPointerCancel={cancelDrag}
                  role="slider"
                />
                <span
                  aria-label={`Move end of ${label.name}`}
                  className="annotation__handle annotation__handle--end"
                  onClick={(event) => event.stopPropagation()}
                  onPointerDown={(event) =>
                    startDrag(event, { ...label, ...interval }, "end")
                  }
                  onPointerMove={updateDrag}
                  onPointerUp={finishDrag}
                  onPointerCancel={cancelDrag}
                  role="slider"
                />
              </>
            )}
          </div>
        );
      })}
    </div>,
    root
  );
};

export default AnnotationOverlay;
