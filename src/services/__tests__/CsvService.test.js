import { describe, it, expect } from "vitest";
import {
  processCSV,
  generateDataset,
  generateCSV,
  generateLabeledDataset,
  extendExistingDataset,
  checkHeaders,
} from "../CsvService";

const makeFile = (content) => new File([content], "test.csv", { type: "text/csv" });

describe("processCSV", () => {
  it("splits file content into lines and columns", async () => {
    const files = [makeFile("a,b\n1,2\r\n3,4\n")];
    const result = await processCSV(files);
    expect(result).toEqual([[["a", "b"], ["1", "2"], ["3", "4"]]]);
  });

  it("reads multiple files in order", async () => {
    const files = [makeFile("x,y"), makeFile("z,w")];
    const result = await processCSV(files);
    expect(result.length).toBe(2);
    expect(result[0][0]).toEqual(["x", "y"]);
    expect(result[1][0]).toEqual(["z", "w"]);
  });
});

describe("checkHeaders", () => {
  it("accepts valid sensor and label headers", () => {
    const timeData = [["time", "sensor_a[ms]", "label_x_y"]];
    expect(checkHeaders([timeData])).toEqual([]);
  });

  it("rejects headers that do not start with 'time'", () => {
    const errors = checkHeaders([["nottime", "sensor_a"]]);
    expect(errors[0][0].error).toContain("Header must start with 'time'");
  });

  it("rejects malformed column headers", () => {
    const errors = checkHeaders([[["time", "badcolumn"]]]);
    expect(errors[0][0].error).toContain("Wrong header format");
  });
});

describe("generateDataset", () => {
  it("builds dataset and labeling objects from valid csv data", () => {
    // processCSVColumn is applied per file: first entry is the header.
    const input = [
      [
        ["time", "sensor_temp[C]", "label_activity_state"],
        ["0", "", ""],
        ["100", "1.5", "x"],
        ["200", "2.5", "x"],
        ["300", "", ""],
      ],
    ];
    const result = generateDataset(input, {});
    expect(Array.isArray(result)).toBe(false);
    expect(result.datasets.length).toBe(1);
    const ds = result.datasets[0];
    expect(ds.timeSeries[0].name).toBe("temp");
    expect(ds.timeSeries[0].unit).toBe("C");
    expect(ds.timeSeries[0].data).toEqual([
      [100, 1.5],
      [200, 2.5],
    ]);
    expect(ds.start).toBe(0);
    expect(ds.end).toBe(300);
    expect(result.labelings[0][0].datasetLabel.name).toBe("activity");
    expect(result.labelings[0][0].labels[0].name).toBe("state");
  });

  it("returns header errors when headers are invalid", () => {
    const input = [[["nope", "bad"]]];
    const result = generateDataset(input, {});
    expect(result[0][0].error).toContain("Header must start with 'time'");
  });

  it("returns column errors for wrong formats", () => {
    const input = [
      [
        ["time", "wrongcol"],
        ["0", "1"],
      ],
    ];
    const result = generateDataset(input, {});
    expect(result[0][0].error).toContain("Wrong header format");
  });

  it("reports an empty csv when only a header column exists", () => {
    const input = [[["time"]]];
    const result = generateDataset(input, {});
    expect(result[0][0].error).toBe("No data in csv file");
  });

  it("reports rows with inconsistent element counts", () => {
    const input = [
      [["time", "sensor_a[ms]"], ["0", "1", "extra"]],
    ];
    const result = generateDataset(input, {});
    expect(result[0][0].error).toBe(
      "Each row needs the same number of elements, at line 2"
    );
  });

  it("reports a csv with a header but no rows as empty", () => {
    const input = [[["time", "sensor_a[ms]"]]];
    const result = generateDataset(input, {});
    expect(result[0][0].error).toBe("No data in csv file");
  });

  it("handles sensor columns without a unit and labels active until the last row", () => {
    const input = [
      [
        ["time", "sensor_count", "label_activity_state"],
        ["10", "1.5", "x"],
        ["20", "2.5", "x"],
      ],
    ];
    const result = generateDataset(input, {});
    expect(Array.isArray(result)).toBe(false);
    const ds = result.datasets[0];
    expect(ds.timeSeries[0].name).toBe("count");
    expect(ds.timeSeries[0].unit).toBe(""); // no [unit] in header
    // The label runs until the final row.
    expect(result.labelings[0][0].datasetLabel.labels[0]).toEqual({
      start: "10",
      end: "20",
      name: "state",
    });
    expect(ds.start).toBe(10);
    expect(ds.end).toBe(20);
  });

  it("reports missing timestamps", () => {
    const input = [
      [
        ["time", "sensor_t"],
        ["", "1"],
      ],
    ];
    const result = generateDataset(input, {});
    expect(result[0][0].error).toContain("Timestamp missing");
  });

  it("reports non-numeric timestamps", () => {
    const input = [
      [
        ["time", "sensor_t"],
        ["abc", "1"],
      ],
    ];
    const result = generateDataset(input, {});
    expect(result[0][0].error).toContain("Timestamp is not a number");
  });

  it("reports non-numeric sensor values", () => {
    const input = [
      [
        ["time", "sensor_t"],
        ["10", "xyz"],
      ],
    ];
    const result = generateDataset(input, {});
    expect(result[0][0].error).toContain("Sensor value is not a number");
  });
});

