import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  ActionIcon,
  Button,
  Group,
  Loader,
  Menu,
  Select,
  Text,
  Tooltip,
} from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExpand,
  faCompress,
  faMagnifyingGlassMinus,
  faMagnifyingGlassPlus,
  faPause,
  faPlay,
  faRotateLeft,
  faRotateRight,
  faTag,
} from "@fortawesome/free-solid-svg-icons";
import { getMediaUrl } from "../../../services/ApiServices/MediaServices";
import { RATES } from "./playback";
import { MIN_VISIBLE_MS, formatDuration, showSpan, zoomRange } from "./mediaUtils";

const formatClock = (timestamp) =>
  new Date(timestamp).toISOString().replace("T", " ").slice(0, 23);

// The <audio>/<video> element of one recording, driven by the playback.
const MediaPlayer = ({ datasetId, media, playback }) => {
  const elementRef = useRef();
  const frameRef = useRef();
  const [url, setUrl] = useState(undefined);
  const [failed, setFailed] = useState(false);
  // the picture at the playhead is there to be shown
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getMediaUrl(datasetId, media._id)
      .then((result) => !cancelled && setUrl(result))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [datasetId, media._id]);

  useEffect(
    () => playback.register(media, elementRef.current),
    [playback, media._id]
  );
  useEffect(() => playback.updateMedia(media), [playback, media]);

  // dim the picture while the playhead is outside of this recording
  useEffect(() => {
    if (media.kind !== "video") return undefined;
    const update = () =>
      frameRef.current?.classList.toggle(
        "media-player--outside",
        !playback.covers(media)
      );
    update();
    return playback.subscribe(update);
  }, [playback, media]);

  if (media.kind === "audio") {
    return (
      <audio
        ref={elementRef}
        src={url}
        preload="auto"
        aria-label={media.name}
        onError={() => url && setFailed(true)}
      />
    );
  }

  return (
    <figure className="media-player" ref={frameRef}>
      <video
        ref={elementRef}
        src={url}
        preload="auto"
        playsInline
        aria-label={media.name}
        // the size is known before the file arrives: no jump when it does
        style={
          media.meta?.width && media.meta?.height
            ? { aspectRatio: `${media.meta.width} / ${media.meta.height}` }
            : undefined
        }
        onClick={() => playback.toggle()}
        onLoadedData={() => setReady(true)}
        onCanPlay={() => setReady(true)}
        onSeeked={() => setReady(true)}
        onPlaying={() => setReady(true)}
        onWaiting={() => setReady(false)}
        onError={() => url && setFailed(true)}
      />
      {!ready && !failed ? (
        <div className="media-player__loading" role="status">
          <Loader size="sm" color="white" />
          <span>Loading video…</span>
        </div>
      ) : null}
      <figcaption>{failed ? `${media.name} could not be loaded` : media.name}</figcaption>
    </figure>
  );
};

const TimeReadout = ({ playback, start, end }) => {
  const elapsedRef = useRef();
  const clockRef = useRef();
  useEffect(() => {
    const update = () => {
      if (!elapsedRef.current) return;
      elapsedRef.current.textContent = formatDuration(playback.time - start);
      clockRef.current.textContent = formatClock(playback.time);
    };
    update();
    return playback.subscribe(update);
  }, [playback, start]);
  return (
    <div className="media-dock__time">
      <Text span size="sm" fw={600} ref={elapsedRef} />
      <Text span size="sm" c="dimmed">
        {" / "}
        {formatDuration(end - start)}
      </Text>
      <Tooltip label="Time of day at the playhead (UTC)" withinPortal openDelay={300}>
        <Text span size="xs" c="dimmed" ml="sm" ref={clockRef} />
      </Tooltip>
    </div>
  );
};

// How much of the timeline to show at once.
const SPANS = [
  [5_000, "5 s"],
  [15_000, "15 s"],
  [60_000, "1 min"],
  [5 * 60_000, "5 min"],
  [15 * 60_000, "15 min"],
  [60 * 60_000, "1 h"],
];

