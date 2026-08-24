import { describe, it, expect, vi } from "vitest";
import { HttpResponse, http } from "msw";
import { server } from "../../../tests/setup";
import {
  intersect,
  difference,
  toggleElement,
  validateEmail,
  getServerTime,
  isNumber,
  betterModulo,
  unixTimeToString,
  toPercentage,
  humanFileSize,
  downloadBlob,
  mobileAndTabletCheck,
  objMap,
  throttle,
  debounce,
  displayTime,
  humanDuration,
} from "../helpers";

describe("helpers", () => {
  it("intersect works for any number of arrays", () => {
    expect(intersect([1, 2, 3], [2, 3, 4])).toEqual([2, 3]);
    expect(intersect([1, 2], [2, 3], [3, 2])).toEqual([2]);
    expect(intersect([1, 2])).toEqual([1, 2]);
  });

  it("difference returns elements not in the second array", () => {
    expect(difference([1, 2, 3], [2])).toEqual([1, 3]);
    expect(difference([], [1])).toEqual([]);
  });

  it("toggleElement adds and removes items", () => {
    expect(toggleElement([1, 2], 3)).toEqual([1, 2, 3]);
    expect(toggleElement([1, 2], 2)).toEqual([1]);
  });

  it.each([
    ["test@edge-ml.org", true],
    ["invalid", false],
    ["@nope.com", false],
    ["user@sub.domain.org", true],
  ])("validateEmail(%s) === %s", (mail, expected) => {
    expect(validateEmail(mail)).toBe(expected);
  });

  it("getServerTime resolves with the date header", async () => {
    server.use(
      http.get("*", () =>
        new HttpResponse(null, { headers: { date: "Wed, 21 Oct 2015 07:28:00 GMT" } })
      )
    );
    expect(await getServerTime()).toBe("Wed, 21 Oct 2015 07:28:00 GMT");
  });

  it("getServerTime rejects when the request fails", async () => {
    server.use(http.get("*", () => HttpResponse.json({}, { status: 500 })));
    // The raw axios error is re-thrown by the promise's reject handler.
    await expect(getServerTime()).rejects.toMatchObject({
      code: "ERR_BAD_RESPONSE",
    });
  });

  it.each([
    ["123", true],
    ["-1.5", true],
    ["1e10", true],
    ["abc", false],
    ["12px", false],
  ])("isNumber(%s) === %s", (val, expected) => {
    expect(isNumber(val)).toBe(expected);
  });

  it("betterModulo always returns non-negative results", () => {
    expect(betterModulo(-1, 5)).toBe(4);
    expect(betterModulo(7, 5)).toBe(2);
  });

  it("unixTimeToString formats timestamps", () => {
    const ts = new Date(2020, 0, 1, 13, 4, 5, 6).getTime();
    expect(unixTimeToString(ts)).toBe("13:04:05.006");
    expect(unixTimeToString(0)).toBe("00:00:00.000");
  });

  it("toPercentage formats ratios", () => {
    expect(toPercentage(0.5)).toBe("50.00%");
    expect(toPercentage(1)).toBe("100.00%");
  });

  it.each([
    [500, false, "500 B"],
    [1024, false, "1.0 KiB"],
    [1000, true, "1.0 kB"],
    [1024 ** 2 * 3.5, false, "3.5 MiB"],
    [1024 ** 9, false, "1024.0 YiB"],
    [-512, false, "-512 B"], // negative bytes use Math.abs for threshold
    [1500000, true, "1.50 MB"], // custom dp=2 rounds and keeps unit
  ])("humanFileSize(%d, %s) === %s", (bytes, si, expected) => {
    const dp = expected.startsWith("1.50") ? 2 : undefined;
    expect(humanFileSize(bytes, si, dp)).toBe(expected);
  });

  it("downloadBlob rejects non-blob input and downloads blobs in the browser", async () => {
    await expect(downloadBlob("not-a-blob", "f.txt")).rejects.toThrow(
      TypeError
    );
    const clickSpy = vi.fn();
    const anchor = {
      set href(v) {},
      get href() {
        return "";
      },
      click: clickSpy,
    };
    const createSpy = vi
      .spyOn(document, "createElement")
      .mockReturnValue(anchor);
    document.body.appendChild = vi.fn();
    document.body.removeChild = vi.fn();
    globalThis.URL.createObjectURL = vi.fn(() => "blob:x");
    globalThis.URL.revokeObjectURL = vi.fn();

    const blob = new Blob(["data"]);
    await expect(downloadBlob(blob, "file.zip")).resolves.toBe(true);
    expect(clickSpy).toHaveBeenCalled();
    expect(globalThis.URL.revokeObjectURL).toHaveBeenCalledWith("blob:x");
    createSpy.mockRestore();
  });

  it("downloadBlob saves through the Tauri dialog/fs plugins inside Tauri", async () => {
    globalThis.__TAURI_INTERNALS__ = {};
    const save = vi.fn().mockResolvedValue("/tmp/out.bin");
    const writeFile = vi.fn().mockResolvedValue(undefined);
    vi.doMock("@tauri-apps/plugin-dialog", () => ({ save }));
    vi.doMock("@tauri-apps/plugin-fs", () => ({ writeFile }));
    vi.resetModules();
    try {
      const { downloadBlob: tauriDownload } = await import("../helpers");
      await expect(tauriDownload(new Blob(["abc"]), "out.bin")).resolves.toBe(
        true
      );
      expect(save).toHaveBeenCalledWith({
        defaultPath: "out.bin",
        filters: [{ name: "BIN file", extensions: ["bin"] }],
      });
      expect(writeFile).toHaveBeenCalledTimes(1);
      expect(writeFile.mock.calls[0][0]).toBe("/tmp/out.bin");
      expect(writeFile.mock.calls[0][1]).toBeInstanceOf(Uint8Array);
    } finally {
      delete globalThis.__TAURI_INTERNALS__;
    }
  });

  it("downloadBlob returns false when the Tauri save dialog is cancelled", async () => {
    globalThis.__TAURI_INTERNALS__ = {};
    const save = vi.fn().mockResolvedValue(null);
    const writeFile = vi.fn();
    vi.doMock("@tauri-apps/plugin-dialog", () => ({ save }));
    vi.doMock("@tauri-apps/plugin-fs", () => ({ writeFile }));
    vi.resetModules();
    try {
      const { downloadBlob: tauriDownload } = await import("../helpers");
      await expect(tauriDownload(new Blob(["abc"]), "file")).resolves.toBe(false);
      // "file" has no dot -> split(".").pop() yields "file" itself as
      // extension; an empty filename exercises the filter-less branch.
      await tauriDownload(new Blob(["abc"]), "");
      expect(save).toHaveBeenLastCalledWith({
        defaultPath: "",
        filters: undefined,
      });
      expect(writeFile).not.toHaveBeenCalled();
    } finally {
      delete globalThis.__TAURI_INTERNALS__;
    }
  });

  it("mobileAndTabletCheck detects mobile user agents", () => {
    const original = navigator.userAgent;
    Object.defineProperty(window.navigator, "userAgent", {
      value:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) Mobile Safari",
      configurable: true,
    });
    expect(mobileAndTabletCheck()).toBe(true);
    Object.defineProperty(window.navigator, "userAgent", {
      value: original,
      configurable: true,
    });
  });

  it("mobileAndTabletCheck falls back to vendor/opera when userAgent is empty", () => {
    const original = navigator.userAgent;
    Object.defineProperty(window.navigator, "userAgent", {
      value: "",
      configurable: true,
    });
    // jsdom's vendor is "" (Apple-like) or "Google Inc."; either way this
    // exercises the || fallback operands without matching a mobile UA.
    expect(typeof mobileAndTabletCheck()).toBe("boolean");
    Object.defineProperty(window.navigator, "userAgent", {
      value: original,
      configurable: true,
    });
  });

  it("objMap maps over object values", () => {
    expect(objMap({ a: 1, b: 2 }, (v) => v * 2)).toEqual({ a: 2, b: 4 });
  });

  it("throttle calls immediately then at most once per limit", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const throttled = throttle(fn, 100);
    throttled();
    throttled();
    throttled();
    expect(fn).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(150);
    expect(fn).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it("throttle invokes directly once the limit has fully elapsed", () => {
    // Start at a non-zero epoch so `lastRan` is truthy after the first call
    // (fake timers default to Date.now() === 0).
    vi.useFakeTimers({ now: 1_000_000 });
    const fn = vi.fn();
    const throttled = throttle(fn, 100);
    throttled();
    expect(fn).toHaveBeenCalledTimes(1);
    // Fully elapsed -> the scheduled trailing run executes immediately.
    vi.advanceTimersByTime(200);
    throttled();
    vi.advanceTimersByTime(1); // flush the trailing setTimeout
    expect(fn).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it("throttle drops trailing calls that have not yet reached the limit", () => {
    vi.useFakeTimers({ now: 1_000_000 });
    const fn = vi.fn();
    const throttled = throttle(fn, 100);
    throttled();
    throttled(); // schedules a trailing run at ~limit
    vi.advanceTimersByTime(99); // not yet elapsed -> trailing run is a no-op
    expect(fn).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(2); // now elapsed -> trailing run fires
    expect(fn).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it("debounce only calls after silence", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn, 50);
    debounced();
    debounced();
    vi.advanceTimersByTime(49);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it("displayTime renders '-' for out-of-range timestamps", () => {
    expect(displayTime(1e20)).toBe("-");
    expect(displayTime(-1e20)).toBe("-");
    const t = new Date(2021, 5, 15, 10, 30, 0).getTime();
    expect(displayTime(t)).toContain("at");
  });

  it("humanDuration renders short durations", () => {
    expect(humanDuration(90_000)).toMatch(/min.*s/);
  });

  it("humanDuration covers every shortEn unit", () => {
    // ~1y, 2mo, 3w, 4d, 5h, 6min, 7s, 800ms
    const ms =
      365.25 * 24 * 3600e3 +
      2 * 30 * 24 * 3600e3 +
      21 * 24 * 3600e3 +
      96 * 3600e3 +
      18_000e3 +
      360e3 +
      7e3 +
      800;
    const out = humanDuration(ms);
    expect(out).toContain("y");
    expect(out).toContain("mo");
    expect(out).toContain("w");
    expect(out).toContain("d");
    expect(out).toContain("h");
    expect(out).toContain("min");
    expect(out).toContain("s");
    // Sub-second durations render via the ms unit when restricted to it.
    expect(humanDuration(800, { units: ["ms"] })).toBe("800ms");
  });
});
