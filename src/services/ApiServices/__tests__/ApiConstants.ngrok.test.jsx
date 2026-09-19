import { describe, it, expect, vi } from "vitest";

// Covers the ngrok-host URI branches in ApiConstants. They are only reachable
// when no VITE_* base URL is configured (e.g. a bare checkout served from an
// ngrok tunnel), and require window.location.host to be the ngrok host.
describe("ApiConstants ngrok-host URIs", () => {
  it("uses *.edge-ml.ngrok.io service hosts on ngrok origins", async () => {
    const original = window.location;
    try {
      Object.defineProperty(window, "location", {
        value: { host: "edge-ml.ngrok.io", href: "https://edge-ml.ngrok.io/" },
        configurable: true,
      });
      vi.stubEnv("VITE_API_BASE_URL", "");
      vi.stubEnv("VITE_AUTH_BASE_URL", "");
      vi.stubEnv("VITE_ML_BASE_URL", "");
      vi.stubEnv("VITE_DS_BASE_URL", "");

      // Drop the ApiConstants instance cached during setup (via MSW handlers).
      vi.resetModules();

      const apiConsts = (await import("../ApiConstants")).default;
      expect(apiConsts.AUTH_URI).toBe("http://auth.edge-ml.ngrok.io/auth/");
      expect(apiConsts.API_URI).toBe("http://backend.edge-ml.ngrok.io/api/");
      expect(apiConsts.ML_URI).toBe("http://ml.edge-ml.ngrok.io/ml/");
      expect(apiConsts.DATASET_STORE).toBe("http://ds.edge-ml.ngrok.io/ds/");
      expect(apiConsts.WHAR_URI).toBe("http://whar.edge-ml.ngrok.io/whar/");
    } finally {
      Object.defineProperty(window, "location", {
        value: original,
        configurable: true,
      });
      vi.unstubAllEnvs();
    }
  });
});
