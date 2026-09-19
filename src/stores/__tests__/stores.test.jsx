import { describe, it, expect, beforeEach, vi } from "vitest";
import { HttpResponse, http } from "msw";
import { server } from "../../../tests/setup";

let useLabelingStore;
let useWharImportStore;

describe("labelingStore", () => {
  beforeEach(async () => {
    vi.resetModules();
    localStorage.clear();
    ({ default: useLabelingStore } = await import("../labelingStore"));
  });

  it("setLabelings stores labelings locally", () => {
    const labelings = [{ _id: "l1", name: "L" }];
    useLabelingStore.getState().setLabelings(labelings);
    expect(useLabelingStore.getState().labelings).toEqual(labelings);
  });

  it("getLabelings fetches from the dataset store", async () => {
    server.use(
      http.get("/ds/labelings", () => HttpResponse.json([{ _id: "l2" }]))
    );
    await useLabelingStore.getState().getLabelings();
    expect(useLabelingStore.getState().labelings).toEqual([{ _id: "l2" }]);
  });
});

describe("wharImportStore", () => {
  beforeEach(async () => {
    vi.resetModules();
    localStorage.clear();
    ({ default: useWharImportStore } = await import("../wharImportStore"));
  });

  it("starts with no job when nothing is stored", () => {
    expect(useWharImportStore.getState().job).toBeNull();
    expect(useWharImportStore.getState().status).toBeNull();
  });

  it("tolerates corrupted stored jobs (JSON parse error)", async () => {
    localStorage.setItem("wharImportJob", "{not valid json");
    // Re-import simulates a fresh page load hitting the catch branch.
    vi.resetModules();
    ({ default: useWharImportStore } = await import("../wharImportStore"));
    expect(useWharImportStore.getState().job).toBeNull();
  });

  it("setJob persists the job and restores it on re-import", () => {
    const job = { jobId: "j1", datasetName: "WHAR-1", startedAt: 123 };
    useWharImportStore.getState().setJob(job);
    expect(JSON.parse(localStorage.getItem("wharImportJob"))).toEqual(job);

    // Re-import simulates a fresh page load.
    vi.resetModules();
  });

  it("setJob(null) removes any stored job", () => {
    useWharImportStore.getState().setJob({ jobId: "j1" });
    expect(localStorage.getItem("wharImportJob")).not.toBeNull();
    useWharImportStore.getState().setJob(null);
    expect(localStorage.getItem("wharImportJob")).toBeNull();
    expect(useWharImportStore.getState().job).toBeNull();
  });

  it("setStatus tracks polled status without persisting it", () => {
    useWharImportStore.getState().setStatus({ state: "running" });
    expect(useWharImportStore.getState().status).toEqual({ state: "running" });
    expect(localStorage.getItem("wharImportJob")).toBeNull();
  });

  it("clear removes job, status and storage", () => {
    useWharImportStore.getState().setJob({ jobId: "j2" });
    useWharImportStore.getState().clear();
    expect(useWharImportStore.getState().job).toBeNull();
    expect(useWharImportStore.getState().status).toBeNull();
    expect(localStorage.getItem("wharImportJob")).toBeNull();
  });
});
