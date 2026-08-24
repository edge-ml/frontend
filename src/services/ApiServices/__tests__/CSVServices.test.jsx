import { describe, it, expect, vi, beforeEach } from "vitest";
import apiConsts from "../ApiConstants";

const state = {
  handler: vi.fn(() => Promise.resolve({ data: { uploaded: true } })),
  lastCancelMessage: undefined,
};

vi.mock("axios", () => {
  const ax = {
    create: () => {
      const inst = (...args) => state.handler(...args);
      return inst;
    },
    CancelToken: {
      source: () => ({
        token: "cancel-token",
        cancel: (msg) => {
          state.lastCancelMessage = msg;
        },
      }),
    },
  };
  return { default: ax };
});

describe("CSVServices.processCSVBackend", () => {
  beforeEach(() => {
    state.handler.mockClear();
    state.handler.mockImplementation(() =>
      Promise.resolve({ data: { uploaded: true } })
    );
    state.lastCancelMessage = undefined;
    localStorage.clear();
  });

  it("builds a multipart upload request against the current project", async () => {
    localStorage.setItem("access_token", "tok-1");
    const useProjectStore = (await import("../../../stores/projectStore")).default;
    useProjectStore.setState({
      currentProject: { _id: "proj-42" },
    });

    const { processCSVBackend } = await import("../CSVServices");
    const formData = new FormData();
    formData.append("file", "content");

    const handleProgress = vi.fn();
    const [cancellationHandler, req] = processCSVBackend(
      formData,
      "file-1",
      handleProgress
    );

    expect(typeof cancellationHandler).toBe("function");

    const res = await req;
    expect(res.data).toEqual({ uploaded: true });

    const config = state.handler.mock.calls[0][0];
    expect(config.method).toBe("POST");
    expect(config.url).toContain(
      apiConsts.DATASET_STORE + apiConsts.DATASET_STORE_ENDPOINTS.CREATE_DATASET
    );
    expect(config.headers.project).toBe("proj-42");
    expect(config.headers.Authorization).toBe("tok-1");
    expect(config.withCredentials).toBe(true);
    expect(config.cancelToken).toBe("cancel-token");

    // Progress callback computes percentage.
    config.onUploadProgress({ loaded: 25, total: 100 });
    expect(handleProgress).toHaveBeenCalledWith("file-1", 25);

    // The returned handler cancels the upload.
    cancellationHandler();
    expect(state.lastCancelMessage).toBe("Operation cancelled by the user");
  });
});
