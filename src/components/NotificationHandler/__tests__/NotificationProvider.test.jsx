import React, { useContext } from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { act, render } from "@testing-library/react";

const toasts = vi.hoisted(() => ({ show: vi.fn(), update: vi.fn() }));
vi.mock("@mantine/notifications", () => ({ notifications: toasts }));

const service = vi.hoisted(() => ({
  registerDatasetDownload: vi.fn(),
  registerProjectDownload: vi.fn(),
  datasetDownloadStatus: vi.fn(),
  datasetDownloadfromId: vi.fn(),
  cancelDownload: vi.fn(),
  downloadFileName: (entry) => `${entry.fileName}.${entry.fileType}`,
}));
vi.mock("../../../services/DatasetService", () => service);

import NotificationContext, { NotificationProvider } from "../NotificationProvider";

const READY = { downloadId: "d1", status: 100, error: "", fileName: "walk", fileType: "zip", datasetName: "walk" };

let api;
const Grab = () => {
  api = useContext(NotificationContext);
  return null;
};

beforeEach(() => {
  vi.useFakeTimers();
  Object.values(toasts).forEach((mock) => mock.mockReset());
  service.datasetDownloadStatus.mockReset();
  service.datasetDownloadfromId.mockReset();
  service.registerDatasetDownload.mockResolvedValue({ ...READY, status: 0 });
  service.cancelDownload.mockResolvedValue(undefined);
});

describe("downloading a dataset", () => {
  it("ends on the result, also when progress is reported late", async () => {
    service.datasetDownloadStatus
      .mockResolvedValueOnce([{ ...READY, status: 40 }])
      .mockResolvedValue([READY]);
    let lateProgress;
    service.datasetDownloadfromId.mockImplementation(async (entry, onProgress) => {
      onProgress(0.09);
      lateProgress = onProgress;
      return true;
    });
    render(
      <NotificationProvider>
        <Grab />
      </NotificationProvider>
    );
    let result;
    await act(async () => {
      result = api.registerDatasetDownload({ _id: "ds", name: "walk" });
      await vi.advanceTimersByTimeAsync(2500);
    });
    expect(await result).toBe(true);
    const messages = () => toasts.update.mock.calls.map(([toast]) => toast.message);
    expect(messages()).toContain("Preparing the files… 40 %");
    expect(messages()).toContain("Fetching the file… 9 %");
    expect(messages().at(-1)).toBe("Saved as walk.zip");
    // the delayed last report of the transfer
    lateProgress(1);
    expect(messages().at(-1)).toBe("Saved as walk.zip");
    expect(service.cancelDownload).toHaveBeenCalledWith("d1");
  });

  it("reports why the server could not prepare it", async () => {
    service.datasetDownloadStatus.mockResolvedValue([{ ...READY, status: 10, error: "The file is missing" }]);
    render(
      <NotificationProvider>
        <Grab />
      </NotificationProvider>
    );
    let result;
    await act(async () => {
      result = api.registerDatasetDownload({ _id: "ds", name: "walk" });
      await vi.advanceTimersByTimeAsync(1500);
    });
    expect(await result).toBe(false);
    expect(toasts.update.mock.calls.at(-1)[0]).toMatchObject({ color: "red", message: "The file is missing" });
    expect(service.datasetDownloadfromId).not.toHaveBeenCalled();
  });
});
