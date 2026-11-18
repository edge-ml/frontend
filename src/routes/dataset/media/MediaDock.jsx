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
  faUpRightFromSquare,
  faVideo,
  faXmark,
  faMagnifyingGlassMinus,
  faMagnifyingGlassPlus,
  faPause,
  faPlay,
  faBackward,
  faForward,
  faTag,
} from "@fortawesome/free-solid-svg-icons";
import { getMediaUrl } from "../../../services/ApiServices/MediaServices";
import { RATES } from "./playback";
import FloatingWindow from "./FloatingWindow";
import { SHORTCUT_KEYS, indexToShortcutKey } from "../../../services/ShortcutKeys";
import { MIN_VISIBLE_MS, formatDuration, showSpan, zoomRange } from "./mediaUtils";

const formatClock = (timestamp) =>
  new Date(timestamp).toISOString().replace("T", " ").slice(0, 23);

// Native picture-in-picture: a window of its own that can leave the browser.
// Chrome, Edge and Safari have it; Firefox only through its own button.
const nativePipAvailable = () =>
  typeof document !== "undefined" &&
  Boolean(document.pictureInPictureEnabled) &&
  typeof HTMLVideoElement !== "undefined" &&
  "requestPictureInPicture" in HTMLVideoElement.prototype;

const DEFAULT_VIDEO_WIDTH = 400;

// Where the n-th video's window goes the first time: the lower right corner,
// above the label bar, each further one a little up and to the left.
const initialVideoBox = (index, aspect) => {
  const width = Math.min(DEFAULT_VIDEO_WIDTH, window.innerWidth * 0.4);
  const height = width / aspect + 30;
  return {
    x: window.innerWidth - width - 24 - index * 32,
    y: window.innerHeight - height - 72 - index * 32,
    width,
  };
};

