import { describe, it, expect, beforeEach, vi } from "vitest";
import { HttpResponse, http } from "msw";
import { server } from "../../../../tests/setup";

let useApiCalls;

beforeEach(async () => {
  vi.resetModules();
  localStorage.clear();
  ({ default: useApiCalls } = await import("../useApiCalls"));
});

describe("useApiCalls", () => {
  it("sends project header and auth token when a currentProject is given", async () => {
    let headers;
    server.use(
      http.get("/api/projects", ({ request }) => {
        headers = Object.fromEntries(request.headers.entries());
        return HttpResponse.json([{ _id: "p1" }]);
      })
    );

    localStorage.setItem("access_token", "tok-9");
    const { request } = useApiCalls({ _id: "proj-5" });
    const res = await request("GET", "/api/", "projects");

    expect(res).toEqual([{ _id: "p1" }]);
    expect(headers.project).toBe("proj-5");
    expect(headers.authorization).toBe("tok-9");
  });

  it("omits the project header without a currentProject", async () => {
    let headers;
    server.use(
      http.get("/api/projects", ({ request }) => {
        headers = Object.fromEntries(request.headers.entries());
        return HttpResponse.json([]);
      })
    );

    const { request } = useApiCalls(undefined);
    await request("GET", "/api/", "projects");
    expect(headers.project).toBeUndefined();
  });

  it("passes body and params through", async () => {
    let body;
    let url;
    server.use(
      http.post("/api/datasets", async ({ request: req }) => {
        body = await req.json();
        url = new URL(req.url);
        return HttpResponse.json({ created: true });
      })
    );

    const { request } = useApiCalls(null);
    const res = await request("POST", "/api/", "datasets", { name: "x" }, {
      skip: 1,
    });
    expect(res).toEqual({ created: true });
    expect(body).toEqual({ name: "x" });
    expect(url.searchParams.get("skip")).toBe("1");
  });

  it("propagates backend errors", async () => {
    server.use(
      http.post("/api/datasets", () =>
        HttpResponse.json({ detail: "nope" }, { status: 400 })
      )
    );
    const { request } = useApiCalls(null);
    // useApiCalls does not normalize errors like request.jsx does; the raw
    // axios error surfaces with its generic message.
    await expect(request("POST", "/api/", "datasets", {})).rejects.toThrow(
      "Request failed with status code 400"
    );
  });
});
