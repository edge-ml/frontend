import { describe, it, expect, beforeEach } from "vitest";
import localStorageService from "../LocalStorageService";
import {
  setToken,
  getAccessToken,
  getRefreshToken,
  clearToken,
  setProject,
  clearProject,
  getProject,
} from "../LocalStorageService";

describe("LocalStorageService", () => {
  beforeEach(() => localStorage.clear());

  it("setToken stores both tokens", () => {
    setToken("access-1", "refresh-1");
    expect(localStorage.getItem("access_token")).toBe("access-1");
    expect(localStorage.getItem("refresh_token")).toBe("refresh-1");
    expect(getAccessToken()).toBe("access-1");
    expect(getRefreshToken()).toBe("refresh-1");
  });

  it("clearToken removes tokens and the project", () => {
    setToken("a", "r");
    setProject("p1");
    clearToken();
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
    expect(getProject()).toBeNull();
  });

  it("setProject / getProject / clearProject manage the project id", () => {
    expect(getProject()).toBeNull();
    setProject("proj-7");
    expect(getProject()).toBe("proj-7");
    clearProject();
    expect(getProject()).toBeNull();
  });

  it("exposes the same functions via the default export", () => {
    expect(localStorageService.setToken).toBe(setToken);
    expect(localStorageService.getAccessToken).toBe(getAccessToken);
    expect(localStorageService.getRefreshToken).toBe(getRefreshToken);
    expect(localStorageService.clearToken).toBe(clearToken);
    expect(localStorageService.setProject).toBe(setProject);
    expect(localStorageService.clearProject).toBe(clearProject);
    expect(localStorageService.getProject).toBe(getProject);
  });
});