// The <audio>/<video> element of one recording, driven by the playback.
// Videos play in a floating window that can be dragged anywhere.
const MediaPlayer = ({ datasetId, media, playback, index = 0, hidden, onHide }) => {
  const elementRef = useRef();
  const frameRef = useRef();
  const [url, setUrl] = useState(undefined);
  const [failed, setFailed] = useState(false);
  // the picture at the playhead is there to be shown
  const [ready, setReady] = useState(false);
  const [inNativePip, setInNativePip] = useState(false);

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

  // leave the browser's picture-in-picture when the page goes
  useEffect(
    () => () => {
      if (document.pictureInPictureElement === elementRef.current) {
        document.exitPictureInPicture?.().catch(() => {});
      }
    },
    []
  );

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

  const aspect =
    media.meta?.width && media.meta?.height
      ? media.meta.width / media.meta.height
      : 16 / 9;

  const toggleNativePip = async () => {
    try {
      if (document.pictureInPictureElement === elementRef.current) {
        await document.exitPictureInPicture();
      } else {
        await elementRef.current.requestPictureInPicture();
      }
    } catch (error) {
      console.error("Picture-in-picture is not available", error);
    }
  };

  return (
    <FloatingWindow
      storageKey={`edgeml.videoWindow.${media._id}`}
      title={media.name}
      aspect={aspect}
      initial={initialVideoBox(index, aspect)}
      hidden={hidden}
      actions={
        <>
          {nativePipAvailable() ? (
            <Tooltip
              label={inNativePip ? "Back into the page" : "Own window, also outside the browser"}
              withinPortal
              openDelay={300}
            >
              <ActionIcon
                size="sm"
                variant="subtle"
                color="gray.0"
                aria-label={inNativePip ? `Put ${media.name} back into the page` : `Open ${media.name} in its own window`}
                onClick={toggleNativePip}
              >
                <FontAwesomeIcon icon={faUpRightFromSquare} size="xs" />
              </ActionIcon>
            </Tooltip>
          ) : null}
          <Tooltip label="Hide (Videos button brings it back)" withinPortal openDelay={300}>
            <ActionIcon
              size="sm"
              variant="subtle"
              color="gray.0"
              aria-label={`Hide ${media.name}`}
              onClick={onHide}
            >
              <FontAwesomeIcon icon={faXmark} size="sm" />
            </ActionIcon>
          </Tooltip>
        </>
      }
    >
      <figure className="media-player" ref={frameRef}>
        <video
          ref={elementRef}
          src={url}
          preload="auto"
          playsInline
          aria-label={media.name}
          onClick={() => playback.toggle()}
          onLoadedData={() => setReady(true)}
          onCanPlay={() => setReady(true)}
          onSeeked={() => setReady(true)}
          onPlaying={() => setReady(true)}
          onWaiting={() => setReady(false)}
          onError={() => url && setFailed(true)}
          onEnterpictureinpicture={() => setInNativePip(true)}
          onLeavepictureinpicture={() => setInNativePip(false)}
        />
        {inNativePip ? (
          <div className="media-player__loading">
            <span>Playing in its own window</span>
          </div>
        ) : !ready && !failed ? (
          <div className="media-player__loading" role="status">
            <Loader size="sm" color="white" />
            <span>Loading video…</span>
          </div>
        ) : failed ? (
          <div className="media-player__loading">
            <span>{media.name} could not be loaded</span>
          </div>
        ) : null}
      </figure>
    </FloatingWindow>
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

// Play controls above the timeline rows; the videos float above the page.
const MediaDock = ({
  dataset,
  mediaList,
  playback,
  fullRange,
  visibleRange,
  onRangeChange,
  onMark,
  // the label being recorded with the keys: { name, color, start, end }
  live,
  // the active labeling, whose keys label while playing
  labeling,
}) => {
  // videos whose floating window the user closed
  const [hiddenVideos, setHiddenVideos] = useState(() => new Set());
  const videos = mediaList.filter((media) => media.kind === "video");
  const shownVideos = videos.filter((media) => !hiddenVideos.has(media._id));
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
      } else if (event.key === "," || event.key === ".") {
        // one picture back or forward, to place a boundary exactly
        playback.pause();
        seek(playback.time + (event.key === "," ? -1 : 1) * playback.frameMs());
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
              <FontAwesomeIcon icon={faBackward} size="sm" />
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
              <FontAwesomeIcon icon={faForward} size="sm" />
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
          {live ? (
            <Tooltip
              label="Its key again ends it, another label's key switches, pausing ends it, Esc drops it"
              withinPortal
              multiline
              w={260}
            >
              <span
                className="live-label-chip"
                role="status"
                style={live.color ? { "--live-color": live.color } : undefined}
              >
                {live.name} {formatDuration(Math.max(0, live.end - live.start))}
              </span>
            </Tooltip>
          ) : playing && labeling?.labels.length ? (
            <Text size="xs" c="dimmed" style={{ whiteSpace: "nowrap" }}>
              Press a label&apos;s key ({indexToShortcutKey(0)}
              {labeling.labels.length > 1
                ? `–${indexToShortcutKey(Math.min(labeling.labels.length, SHORTCUT_KEYS.length) - 1)}`
                : ""}
              ) to label while it plays
            </Text>
          ) : null}
        </Group>
        <Group gap="xs" wrap="nowrap">
          <ZoomControls
            playback={playback}
            fullRange={fullRange}
            visibleRange={visibleRange}
            onRangeChange={onRangeChange}
          />
          {hasVideo ? (
            <Tooltip
              label={
                shownVideos.length > 0
                  ? "Hide the video windows"
                  : "Show the video windows"
              }
              withinPortal
            >
              <Button
                size="compact-sm"
                variant={shownVideos.length > 0 ? "light" : "default"}
                leftSection={<FontAwesomeIcon icon={faVideo} size="xs" />}
                aria-pressed={shownVideos.length > 0}
                onClick={() =>
                  setHiddenVideos(
                    shownVideos.length > 0
                      ? new Set(videos.map((media) => media._id))
                      : new Set()
                  )
                }
              >
                Videos {shownVideos.length}/{videos.length}
              </Button>
            </Tooltip>
          ) : null}
        </Group>
      </Group>
      {mediaList.map((media) => (
        <MediaPlayer
          key={media._id}
          datasetId={dataset._id}
          media={media}
          playback={playback}
          index={videos.indexOf(media)}
          hidden={hiddenVideos.has(media._id)}
          onHide={() =>
            setHiddenVideos((current) => new Set([...current, media._id]))
          }
        />
      ))}
    </div>
  );
};

export default MediaDock;
