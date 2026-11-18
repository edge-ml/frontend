import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";

vi.mock("../../../services/ApiServices/MediaServices", () => ({
  uploadMedia: vi.fn(async () => ({ _id: "m1", startSource: "metadata", start: 0, end: 1 })),
}));
vi.mock("../../../services/ApiServices/DatasetServices", () => ({
  createDataset: vi.fn(async () => ({ _id: "d1" })),
  deleteDataset: vi.fn(async () => ({})),
}));
vi.mock("../../../services/ApiServices/CSVServices", () => ({
  processCSVBackend: vi.fn(() => [() => {}, Promise.resolve({ data: { _id: "d1" } })]),
}));
vi.mock("@mantine/notifications", () => ({ notifications: { show: vi.fn() } }));

import { useFileUploads, FileStatus } from "../useFileUploads";

describe("upload dialog", () => {
  it("closes once every file is uploaded", async () => {
    const onClose = vi.fn();
    const onComplete = vi.fn();
    const { result } = renderHook(() => useFileUploads(onComplete, onClose));
    await act(async () => {
      await result.current.onFileInput([
        new File(["a"], "clip.webm", { type: "video/webm" }),
        new File(["b"], "voice.mp3", { type: "audio/mpeg" }),
      ]);
    });
    expect(result.current.together).toBe(true);
    await act(async () => {
      await result.current.handleUploadAll();
    });
    expect(onComplete).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(result.current.files).toEqual([]);
  });

  it("stays open when a file was refused", async () => {
    const { uploadMedia } = await import("../../../services/ApiServices/MediaServices");
    uploadMedia.mockRejectedValueOnce(new Error("This video format cannot be played"));
    const onClose = vi.fn();
    const { result } = renderHook(() => useFileUploads(vi.fn(), onClose));
    await act(async () => {
      await result.current.onFileInput([new File(["a"], "old.mp4", { type: "video/mp4" })]);
    });
    await act(async () => {
      await result.current.handleUploadAll();
    });
    expect(onClose).not.toHaveBeenCalled();
    expect(result.current.files[0].status).toBe(FileStatus.ERROR);
    expect(result.current.files[0].error).toMatch(/cannot be played/);
  });
});
