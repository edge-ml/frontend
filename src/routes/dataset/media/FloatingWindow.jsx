import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// A window that floats above the page: dragged by its title bar, resized from
// its lower right corner (keeping `aspect`), and kept inside the browser
// window. Where it was is remembered per `storageKey`.

const MARGIN = 8;
const MIN_WIDTH = 200;
const TITLE_HEIGHT = 30;

const load = (key) => {
  try {
    const value = JSON.parse(window.localStorage.getItem(key));
    return value && Number.isFinite(value.x) && Number.isFinite(value.width)
      ? value
      : undefined;
  } catch (_) {
    return undefined;
  }
};

const save = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (_) {
    // private window or storage full: it just is not remembered
  }
};

// Keeps a window of `box` inside the browser window.
export const fitInView = (box, aspect, view = { width: window.innerWidth, height: window.innerHeight }) => {
  const maxWidth = Math.max(MIN_WIDTH, view.width - 2 * MARGIN);
  const maxHeight = Math.max(TITLE_HEIGHT + 80, view.height - 2 * MARGIN);
  let width = Math.min(Math.max(box.width, MIN_WIDTH), maxWidth);
  // the picture must fit below the title bar
  if (width / aspect + TITLE_HEIGHT > maxHeight) {
    width = Math.max(MIN_WIDTH, (maxHeight - TITLE_HEIGHT) * aspect);
  }
  const height = width / aspect + TITLE_HEIGHT;
  const x = Math.min(Math.max(box.x, MARGIN), Math.max(MARGIN, view.width - width - MARGIN));
  const y = Math.min(Math.max(box.y, MARGIN), Math.max(MARGIN, view.height - height - MARGIN));
  return { x, y, width };
};

const FloatingWindow = ({
  storageKey,
  title,
  aspect = 16 / 9,
  // where it starts the first time: { x, y, width }
  initial,
  hidden = false,
  actions,
  children,
}) => {
  const [box, setBox] = useState(() =>
    fitInView(load(storageKey) ?? initial, aspect)
  );
  const boxRef = useRef(box);
  boxRef.current = box;
  const gesture = useRef();

  // the browser window shrank, or the picture's shape became known
  useLayoutEffect(() => {
    const fit = () => setBox((current) => fitInView(current, aspect));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [aspect]);

  useEffect(() => {
    if (!gesture.current) save(storageKey, box);
  }, [box, storageKey]);

  const begin = (event, kind) => {
    if (event.button !== 0) return;
    // the buttons in the title bar are not handles
    if (kind === "move" && event.target.closest("button")) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    gesture.current = {
      kind,
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      box: boxRef.current,
    };
  };

  const move = (event) => {
    const g = gesture.current;
    if (!g || event.pointerId !== g.pointerId) return;
    const dx = event.clientX - g.x;
    const dy = event.clientY - g.y;
    setBox(
      fitInView(
        g.kind === "move"
          ? { ...g.box, x: g.box.x + dx, y: g.box.y + dy }
          : { ...g.box, width: g.box.width + Math.max(dx, dy * aspect) },
        aspect
      )
    );
  };

  const end = (event) => {
    const g = gesture.current;
    if (!g || event.pointerId !== g.pointerId) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    gesture.current = undefined;
    save(storageKey, boxRef.current);
  };

  const handlers = (kind) => ({
    onPointerDown: (event) => begin(event, kind),
    onPointerMove: move,
    onPointerUp: end,
    onPointerCancel: end,
  });

  return createPortal(
    <section
      className="floating-window"
      aria-label={title}
      style={{
        left: box.x,
        top: box.y,
        width: box.width,
        // hidden, not unmounted: the video keeps playing its sound
        display: hidden ? "none" : undefined,
      }}
    >
      <header
        className="floating-window__title"
        title="Drag to move; double-click to put it back in the corner"
        onDoubleClick={(event) => {
          if (event.target.closest("button")) return;
          setBox(fitInView(initial, aspect));
        }}
        {...handlers("move")}
      >
        <span className="floating-window__name">{title}</span>
        <span className="floating-window__actions">{actions}</span>
      </header>
      <div className="floating-window__body" style={{ aspectRatio: aspect }}>
        {children}
      </div>
      <div
        className="floating-window__resize"
        aria-hidden
        title="Drag to resize"
        {...handlers("resize")}
      />
    </section>,
    document.body
  );
};

export default FloatingWindow;
