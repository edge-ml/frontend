import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";

import {
  buildTrainRequest,
  commonRecordingNames,
  defaultRecordingName,
  partialRecordingNames,
  soundRecordings,
} from "../trainRequest";
import Wizard_SelectDataset from "../Steps/Select_Datasets";

const rec = (id, name, extra = {}) => ({
  _id: id,
  name,
  kind: "audio",
  status: "ready",
  meta: { audioCodec: "aac" },
  ...extra,
});
const ts = (id, name) => ({ _id: id, name, samplingRate: { mean: 20 } });
const labeling = {
  _id: "L",
  labels: [
    { _id: "a", name: "still", color: "#000" },
    { _id: "b", name: "shaking", color: "#fff" },
  ],
  disabledLabels: [],
};
const labeled = { labelingId: "L", labels: [{ type: "a", start: 0, end: 10 }, { type: "b", start: 11, end: 20 }] };
const ds = (id, timeSeries, mediaSeries, selected = true) => ({
  _id: id,
  name: id,
  selected,
  timeSeries,
  mediaSeries,
  labelings: [labeled],
});
const pipeline = { name: "Audio & Sensor Classification", usesRecordings: true, steps: [{ name: "Windowing" }] };

const request = (datasets, extra = {}) =>
  buildTrainRequest({
    datasets,
    disabledTimeseriesNames: [],
    usesRecordings: true,
    labeling,
    zeroClass: false,
    selectedPipeline: pipeline,
    selectedPipelineSteps: [{ name: "Time based (sensors & audio)" }],
    modelName: "m",
    ...extra,
  });

describe("sound recordings", () => {
  it("counts audio and videos with sound once processed", () => {
    const d = ds("d", [], [
      rec("1", "mic"),
      rec("2", "camera", { kind: "video" }),
      rec("3", "silent", { kind: "video", meta: { audioCodec: null } }),
      rec("4", "busy", { status: "processing" }),
    ]);
    expect(soundRecordings(d).map((m) => m.name)).toEqual(["mic", "camera"]);
  });

  it("offers names every selected dataset has", () => {
    const one = ds("one", [], [rec("1", "mic"), rec("2", "camera")]);
    const two = ds("two", [], [rec("3", "mic")]);
    expect(commonRecordingNames([one, two])).toEqual(["mic"]);
    expect(partialRecordingNames([one, two])).toEqual(["camera"]);
    expect(defaultRecordingName([one, two])).toBe("mic");
    // a choice to make: nothing is picked for the user
    expect(defaultRecordingName([one])).toBeUndefined();
    expect(commonRecordingNames([])).toEqual([]);
  });
});

describe("buildTrainRequest", () => {
  it("sends the chosen recording per dataset", () => {
    const one = ds("one", [ts("t1", "acc")], [rec("1", "mic"), rec("2", "camera")]);
    const two = ds("two", [ts("t2", "acc")], [rec("3", "mic")]);
    const other = ds("three", [ts("t3", "acc")], [rec("4", "mic")], false);
    const req = request([one, two, other], { recordingName: "mic" });
    expect(req.datasets).toEqual([
      { _id: "one", timeSeries: ["t1"], mediaSeries: ["1"] },
      { _id: "two", timeSeries: ["t2"], mediaSeries: ["3"] },
    ]);
    expect(req.selectedPipeline.steps[0].options.name).toBe("Time based (sensors & audio)");
  });

  it("keeps sound-only datasets", () => {
    const req = request([ds("one", [], [rec("1", "mic")])], { recordingName: "mic" });
    expect(req.datasets).toEqual([{ _id: "one", timeSeries: [], mediaSeries: ["1"] }]);
  });

  it("sends no audio when none is chosen", () => {
    const req = request([ds("one", [ts("t1", "acc")], [rec("1", "mic")])]);
    expect(req.datasets).toEqual([{ _id: "one", timeSeries: ["t1"], mediaSeries: [] }]);
  });

  it("leaves sensor pipelines' requests as they were", () => {
    const req = request(
      [ds("one", [ts("t1", "acc")], [rec("1", "mic")]), ds("two", [ts("t2", "acc")], [])],
      { usesRecordings: false, recordingName: "mic" }
    );
    // no mediaSeries key at all, as before
    expect(req.datasets).toEqual([
      { _id: "one", timeSeries: ["t1"] },
      { _id: "two", timeSeries: ["t2"] },
    ]);
    // and a dataset without time series is dropped, as before
    const soundOnly = request([ds("one", [], [rec("1", "mic")])], { usesRecordings: false, recordingName: "mic" });
    expect(soundOnly.datasets).toEqual([]);
  });
});

describe("dataset step with recordings", () => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };

  const renderStep = (props) =>
    render(
      <MantineProvider>
        <Wizard_SelectDataset
          datasets={[ds("kitchen", [ts("t1", "acc")], [rec("1", "mic")])]}
          selectedLabeling={labeling}
          disabledTimeseriesNames={[]}
          toggleSelectDataset={() => {}}
          toggleDisableTimeseries={() => {}}
          toggleAllDatasets={() => {}}
          usesRecordings
          {...props}
        />
      </MantineProvider>
    );

  it("lets the user pick the sound or none", () => {
    const setRecordingName = vi.fn();
    renderStep({ recordingName: "mic", setRecordingName });
    expect(screen.getByText("Selected audio")).toBeTruthy();
    expect(screen.getByText(/learns from the sound of "mic"/)).toBeTruthy();
    expect(screen.getByText("1 recording")).toBeTruthy();
    fireEvent.click(screen.getByText("No audio"));
    expect(setRecordingName).toHaveBeenCalledWith(undefined);
  });

  it("validates sensors or sound", () => {
    const datasets = [ds("kitchen", [ts("t1", "acc")], [rec("1", "mic")])];
    const base = { datasets, selectedLabeling: labeling, zeroClass: false, usesRecordings: true };
    expect(Wizard_SelectDataset.validate({ ...base, disabledTimeseriesNames: ["acc"], recordingName: "mic" })).toBeUndefined();
    expect(Wizard_SelectDataset.validate({ ...base, disabledTimeseriesNames: ["acc"] })).toMatch(/time series or a recording/);
    // sensor pipelines still need a time series
    expect(
      Wizard_SelectDataset.validate({ ...base, usesRecordings: false, disabledTimeseriesNames: ["acc"], recordingName: "mic" })
    ).toMatch(/should remain enabled/);
  });

  it("shows nothing about audio for sensor pipelines", () => {
    renderStep({ usesRecordings: false });
    expect(screen.queryByText("Selected audio")).toBeNull();
  });
});
