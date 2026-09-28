import { describe, it, expect, beforeEach, vi } from "vitest";

// The blob response type cannot round-trip through MSW's XHR interceptor in
// jsdom (undici needs a web-standard Blob), so axios is stubbed directly here.
const state = { impl: () => Promise.resolve({ data: "blob-data" }) };

vi.mock("axios", () => ({
  default: { create: () => (...args) => state.impl(...args) },
}));

describe("MLDeploymentService", () => {
  beforeEach(() => {
    state.impl = () => Promise.resolve({ data: "blob-data" });
  });

  it("downloadDeploymentModel requests a blob with wasm query params", async () => {
    const { downloadDeploymentModel } = await import("../MLDeploymentService");

    const res = await downloadDeploymentModel("m1", "edgetpu", true, false);
    expect(res).toBe("blob-data");
  });

  it("downloadModalLink requests a blob for a language target", async () => {
    const configSeen = {};
    state.impl = (config) => {
      Object.assign(configSeen, config);
      return Promise.resolve({ data: "code" });
    };
    const { downloadModalLink } = await import("../MLDeploymentService");

    const res = await downloadModalLink("p1", "m2", "arduino");
    expect(res).toBe("code");
    expect(configSeen.url.endsWith("/ml/models/download/p1/m2/arduino")).toBe(true);
    expect(configSeen.responseType).toBe("blob");
  });
});
