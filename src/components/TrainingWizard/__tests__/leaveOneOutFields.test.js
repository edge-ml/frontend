import { describe, it, expect } from "vitest";

import {
  GROUP_FIELD,
  metaFieldSummary,
  withGroupFieldOptions,
  groupFieldNote,
} from "../leaveOneOutFields";

const ds = (metaData) => ({ metaData });
const step = (value) => ({
  name: "LeaveOneGroupOut",
  parameters: [
    { parameter_name: "something_else", value: 5 },
    { parameter_name: GROUP_FIELD, value, options: [] },
  ],
});

describe("metaFieldSummary", () => {
  it("counts the datasets and distinct values per field", () => {
    const summary = metaFieldSummary([
      ds({ subject: "a", device: "watch" }),
      ds({ subject: "b", device: "watch" }),
      ds({ subject: "a" }),
    ]);
    expect(summary.fields).toEqual(["device", "subject"]);
    expect(summary.byField.subject).toMatchObject({ datasets: 3, values: 2 });
    expect(summary.byField.device).toMatchObject({ datasets: 2, values: 1 });
    expect(summary.total).toBe(3);
  });

  it("treats blank and missing values as absent", () => {
    // A blank value cannot identify a group, so it must not inflate the counts
    // or create an empty group the way the old LOSO code did.
    const summary = metaFieldSummary([
      ds({ subject: "a" }),
      ds({ subject: "   " }),
      ds({ subject: null }),
      ds({ subject: undefined }),
      ds({}),
      ds(undefined),
    ]);
    expect(summary.byField.subject).toMatchObject({ datasets: 1, values: 1 });
    expect(summary.total).toBe(6);
  });

  it("coerces non-string values", () => {
    const summary = metaFieldSummary([ds({ subject: 1 }), ds({ subject: 2 })]);
    expect(summary.byField.subject).toMatchObject({ datasets: 2, values: 2 });
  });

  it("handles no datasets", () => {
    expect(metaFieldSummary([])).toMatchObject({ fields: [], total: 0 });
    expect(metaFieldSummary()).toMatchObject({ fields: [], total: 0 });
  });
});

describe("withGroupFieldOptions", () => {
  it("fills the group_field options and leaves other parameters alone", () => {
    const filled = withGroupFieldOptions(step(""), ["device", "subject"]);
    const group = filled.parameters.find((p) => p.parameter_name === GROUP_FIELD);
    const other = filled.parameters.find(
      (p) => p.parameter_name === "something_else"
    );
    expect(group.options).toEqual(["device", "subject"]);
    expect(other).toEqual({ parameter_name: "something_else", value: 5 });
  });

  it("returns options without a group_field untouched", () => {
    const plain = { name: "TestTrainSplit", parameters: [{ parameter_name: "split" }] };
    expect(withGroupFieldOptions(plain, ["subject"])).toBe(plain);
    expect(withGroupFieldOptions(undefined, ["subject"])).toBe(undefined);
  });

  it("does not mutate the input", () => {
    const original = step("");
    withGroupFieldOptions(original, ["subject"]);
    expect(
      original.parameters.find((p) => p.parameter_name === GROUP_FIELD).options
    ).toEqual([]);
  });
});

describe("groupFieldNote", () => {
  const summary = (datasets) => metaFieldSummary(datasets);

  it("is undefined for a step that is not leave-one-out", () => {
    const plain = { parameters: [{ parameter_name: "split", value: 80 }] };
    expect(groupFieldNote(plain, summary([ds({ subject: "a" })]))).toBeUndefined();
  });

  it("says so when the selection has no metadata at all", () => {
    const note = groupFieldNote(step(""), summary([ds({}), ds({})]));
    expect(note).toContain("None of the 2 selected datasets");
    expect(note).toContain("nothing to leave out");
  });

  it("lists the available fields before one is picked", () => {
    const note = groupFieldNote(
      step(""),
      summary([ds({ subject: "a" }), ds({ subject: "b", device: "watch" })])
    );
    expect(note).toContain("subject (2 datasets, 2 values)");
    expect(note).toContain("device (1 dataset, 1 value)");
  });

  it("warns that training would fail with fewer than two distinct values", () => {
    // Two datasets but the same subject: no fold can be held out.
    const note = groupFieldNote(
      step("subject"),
      summary([ds({ subject: "a" }), ds({ subject: "a" })])
    );
    expect(note).toContain("Only 1 distinct value");
    expect(note).toContain("needs at least 2");
  });

  it("reports how many datasets are excluded", () => {
    const note = groupFieldNote(
      step("subject"),
      summary([ds({ subject: "a" }), ds({ subject: "b" }), ds({}), ds({ other: "x" })])
    );
    expect(note).toContain("2 of 4 selected datasets have no \"subject\"");
    expect(note).toContain("will be excluded");
    expect(note).toContain("2 remain, across 2 values");
  });

  it("confirms when nothing is excluded", () => {
    const note = groupFieldNote(
      step("subject"),
      summary([ds({ subject: "a" }), ds({ subject: "b" })])
    );
    expect(note).toContain("All 2 selected datasets");
    expect(note).toContain("across 2 values");
  });

  it("handles a field that no selected dataset carries", () => {
    const note = groupFieldNote(
      step("subject"),
      summary([ds({ device: "watch" }), ds({ device: "phone" })])
    );
    expect(note).toContain("Only 0 distinct values");
  });
});
