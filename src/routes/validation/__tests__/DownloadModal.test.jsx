import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";

vi.mock("../../../services/ApiServices/MLDeploymentService", () => ({
  downloadDeploymentModel: vi.fn(),
}));
vi.mock("../../../services/helpers", () => ({ downloadBlob: vi.fn() }));

import DownloadModal from "../DownloadModal";
import { downloadDeploymentModel } from "../../../services/ApiServices/MLDeploymentService";
import { downloadBlob } from "../../../services/helpers";

const model = { _id: "m1", name: "test_double", formats: ["C"], timeSeries: ["accX"] };
const renderModal = () =>
  render(
    <MantineProvider>
      <DownloadModal model={model} onClose={() => {}} />
    </MantineProvider>
  );
const downloadButton = () => screen.getByRole("button", { name: /download|preparing/i });

describe("DownloadModal", () => {
  it("shows a loading state until the file is handed to the browser", async () => {
    let finish;
    downloadDeploymentModel.mockReturnValue(new Promise((r) => (finish = r)));
    renderModal();

    fireEvent.click(downloadButton());
    // the edge-ml logo loader, not a generic spinner
    await waitFor(() => expect(downloadButton()).toHaveAttribute("aria-busy", "true"));
    expect(downloadButton()).toBeDisabled();
    expect(downloadButton()).toHaveTextContent("Preparing…");
    expect(screen.getByRole("img", { name: "Loading" })).toHaveClass("logo-loader");

    const blob = new Blob(["zip"]);
    finish(blob);
    await waitFor(() => expect(downloadButton()).toHaveAttribute("aria-busy", "false"));
    expect(downloadButton()).toHaveTextContent("Download");
    expect(screen.queryByRole("img", { name: "Loading" })).not.toBeInTheDocument();
    expect(downloadBlob).toHaveBeenCalledWith(blob, "test_double_c.zip");
  });

  it("stops loading and shows the error when the download fails", async () => {
    downloadDeploymentModel.mockRejectedValue(new Error("Request failed with status code 500"));
    renderModal();
    fireEvent.click(downloadButton());
    expect(await screen.findByText("Request failed with status code 500")).toBeInTheDocument();
    expect(downloadButton()).toHaveAttribute("aria-busy", "false");
  });

  it("shows the sound input and audio code for audio models", () => {
    const audioModel = {
      _id: "m2",
      name: "kitchen",
      formats: ["ONNX", "EXECUTORCH", "PYTORCH"],
      timeSeries: ["accX"],
      audioInputs: [{ name: "mic", sampleRate: 16000 }],
    };
    render(
      <MantineProvider>
        <DownloadModal model={audioModel} onClose={() => {}} />
      </MantineProvider>
    );
    expect(screen.getByText("mic · sound, 16 kHz mono")).toBeInTheDocument();
    // the modal is rendered into a portal on the body
    expect(document.body.textContent).toContain("predictor.addAudio(samples, { sampleRate: audioContext.sampleRate })");
    expect(document.body.textContent).toContain('predictor.addSample({ "accX": val_accX })');
  });
});
