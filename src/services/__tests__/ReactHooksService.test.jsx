import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useSelect,
  useIncrement,
  useAsyncMemo,
  useBoolean,
  useMediaQuery,
  useBootstrapMDBreakpoint,
  usePersistedState,
  useInterval,
} from "../ReactHooksService";

describe("useSelect", () => {
  it("starts at the initial index and exposes list helpers", () => {
    const { result } = renderHook(() => useSelect(["a", "b", "c"], 1));
    expect(result.current.index).toBe(1);
    expect(result.current.item).toBe("b");
    expect(result.current.list).toEqual(["a", "b", "c"]);

    act(() => result.current.setItem("c"));
    expect(result.current.index).toBe(2);

    act(() => result.current.setIndex(0));
    expect(result.current.item).toBe("a");
  });

  it("defaults to the first element when no initial index is given", () => {
    const { result } = renderHook(() => useSelect(["x", "y"]));
    expect(result.current.index).toBe(0);
    expect(result.current.item).toBe("x");
  });

  it("setItem with an unknown value selects index -1", () => {
    const { result } = renderHook(() => useSelect(["a", "b"]));
    act(() => result.current.setItem("nope"));
    expect(result.current.index).toBe(-1);
  });
});

describe("useIncrement", () => {
  it("increments the counter", () => {
    const { result } = renderHook(() => useIncrement());
    expect(result.current[0]).toBe(0);
    act(() => result.current[1]());
    expect(result.current[0]).toBe(1);
  });
});

describe("useAsyncMemo", () => {
  it("resolves the factory promise into state", async () => {
    const { result } = renderHook(() => useAsyncMemo(() => Promise.resolve(42), []));
    expect(result.current).toBeUndefined();
    await act(async () => {});
    expect(result.current).toBe(42);
  });

  it("handles factories returning undefined or null", async () => {
    const { result } = renderHook(() => useAsyncMemo(() => undefined, []));
    await act(async () => {});
    expect(result.current).toBeUndefined();

    const { result: resultNull } = renderHook(() => useAsyncMemo(() => null, []));
    await act(async () => {});
    expect(resultNull.current).toBeUndefined(); // initial stays, no update
  });

  it("does not set state after unmount (cancel)", async () => {
    let resolve;
    const factory = vi.fn(
      () => new Promise((r) => (resolve = r))
    );
    const { unmount } = renderHook(() => useAsyncMemo(factory, ["dep"]));
    unmount();
    resolve("late");
    // No state update warning/error should occur.
    await act(async () => {});
  });

  it("uses the initial value until resolved", async () => {
    const { result } = renderHook(() =>
      useAsyncMemo(() => Promise.resolve("v"), [], "initial")
    );
    expect(result.current).toBe("initial");
    await act(async () => {});
    expect(result.current).toBe("v");
  });
});

describe("useBoolean", () => {
  it("supports setTrue/setFalse/toggle", () => {
    const { result } = renderHook(() => useBoolean(false));
    expect(result.current[0]).toBe(false);
    act(() => result.current[1]()); // setTrue
    expect(result.current[0]).toBe(true);
    act(() => result.current[2]()); // setFalse
    expect(result.current[0]).toBe(false);
    act(() => result.current[3]()); // toggle
    expect(result.current[0]).toBe(true);
  });

  it("coerces truthy default values", () => {
    const { result } = renderHook(() => useBoolean("truthy"));
    expect(result.current[0]).toBe(true);
  });
});

describe("useMediaQuery", () => {
  function makeMatchMedia() {
    const listeners = [];
    const queries = {};
    window.matchMedia = vi.fn((query) => {
      if (!queries[query]) {
        queries[query] = {
          matches: query === "(min-width: 100px)",
          media: query,
          addEventListener: (_t, cb) => listeners.push(cb),
          removeEventListener: (_t, cb) =>
            listeners.splice(listeners.indexOf(cb), 1),
        };
      }
      return queries[query];
    });
    return { listeners, queries };
  }

  it("reflects matchMedia results and updates on change", () => {
    const { listeners, queries } = makeMatchMedia();

    const { result } = renderHook(() => useMediaQuery("(min-width: 100px)"));
    expect(result.current).toBe(true);

    // Simulate a media query change event.
    act(() => {
      queries["(min-width: 100px)"].matches = false;
      listeners.forEach((cb) => cb());
    });
    expect(result.current).toBe(false);

    expect(window.matchMedia).toHaveBeenCalledWith("(min-width: 100px)");
  });

  it("supports the legacy add/removeListener API and cleans up on unmount", () => {
    const added = [];
    const removed = [];
    window.matchMedia = vi.fn((query) => ({
      matches: false,
      media: query,
      // Legacy API only -> exercises both legacy branches (and not the
      // modern addEventListener ones).
      addListener: (cb) => added.push(cb),
      removeListener: (cb) => removed.push(cb),
    }));

    const { unmount } = renderHook(() => useMediaQuery("(min-width: 100px)"));
    expect(added.length).toBe(1);
    expect(removed.length).toBe(0);
    unmount();
    expect(removed.length).toBe(1);
    expect(removed[0]).toBe(added[0]);
  });

  it("removes modern event listeners on unmount", () => {
    const listeners = [];
    window.matchMedia = vi.fn((query) => ({
      matches: true,
      media: query,
      addEventListener: (_t, cb) => listeners.push(cb),
      removeEventListener: (_t, cb) =>
        listeners.splice(listeners.indexOf(cb), 1),
    }));

    const { unmount, result } = renderHook(() => useMediaQuery("all"));
    expect(result.current).toBe(true);
    expect(listeners.length).toBe(1);
    unmount();
    expect(listeners.length).toBe(0);
  });

  it("useBootstrapMDBreakpoint checks for md screens", () => {
    window.matchMedia = vi.fn((query) => ({
      matches: true,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
    const { result } = renderHook(() => useBootstrapMDBreakpoint());
    expect(result.current).toBe(true);
  });
});

describe("usePersistedState", () => {
  it("reads initial value from localStorage and persists updates", () => {
    localStorage.setItem("myKey", JSON.stringify({ a: 1 }));
    const { result } = renderHook(() => usePersistedState("fallback", "myKey"));
    expect(result.current[0]).toEqual({ a: 1 });

    act(() => result.current[1]("updated"));
    expect(JSON.parse(localStorage.getItem("myKey"))).toBe("updated");
  });

  it("falls back to the default on parse errors", () => {
    localStorage.setItem("badKey", "{invalid json");
    const { result } = renderHook(() => usePersistedState("default", "badKey"));
    expect(result.current[0]).toBe("default");
  });

  it("uses the default when nothing is stored", () => {
    const { result } = renderHook(() => usePersistedState([1, 2], "emptyKey"));
    expect(result.current[0]).toEqual([1, 2]);
  });
});

describe("useInterval", () => {
  it("ticks repeatedly while delay is non-null", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    renderHook(() => useInterval(fn, 100));
    vi.advanceTimersByTime(350);
    expect(fn).toHaveBeenCalledTimes(3);
    vi.useRealTimers();
  });

  it("does not tick when delay is null", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    renderHook(() => useInterval(fn, null));
    vi.advanceTimersByTime(500);
    expect(fn).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("always calls the latest callback", () => {
    vi.useFakeTimers();
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(({ cb }) => useInterval(cb, 100), {
      initialProps: { cb: first },
    });
    rerender({ cb: second });
    vi.advanceTimersByTime(150);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
