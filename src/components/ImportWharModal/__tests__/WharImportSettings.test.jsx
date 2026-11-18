import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import WharImportSettings, {
  defaultSettings,
  settingsProblem,
  settingsToRequest,
} from "../WharImportSettings";

// jsdom has no ResizeObserver; Mantine's ScrollArea needs one
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

const WISDM = {
  id: "wisdm",
  name: "wisdm",
  sampling_freq: 20,
  default_sampling_freq: 20,
  channels: ["accel_x", "accel_y", "accel_z"],
  activities: ["Walking", "Jogging", "Sitting"],
};

describe("WHAR import settings", () => {
  it("sends nothing when nothing is changed", () => {
    expect(settingsToRequest(WISDM, defaultSettings(WISDM))).toEqual({});
  });

  it("sends what was changed", () => {
    const settings = { channels: ["accel_x"], activities: ["Walking", "Sitting"], samplingFreq: 10 };
    expect(settingsToRequest(WISDM, settings)).toEqual({
      channels: ["accel_x"],
      activities: ["Walking", "Sitting"],
      sampling_freq: 10,
    });
  });

  it("uses the resampling rate of datasets with mixed rates", () => {
    const hhar = { ...WISDM, sampling_freq: null, default_sampling_freq: 50 };
    expect(defaultSettings(hhar).samplingFreq).toBe(50);
    expect(settingsToRequest(hhar, defaultSettings(hhar))).toEqual({});
  });

  it("explains what is wrong", () => {
    const ok = defaultSettings(WISDM);
    expect(settingsProblem(ok)).toBeUndefined();
    expect(settingsProblem({ ...ok, channels: [] })).toMatch(/channel/);
    expect(settingsProblem({ ...ok, activities: [] })).toMatch(/activity/);
    expect(settingsProblem({ ...ok, samplingFreq: 0 })).toMatch(/between/);
    expect(settingsProblem({ ...ok, samplingFreq: undefined })).toMatch(/between/);
  });

  it("ticks channels and keeps their order", () => {
    const onChange = vi.fn();
    render(
      <MantineProvider>
        <WharImportSettings
          dataset={WISDM}
          value={{ ...defaultSettings(WISDM), channels: ["accel_z"] }}
          onChange={onChange}
        />
      </MantineProvider>
    );
    expect(screen.getByText(/1 of 3 channels/)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Import settings for wisdm/));
    fireEvent.click(screen.getByLabelText("accel_x"));
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ channels: ["accel_x", "accel_z"] })
    );
    fireEvent.click(screen.getAllByRole("button", { name: "None" })[1]);
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ activities: [] }));
  });
});
