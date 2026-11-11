import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Center, Stack, Text } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWaveSquare } from "@fortawesome/free-solid-svg-icons";
import { DatasetContext } from "./DatasetContext";
import TimeSeriesDisplay from "./TimeSeriesDisplay";
import ChartSlider from "./ChartSlider";
import MediaDock from "./media/MediaDock";
import MediaSeriesDisplay from "./media/MediaSeriesDisplay";
import { Playback } from "./media/playback";
import { mediaOf } from "./media/mediaUtils";

// How often, and for how long, to look for a waveform that is being computed.
const PROCESSING_POLL_MS = 2000;
const PROCESSING_POLL_LIMIT = 150;

const TimeSeriesSection = () => {
  const { activeTimeSeries, dataset, onPlotClick, refreshDataset } =
    useContext(DatasetContext);
  const savedMedia = mediaOf(dataset);

  // Recordings being aligned are shown (and played) at their new position
  // before it is saved: media id -> shift in ms.
  const [shifts, setShifts] = useState({});
  const mediaList = useMemo(
    () =>
      savedMedia.map((media) => {
        const shift = shifts[media._id];
        return shift
          ? { ...media, start: media.start + shift, end: media.end + shift }
          : media;
      }),
    [savedMedia, shifts]
  );
  const setShift = (mediaId, value) =>
    setShifts((current) => {
      const next = typeof value === "function" ? value(current[mediaId]) : value;
      const { [mediaId]: _, ...rest } = current;
      return next === undefined ? rest : { ...rest, [mediaId]: next };
    });

  const fullRange = useMemo(() => {
    const spans = [...activeTimeSeries, ...savedMedia];
    const starts = spans
      .map((item) => Number(item.start))
      .filter(Number.isFinite);
    const ends = spans.map((item) => Number(item.end)).filter(Number.isFinite);

    return {
      min: starts.length > 0 ? Math.min(...starts) : 0,
      max: ends.length > 0 ? Math.max(...ends) : 1,
    };
  }, [activeTimeSeries, savedMedia]);

  const [visibleRange, setVisibleRange] = useState(fullRange);
  const visibleRangeRef = useRef(visibleRange);
  visibleRangeRef.current = visibleRange;
  const previousFullRange = useRef(fullRange);

  useEffect(() => {
    const previous = previousFullRange.current;
    previousFullRange.current = fullRange;
    setVisibleRange((current) => {
      const showedEverything =
        current.min <= previous.min && current.max >= previous.max;
      const stillInside =
        current.min >= fullRange.min && current.max <= fullRange.max;
      // keep a zoomed-in view when the dataset grows or a recording moves
      return showedEverything || !stillInside ? fullRange : current;
    });
  }, [fullRange.max, fullRange.min]);

  const playbackRef = useRef();
  if (!playbackRef.current) playbackRef.current = new Playback();
  const playback = playbackRef.current;

  useEffect(() => () => playback.destroy(), [playback]);
  useEffect(() => {
    playback.setRange(fullRange);
  }, [playback, fullRange.min, fullRange.max]);
  useEffect(() => {
    // turn the page when the playhead runs off the visible part
    playback.onLeaveView = (time) => {
      const { min, max } = visibleRangeRef.current;
      if (time >= min && time <= max) return;
      const span = max - min;
      const start = Math.max(
        fullRange.min,
        Math.min(time - span * 0.05, fullRange.max - span)
      );
      setVisibleRange({ min: start, max: start + span });
    };
  }, [playback, fullRange.min, fullRange.max]);

  const isProcessing = savedMedia.some((media) => media.status === "processing");
  const pollsRef = useRef(0);
  useEffect(() => {
    if (!isProcessing) {
      pollsRef.current = 0;
      return undefined;
    }
    if (pollsRef.current >= PROCESSING_POLL_LIMIT) return undefined;
    const timeout = window.setTimeout(() => {
      pollsRef.current += 1;
      refreshDataset();
    }, PROCESSING_POLL_MS);
    return () => window.clearTimeout(timeout);
  }, [isProcessing, dataset]);

  const hasMedia = mediaList.length > 0;

  if (activeTimeSeries.length === 0 && !hasMedia) {
    return (
      <Center className="flex-grow-1" style={{ minHeight: 0 }}>
        <Stack align="center" gap="xs" p="xl">
          <FontAwesomeIcon
            icon={faWaveSquare}
            size="2x"
            color="var(--mantine-color-gray-4)"
          />
          <Text fw={600}>No time series selected</Text>
          <Text size="sm" c="dimmed" ta="center" maw={320}>
            {dataset.timeSeries.length > 0
              ? "Open the Time Series menu above to choose which series to display."
              : "This dataset has no time series. Add audio or video with the button at the top right."}
          </Text>
        </Stack>
      </Center>
    );
  }

  const hiddenCount = dataset.timeSeries.length - activeTimeSeries.length;

  return (
    <>
      <ChartSlider
        start={fullRange.min}
        end={fullRange.max}
        visibleRange={visibleRange}
        onRangeChange={setVisibleRange}
      />
      {hasMedia ? (
        <MediaDock
          dataset={dataset}
          mediaList={mediaList}
          playback={playback}
          fullRange={fullRange}
          onMark={onPlotClick}
        />
      ) : null}
      <div className="flex-grow-1 overflow-auto" style={{ minHeight: 0 }}>
        {mediaList.map((media) => (
          <MediaSeriesDisplay
            key={media._id}
            media={media}
            shift={shifts[media._id]}
            onShiftChange={(value) => setShift(media._id, value)}
            playback={playback}
            fullRange={fullRange}
            visibleRange={visibleRange}
            onRangeChange={setVisibleRange}
          />
        ))}
        {hiddenCount > 0 ? (
          <Text size="xs" c="dimmed" px="sm" pt={4}>
            Showing {activeTimeSeries.length} of {dataset.timeSeries.length} time
            series — add more from the Time Series menu.
          </Text>
        ) : null}
        {activeTimeSeries.map((timeSeries) => (
          <TimeSeriesDisplay
            key={timeSeries._id}
            timeSeries={timeSeries}
            fullRange={fullRange}
            visibleRange={visibleRange}
            onRangeChange={setVisibleRange}
            playback={hasMedia ? playback : undefined}
          />
        ))}
      </div>
    </>
  );
};

export default TimeSeriesSection;
