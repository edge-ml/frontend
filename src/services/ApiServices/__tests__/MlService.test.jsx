import { describe, it, expect } from "vitest";
import { HttpResponse, http } from "msw";
import { server } from "../../../../tests/setup";
import apiConsts from "../ApiConstants";
import {
  getStepOptions,
  getModels,
  getModel,
  updateModel,
  deleteModel,
  getTrainConfig,
  train,
  preflightTrain,
  getDeployDevices,
  deployModel,
  downloadFirmware,
} from "../MlService";

const ML = apiConsts.ML_URI;
const E = apiConsts.ML_ENDPOINTS;

describe("MlService", () => {
  it("getStepOptions fetches pipeline options", async () => {
    server.use(
      http.get(`${ML}${E.TRAIN}/pipeline/options`, () =>
        HttpResponse.json({ options: ["a"] })
      )
    );
    expect(await getStepOptions()).toEqual({ options: ["a"] });
  });

  it("getModels lists models", async () => {
    server.use(http.get(ML + E.MODELS, () => HttpResponse.json([{ _id: "m1" }])));
    expect(await getModels()).toEqual([{ _id: "m1" }]);
  });

  it("getModel fetches one model by id", async () => {
    server.use(
      http.get(`${ML}${E.MODELS}/m2`, () => HttpResponse.json({ _id: "m2" }))
    );
    expect(await getModel("m2")).toEqual({ _id: "m2" });
  });

  it("updateModel PUTs the model", async () => {
    let body;
    server.use(
      http.put(`${ML}${E.MODELS}/m1`, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ ok: true });
      })
    );
    await updateModel({ _id: "m1", name: "renamed" });
    expect(body).toEqual({ _id: "m1", name: "renamed" });
  });

  it("deleteModel DELETEs by id", async () => {
    let method;
    server.use(
      http.delete(`${ML}${E.MODELS}/m3`, ({ request }) => {
        method = request.method;
        return HttpResponse.json({});
      })
    );
    await deleteModel("m3");
    expect(method).toBe("DELETE");
  });

  it("getTrainConfig fetches train config", async () => {
    server.use(http.get(ML + E.TRAIN, () => HttpResponse.json({ steps: [] })));
    expect(await getTrainConfig()).toEqual({ steps: [] });
  });

  it("train POSTs training data", async () => {
    let body;
    server.use(
      http.post(ML + E.TRAIN, async ({ request }) => {
        if (new URL(request.url).pathname.endsWith("/train")) {
          body = await request.json();
          return HttpResponse.json({ started: true });
        }
        return HttpResponse.json({});
      })
    );
    expect(await train({ datasetId: "d1" })).toEqual({ started: true });
    expect(body).toEqual({ datasetId: "d1" });
  });

  it("preflightTrain POSTs to the preflight endpoint", async () => {
    let path;
    server.use(
      http.post(`${ML}${E.TRAIN}/*`, ({ request }) => {
        path = new URL(request.url).pathname;
        return HttpResponse.json({ ok: true });
      })
    );
    await preflightTrain({ config: true });
    expect(path.endsWith("/train/preflight")).toBe(true);
  });

  it("getDeployDevices fetches devices for a model", async () => {
    server.use(
      http.get(`${ML}${E.DEPLOY}/m1`, () =>
        HttpResponse.json(["nano_33_iot"])
      )
    );
    expect(await getDeployDevices("m1")).toEqual(["nano_33_iot"]);
  });

  it("deployModel returns arraybuffer response", async () => {
    let body;
    server.use(
      http.post(`${ML}${E.DEPLOY}/*`, async ({ request }) => {
        body = await request.json();
        return new HttpResponse(new Uint8Array([9]).buffer);
      })
    );
    const buf = await deployModel("m1", { t: 1 }, { p: 2 }, "device-1", { x: 3 });
    expect(buf.byteLength).toBe(1);
    expect(body).toEqual({
      tsMap: { t: 1 },
      parameters: { p: 2 },
      device: "device-1",
      additionalSettings: { x: 3 },
    });
  });

  it("downloadFirmware posts to the download endpoint and returns arraybuffer", async () => {
    let path;
    server.use(
      http.post(`${ML}${E.DEPLOY}/*`, ({ request }) => {
        path = new URL(request.url).pathname;
        return new HttpResponse(new ArrayBuffer(4));
      })
    );
    const buf = await downloadFirmware("m1", {}, {}, "dev", {});
    expect(buf.byteLength).toBe(4);
    expect(path.endsWith("/deploy/m1/download")).toBe(true);
  });
});
