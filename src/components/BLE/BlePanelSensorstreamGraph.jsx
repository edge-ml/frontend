import "./BleActivated.css";

import React, { useEffect, useRef } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";

const SERIES_COLORS = [
  "#2563eb",
  "#0f9f8f",
  "#8b5cf6",
  "#e8790c",
  "#dc3f58",
  "#0891b2",
];

const STREAM_WINDOW_MS = 30000;
const DEFAULT_INTERVAL_MS = 100;

const alphaColor = (color, opacity) => {
  if (!color || !color.startsWith("#")) {
    return `rgba(37, 99, 235, ${opacity})`;
  }

  const hex = color.slice(1);
  const normalized =
    hex.length === 3
      ? hex
          .split("")
          .map((character) => character + character)
          .join("")
      : hex;
  const value = Number.parseInt(normalized, 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
};

const createLabelOverlayPlugin = (annotationsRef, latestTimeRef) => {
  let root;

  const drawAnnotations = (plot) => {
    if (!root) return;
    root.replaceChildren();

    const scaleMin = plot.scales.x.min;
    const scaleMax = plot.scales.x.max;
    if (!Number.isFinite(scaleMin) || !Number.isFinite(scaleMax)) return;

    annotationsRef.current.forEach((annotation) => {
      const end = annotation.end ?? latestTimeRef.current;
      if (end < scaleMin || annotation.start > scaleMax) return;

      const startPosition = plot.valToPos(
        Math.max(annotation.start, scaleMin),
        "x"
      );
      const endPosition = plot.valToPos(Math.min(end, scaleMax), "x");
      const marker = document.createElement("div");
      marker.className = `ble-live-chart__annotation${
        annotation.end ? "" : " ble-live-chart__annotation--active"
      }`;
      marker.style.left = `${Math.max(0, startPosition)}px`;
      marker.style.width = `${Math.max(3, endPosition - startPosition)}px`;
      marker.style.background = alphaColor(annotation.color, 0.16);
      marker.style.borderColor = annotation.color || "#2563eb";
      root.appendChild(marker);
    });
  };

  return {
    hooks: {
      ready: [
        (plot) => {
          root = document.createElement("div");
          root.className = "ble-live-chart__annotations";
          plot.over.appendChild(root);
          drawAnnotations(plot);
        },
      ],
      draw: [drawAnnotations],
      destroy: [
        () => {
          root = undefined;
        },
      ],
    },
  };
};

const BlePanelSensorstreamGraph = ({
  sensor,
  fullSampleRate,
  lastData,
  currentLabel,
  prevLabel,
  recordingStartTime,
}) => {
  const containerRef = useRef();
  const plotRef = useRef();
  const propsRef = useRef({ lastData, currentLabel, prevLabel });
  const annotationsRef = useRef(new Map());
  const latestTimeRef = useRef(recordingStartTime);

  propsRef.current = { lastData, currentLabel, prevLabel };

  useEffect(() => {
    const storeCompletedLabel = (label) => {
      if (label?.id === undefined || label?.start === undefined) return;
      annotationsRef.current.set(label.plotId, { ...label });
    };

    storeCompletedLabel(prevLabel);
    if (currentLabel?.end !== undefined) {
      storeCompletedLabel(currentLabel);
    } else if (currentLabel?.id !== undefined) {
      annotationsRef.current.set(currentLabel.plotId, { ...currentLabel });
    }
  }, [currentLabel, prevLabel]);

  useEffect(() => {
    if (!containerRef.current) return undefined;

    const components = sensor.parseScheme || [];
    const data = [[recordingStartTime], ...components.map(() => [null])];
    const componentLabels = components.map((component) =>
      component.unit ? `${component.name} (${component.unit})` : component.name
    );
    const options = {
      width: Math.max(containerRef.current.clientWidth, 320),
      height: 230,
      ms: 1,
      legend: {
        show: true,
        live: false,
      },
      cursor: {
        drag: { x: false, y: false, setScale: false },
        points: { show: false },
      },
      scales: {
        x: {
          time: true,
          auto: false,
          min: recordingStartTime,
          max: recordingStartTime + STREAM_WINDOW_MS,
        },
        y: { auto: true },
      },
      axes: [
        {
          stroke: "#64748b",
          grid: { stroke: "#e8edf4", width: 1 },
          values: (_plot, ticks) =>
            ticks.map((value) => {
              const seconds = Math.max(
                0,
                Math.round((value - recordingStartTime) / 1000)
              );
              return `${seconds}s`;
            }),
        },
        {
          stroke: "#64748b",
          grid: { stroke: "#e8edf4", width: 1 },
          size: 58,
        },
      ],
      series: [
        {},
        ...componentLabels.map((label, index) => ({
          label,
          stroke: SERIES_COLORS[index % SERIES_COLORS.length],
          width: 1.5,
          points: { show: false },
          spanGaps: true,
        })),
      ],
      plugins: [createLabelOverlayPlugin(annotationsRef, latestTimeRef)],
    };

    const plot = new uPlot(options, data, containerRef.current);
    plotRef.current = plot;
    const resizeObserver = new ResizeObserver(([entry]) => {
      const width = Math.max(Math.floor(entry.contentRect.width), 320);
      if (plot.width !== width) {
        plot.setSize({ width, height: 230 });
      }
    });
    resizeObserver.observe(containerRef.current);

    const configuredRate = sensor.options
      ? sensor.options.frequencies.frequencies[sensor.sampleRate]
      : sensor.sampleRate;
    const sampleRate = Number(configuredRate) || 1;
    const intervalLength = fullSampleRate
      ? Math.max(16, Math.floor(1000 / sampleRate))
      : DEFAULT_INTERVAL_MS;
    const maximumPoints = Math.max(
      2,
      Math.ceil(STREAM_WINDOW_MS / intervalLength)
    );
    let lastTimestamp = recordingStartTime;

    const updateData = () => {
      const latest = propsRef.current.lastData;
      if (
        Array.isArray(latest) &&
        Number.isFinite(Number(latest[0])) &&
        Number(latest[0]) > lastTimestamp
      ) {
        const timestamp = Number(latest[0]);
        const values = Array.isArray(latest[1]) ? latest[1] : [];
        data[0].push(timestamp);
        components.forEach((_component, index) => {
          const value = Number(values[index]);
          data[index + 1].push(Number.isFinite(value) ? value : null);
        });
        lastTimestamp = timestamp;
        latestTimeRef.current = timestamp;

        if (data[0].length > maximumPoints) {
          data.forEach((series) => series.shift());
        }
      }

      const windowEnd = Math.max(
        recordingStartTime + STREAM_WINDOW_MS,
        latestTimeRef.current
      );
      plot.setData(data, false);
      plot.setScale("x", {
        min: windowEnd - STREAM_WINDOW_MS,
        max: windowEnd,
      });
    };

    const interval = window.setInterval(updateData, intervalLength);

    return () => {
      window.clearInterval(interval);
      resizeObserver.disconnect();
      plotRef.current = undefined;
      plot.destroy();
    };
  }, [fullSampleRate, recordingStartTime, sensor]);

  return <div className="ble-live-chart" ref={containerRef} />;
};

export default BlePanelSensorstreamGraph;
