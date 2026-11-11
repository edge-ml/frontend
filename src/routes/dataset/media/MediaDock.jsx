import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ActionIcon, Button, Group, Select, Text, Tooltip } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExpand,
  faCompress,
  faPause,
  faPlay,
  faTag,
} from "@fortawesome/free-solid-svg-icons";
import { getMediaUrl } from "../../../services/ApiServices/MediaServices";
import { RATES } from "./playback";
import { formatDuration } from "./mediaUtils";

const formatClock = (timestamp) =>
  new Date(timestamp).toISOString().replace("T", " ").slice(0, 23);

// The <audio>/<video> element of one recording, driven by the playback.
const MediaPlayer = ({ datasetId, media, playback }) => {
  const elementRef = useRef();
  const frameRef = useRef();
  const [url, setUrl] = useState(undefined);
  const [failed, setFailed] = useState(false);

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
        onClick={() => playback.toggle()}
        onError={() => url && setFailed(true)}
      />
      <figcaption>{failed ? `${media.name} could not be loaded` : media.name}</figcaption>
    </figure>
  );
};

const TimeReadout = ({ playback, start }) => {
  const ref = useRef();
  useEffect(() => {
    const update = () => {
      if (!ref.current) return;
      ref.current.textContent = `${formatDuration(playback.time - start)}  ·  ${formatClock(playback.time)}`;
    };
    update();
    return playback.subscribe(update);
  }, [playback, start]);
  return <Text size="sm" className="media-dock__time" ref={ref} />;
};

// Play controls and the pictures of all videos, above the timeline rows.
const MediaDock = ({ dataset, mediaList, playback, fullRange, onMark, children }) => {
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

  // Space plays and pauses, as in any player.
  useEffect(() => {
    const onKeyDown = (event) => {
      const target = event.target;
      const typing =
        target instanceof HTMLElement &&
        (["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(target.tagName) ||
          target.isContentEditable);
      if (event.key === " " && !typing) {
        event.preventDefault();
        playback.toggle();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [playback]);

  return (
    <div className="media-dock">
      <Group gap="xs" px="sm" py={4} wrap="nowrap" justify="space-between">
        <Group gap="xs" wrap="nowrap">
          <Tooltip label={playing ? "Pause (Space)" : "Play (Space)"} withinPortal>
            <ActionIcon
              variant="filled"
              radius="xl"
              aria-label={playing ? "Pause" : "Play"}
              onClick={() => playback.toggle()}
            >
              <FontAwesomeIcon icon={playing ? faPause : faPlay} size="sm" />
            </ActionIcon>
          </Tooltip>
          <TimeReadout playback={playback} start={fullRange.min} />
          <Select
            size="xs"
            w={76}
            aria-label="Playback speed"
            allowDeselect={false}
            data={RATES.map((value) => ({ value: String(value), label: `${value}×` }))}
            value={String(rate)}
            onChange={(value) => playback.setRate(Number(value))}
          />
          <Tooltip
            label="Start or end a label at the playhead, like a click on the timeline"
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
          {children}
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
        className={`media-dock__players ${large ? "media-dock__players--large" : ""}`}
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
