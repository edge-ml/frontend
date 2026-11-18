import { describe, expect, it } from "vitest";
import { defaultTogether, fileKind } from "../useFileUploads";

describe("one upload dialog", () => {
  it("tells the kinds of files apart", () => {
    expect(fileKind({ name: "walk.CSV" })).toBe("csv");
    expect(fileKind({ name: "x", type: "text/csv" })).toBe("csv");
    expect(fileKind({ name: "clip.mp4", type: "video/mp4" })).toBe("video");
    expect(fileKind({ name: "clip.MOV" })).toBe("video");
    expect(fileKind({ name: "memo.m4a" })).toBe("audio");
    expect(fileKind({ name: "x", type: "audio/ogg" })).toBe("audio");
    expect(fileKind({ name: "notes.txt", type: "text/plain" })).toBeUndefined();
  });

  it("puts recordings with their sensor data by default", () => {
    const of = (...kinds) => kinds.map((kind) => ({ kind }));
    expect(defaultTogether(of("csv", "video"))).toBe(true);
    expect(defaultTogether(of("video", "audio"))).toBe(true);
    expect(defaultTogether(of("csv", "csv"))).toBe(false);
    expect(defaultTogether(of("csv", "csv", "video"))).toBe(false);
    expect(defaultTogether(of("csv"))).toBe(false);
  });
});