const describeSpan = (ms) => {
  if (ms < 1000) return `${Math.round(ms)} ms`;
  if (ms < 60_000) return `${+(ms / 1000).toFixed(1)} s`;
  if (ms < 3_600_000) return `${+(ms / 60_000).toFixed(1)} min`;
  return `${+(ms / 3_600_000).toFixed(1)} h`;
};

const ZoomControls = ({ playback, fullRange, visibleRange, onRangeChange }) => {
  const span = visibleRange.max - visibleRange.min;
  const fullSpan = fullRange.max - fullRange.min;
  // zoom around the playhead while it is in view, so it stays in view
  const anchor = () =>
    playback.time >= visibleRange.min && playback.time <= visibleRange.max
      ? playback.time
      : visibleRange.min + span / 2;
  const zoom = (factor) =>
    onRangeChange(zoomRange(visibleRange, fullRange, factor, anchor()));

  return (
    <Group gap={4} wrap="nowrap">
      <Tooltip label="Zoom out (−)" withinPortal openDelay={300}>
        <ActionIcon
          variant="default"
          aria-label="Zoom out"
          disabled={span >= fullSpan}
          onClick={() => zoom(2)}
        >
          <FontAwesomeIcon icon={faMagnifyingGlassMinus} size="sm" />
        </ActionIcon>
      </Tooltip>
      <Menu withinPortal position="bottom-end">
        <Menu.Target>
          <Tooltip label="How much of the timeline is shown" withinPortal openDelay={300}>
            <Button
              size="compact-sm"
              variant="default"
              miw={76}
              aria-label={`Showing ${describeSpan(span)}; choose how much to show`}
            >
              {span >= fullSpan ? "All" : describeSpan(span)}
            </Button>
          </Tooltip>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>Show</Menu.Label>
          {SPANS.filter(([ms]) => ms < fullSpan).map(([ms, label]) => (
            <Menu.Item
              key={ms}
              onClick={() => onRangeChange(showSpan(fullRange, ms, anchor()))}
            >
              {label}
            </Menu.Item>
          ))}
          <Menu.Item onClick={() => onRangeChange(fullRange)}>
            Everything ({describeSpan(fullSpan)})
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
      <Tooltip label="Zoom in (+)" withinPortal openDelay={300}>
        <ActionIcon
          variant="default"
          aria-label="Zoom in"
          disabled={span <= MIN_VISIBLE_MS}
          onClick={() => zoom(0.5)}
        >
          <FontAwesomeIcon icon={faMagnifyingGlassPlus} size="sm" />
        </ActionIcon>
      </Tooltip>
    </Group>
  );
};

