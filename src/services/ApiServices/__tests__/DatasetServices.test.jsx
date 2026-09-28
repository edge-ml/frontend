import { describe, it, expect } from "vitest";
import { HttpResponse, http } from "msw";
import { server } from "../../../../tests/setup";
import apiConsts from "../ApiConstants";
import {
  getDatasets,
  getDatasetsPagination,
  updateDataset,
  getDatasetTimeseries,
  getTimeSeriesDataPartial,
  getDataset,
  deleteDataset,
  deleteDatasets,
  createDataset,
  createDatasets,
  appendToDataset,
  getUploadProcessingProgress,
  updateTimeSeriesConfig,
} from "../DatasetServices";

const DS = apiConsts.DATASET_STORE;
const E = apiConsts.DATASET_STORE_ENDPOINTS;

describe("DatasetServices", () => {
  it("getDatasets fetches the dataset list", async () => {
    server.use(http.get(DS + E.DATASETS, () => HttpResponse.json([{ id: 1 }])));
    expect(await getDatasets("project")).toEqual([{ id: 1 }]);
  });

  it("getDatasetsPagination passes skip/limit/sort as params", async () => {
    let url;
    server.use(
      http.get(DS + E.DATASETS + "view", ({ request }) => {
        url = new URL(request.url);
        return HttpResponse.json([]);
      })
    );
    await getDatasetsPagination(10, 20, "name");
    expect(url.searchParams.get("skip")).toBe("10");
    expect(url.searchParams.get("limit")).toBe("20");
    expect(url.searchParams.get("sort")).toBe("name");
  });

  it("updateDataset PUTs the whole dataset", async () => {
    let body;
    server.use(
      http.put(`${DS}${E.DATASETS}ds-1`, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ updated: true });
      })
    );
    const res = await updateDataset({ _id: "ds-1", name: "x" });
    expect(res).toEqual({ updated: true });
    expect(body).toEqual({ _id: "ds-1", name: "x" });
  });

  it("getDatasetTimeseries resolves with response data", async () => {
    server.use(
      http.get(`${DS}${E.DATASETS}ds-1/ts/0/100/50`, () =>
        HttpResponse.json([[0, 1], [10, 2]])
      )
    );
    const data = await getDatasetTimeseries("ds-1", {
      max_resolution: 50,
      start: 0,
      end: 100,
    });
    expect(data).toEqual([[0, 1], [10, 2]]);
  });

  it("getDatasetTimeseries rejects with err.response", async () => {
    server.use(
      http.get(`${DS}${E.DATASETS}bad/ts/0/100/50`, () =>
        HttpResponse.json({ detail: "nope" }, { status: 404 })
      )
    );
    await expect(
      getDatasetTimeseries("bad", { max_resolution: 50, start: 0, end: 100 })
    ).rejects.toMatchObject({ status: 404 });
  });

  it("getTimeSeriesDataPartial POSTs ts ids and resolves data", async () => {
    server.use(
      http.post(`${DS}${E.DATASETS}ds-2/ts/0/5/10`, () =>
        HttpResponse.json([[0, 3]])
      )
    );
    const data = await getTimeSeriesDataPartial(
      "ds-2",
      ["ts-1"],
      { max_resolution: 10, start: 0, end: 5 }
    );
    expect(data).toEqual([[0, 3]]);
  });

  it("getDataset fetches a single dataset", async () => {
    server.use(
      http.get(`${DS}${E.DATASETS}ds-9`, () =>
        HttpResponse.json({ _id: "ds-9" })
      )
    );
    expect(await getDataset("ds-9")).toEqual({ _id: "ds-9" });
  });

  it("deleteDataset DELETEs by id", async () => {
    let method;
    server.use(
      http.delete(`${DS}${E.DATASETS}gone`, () => {
        method = "DELETE";
        return HttpResponse.json({});
      })
    );
    await deleteDataset("gone");
    expect(method).toBe("DELETE");
  });

  it("deleteDatasets deletes every id", async () => {
    const deleted = [];
    server.use(
      http.delete(`${DS}${E.DATASETS}*`, ({ request }) => {
        deleted.push(new URL(request.url).pathname);
        return HttpResponse.json({});
      })
    );
    await deleteDatasets(["a", "b"]);
    expect(deleted.some((p) => p.endsWith("/datasets/a"))).toBe(true);
    expect(deleted.some((p) => p.endsWith("/datasets/b"))).toBe(true);
  });

  it("createDataset POSTs the dataset", async () => {
    server.use(
      http.post(DS + E.DATASETS, () => HttpResponse.json({ created: true }))
    );
    expect(await createDataset({ name: "new" })).toEqual({ created: true });
  });

  it("createDatasets creates all datasets then returns full list", async () => {
    let createdBodies = [];
    server.use(
      http.post(DS + E.DATASETS, async ({ request }) => {
        createdBodies.push(await request.json());
        return HttpResponse.json({});
      }),
      http.get(DS + E.DATASETS, () =>
        HttpResponse.json([{ _id: "existing" }])
      )
    );
    const res = await createDatasets([{ name: "a" }, { name: "b" }]);
    expect(createdBodies.length).toBe(2);
    expect(res).toEqual([{ _id: "existing" }]);
  });

  it("appendToDataset POSTs data to the append endpoint", async () => {
    let path;
    server.use(
      http.post(`${DS}${E.DATASETS}*`, ({ request }) => {
        path = new URL(request.url).pathname;
        return HttpResponse.json({});
      })
    );
    await appendToDataset({ _id: "ds-1" }, [[0, 1]]);
    expect(path.endsWith("/datasets/ds-1/append")).toBe(true);
  });

  it("getUploadProcessingProgress queries by datasetId", async () => {
    let url;
    server.use(
      http.get(DS + E.GET_PROCESSING_PROGRESS, ({ request }) => {
        url = new URL(request.url);
        return HttpResponse.json({ progress: 42 });
      })
    );
    expect(await getUploadProcessingProgress("ds-3")).toEqual({
      progress: 42,
    });
    expect(url.searchParams.get("datasetId")).toBe("ds-3");
  });

  it("updateTimeSeriesConfig PUTs unit config query", async () => {
    let path;
    server.use(
      http.put(`${DS}${E.DATASETS}*`, ({ request }) => {
        path = new URL(request.url).pathname + new URL(request.url).search;
        return HttpResponse.json({});
      })
    );
    await updateTimeSeriesConfig("d1", "ts1", "g", 2.5, -1);
    expect(path).toContain(
      "/datasets/d1/changeUnitConfig?tsId=ts1&unit=g&scaling=2.5&offset=-1"
    );
  });
});
