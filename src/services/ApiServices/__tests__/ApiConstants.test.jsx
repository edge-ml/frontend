import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ApiConstants resolves all URIs at import time, so each test re-imports the
// module under different environments.
beforeEach(() => {
  vi.resetModules();
  localStorage.clear();
});

afterEach(() => {
  vi.unstubAllEnvs();
  delete globalThis.__TAURI_INTERNALS__;
  delete globalThis.isTauri;
});

describe("ApiConstants URI resolution", () => {
  it("uses VITE_* env base URLs when provided", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "https://api.example.com/api/");
    vi.stubEnv("VITE_AUTH_BASE_URL", "https://auth.example.com/auth/");
    vi.stubEnv("VITE_ML_BASE_URL", "https://ml.example.com/ml/");
    vi.stubEnv("VITE_DS_BASE_URL", "https://ds.example.com/ds/");

    const apiConsts = (await import("../ApiConstants")).default;
    expect(apiConsts.API_URI).toBe("https://api.example.com/api/");
    expect(apiConsts.AUTH_URI).toBe("https://auth.example.com/auth/");
    expect(apiConsts.ML_URI).toBe("https://ml.example.com/ml/");
    expect(apiConsts.DATASET_STORE).toBe("https://ds.example.com/ds/");
  });

  it("resolves relative URIs against the Tauri backend when running inside Tauri", async () => {
    globalThis.__TAURI_INTERNALS__ = {};
    const apiConsts = (await import("../ApiConstants")).default;

    expect(apiConsts.AUTH_URI).toBe("https://beta.edge-ml.org/auth/");
    expect(apiConsts.API_URI).toBe("https://beta.edge-ml.org/api/");
    expect(apiConsts.ML_URI).toBe("https://beta.edge-ml.org/ml/");
    expect(apiConsts.DATASET_STORE).toBe("https://beta.edge-ml.org/ds/");
  });

  it("also detects Tauri via the globalThis.isTauri flag", async () => {
    globalThis.isTauri = true;
    const apiConsts = (await import("../ApiConstants")).default;
    expect(apiConsts.API_URI).toBe("https://beta.edge-ml.org/api/");
  });

  it("falls back to dev-server ports outside production", async () => {
    // .env sets all four VITE_* URLs; stub them falsy to exercise the
    // local dev-server fallback branch.
    vi.stubEnv("VITE_API_BASE_URL", "");
    vi.stubEnv("VITE_AUTH_BASE_URL", "");
    vi.stubEnv("VITE_ML_BASE_URL", "");
    vi.stubEnv("VITE_DS_BASE_URL", "");

    const apiConsts = (await import("../ApiConstants")).default;
    // jsdom's origin is http://localhost:3000 -> host prefix "localhost".
    expect(apiConsts.AUTH_URI).toBe("http://localhost:3002/auth/");
    expect(apiConsts.API_URI).toBe("http://localhost:3001/api/");
    expect(apiConsts.ML_URI).toBe("http://localhost:3003/ml/");
    expect(apiConsts.DATASET_STORE).toBe("http://localhost:3004/ds/");
    expect(apiConsts.WHAR_URI).toBe("http://localhost:3006/whar/");
  });

  it("uses root-relative URIs in production mode", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const apiConsts = (await import("../ApiConstants")).default;
    expect(apiConsts.WHAR_URI).toBe("/whar/");
  });
});

describe("generateApiRequest", () => {
  it("includes the project header only when one is stored", async () => {
    const apiConstsModule = await import("../ApiConstants");
    const apiConsts = apiConstsModule.default;

    // Without a project id:
    const configNoProject = apiConsts.generateApiRequest(
      apiConsts.HTTP_METHODS.GET,
      "/api/",
      "projects"
    );
    expect(configNoProject.headers.project).toBeUndefined();
    expect(configNoProject.method).toBe("GET");
    expect(configNoProject.url).toBe("/api/projects");
    expect(configNoProject.data).toEqual({});
    expect(configNoProject.params).toEqual({});
    expect(configNoProject.headers["Content-Type"]).toBe("application/json");

    // With a project id and access token:
    localStorage.setItem("project_id", "proj-1");
    localStorage.setItem("access_token", "tok");
    const configWithProject = apiConsts.generateApiRequest(
      apiConsts.HTTP_METHODS.POST,
      "/api/",
      "projects",
      { name: "x" },
      { skip: 1 },
      "text/plain"
    );
    expect(configWithProject.headers.project).toBe("proj-1");
    expect(configWithProject.headers.Authorization).toBe("tok");
    expect(configWithProject.data).toEqual({ name: "x" });
    expect(configWithProject.params).toEqual({ skip: 1 });
    expect(configWithProject.headers["Content-Type"]).toBe("text/plain");
  });

  it("applies default values for body/params/contentType", async () => {
    localStorage.setItem("project_id", "proj-2");
    const apiConsts = (await import("../ApiConstants")).default;
    // Note: generateApiRequest is an arrow function referencing `this`, so
    // its first three defaults would throw if evaluated; callers always pass
    // method/baseUri/endpoint explicitly.
    const config = apiConsts.generateApiRequest(
      apiConsts.HTTP_METHODS.PUT,
      "/api/",
      "projects"
    );
    expect(config.method).toBe("PUT");
    expect(config.url).toBe("/api/projects");
    expect(config.data).toEqual({});
    expect(config.params).toEqual({});
    expect(config.headers["Content-Type"]).toBe("application/json");
    expect(config.headers.project).toBe("proj-2");
  });
});
