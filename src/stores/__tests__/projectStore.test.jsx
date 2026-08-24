import { describe, it, expect, beforeEach, vi } from "vitest";
import { HttpResponse, http } from "msw";
import { server } from "../../../tests/setup";
import apiConsts from "../../services/ApiServices/ApiConstants";

const API = apiConsts.API_URI;
const AUTH = apiConsts.AUTH_URI;

let useProjectStore;

beforeEach(async () => {
  vi.resetModules();
  localStorage.clear();
  ({ default: useProjectStore } = await import("../projectStore"));
});

describe("projectStore", () => {
  it("setProjects picks the saved project or the first one", () => {
    const projects = [
      { _id: "p1", name: "One" },
      { _id: "p2", name: "Two" },
    ];
    // No saved project -> falls back to the first project.
    useProjectStore.getState().setProjects(projects);
    expect(useProjectStore.getState().currentProject).toEqual(projects[0]);
    expect(localStorage.getItem("project_id")).toBe("p1");

    // Saved project is preferred.
    localStorage.setItem("project_id", "p2");
    useProjectStore.setState({ currentProject: undefined });
    useProjectStore.getState().setProjects(projects);
    expect(useProjectStore.getState().currentProject).toEqual(projects[1]);
  });

  it("setProjects handles an empty project list", () => {
    useProjectStore.setState({ currentProject: { _id: "old" } });
    useProjectStore.getState().setProjects([]);
    expect(useProjectStore.getState().projects).toEqual([]);
    // No project remains selected and storage is cleared (setItem(null)).
    expect(useProjectStore.getState().currentProject).toBeNull();
  });

  it("setCurrentProject updates state and persists the id", () => {
    const project = { _id: "px", name: "X" };
    useProjectStore.getState().setCurrentProject(project);
    expect(useProjectStore.getState().currentProject).toEqual(project);
    expect(localStorage.getItem("project_id")).toBe("px");

    useProjectStore.getState().setCurrentProject(null);
    expect(useProjectStore.getState().currentProject).toBeNull();
    expect(localStorage.getItem("project_id")).toBe("null"); // setItem(null) stores "null"
  });

  it("getProjects loads projects and enriches users via auth service", async () => {
    const raw = [
      { _id: "a", name: "A", admin: "admin-id", users: ["user-id"] },
    ];
    server.use(
      http.get(`${API}${apiConsts.API_ENDPOINTS.PROJECTS}`, () =>
        HttpResponse.json(raw)
      ),
      http.post(`${AUTH}${apiConsts.AUTH_ENDPOINTS.USERNAME}`, () =>
        HttpResponse.json(["AdminName", "UserName"])
      )
    );
    await useProjectStore.getState().getProjects();
    const state = useProjectStore.getState();
    expect(state.projects[0].admin).toBe("AdminName");
    expect(state.projects[0].users).toEqual(["UserName"]);
    expect(state.currentProject._id).toBe("a");
  });

  it("getProjects keeps an existing current project selection", async () => {
    useProjectStore.setState({
      currentProject: { _id: "keep-me" },
    });
    server.use(
      http.get(`${API}${apiConsts.API_ENDPOINTS.PROJECTS}`, () =>
        HttpResponse.json([{ _id: "other", admin: "", users: [] }])
      ),
      http.post(`${AUTH}${apiConsts.AUTH_ENDPOINTS.USERNAME}`, () =>
        HttpResponse.json([])
      )
    );
    await useProjectStore.getState().getProjects();
    expect(useProjectStore.getState().currentProject._id).toBe("keep-me");
  });

  it("getProjects respects a stored project id when initializing", async () => {
    localStorage.setItem("project_id", "b");
    server.use(
      http.get(`${API}${apiConsts.API_ENDPOINTS.PROJECTS}`, () =>
        HttpResponse.json([
          { _id: "a", admin: "", users: [] },
          { _id: "b", admin: "", users: [] },
        ])
      ),
      http.post(`${AUTH}${apiConsts.AUTH_ENDPOINTS.USERNAME}`, () =>
        HttpResponse.json([])
      )
    );
    await useProjectStore.getState().getProjects();
    expect(useProjectStore.getState().currentProject._id).toBe("b");
  });

  it("getProjects falls back to the first project if the stored id no longer exists", async () => {
    localStorage.setItem("project_id", "deleted");
    server.use(
      http.get(`${API}${apiConsts.API_ENDPOINTS.PROJECTS}`, () =>
        HttpResponse.json([
          { _id: "a", admin: "", users: [] },
          { _id: "b", admin: "", users: [] },
        ])
      ),
      http.post(`${AUTH}${apiConsts.AUTH_ENDPOINTS.USERNAME}`, () =>
        HttpResponse.json([])
      )
    );
    await useProjectStore.getState().getProjects();
    expect(useProjectStore.getState().currentProject._id).toBe("a");
  });
});
