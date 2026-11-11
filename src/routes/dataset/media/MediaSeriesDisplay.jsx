import React, { useContext, useMemo, useState } from "react";
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Loader,
  Menu,
  Text,
  TextInput,
} from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowsLeftRight,
  faEllipsisVertical,
  faPen,
  faTrash,
  faVideo,
  faVolumeHigh,
} from "@fortawesome/free-solid-svg-icons";
import { DatasetContext } from "../DatasetContext";
import TimeSeriesChart from "../TimeSeriesChart";
import MediaOverlay from "./MediaOverlay";
import useMediaPeaks from "./useMediaPeaks";
import { formatDuration, formatShift, formatSize, waveformData } from "./mediaUtils";
import {
  deleteMedia,
  updateMedia,
} from "../../../services/ApiServices/MediaServices";

const NUDGES = [-1000, -100, 100, 1000];

// One recording as a row on the dataset timeline: its waveform (when it has
// sound), the labels, and the tools to rename, align and delete it.
const MediaSeriesDisplay = ({
  media,
  shift,
  onShiftChange,
  playback,
  fullRange,
  visibleRange,
  onRangeChange,
}) => {
  const {
    dataset,
    labelsToShow,
    selectedLabel,
    setSelectedLabel,
    onPlotClick,
    updateLabelStartEnd,
    refreshDataset,
  } = useContext(DatasetContext);
  const [chartWidth, setChartWidth] = useState(window.innerWidth);
  // undefined | "rename" | "align" | "delete"
  const [mode, setMode] = useState(undefined);
  const [name, setName] = useState(media.name);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(undefined);
  const peaks = useMediaPeaks(dataset._id, media);

  const hasSound = Boolean(media.meta?.audioCodec);
  const waveform = useMemo(
    () => waveformData(peaks, media, visibleRange, chartWidth),
    [peaks, media.start, visibleRange.min, visibleRange.max, chartWidth]
  );

  const close = () => {
    setMode(undefined);
    setError(undefined);
    onShiftChange(undefined);
  };

  const run = async (action) => {
    setBusy(true);
    setError(undefined);
    try {
      await action();
      await refreshDataset();
      close();
    } catch (e) {
      setError(e.message || "That did not work");
    } finally {
      setBusy(false);
    }
  };

  const saveName = () =>
    run(() => updateMedia(dataset._id, media._id, { name: name.trim() }));
  // `media.start` already includes the pending shift
  const saveShift = () =>
    run(() =>
      updateMedia(dataset._id, media._id, { start: Math.round(media.start) })
    );
  const remove = () => run(() => deleteMedia(dataset._id, media._id));

  const details = [
    formatDuration(media.durationMs),
    media.kind === "video" && media.meta?.width
      ? `${media.meta.width}×${media.meta.height}`
      : null,
    formatSize(media.size),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <section className="time-series-item media-series-item m-2">
      <Group justify="space-between" align="center" wrap="nowrap" gap="xs">
        <Group gap={6} wrap="nowrap" style={{ minWidth: 0 }}>
          <FontAwesomeIcon
            icon={media.kind === "video" ? faVideo : faVolumeHigh}
            className="media-series-icon"
          />
          <h6 className="fw-bold time-series-name">{media.name}</h6>
          <Text size="xs" c="dimmed" style={{ whiteSpace: "nowrap" }}>
            {details}
          </Text>
          {media.status === "processing" ? (
            <Badge
              size="sm"
              variant="light"
              color="gray"
              leftSection={<Loader size={10} color="gray" />}
            >
              Preparing waveform
            </Badge>
          ) : null}
        </Group>
        <Menu withinPortal position="bottom-end">
          <Menu.Target>
            <ActionIcon
              size="sm"
              variant="subtle"
              color="gray"
              aria-label={`Options for ${media.name}`}
            >
              <FontAwesomeIcon icon={faEllipsisVertical} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              leftSection={<FontAwesomeIcon icon={faArrowsLeftRight} />}
              onClick={() => {
                onShiftChange(0);
                setMode("align");
              }}
            >
              Align with sensor data
            </Menu.Item>
            <Menu.Item
              leftSection={<FontAwesomeIcon icon={faPen} />}
              onClick={() => {
                setName(media.name);
                setMode("rename");
              }}
            >
              Rename
            </Menu.Item>
            <Menu.Item
              color="red"
              leftSection={<FontAwesomeIcon icon={faTrash} />}
              onClick={() => setMode("delete")}
            >
              Delete
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>

      {mode === "align" ? (
        <Group gap="xs" className="media-series-panel">
          <Text size="sm">
            Drag the recording along the timeline, or nudge it:
          </Text>
          <Button.Group>
            {NUDGES.map((step) => (
              <Button
                key={step}
                size="compact-xs"
                variant="default"
                onClick={() => onShiftChange((shift ?? 0) + step)}
              >
                {formatShift(step)}
              </Button>
            ))}
          </Button.Group>
          <Text size="sm" fw={600} aria-label="Shift">
            {formatShift(shift ?? 0)}
          </Text>
          <Button
            size="compact-xs"
            loading={busy}
            disabled={!shift}
            onClick={saveShift}
          >
            Save
          </Button>
          <Button size="compact-xs" variant="subtle" color="gray" onClick={close}>
            Cancel
          </Button>
        </Group>
      ) : null}
      {mode === "rename" ? (
        <Group gap="xs" className="media-series-panel">
          <TextInput
            size="xs"
            w={240}
            aria-label="Name of the recording"
            value={name}
            autoFocus
            onChange={(event) => setName(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && name.trim()) saveName();
              if (event.key === "Escape") close();
            }}
          />
          <Button
            size="compact-xs"
            loading={busy}
            disabled={!name.trim()}
            onClick={saveName}
          >
            Save
          </Button>
          <Button size="compact-xs" variant="subtle" color="gray" onClick={close}>
            Cancel
          </Button>
        </Group>
      ) : null}
      {mode === "delete" ? (
        <Group gap="xs" className="media-series-panel">
          <Text size="sm">
            Delete this recording? The labels and sensor data stay.
          </Text>
          <Button size="compact-xs" color="red" loading={busy} onClick={remove}>
            Delete
          </Button>
          <Button size="compact-xs" variant="subtle" color="gray" onClick={close}>
            Cancel
          </Button>
        </Group>
      ) : null}
      {error ? (
        <Text size="xs" c="red" role="alert">
          {error}
        </Text>
      ) : null}

      <TimeSeriesChart
        name={media.name}
        height={hasSound ? 120 : 76}
        waveform={waveform}
        fullRange={fullRange}
        visibleRange={visibleRange}
        labels={labelsToShow}
        selectedLabel={selectedLabel}
        onPlotClick={onPlotClick}
        onRangeChange={onRangeChange}
        onLabelSelect={setSelectedLabel}
        onBoundaryCommit={updateLabelStartEnd}
        onWidthChange={setChartWidth}
        renderOverlay={(plot) => (
          <MediaOverlay
            plot={plot}
            playback={playback}
            media={media}
            aligning={mode === "align"}
            onShift={(delta) => onShiftChange((current) => (current ?? 0) + delta)}
          />
        )}
      />
    </section>
  );
};

export default MediaSeriesDisplay;
