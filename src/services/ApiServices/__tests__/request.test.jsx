import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { HttpResponse, http } from "msw";
import { server } from "../../../../tests/setup";
import apiConsts from "../ApiConstants";

let apiRequest;

beforeEach(async () => {
  vi.resetModules();
  ({ default: apiRequest } = await import("../request"));
  localStorage.clear();
});

afterEach(() => {
  delete globalThis.__TAURI_INTERNALS__;
  delete globalThis.isTauri;
});

const { AUTH_URI, HTTP_METHODS } = apiConsts;

describe("apiRequest (browser/axios path)", () => {
  it("performs a GET request and returns parsed json", async () => {
    server.use(
      http.get(`${AUTH_URI}ping`, () => HttpResponse.json({ pong: true }))
    );
    const data = await apiRequest(
      HTTP_METHODS.GET,
      AUTH_URI,
      "ping"
    );
    expect(data).toEqual({ pong: true });
  });

  it("appends query params to the url", async () => {
    let requestedUrl;
    server.use(
      http.get(`${AUTH_URI}list`, ({ request }) => {
        requestedUrl = request.url;
        return HttpResponse.json({});
      })
    );
    await apiRequest(HTTP_METHODS.GET, AUTH_URI, "list", {}, { skip: 5, limit: 10 });
    const url = new URL(requestedUrl);
    expect(url.searchParams.get("skip")).toBe("5");
    expect(url.searchParams.get("limit")).toBe("10");
  });

  it("sends authorization and project headers from localStorage", async () => {
    let headers;
    server.use(
      http.get(`${AUTH_URI}whoami`, ({ request }) => {
        headers = Object.fromEntries(request.headers.entries());
        return HttpResponse.json({});
      })
    );
    localStorage.setItem("access_token", "token-123");
    localStorage.setItem("project_id", "project-9");
    await apiRequest(HTTP_METHODS.GET, AUTH_URI, "whoami");
    expect(headers.authorization).toBe("token-123");
    expect(headers.project).toBe("project-9");
  });

  it("sends a JSON body for POST requests", async () => {
    let body;
    server.use(
      http.post(`${AUTH_URI}echo`, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json(body);
      })
    );
    const data = await apiRequest(HTTP_METHODS.POST, AUTH_URI, "echo", {
      a: 1,
    });
    expect(data).toEqual({ a: 1 });
  });

  it("returns text when responseType is text", async () => {
    server.use(http.get(`${AUTH_URI}txt`, () => new HttpResponse("hello")));
    const data = await apiRequest(
      HTTP_METHODS.GET,
      AUTH_URI,
      "txt",
      {},
      {},
      "application/json",
      "text"
    );
    expect(data).toBe("hello");
  });

  it("returns arraybuffer when responseType is arraybuffer", async () => {
    server.use(
      http.get(`${AUTH_URI}bin`, () =>
        new HttpResponse(new Uint8Array([1, 2, 3]).buffer)
      )
    );
    const data = await apiRequest(
      HTTP_METHODS.GET,
      AUTH_URI,
      "bin",
      {},
      {},
      undefined,
      "arraybuffer"
    );
    expect(data.byteLength).toBe(3);
  });

  it("normalizes backend error messages (detail field) with status", async () => {
    server.use(
      http.get(`${AUTH_URI}fail`, () =>
        HttpResponse.json({ detail: "Something broke" }, { status: 418 })
      )
    );
    await expect(apiRequest(HTTP_METHODS.GET, AUTH_URI, "fail")).rejects.toThrow(
      "Something broke"
    );
    try {
      await apiRequest(HTTP_METHODS.GET, AUTH_URI, "fail");
    } catch (e) {
      expect(e.status).toBe(418);
    }
  });

  it("falls back to error/message fields and axios message", async () => {
    server.use(
      http.get(`${AUTH_URI}err1`, () =>
        HttpResponse.json({ error: "E1" }, { status: 400 })
      ),
      http.get(`${AUTH_URI}err2`, () =>
        HttpResponse.json({ message: "M2" }, { status: 400 })
      ),
      http.get(`${AUTH_URI}err3`, () => HttpResponse.json({}, { status: 500 }))
    );
    await expect(
      apiRequest(HTTP_METHODS.GET, AUTH_URI, "err1")
    ).rejects.toThrow("E1");
    await expect(
      apiRequest(HTTP_METHODS.GET, AUTH_URI, "err2")
    ).rejects.toThrow("M2");
    await expect(
      apiRequest(HTTP_METHODS.GET, AUTH_URI, "err3")
    ).rejects.toThrow(/failed/i);
  });

});