describe("generateLabeledDataset", () => {
  it("attaches labeling/label ids to datasets", () => {
    const labelings = [
      { _id: "lab-1", name: "activity", labels: [{ _id: "type-1", name: "walk" }] },
    ];
    const currentLabeling = [
      [
        {
          datasetLabel: {
            name: "activity",
            labels: [{ name: "walk", start: 0, end: 10 }],
          },
        },
      ],
    ];
    const datasets = [{ timeSeries: [], start: 0, end: 10 }];
    const result = generateLabeledDataset(labelings, currentLabeling, datasets);
    expect(result[0].labelings[0].labelingId).toBe("lab-1");
    expect(result[0].labelings[0].labels[0].type).toBe("type-1");
  });
});

describe("extendExistingDataset", () => {
  it("merges time series and extends start/end", () => {
    const base = {
      timeSeries: [{ name: "a" }],
      start: 100,
      end: 200,
    };
    const merged = extendExistingDataset(base, [
      { timeSeries: [{ name: "b" }], start: 50, end: 150 },
      { timeSeries: [{ name: "c" }], start: 120, end: 400 },
    ]);
    expect(merged.start).toBe(50);
    expect(merged.end).toBe(400);
    expect(merged.timeSeries.map((t) => t.name)).toEqual(["a", "b", "c"]);
  });
});

describe("generateCSV", () => {
  const labelings = [
    { _id: "lab-1", name: "activity" },
  ];
  const labels = [
    { _id: "type-1", name: "walk" },
  ];

  it("exports sensor data without labels", () => {
    const dataset = {
      timeSeries: [
        {
          name: "temp",
          unit: "C",
          data: [
            [0, 1],
            [10, 2],
          ],
        },
      ],
    };
    const csv = generateCSV(dataset, labelings, labels);
    const lines = csv.split("\n");
    expect(lines[0]).toBe("time,sensor_temp[C]");
    expect(lines[1]).toBe("0,1");
    expect(lines[2]).toBe("10,2");
  });

  it("interleaves multiple time series by timestamp and adds label columns", () => {
    const dataset = {
      timeSeries: [
        { name: "a", unit: "x", data: [[0, 1], [20, 2]] },
        { name: "b", unit: "y", data: [[10, 7]] },
      ],
      labelings: [
        {
          labelingId: "lab-1",
          labels: [{ type: "type-1", start: 0, end: 15 }],
        },
      ],
    };
    const csv = generateCSV(dataset, labelings, labels);
    const lines = csv.split("\n").map((l) => l.split(","));
    expect(lines[0]).toEqual([
      "time",
      "sensor_a[x]",
      "sensor_b[y]",
      "label_activity_walk",
    ]);
    expect(lines[1]).toEqual(["0", "1", "", "x"]);
    expect(lines[2]).toEqual(["10", "", "7", "x"]);
    expect(lines[3]).toEqual(["20", "2", "", ""]);
  });
});