// Play controls and the pictures of all videos, above the timeline rows.
const MediaDock = ({
  dataset,
  mediaList,
  playback,
  fullRange,
  visibleRange,
  onRangeChange,
  onMark,
  // few rows below: the picture can take more of the window
  roomy = false,
}) => {
  const [large, setLarge] = useState(false);
  const playing = useSyncExternalStore(
    (listener) => playback.subscribeState(listener),
    () => playback.playing
  );
  const rate = useSyncExternalStore(
    (listener) => playback.subscribeState(listener),
    () => playback.rate
  );
  const hasVideo = mediaList.some((media) => media.kind === "video");
  const latest = useRef({});
  latest.current = { visibleRange, fullRange, onRangeChange, onMark };

  // Moves the playhead and brings it into view if it left it.
  const seek = (time) => {
    playback.seek(time);
    const { visibleRange, fullRange, onRangeChange } = latest.current;
    if (playback.time < visibleRange.min || playback.time > visibleRange.max) {
      onRangeChange(
        showSpan(fullRange, visibleRange.max - visibleRange.min, playback.time)
      );
    }
  };

  useEffect(() => {
    const onKeyDown = (event) => {
      const target = event.target;
      const element = target instanceof HTMLElement ? target : undefined;
      const role = element?.getAttribute("role");
      const typing =
        element &&
        (["INPUT", "TEXTAREA", "SELECT"].includes(element.tagName) ||
          element.isContentEditable ||
          // sliders and menus use the same keys
          ["slider", "menuitem", "option", "textbox"].includes(role));
      if (typing || event.ctrlKey || event.metaKey) return;
      // A button that was just clicked keeps the focus. Space still plays
      // and pauses then (it would press that button again otherwise); Enter
      // is left to the button.
      const onButton = element?.tagName === "BUTTON" || role === "button";
      if (onButton && event.key === "Enter") return;
      const { visibleRange, fullRange, onRangeChange, onMark } = latest.current;
      if (event.key === " ") {
        playback.toggle();
      } else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        const step = event.shiftKey ? 5000 : event.altKey ? 100 : 1000;
        seek(playback.time + (event.key === "ArrowLeft" ? -step : step));
      } else if (event.key === "Enter") {
        onMark(playback.time);
      } else if (event.key === "+" || event.key === "=" || event.key === "-") {
        onRangeChange(
          zoomRange(visibleRange, fullRange, event.key === "-" ? 2 : 0.5, playback.time)
        );
      } else {
        return;
      }
      event.preventDefault();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [playback]);

  return (
    <div className="media-dock">
      <Group gap="md" px="sm" py={6} wrap="nowrap" justify="space-between">
        <Group gap="xs" wrap="nowrap">
          <Tooltip label="Back 5 s (Shift + ←)" withinPortal openDelay={300}>
            <ActionIcon
              variant="subtle"
              color="gray"
              aria-label="Back 5 seconds"
              onClick={() => seek(playback.time - 5000)}
            >
              <FontAwesomeIcon icon={faRotateLeft} size="sm" />
            </ActionIcon>
          </Tooltip>
          <Tooltip label={playing ? "Pause (Space)" : "Play (Space)"} withinPortal>
            <ActionIcon
              variant="filled"
              radius="xl"
              size="lg"
              aria-label={playing ? "Pause" : "Play"}
              onClick={() => playback.toggle()}
            >
              <FontAwesomeIcon icon={playing ? faPause : faPlay} size="sm" />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Forward 5 s (Shift + →)" withinPortal openDelay={300}>
            <ActionIcon
              variant="subtle"
              color="gray"
              aria-label="Forward 5 seconds"
              onClick={() => seek(playback.time + 5000)}
            >
              <FontAwesomeIcon icon={faRotateRight} size="sm" />
            </ActionIcon>
          </Tooltip>
          <TimeReadout playback={playback} start={fullRange.min} end={fullRange.max} />
          <Select
            size="xs"
            w={84}
            aria-label="Playback speed"
            allowDeselect={false}
            data={RATES.map((value) => ({ value: String(value), label: `${value}×` }))}
            value={String(rate)}
            onChange={(value) => playback.setRate(Number(value))}
          />
          <Tooltip
            label="Start or end a label at the playhead (Enter)"
            withinPortal
          >
            <Button
              size="compact-sm"
              variant="default"
              leftSection={<FontAwesomeIcon icon={faTag} size="xs" />}
              onClick={() => onMark(playback.time)}
            >
              Label here
            </Button>
          </Tooltip>
        </Group>
        <Group gap="xs" wrap="nowrap">
          <ZoomControls
            playback={playback}
            fullRange={fullRange}
            visibleRange={visibleRange}
            onRangeChange={onRangeChange}
          />
          {hasVideo ? (
            <Tooltip label={large ? "Smaller picture" : "Larger picture"} withinPortal>
              <ActionIcon
                variant="default"
                aria-label={large ? "Smaller picture" : "Larger picture"}
                onClick={() => setLarge((value) => !value)}
              >
                <FontAwesomeIcon icon={large ? faCompress : faExpand} size="sm" />
              </ActionIcon>
            </Tooltip>
          ) : null}
        </Group>
      </Group>
      <div
        className={`media-dock__players ${
          large
            ? "media-dock__players--large"
            : roomy
              ? "media-dock__players--roomy"
              : ""
        }`}
        style={hasVideo ? undefined : { display: "none" }}
      >
        {mediaList.map((media) => (
          <MediaPlayer
            key={media._id}
            datasetId={dataset._id}
            media={media}
            playback={playback}
          />
        ))}
      </div>
    </div>
  );
};

export default MediaDock;
