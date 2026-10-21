import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { FileListItem } from "../FileListItem";
import { FileStatus } from "../useFileUploads";

const file = (timeSeries) => ({
  id: "f1",
  name: "walk.csv",
  status: FileStatus.CONFIGURATION,
  progress: 0,
  config: { name: "walk", timeSeries, labelings: [], editingModeActive: false },
});

const renderItem = (f, changeConfig = vi.fn()) =>
  render(
    <MantineProvider>
      <FileListItem
        file={f}
        onDelete={vi.fn()}
        onCancel={vi.fn()}
        changeConfig={changeConfig}
        FileStatus={FileStatus}
      />
    </MantineProvider>
  );

describe("FileListItem unit summary", () => {
  it("says when no units are set and opens the settings", () => {
    const changeConfig = vi.fn();
    const f = file([
      { name: "accX", unit: "m/s^2" },
      { name: "accY", unit: "" },
    ]);
    renderItem(f, changeConfig);
    expect(screen.getByText("Units not set for 2 time-series")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Set units" }));
    expect(changeConfig).toHaveBeenCalledWith("f1", { ...f.config, editingModeActive: true });
  });

  it("counts series with a quantity and ignores removed ones", () => {
    renderItem(
      file([
        { name: "accX", quantity: "acceleration", unit: "g" },
        { name: "accY", unit: "" },
        { name: "gone", quantity: "angle", unit: "deg", removed: true },
      ])
    );
    expect(screen.getByText("Units set for 1 of 2 time-series")).toBeInTheDocument();
  });

  it("offers editing once all units are set", () => {
    renderItem(file([{ name: "t", quantity: "temperature", unit: "degC" }]));
    expect(screen.getByText("Unit set")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit units" })).toBeInTheDocument();
  });
});
