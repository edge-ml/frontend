import React from "react";
import C from "./C.svg";

// Renders the deployment target(s) for the WHOLE pipeline (computed by
// computeExportTargets in the TrainingWizard), matching what the Download modal
// will actually offer. One clear signal instead of contradictory per-step badges.
const ExportTarget = ({ targets, size = "1.6rem" }) => {
  const { c, executorch, pytorch } = targets || {};

  if (!c && !executorch && !pytorch) {
    return (
      <span className="text-muted">
        Runs live on the server — not downloadable to a device
      </span>
    );
  }

  return (
    <span className="child-gap d-inline align-middle">
      {c && (
        <img
          src={C}
          alt="C"
          title="Downloadable as C for embedded devices"
          style={{ height: size, width: size }}
        />
      )}
      {executorch && (
        <span
          title="Downloadable as ExecuTorch (.pte) for mobile"
          style={{
            display: "inline-block",
            padding: "0.15rem 0.5rem",
            borderRadius: "0.6rem",
            background: "#ee4c2c",
            color: "#fff",
            fontSize: "0.85rem",
            fontWeight: 600,
            lineHeight: 1.4,
            verticalAlign: "middle",
          }}
        >
          ExecuTorch (.pte)
        </span>
      )}
      {pytorch && (
        <span
          title="Downloadable as PyTorch (.pt) to run on a server or desktop"
          style={{
            display: "inline-block",
            padding: "0.15rem 0.5rem",
            borderRadius: "0.6rem",
            background: "#ee4c2c",
            color: "#fff",
            fontSize: "0.85rem",
            fontWeight: 600,
            lineHeight: 1.4,
            verticalAlign: "middle",
          }}
        >
          PyTorch (.pt)
        </span>
      )}
    </span>
  );
};

export default ExportTarget;