describe("apiRequest (tauri path)", () => {
  beforeEach(() => {
    globalThis.__TAURI_INTERNALS__ = {};
  });

  it("uses the tauri fetch plugin and parses json", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      json: () => Promise.resolve({ tauri: true }),
    });
    vi.doMock("@tauri-apps/plugin-http", () => ({
      fetch: fetchMock,
    }));
    vi.resetModules();
    ({ default: apiRequest } = await import("../request"));

    const data = await apiRequest(HTTP_METHODS.POST, AUTH_URI, "login", {
      email: "a",
    });
    expect(data).toEqual({ tauri: true });
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain(AUTH_URI);
    expect(options.method).toBe("POST");
    expect(options.body).toBe(JSON.stringify({ email: "a" }));
  });

  it("does not send a body for GET requests without payload", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      json: () => Promise.resolve(null),
    });
    vi.doMock("@tauri-apps/plugin-http", () => ({ fetch: fetchMock }));
    vi.resetModules();
    ({ default: apiRequest } = await import("../request"));

    await apiRequest(HTTP_METHODS.GET, AUTH_URI, "user");
    expect(fetchMock.mock.calls[0][1].body).toBeUndefined();
  });

  it("passes FormData bodies through unserialized", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      });
    vi.doMock("@tauri-apps/plugin-http", () => ({ fetch: fetchMock }));
    vi.resetModules();
    ({ default: apiRequest } = await import("../request"));

    const fd = new FormData();
    fd.append("file", "data");
    await apiRequest(HTTP_METHODS.POST, AUTH_URI, "upload", fd);
    expect(fetchMock.mock.calls[0][1].body).toBe(fd);
  });

  it.each([
    ["Blob body", () => new Blob(["x"], { type: "text/plain" })],
    ["ArrayBuffer body", () => new ArrayBuffer(4)],
    ["typed array body", () => new Uint8Array([1])],
  ])("passes %s through unserialized via tauri fetch", async (_name, makeBody) => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });
    vi.doMock("@tauri-apps/plugin-http", () => ({ fetch: fetchMock }));
    vi.resetModules();
    ({ default: apiRequest } = await import("../request"));

    const body = makeBody();
    await apiRequest(HTTP_METHODS.POST, AUTH_URI, "upload", body);
    expect(fetchMock.mock.calls[0][1].body).toBe(body);
  });

  it("serializes plain objects but not empty ones via tauri fetch", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });
    vi.doMock("@tauri-apps/plugin-http", () => ({ fetch: fetchMock }));
    vi.resetModules();
    ({ default: apiRequest } = await import("../request"));

    await apiRequest(HTTP_METHODS.POST, AUTH_URI, "a", { x: 1 });
    expect(fetchMock.mock.calls[0][1].body).toBe(JSON.stringify({ x: 1 }));

    await apiRequest(HTTP_METHODS.POST, AUTH_URI, "b", {});
    expect(fetchMock.mock.calls[1][1].body).toBeUndefined();
  });

  it("supports arraybuffer and blob responseTypes via tauri fetch", async () => {
    const buffer = new Uint8Array([7, 8]).buffer;
    const blob = new Blob(["z"]);
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, status: 200, statusText: "OK", arrayBuffer: () => Promise.resolve(buffer) })
      .mockResolvedValueOnce({ ok: true, status: 200, statusText: "OK", blob: () => Promise.resolve(blob) });
    vi.doMock("@tauri-apps/plugin-http", () => ({ fetch: fetchMock }));
    vi.resetModules();
    ({ default: apiRequest } = await import("../request"));

    await expect(
      apiRequest(HTTP_METHODS.GET, AUTH_URI, "bin", {}, {}, undefined, "arraybuffer")
    ).resolves.toBe(buffer);
    await expect(
      apiRequest(HTTP_METHODS.GET, AUTH_URI, "blob", {}, {}, undefined, "blob")
    ).resolves.toBe(blob);
  });

  it("falls back to statusText when the tauri error body has no message", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      statusText: "Bad Gateway",
      json: () => Promise.resolve(null),
    });
    vi.doMock("@tauri-apps/plugin-http", () => ({ fetch: fetchMock }));
    vi.resetModules();
    ({ default: apiRequest } = await import("../request"));

    await expect(
      apiRequest(HTTP_METHODS.GET, AUTH_URI, "down")
    ).rejects.toMatchObject({ message: "Bad Gateway", status: 502 });
  });

  it("throws errors including status from tauri responses", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      json: () => Promise.resolve({ message: "Bad token" }),
    });
    vi.doMock("@tauri-apps/plugin-http", () => ({ fetch: fetchMock }));
    vi.resetModules();
    ({ default: apiRequest } = await import("../request"));

    await expect(apiRequest(HTTP_METHODS.GET, AUTH_URI, "user")).rejects.toMatchObject(
      { message: "Bad token", status: 401 }
    );
  });

  it("supports text responseType via tauri fetch", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      text: () => Promise.resolve("plain"),
    });
    vi.doMock("@tauri-apps/plugin-http", () => ({ fetch: fetchMock }));
    vi.resetModules();
    ({ default: apiRequest } = await import("../request"));

    const data = await apiRequest(
      HTTP_METHODS.GET,
      AUTH_URI,
      "x",
      {},
      {},
      undefined,
      "text"
    );
    expect(data).toBe("plain");
  });
});
