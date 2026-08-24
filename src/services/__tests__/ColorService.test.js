import { describe, it, expect } from "vitest";
import {
  generateRandomColor,
  hexToRgb,
  hexToForegroundColor,
  isValidColor,
} from "../ColorService";

describe("ColorService", () => {
  it("generateRandomColor returns a valid hex color", () => {
    for (let i = 0; i < 50; i++) {
      const color = generateRandomColor();
      expect(color).toMatch(/^#[0-9A-F]{6}$/);
    }
  });

  it("hexToRgb converts hex to rgb channels", () => {
    expect(hexToRgb("#FF8000")).toEqual({ r: 255, g: 128, b: 0 });
    expect(hexToRgb("#ff8000")).toEqual({ r: 255, g: 128, b: 0 });
  });

  it("hexToRgb returns null for invalid input", () => {
    expect(hexToRgb("#12345")).toBeNull();
    expect(hexToRgb("nope")).toBeNull();
  });

  it("hexToForegroundColor picks black on light and white on dark colors", () => {
    expect(hexToForegroundColor("#FFFFFF")).toBe("#000000");
    expect(hexToForegroundColor("#000000")).toBe("#ffffff");
  });

  it("hexToForegroundColor falls back to black for invalid colors", () => {
    expect(hexToForegroundColor("zzz")).toBe("#000000");
  });

  it.each([
    ["#AABBCC", true],
    ["#aabbcc", true],
    ["AABBCC", false],
    ["#AABB", false],
    ["#GGGHHH", false],
  ])("isValidColor(%s) === %s", (color, expected) => {
    expect(isValidColor(color)).toBe(expected);
  });
});
