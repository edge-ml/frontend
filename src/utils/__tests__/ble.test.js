import { describe, it, expect } from "vitest";
import { get_parse_schema } from "../ble";

// Builds the binary BLE parse scheme payload:
// [numSensors] per sensor: id, nameLen, name..., numComponents,
//   per component: groupType, groupLen, group..., compNameLen, compName...,
//                  unitLen, unit...
function buildSchemaBuffer() {
  const bytes = [];
  const str = (s) => {
    for (const c of s) bytes.push(c.charCodeAt(0));
  };
  const u8 = (v) => bytes.push(v);

  const component = (type, group, name, unit) => {
    u8(type);
    u8(group.length);
    str(group);
    u8(name.length);
    str(name);
    u8(unit.length);
    str(unit);
  };

  u8(2); // number of sensors

  // Sensor 1: accelerometer with two components
  u8(0x11); // sensor id / bleKey
  u8(3);
  str("Acc");
  u8(2); // two component groups
  component(6, "accel", "x", "m/s2"); // PARSE_TYPE_FLOAT
  component(6, "accel", "y", "g");

  // Sensor 2: no components -> must be skipped
  u8(0x22);
  u8(5);
  str("Empty");
  u8(0);

  return new DataView(new Uint8Array(bytes).buffer);
}

describe("get_parse_schema", () => {
  it("parses sensors and their component schemes from binary data", () => {
    const schema = get_parse_schema(buildSchemaBuffer());

    expect(schema.length).toBe(1); // sensor without components is dropped
    const acc = schema[0];
    expect(acc.bleKey).toBe(0x11);
    expect(acc.name).toBe("Acc");
    expect(acc.sampleRate).toBe(10);
    expect(acc.parseScheme).toEqual([
      { name: "accel_x", unit: "m/s2", type: "float" },
      { name: "accel_y", unit: "g", type: "float" },
    ]);
  });

  it("throws for unsupported data types", () => {
    const bytes = [];
    const str = (s) => {
      for (const c of s) bytes.push(c.charCodeAt(0));
    };
    const u8 = (v) => bytes.push(v);
    u8(1); // num sensors
    u8(1); // id
    u8(1); str("T"); // name
    u8(1); // one component
    u8(4); // PARSE_TYPE_INT32 -> unsupported
    u8(1); str("g"); // group
    u8(1); str("c"); // component
    u8(1); str("u"); // unit
    expect(() =>
      get_parse_schema(new DataView(new Uint8Array(bytes).buffer))
    ).toThrow(/implement this type/);
  });
});
