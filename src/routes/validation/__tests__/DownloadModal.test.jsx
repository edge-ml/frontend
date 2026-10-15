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
const downloadButton = () => screen.getByRole("button", { name: /^download$/i });

describe("DownloadModal", () => {
  it("shows a loading state until the file is handed to the browser", async () => {
    let finish;
    downloadDeploymentModel.mockReturnValue(new Promise((r) => (finish = r)));
    renderModal();

    fireEvent.click(downloadButton());
    await waitFor(() => expect(downloadButton()).toHaveAttribute("data-loading"));
    expect(downloadButton()).toBeDisabled();

    const blob = new Blob(["zip"]);
    finish(blob);
    await waitFor(() => expect(downloadButton()).not.toHaveAttribute("data-loading"));
    expect(downloadBlob).toHaveBeenCalledWith(blob, "test_double_c.zip");
  });

  it("stops loading and shows the error when the download fails", async () => {
    downloadDeploymentModel.mockRejectedValue(new Error("Request failed with status code 500"));
    renderModal();
    fireEvent.click(downloadButton());
    expect(await screen.findByText("Request failed with status code 500")).toBeInTheDocument();
    expect(downloadButton()).not.toHaveAttribute("data-loading");
  });
});
