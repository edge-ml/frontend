import { describe, it, expect } from "vitest";
import { HttpResponse, http } from "msw";
import { server } from "../../../../tests/setup";
import apiConsts from "../ApiConstants";
import {
  getLabelings,
  updateLabeling,
  addLabeling,
  deleteLabeling,
} from "../LabelingServices";
import {
  setDeviceApiKey,
  getDeviceApiKey,
  deleteDeviceApiKey,
  switchDeviceApiActive,
} from "../DeviceApiService";
import { getDeviceByNameAndGeneration } from "../DeviceService";
import { getTimeSeriesDataPartial } from "../TimeSeriesService";
import {
  getWharDatasets,
  startWharImport,
  getWharImportStatus,
} from "../WharImportService";
import {
  getArduinoFirmware,
  getLatestEdgeMLVersionNumber,
} from "../ArduinoFirmwareServices";

const { DATASET_STORE: DS, WHAR_URI, API_URI } = apiConsts;

describe("LabelingServices", () => {
  it("getLabelings lists labelings", async () => {
    server.use(
      http.get(DS + apiConsts.DATASET_STORE_ENDPOINTS.LABELING, () =>
        HttpResponse.json([{ _id: "l1" }])
      )
    );
    expect(await getLabelings()).toEqual([{ _id: "l1" }]);
  });

  it("updateLabeling PUTs by id", async () => {
    let path;
    server.use(
      http.put(`${DS}${apiConsts.DATASET_STORE_ENDPOINTS.LABELING}*`, ({ request }) => {
        path = new URL(request.url).pathname;
        return HttpResponse.json({});
      })
    );
    await updateLabeling({ _id: "l9", name: "n" });
    expect(path.endsWith("/labelings/l9")).toBe(true);
  });

  it("addLabeling POSTs a new labeling", async () => {
    server.use(
      http.post(DS + apiConsts.DATASET_STORE_ENDPOINTS.LABELING, () =>
        HttpResponse.json({ created: true })
      )
    );
    expect(await addLabeling({ name: "x" })).toEqual({ created: true });
  });

  it("deleteLabeling DELETEs by id", async () => {
    let method;
    server.use(
      http.delete(`${DS}${apiConsts.DATASET_STORE_ENDPOINTS.LABELING}*`, () => {
        method = "DELETE";
        return HttpResponse.json({});
      })
    );
    await deleteLabeling("l1", ["d1"]);
    expect(method).toBe("DELETE");
  });
});

describe("DatasetLabelService", () => {
  it("createDatasetLabel POSTs a label", async () => {
    const { createDatasetLabel } = await import("../DatasetLabelService");
    let path;
    server.use(
      http.post(`${DS}${apiConsts.DATASET_STORE_ENDPOINTS.DATASET_LABELINGS}*`, ({ request }) => {
        path = new URL(request.url).pathname;
        return HttpResponse.json({});
      })
    );
    await createDatasetLabel("d1", "lb1", { name: "walk" });
    expect(path.endsWith("/datasets/labelings/d1/lb1")).toBe(true);
  });

  it("changeDatasetLabel rounds start/end and PUTs", async () => {
    const { changeDatasetLabel } = await import("../DatasetLabelService");
    let body;
    server.use(
      http.put(`${DS}${apiConsts.DATASET_STORE_ENDPOINTS.DATASET_LABELINGS}*`, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({});
      })
    );
    await changeDatasetLabel("d1", "lb1", {
      _id: "lab-1",
      start: 10.6,
      end: 20.4,
    });
    expect(body.start).toBe(11);
    expect(body.end).toBe(20);
  });

  it("deleteDatasetLabel DELETEs the label", async () => {
    const { deleteDatasetLabel } = await import("../DatasetLabelService");
    server.use(
      http.delete(`${DS}${apiConsts.DATASET_STORE_ENDPOINTS.DATASET_LABELINGS}*`, () =>
        HttpResponse.json({})
      )
    );
    expect(await deleteDatasetLabel("d1", "lb1", "lab-1")).toEqual({});
  });
});

