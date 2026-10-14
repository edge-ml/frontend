import { describe, it, expect } from "vitest";
import { codeNode, codeJs, codeDart } from "../Code";
import { deploymentLabel } from "../../Common/modelExport";

const args = (useServerTime) => [
  "https://app.edge-ml.org",
  "KEY",
  "my-dataset",
  useServerTime,
  useServerTime ? "" : "1618760114000, ",
];

describe("edge-ml JS library snippets", () => {
  it.each([true, false])("Node.js snippet is valid JavaScript (useServerTime=%s)", (useServerTime) => {
    const code = codeNode(...args(useServerTime));
    expect(() => new Function("require", code)).not.toThrow();
    expect(code).toContain('require("edge-ml")');
    expect(code).toContain(useServerTime ? 'addDataPoint("sensorName_001", 1.23)' : 'addDataPoint(1618760114000, "sensorName_001", 1.23)');
  });

  it("browser snippet uses the edgeML global in a module script", () => {
    const code = codeJs(...args(true));
    const script = code.split('<script type="module">')[1].split("</script>")[0];
    // top-level await is only valid in modules: check the body as an async function
    expect(() => new Function(`return (async () => {${script}})`)).not.toThrow();
    expect(script).toContain("edgeML.datasetCollector(");
  });
});

describe("edge-ml Flutter library snippet", () => {
  it.each([true, false])("uses the collector API (useServerTime=%s)", (useServerTime) => {
    const code = codeDart("https://app.edge-ml.org", "KEY", "my-dataset", useServerTime);
    expect(code).toContain("apiKey: 'KEY'");
    expect(code).toContain("backendUrl: 'https://app.edge-ml.org'");
    expect(code).toContain("edgeml.datasets.collector(");
    expect(code).toContain(
      useServerTime ? "collector.add('sensorName_001', 1.23);" : "collector.add('sensorName_001', 1.23, timestamp: 1618760114000);"
    );
    expect(code).toContain("await collector.complete();");
  });
});

describe("deploymentLabel", () => {
  it("names the browser target for ONNX models", () => {
    expect(deploymentLabel({ formats: ["C", "ONNX"] })).toBe("Embedded · Browser");
  });
});
