import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import AnnotationOverlay from "./AnnotationOverlay";

const EMPTY_DATA = [[], []];
const EMPTY_WAVEFORM = [[], [], []];
const WAVEFORM_COLOR = "#4c6ef5";

const toUPlotData = (points) => {
  if (!Array.isArray(points) || points.length === 0) return EMPTY_DATA;

  const validPoints = points.filter(
    (point) =>
      Array.isArray(point) &&
      Number.isFinite(Number(point[0])) &&
      Number.isFinite(Number(point[1]))
  );

  return [
    validPoints.map((point) => Number(point[0])),
    validPoints.map((point) => Number(point[1])),
  ];
};

const rangesEqual = (left, right) =>
  left &&
  right &&
  Math.abs(left.min - right.min) < 1 &&
  Math.abs(left.max - right.max) < 1;

const TimeSeriesChart = ({
  name,
  unit,
  points,
  fullRange,
  visibleRange,
  labels,
  selectedLabel,
  onPlotClick,
  onRangeChange,
  onLabelSelect,
  onBoundaryCommit,
  onWidthChange,
  // Rows of recordings reuse the chart, so that their timeline, labels and
  // panning are the same as for sensor data:
  height = 200,
  // uPlot data [time, high, low] of an audio waveform, instead of `points`
  waveform,
  // (plot) => elements drawn over the plot (playhead, extent of a recording)
  renderOverlay,
}) => {
  const containerRef = useRef();
  const plotRef = useRef();
  const callbacksRef = useRef({});
  const fullRangeRef = useRef(fullRange);
  const rangeRef = useRef(visibleRange);
  const [chart, setChart] = useState(undefined);
  const [, redrawOverlay] = useState(0);

  callbacksRef.current = {
    onPlotClick,
    onRangeChange,
    onWidthChange,
  };
  fullRangeRef.current = fullRange;
  rangeRef.current = visibleRange;

  const isWaveform = waveform !== undefined;
  const data = useMemo(
    () => (isWaveform ? waveform || EMPTY_WAVEFORM : toUPlotData(points)),
    [isWaveform, points, waveform]
  );

  useEffect(() => {
    if (!containerRef.current) return undefined;

    const container = containerRef.current;
    const annotationRoot = document.createElement("div");
    annotationRoot.className = "u-annotation-root";

    const options = {
      width: Math.max(container.clientWidth, 320),
      height,
      ms: 1,
      legend: { show: false },
      cursor: {
        x: false,
        y: false,
        drag: {
          x: false,
          y: false,
          setScale: false,
        },
        points: { show: false },
      },
      scales: {
        x: {
          time: true,
          auto: false,
          min: rangeRef.current.min,
          max: rangeRef.current.max,
        },
        y: isWaveform ? { auto: false, range: [-140, 140] } : { auto: true },
      },
      axes: [
        {
          stroke: "#495057",
          grid: { stroke: "#e9ecef", width: 1 },
        },
        isWaveform
          ? {
              // no values to read off, but keep the width so that the time
              // axis lines up with the sensor charts
              size: 54,
              values: () => [],
              ticks: { show: false },
              grid: { show: false },
            }
          : {
              stroke: "#495057",
              grid: { stroke: "#e9ecef", width: 1 },
              size: 54,
            },
      ],
      series: isWaveform
        ? [
            {},
            { stroke: WAVEFORM_COLOR, width: 1, points: { show: false } },
            { stroke: WAVEFORM_COLOR, width: 1, points: { show: false } },
          ]
        : [
            {},
            {
              label: unit ? `${name} (${unit})` : name,
              stroke: "#212529",
              width: 1.5,
              points: { show: false },
              spanGaps: true,
            },
          ],
      ...(isWaveform && {
        bands: [{ series: [1, 2], fill: WAVEFORM_COLOR }],
      }),
      hooks: {
        ready: [
          (instance) => {
            let panStart;
            let suppressClick = false;

            instance.over.appendChild(annotationRoot);

            instance.over.addEventListener("pointerdown", (event) => {
              if (event.button !== 0) return;

              const currentRange = rangeRef.current;
              const completeRange = fullRangeRef.current;
              const canPan =
                currentRange.max - currentRange.min <
                completeRange.max - completeRange.min;

              panStart = canPan
                ? {
                    pointerId: event.pointerId,
                    x: event.clientX,
                    min: currentRange.min,
                    max: currentRange.max,
                    moved: false,
                  }
                : undefined;
              suppressClick = false;
              if (panStart) {
                instance.over.setPointerCapture(event.pointerId);
                instance.over.classList.add("u-over--panning");
              }
            });
            instance.over.addEventListener("pointermove", (event) => {
              if (!panStart || event.pointerId !== panStart.pointerId) return;

              const pixelDelta = event.clientX - panStart.x;
              if (!panStart.moved && Math.abs(pixelDelta) <= 4) return;

              event.preventDefault();
              panStart.moved = true;

              const completeRange = fullRangeRef.current;
              const duration = panStart.max - panStart.min;
              const timeDelta =
                (pixelDelta / instance.over.clientWidth) * duration;
              let min = panStart.min - timeDelta;
              let max = panStart.max - timeDelta;

              if (min < completeRange.min) {
                min = completeRange.min;
                max = min + duration;
              } else if (max > completeRange.max) {
                max = completeRange.max;
                min = max - duration;
              }

              callbacksRef.current.onRangeChange({ min, max });
            });
            instance.over.addEventListener("pointerup", (event) => {
              if (!panStart || event.pointerId !== panStart.pointerId) return;

              suppressClick = panStart.moved;
              instance.over.releasePointerCapture(event.pointerId);
              instance.over.classList.remove("u-over--panning");
              panStart = undefined;
            });
            instance.over.addEventListener("pointercancel", (event) => {
              if (!panStart || event.pointerId !== panStart.pointerId) return;

              instance.over.releasePointerCapture(event.pointerId);
              instance.over.classList.remove("u-over--panning");
              panStart = undefined;
            });
            instance.over.addEventListener("click", (event) => {
              if (event.defaultPrevented || suppressClick) {
                suppressClick = false;
                return;
              }
              const bounds = instance.over.getBoundingClientRect();
              const x = event.clientX - bounds.left;
              callbacksRef.current.onPlotClick(instance.posToVal(x, "x"));
            });

            plotRef.current = instance;
            setChart({ instance, annotationRoot });
          },
        ],
        draw: [() => redrawOverlay((revision) => revision + 1)],
        setScale: [
          (instance, scaleKey) => {
            if (scaleKey !== "x") return;
            const nextRange = {
              min: instance.scales.x.min,
              max: instance.scales.x.max,
            };
            redrawOverlay((revision) => revision + 1);
            if (!rangesEqual(nextRange, rangeRef.current)) {
              callbacksRef.current.onRangeChange(nextRange);
            }
          },
        ],
      },
    };

    const instance = new uPlot(options, data, container);
    const resizeObserver = new ResizeObserver(([entry]) => {
      const width = Math.max(Math.floor(entry.contentRect.width), 320);
      callbacksRef.current.onWidthChange(width);
      if (width !== instance.width) {
        instance.setSize({ width, height });
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      plotRef.current = undefined;
      setChart(undefined);
      instance.destroy();
    };
  }, [name, unit, height, isWaveform]);

  useEffect(() => {
    if (!plotRef.current) return;
    plotRef.current.setData(data, true);
  }, [data]);

  useEffect(() => {
    const instance = plotRef.current;
    if (!instance || rangesEqual(instance.scales.x, visibleRange)) return;
    instance.setScale("x", visibleRange);
  }, [visibleRange.max, visibleRange.min]);

  return (
    <div className="time-series-chart" ref={containerRef} style={{ height }}>
      {chart && renderOverlay
        ? createPortal(renderOverlay(chart.instance), chart.annotationRoot)
        : null}
      <AnnotationOverlay
        plot={chart?.instance}
        root={chart?.annotationRoot}
        labels={labels}
        selectedLabel={selectedLabel}
        onLabelSelect={onLabelSelect}
        onBoundaryCommit={onBoundaryCommit}
      />
    </div>
  );
};

export default TimeSeriesChart;
