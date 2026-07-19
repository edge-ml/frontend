import React from "react";
import C from "./C.svg";

// The backend declares platforms through two enums with inconsistent casing
// (Platforms.C = "C"; InferenceFormats.C = "c", CPP = "cpp", ...). Normalize
// here and show only the targets the user can actually act on, matching what
// the Download modal offers (computeFormats -> "C" and/or "EXECUTORCH"):
//   - C            : exportable/deployable to embedded (C)
//   - ExecuTorch   : exportable to mobile (.pte)
//   - Server-only  : runs on the server (View live), no device export
const C_FAMILY = new Set(["c", "cpp", "c-embedded"]);

const PlatformList = ({ platforms, size, color }) => {
  const values = (platforms || []).map((p) => String(p).toLowerCase());
  const hasC = values.some((v) => C_FAMILY.has(v));
  const hasExecutorch = values.includes("executorch");

  if (!hasC && !hasExecutorch) {
    return <span className="d-inline text-muted">Server-only (View live)</span>;
  }

  return (
    <span className="child-gap d-inline">
      {hasC && (
        <img
          src={C}
          alt="C"
          title="Exports to C (embedded)"
          style={{ height: size, width: size, fill: color }}
        />
      )}
      {hasExecutorch && (
        <span
          className="badge badge-secondary"
          title="Exports to ExecuTorch (.pte) for mobile"
          style={{ verticalAlign: "middle" }}
        >
          ExecuTorch
        </span>
      )}
    </span>
  );
};

export default PlatformList;
