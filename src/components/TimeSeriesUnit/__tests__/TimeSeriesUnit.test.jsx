import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";

import { fixtures } from "../../../../tests/mocks/handlers";
import { describeUnit, findUnit, findQuantity } from "../units";
import TimeSeriesUnitEditor from "../TimeSeriesUnitEditor";
import ModelInputUnits from "../ModelInputUnits";

const catalog = fixtures.unitCatalog;

// Mantine's Select measures and scrolls its dropdown; jsdom implements neither.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
Element.prototype.scrollIntoView ??= () => {};

const renderIn = (ui) => render(<MantineProvider>{ui}</MantineProvider>);

describe("unit helpers", () => {
  it("resolves catalog units by id and alias", () => {
    const acc = findQuantity(catalog, "acceleration");
    expect(findUnit(acc, "g").label).toBe("g");
    expect(findUnit(acc, "m/s²").id).toBe("m/s^2");
    expect(findUnit(acc, "furlong")).toBeNull();
  });

  it("describes known, custom and unknown units", () => {
    expect(describeUnit(catalog, "acceleration", "g")).toEqual({
      text: "g",
      quantity: "Acceleration",
      convertible: true,
    });
    expect(describeUnit(catalog, "strain", "ue")).toEqual({
      text: "ue",
      quantity: "strain",
      convertible: false,
    });
    expect(describeUnit(catalog, null, "m/s^2")).toEqual({
      text: "m/s^2",
      quantity: "",
      convertible: false,
    });
  });
});

describe("TimeSeriesUnitEditor", () => {
  it("prompts to set the unit when it is unknown", () => {
    renderIn(
      <TimeSeriesUnitEditor timeSeries={{ name: "accX", unit: "" }} onSave={vi.fn()} />
    );
    expect(screen.getByText("Set unit")).toBeInTheDocument();
  });

  it("shows the catalog label and saves quantity and unit", async () => {
    const onSave = vi.fn().mockResolvedValue();
    renderIn(
      <TimeSeriesUnitEditor
        timeSeries={{ name: "temp", quantity: "temperature", unit: "K" }}
        onSave={onSave}
      />
    );
    fireEvent.click(await screen.findByText("K"));
    fireEvent.click(await screen.findByRole("button", { name: "Save" }));
    await waitFor(() => expect(onSave).toHaveBeenCalledWith("temperature", "K"));
  });

  it("keeps an unknown quantity as null when saving", async () => {
    const onSave = vi.fn().mockResolvedValue();
    renderIn(
      <TimeSeriesUnitEditor timeSeries={{ name: "x", unit: "raw" }} onSave={onSave} />
    );
    fireEvent.click(await screen.findByText("raw"));
    fireEvent.click(await screen.findByRole("button", { name: "Save" }));
    await waitFor(() => expect(onSave).toHaveBeenCalledWith(null, "raw"));
  });

  it("shows a save error and stays open", async () => {
    const onSave = vi.fn().mockRejectedValue(new Error("Time-series not found"));
    renderIn(
      <TimeSeriesUnitEditor timeSeries={{ name: "x", unit: "raw" }} onSave={onSave} />
    );
    fireEvent.click(await screen.findByText("raw"));
    fireEvent.click(await screen.findByRole("button", { name: "Save" }));
    expect(await screen.findByText("Time-series not found")).toBeInTheDocument();
  });
});

describe("ModelInputUnits", () => {
  it("lists the expected unit per input", async () => {
    renderIn(
      <ModelInputUnits
        model={{
          timeSeries: ["accX", "temp"],
          inputUnits: [
            { name: "accX", quantity: "acceleration", unit: "m/s^2" },
            { name: "temp", quantity: null, unit: "" },
          ],
        }}
      />
    );
    expect(await screen.findByText("accX · m/s²")).toBeInTheDocument();
    expect(screen.getByText("temp")).toBeInTheDocument();
  });

  it("explains models trained before units existed", () => {
    renderIn(<ModelInputUnits model={{ timeSeries: ["accX"] }} />);
    expect(screen.getByText(/trained before units were recorded/)).toBeInTheDocument();
  });
});
