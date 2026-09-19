import { describe, it, expect } from "vitest";
import { uuidv4 } from "../UUIDService";

describe("uuidv4", () => {
  it("returns strings matching the UUID v4 format", () => {
    const re = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
    expect(uuidv4()).toMatch(re);
  });

  it("generates unique ids", () => {
    const ids = new Set(Array.from({ length: 500 }, () => uuidv4()));
    expect(ids.size).toBe(500);
  });
});
