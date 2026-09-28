import { describe, it, expect } from "vitest";
import { getCookie } from "../index";

describe("utils/getCookie", () => {
  it("returns the value of an existing cookie", () => {
    document.cookie = "token=abc123; path=/";
    document.cookie = "other=x y z; path=/";
    expect(getCookie("token")).toBe("abc123");
    expect(getCookie("other")).toBe("x y z");
  });

  it("returns an empty string for missing cookies", () => {
    document.cookie = "known=1; path=/";
    expect(getCookie("missing")).toBe("");
  });
});
