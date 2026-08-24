import { describe, it, expect, vi } from "vitest";

// The jsdom Blob implementation cannot be passed through undici's Response
// constructor (used by MSW's XHR interceptor), so this error path is tested
// by stubbing axios directly instead of going through network mocking.
const state = { impl: () => Promise.resolve({ data: {} }) };

vi.mock("axios", () => {
  const ax = {
    // All instances share one stubbed implementation so tests can swap it.
    create: () => (...args) => state.impl(...args),
  };
  return { default: ax };
});

describe("apiRequest blob error handling", () => {
  it("recovers the server message from a JSON blob error body", async () => {
    state.impl = () =>
      Promise.reject({
        message: "Request failed with status code 404",
        response: {
          status: 404,
          data: new Blob([JSON.stringify({ detail: "Blob error detail" })], {
            type: "application/json",
          }),
        },
      });
    const { default: apiRequest } = await import("../request");

    await expect(
      apiRequest("GET", "http://x/api/", "y", null, {}, undefined, "blob")
    ).rejects.toMatchObject({ message: "Blob error detail", status: 404 });
  });

  it("falls back to the axios message for non-JSON blobs", async () => {
    state.impl = () =>
      Promise.reject({
        message: "Network Error",
        response: {
          status: 500,
          data: new Blob(["not json"]),
        },
      });
    const { default: apiRequest } = await import("../request");

    await expect(apiRequest("GET", "http://x/api/", "y")).rejects.toMatchObject(
      { message: "Network Error" }
    );
  });

  it("uses error/message fields from JSON error bodies", async () => {
    state.impl = () =>
      Promise.reject({
        message: "generic",
        response: {
          status: 400,
          data: { error: "Bad input" },
        },
      });
    const { default: apiRequest } = await import("../request");

    await expect(apiRequest("POST", "http://x/api/", "y", {})).rejects.toMatchObject(
      { message: "Bad input", status: 400 }
    );
  });
});
