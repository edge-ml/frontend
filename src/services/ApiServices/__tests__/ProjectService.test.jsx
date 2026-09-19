import { describe, it, expect } from "vitest";
import { HttpResponse, http } from "msw";
import { server } from "../../../../tests/setup";
import apiConsts from "../ApiConstants";
import {
  getProjects,
  createProject,
  deleteProject,
  leaveProject,
  updateProject,
} from "../ProjectService";

const API = apiConsts.API_URI;
const E = apiConsts.API_ENDPOINTS;

describe("ProjectService", () => {
  it("getProjects fetches all projects", async () => {
    server.use(
      http.get(`${API}${E.PROJECTS}`, () =>
        HttpResponse.json([{ _id: "p1", name: "P" }])
      )
    );
    expect(await getProjects()).toEqual([{ _id: "p1", name: "P" }]);
  });

  it("createProject resolves user names to ids first", async () => {
    let idBody;
    let projectBody;
    server.use(
      http.post(`${apiConsts.AUTH_URI}${apiConsts.AUTH_ENDPOINTS.ID}`, async ({ request }) => {
        idBody = await request.json();
        return HttpResponse.json(["admin-id", "user-id"]);
      }),
      http.post(`${API}${E.PROJECTS}`, async ({ request }) => {
        projectBody = await request.json();
        return HttpResponse.json({ created: true });
      })
    );
    const res = await createProject({
      name: "New",
      users: [{ userName: "alice" }, { userName: "bob" }],
    });
    expect(idBody).toEqual(["alice", "bob"]);
    expect(projectBody.users).toEqual(["admin-id", "user-id"]);
    expect(res).toEqual({ created: true });
  });

  it("deleteProject DELETEs by id", async () => {
    let path;
    server.use(
      http.delete(`${API}${E.PROJECTS}/*`, ({ request }) => {
        path = new URL(request.url).pathname;
        return HttpResponse.json({});
      })
    );
    await deleteProject("p9");
    expect(path.endsWith("/projects/p9")).toBe(true);
  });

  it("leaveProject DELETEs the leave endpoint", async () => {
    let path;
    server.use(
      http.delete(`${API}${E.PROJECTS}/*`, ({ request }) => {
        path = new URL(request.url).pathname;
        return HttpResponse.json({ left: true });
      })
    );
    const res = await leaveProject("p3");
    expect(path.endsWith("/projects/p3/leave")).toBe(true);
    expect(res).toEqual({ left: true });
  });

  it("updateProject PUTs by project.id", async () => {
    let path;
    server.use(
      http.put(`${API}${E.PROJECTS}/*`, ({ request }) => {
        path = new URL(request.url).pathname;
        return HttpResponse.json({ updated: true });
      })
    );
    await updateProject({ id: "p5", name: "renamed" });
    expect(path.endsWith("/projects/p5")).toBe(true);
  });
});
