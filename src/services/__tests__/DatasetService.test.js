import { describe, it, expect, vi } from "vitest";
import { HttpResponse, http } from "msw";
import { server } from "../../../tests/setup";
import apiConsts from "../ApiServices/ApiConstants";

const DS = apiConsts.DATASET_STORE;
const CSV = apiConsts.DATASET_STORE_ENDPOINTS.CSV;

// Mock the blob download helper so no real <a download> click is required.
const state = { calls: [] };

vi.mock("../helpers", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    downloadBlob: async (...args) => {
      state.calls.push(args);
      return true;
    },
  };
});

const {
  registerDatasetDownload,
  registerProjectDownload,
  datasetDownloadStatus,
  cancelDownload,
} = await import("../DatasetService");

describe("DatasetService", () => {
  it("registerDatasetDownload registers a csv export for one dataset", async () => {
    let path;
    server.use(
      http.post(`${DS}${CSV}*`, ({ request }) => {
        path = new URL(request.url).pathname;
        return HttpResponse.json({ downloadId: "dl-9" });
      })
    );
    const res = await registerDatasetDownload({ _id: "d1" });
    expect(res).toEqual({ downloadId: "dl-9" });
    expect(path.endsWith("/download/dataset/d1")).toBe(true);
  });

  it("registerProjectDownload registers an export for the whole project", async () => {
    let path;
    server.use(
      http.post(`${DS}${CSV}*`, ({ request }) => {
        path = new URL(request.url).pathname;
        return HttpResponse.json({ ok: true });
      })
    );
    await registerProjectDownload();
    expect(path.endsWith("/download/project")).toBe(true);
  });

  it("datasetDownloadStatus polls the status endpoint", async () => {
    server.use(
      http.get(`${DS}${CSV}status/`, () =>
        HttpResponse.json({ state: "running" })
      )
    );
    expect(await datasetDownloadStatus()).toEqual({ state: "running" });
  });

  it("cancelDownload deletes the download job", async () => {
    let method;
    server.use(
      http.delete(`${DS}${CSV}*`, () => {
        method = "DELETE";
        return HttpResponse.json({});
      })
    );
    expect(await cancelDownload("dl-1")).toEqual({});
    expect(method).toBe("DELETE");
  });

  it("cancelDownload swallows errors and returns 404", async () => {
    server.use(
      http.delete(`${DS}${CSV}*`, () =>
        HttpResponse.json({ detail: "gone" }, { status: 404 })
      )
    );
    expect(await cancelDownload("dl-missing")).toBe(404);
  });

  it("downloadFile delegates to downloadBlob", async () => {
    const { downloadFile } = await import("../DatasetService");
    state.calls.length = 0;
    const blob = new Blob(["x"]);
    await downloadFile(blob, "out.zip");
    expect(state.calls).toEqual([[blob, "out.zip"]]);
  });

  it("downloadAllAsZip zips all datasets (deduping names) and downloads the archive", async () => {
    const { downloadAllAsZip } = await import("../DatasetService");
    server.use(
      http.get(`/ds/datasets/d1`, () =>
        HttpResponse.json({
          _id: "d1",
          timeSeries: [
            { name: "temp", unit: "C", data: [[0, 1], [10, 2]] },
          ],
          labelings: [],
          metaData: { author: "tester" },
        })
      ),
      http.get(`/ds/datasets/d2`, () =>
        HttpResponse.json({
          _id: "d2",
          timeSeries: [
            { name: "temp", unit: "C", data: [[0, 5]] },
          ],
          labelings: [],
          metaData: {},
        })
      )
    );
    state.calls.length = 0;
    await downloadAllAsZip(
      [{ _id: "d1", name: "A" }, { _id: "d2", name: "A" }],
      [{ _id: "lab-1", name: "activity" }],
      [{ _id: "type-1", name: "walk" }]
    );
    expect(state.calls).toEqual([[expect.any(Blob), "datasets.zip"]]);
  });
});