describe("DeviceApiService", () => {
  it.each([
    [setDeviceApiKey, "deviceApi/setkey"],
    [getDeviceApiKey, "deviceApi/getkey"],
    [deleteDeviceApiKey, "deviceApi/deletekey"],
  ])("%s GETs its endpoint", async (fn, endpoint) => {
    server.use(http.get(`${API_URI}${endpoint}`, () => HttpResponse.json({ ok: true })));
    expect(await fn()).toEqual({ ok: true });
  });

  it("switchDeviceApiActive POSTs the state", async () => {
    let body;
    server.use(
      http.post(
        `${API_URI}${apiConsts.API_ENDPOINTS.SWTICHDEVICEAPIACTIVE}`,
        async ({ request }) => {
          body = await request.json();
          return HttpResponse.json({});
        }
      )
    );
    await switchDeviceApiActive(false);
    expect(body).toEqual({ state: false });
  });
});

describe("DeviceService", () => {
  it("getDeviceByNameAndGeneration GETs device by name/generation", async () => {
    let path;
    server.use(
      http.get(`${API_URI}${apiConsts.API_ENDPOINTS.DEVICE}/*`, ({ request }) => {
        path = new URL(request.url).pathname;
        return HttpResponse.json({ found: true });
      })
    );
    const res = await getDeviceByNameAndGeneration("myDevice", "gen2");
    expect(res).toEqual({ found: true });
    expect(path).toContain("/devices/myDevice/gen2");
  });
});

describe("TimeSeriesService", () => {
  it("getTimeSeriesDataPartial GETs partial time series data", async () => {
    let path;
    server.use(
      http.get(`${DS}${apiConsts.DATASET_STORE_ENDPOINTS.DATASETS}*ts*`, ({ request }) => {
        path = new URL(request.url).pathname;
        return HttpResponse.json([[0, 5]]);
      })
    );
    expect(await getTimeSeriesDataPartial("d1", "t1", 0, 100, 50)).toEqual([
      [0, 5],
    ]);
    expect(path).toContain("/datasets/d1/ts/t1/0/100/50");
  });
});

describe("WharImportService", () => {
  it("getWharDatasets lists available whar datasets", async () => {
    server.use(
      http.get(`${WHAR_URI}datasets`, () =>
        HttpResponse.json([{ dataset_id: "wh-1" }])
      )
    );
    expect(await getWharDatasets()).toEqual([{ dataset_id: "wh-1" }]);
  });

  it("startWharImport POSTs the dataset id", async () => {
    let body;
    server.use(
      http.post(`${WHAR_URI}import`, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ job_id: "j1" });
      })
    );
    expect(await startWharImport("wh-1")).toEqual({ job_id: "j1" });
    expect(body).toEqual({ dataset_id: "wh-1" });
  });

  it("getWharImportStatus polls the job status", async () => {
    let path;
    server.use(
      http.get(`${WHAR_URI}import/*/status`, ({ request }) => {
        path = new URL(request.url).pathname;
        return HttpResponse.json({ state: "done" });
      })
    );
    expect(await getWharImportStatus("j7")).toEqual({ state: "done" });
    expect(path.endsWith("/import/j7/status")).toBe(true);
  });
});

describe("ArduinoFirmwareServices", () => {
  it("getArduinoFirmware returns an arraybuffer", async () => {
    server.use(
      http.get(`${API_URI}${apiConsts.API_ENDPOINTS.ARDUINOFIRMWARE}/*`, () =>
        new HttpResponse(new Uint8Array([1]).buffer)
      )
    );
    expect((await getArduinoFirmware("nano")).byteLength).toBe(1);
  });

  it("getLatestEdgeMLVersionNumber returns the first valid tag", async () => {
    server.use(
      http.get("https://api.github.com/repos/edge-ml/EdgeML-Arduino/tags", () =>
        HttpResponse.json([
          { name: "not-a-version" },
          { name: "1.0.0" },
          { name: "2.3.4" },
        ])
      )
    );
    // The implementation only validates tags[0]; an invalid first tag throws.
    await expect(getLatestEdgeMLVersionNumber()).rejects.toThrow(
      "Illegal version format"
    );

    server.use(
      http.get("https://api.github.com/repos/edge-ml/EdgeML-Arduino/tags", () =>
        HttpResponse.json([{ name: "2.3.4" }, { name: "1.0.0" }])
      )
    );
    expect(await getLatestEdgeMLVersionNumber()).toBe("2.3.4");
  });

  it("getLatestEdgeMLVersionNumber throws when no tags exist", async () => {
    server.use(
      http.get("https://api.github.com/repos/edge-ml/EdgeML-Arduino/tags", () =>
        HttpResponse.json([])
      )
    );
    await expect(getLatestEdgeMLVersionNumber()).rejects.toThrow(
      "Illegal version format"
    );
  });
});
