import { describe, expect, it } from "vitest";
import { fitInView } from "../FloatingWindow";

const view = { width: 1771, height: 1073 };

describe("floating window", () => {
  it("stays where it is when it fits", () => {
    expect(fitInView({ x: 100, y: 100, width: 400 }, 16 / 9, view)).toEqual({ x: 100, y: 100, width: 400 });
  });

  it("is pulled back inside the browser window", () => {
    const box = fitInView({ x: 1700, y: 1000, width: 400 }, 16 / 9, view);
    expect(box.x + box.width).toBeLessThanOrEqual(view.width - 8);
    expect(box.y + box.width / (16 / 9) + 30).toBeLessThanOrEqual(view.height - 8);
    expect(fitInView({ x: -50, y: -20, width: 400 }, 16 / 9, view)).toMatchObject({ x: 8, y: 8 });
  });

  it("is neither tiny nor bigger than the window", () => {
    expect(fitInView({ x: 0, y: 0, width: 20 }, 16 / 9, view).width).toBe(200);
    const huge = fitInView({ x: 0, y: 0, width: 5000 }, 16 / 9, view);
    // as wide as the window allows
    expect(huge.width).toBe(1771 - 16);
    // a wide picture in a low window: its height decides
    const low = fitInView({ x: 0, y: 0, width: 5000 }, 16 / 9, { width: 1771, height: 600 });
    expect(low.width).toBeCloseTo((600 - 16 - 30) * (16 / 9));
    // a portrait phone video is limited by height too
    const portrait = fitInView({ x: 0, y: 0, width: 1000 }, 9 / 16, view);
    expect(portrait.width / (9 / 16) + 30).toBeLessThanOrEqual(view.height - 16 + 0.001);
  });
});
