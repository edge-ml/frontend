import { describe, it, expect, beforeEach, vi } from "vitest";
import { HttpResponse, http } from "msw";
import { server } from "../../../tests/setup";
import { makeToken } from "../../../tests/mocks/handlers";

let useAuthStore;
let initializeAuth;

beforeEach(async () => {
  vi.resetModules();
  localStorage.clear();
  ({ useAuthStore, initializeAuth } = await import("../authStores"));
});

const validToken = () =>
  makeToken({
    email: "a@b.c",
    userName: "tester",
    id: "u1",
    exp: Math.floor(Date.now() / 1000) + 3600,
  });

describe("authStores", () => {
  it("setUser stores the user object", () => {
    useAuthStore.getState().setUser("x@y.z", "name", "uid");
    expect(useAuthStore.getState().user).toEqual({
      email: "x@y.z",
      name: "name",
      _id: "uid",
    });
  });

  it("login exchanges credentials for tokens and decodes the JWT", async () => {
    server.use(
      http.post("/auth/login",
        () =>
          HttpResponse.json({
            access_token: validToken(),
            refresh_token: "refresh-1",
          })
      )
    );
    await useAuthStore.getState().login("a@b.c", "pw");
    const state = useAuthStore.getState();
    expect(state.user.email).toBe("a@b.c");
    expect(state.user.name).toBe("tester");
    expect(state.user._id).toBe("u1");
    expect(localStorage.getItem("access_token")).toBeTruthy();
    expect(localStorage.getItem("refresh_token")).toBe("refresh-1");
  });

  it("logout clears tokens and the user", async () => {
    localStorage.setItem("access_token", "t");
    localStorage.setItem("refresh_token", "r");
    localStorage.setItem("project_id", "p");
    useAuthStore.setState({ user: { email: "a" } });
    useAuthStore.getState().logout();
    expect(useAuthStore.getState().user).toBeUndefined();
    expect(localStorage.getItem("access_token")).toBeNull();
    expect(localStorage.getItem("refresh_token")).toBeNull();
    expect(localStorage.getItem("project_id")).toBeNull();
  });

  it("checkLoginStatus restores a session from a valid token", () => {
    localStorage.setItem("access_token", validToken());
    initializeAuth();
    expect(useAuthStore.getState().user.name).toBe("tester");
  });

  it("checkLoginStatus ignores expired tokens", () => {
    localStorage.setItem(
      "access_token",
      makeToken({
        email: "a@b.c",
        userName: "old",
        id: "u2",
        exp: Math.floor(Date.now() / 1000) - 10,
      })
    );
    initializeAuth();
    expect(useAuthStore.getState().user).toBeUndefined();
  });

  it("checkLoginStatus does nothing without a token", () => {
    initializeAuth();
    expect(useAuthStore.getState().user).toBeUndefined();
  });
});
