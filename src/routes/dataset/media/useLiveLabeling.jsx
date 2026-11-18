import { useEffect, useRef, useState } from "react";
import { notifications } from "@mantine/notifications";
import { keyToShortcutIndex } from "../../../services/ShortcutKeys";
import { createDatasetLabel } from "../../../services/ApiServices/DatasetLabelService";

// Labeling while the dataset plays, with the label shortcut keys, the way the
// BLE page labels while recording:
//   - a label's key starts that label at the playhead,
//   - the same key again ends it,
//   - another label's key ends the open one and starts that one,
//   - pausing ends the open label, Escape drops it.
// While paused, the keys keep choosing the label type, as before.

// How often the open label grows on screen.
const REDRAW_MS = 100;

export const nextLiveState = (open, type, time) => {
  if (!open) return { open: { type, start: time }, finished: undefined };
  if (open.type === type) {
    return { open: undefined, finished: { ...open, end: time } };
  }
  // labels of one labeling may not overlap: the previous one ends 1 ms before
  return {
    open: { type, start: time },
    finished: { ...open, end: time - 1 },
  };
};

// Labels of one labeling may not overlap. A label being recorded therefore
// cannot start inside an existing one, and stops just before the next.
export const fitBetween = (existing, start, end) => {
  if (existing.some((label) => label.start <= start && start <= label.end)) {
    return undefined;
  }
  const next = existing
    .filter((label) => label.start > start)
    .reduce((first, label) => Math.min(first, label.start), Infinity);
  return { start, end: Math.min(end, next - 1) };
};

const isTyping = (target) =>
  target instanceof HTMLElement &&
  (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) ||
    target.isContentEditable ||
    ["slider", "menuitem", "option", "textbox"].includes(target.getAttribute("role")));

const useLiveLabeling = ({ playback, dataset, activeLabeling, refreshDataset }) => {
  // { type, start, end } while a label is being recorded
  const [live, setLive] = useState(undefined);
  const liveRef = useRef(undefined);
  const latest = useRef({});
  latest.current = { dataset, activeLabeling, refreshDataset };
  // labels are saved one after the other, then the dataset reloads once
  const queue = useRef(Promise.resolve());
  const waiting = useRef(0);

  // the labels of the active labeling already in the dataset
  const existing = () => {
    const { dataset, activeLabeling } = latest.current;
    return (
      dataset?.labelings?.find((l) => l.labelingId === activeLabeling?._id)
        ?.labels ?? []
    );
  };

  // the open label as far as it can go: up to the playhead or the next label
  const extent = (open, time) =>
    fitBetween(existing(), open.start, Math.max(open.start, time)) ?? {
      start: open.start,
      end: open.start,
    };

  const setOpen = (open) => {
    liveRef.current = open;
    setLive(open ? { ...open, ...extent(open, playback.time) } : undefined);
  };

  const save = (label) => {
    const { dataset, activeLabeling } = latest.current;
    if (!activeLabeling) return;
    const fitted = extent(label, label.end);
    const start = Math.round(fitted.start);
    const end = Math.round(fitted.end);
    const name = activeLabeling.labels.find((l) => l._id === label.type)?.name;
    waiting.current += 1;
    queue.current = queue.current
      .then(() =>
        createDatasetLabel(dataset._id, activeLabeling._id, {
          start,
          end,
          type: label.type,
        })
      )
      .catch((error) =>
        notifications.show({
          color: "red",
          title: `The label "${name ?? ""}" was not saved`,
          message: error.message || "The request failed",
        })
      )
      .finally(() => {
        waiting.current -= 1;
        if (waiting.current === 0) latest.current.refreshDataset();
      });
  };

  const press = (type) => {
    const { open, finished } = nextLiveState(liveRef.current, type, playback.time);
    if (finished) save(finished);
    if (open && !fitBetween(existing(), open.start, open.start)) {
      notifications.show({
        id: "live-label-taken",
        color: "yellow",
        title: "There already is a label here",
        message: "Labels of one labeling cannot overlap. Start the new label after it, or delete it first.",
      });
      setOpen(undefined);
      return;
    }
    setOpen(open);
  };

  const finish = () => {
    const open = liveRef.current;
    if (!open) return;
    save({ ...open, end: playback.time });
    setOpen(undefined);
  };

  const drop = () => setOpen(undefined);

  // the keys: ahead of the page's own shortcut handling, while playing
  useEffect(() => {
    const onKeyDown = (event) => {
      const { activeLabeling } = latest.current;
      if (!playback.playing || !activeLabeling) {
        if (event.key === "Escape" && liveRef.current) drop();
        return;
      }
      if (event.ctrlKey || event.metaKey || event.altKey || isTyping(event.target)) return;
      if (event.key === "Escape" && liveRef.current) {
        drop();
      } else {
        const index = keyToShortcutIndex(event.key);
        const label = activeLabeling.labels[index];
        if (index < 0 || !label) return;
        press(label._id);
      }
      event.preventDefault();
      event.stopPropagation();
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [playback]);

  // pausing (or the end of the dataset) ends the open label
  useEffect(
    () =>
      playback.subscribeState(() => {
        if (!playback.playing) finish();
      }),
    [playback]
  );

  // a different labeling: what was being recorded belongs to the old one
  useEffect(() => {
    finish();
  }, [activeLabeling?._id]);

  // the open label grows with the playhead
  useEffect(() => {
    if (!live) return undefined;
    const id = window.setInterval(() => {
      if (liveRef.current) {
        setLive({ ...liveRef.current, ...extent(liveRef.current, playback.time) });
      }
    }, REDRAW_MS);
    return () => window.clearInterval(id);
  }, [Boolean(live), playback]);

  return { live, press, finish, drop };
};

export default useLiveLabeling;
