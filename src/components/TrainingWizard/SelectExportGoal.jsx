import React from "react";
import { Button } from "reactstrap";

// Shown right after the pipeline is picked. Choosing an export target filters the
// options in every later step so the trained model can actually be exported that
// way. Skipping trains with all options available; the model may then not be
// downloadable. Keys must match the values used in the TrainingWizard.
const GOALS = [
  {
    key: "EXECUTORCH",
    title: "Mobile / smartphone",
    desc: "Export to ExecuTorch (.pte) to run on Android or iOS. Uses PyTorch models.",
  },
  {
    key: "C",
    title: "Embedded device",
    desc: "Export to C to run on microcontrollers and embedded hardware.",
  },
];

const SelectExportGoal = ({ availableKeys, onSelect, onSkip, onBack }) => (
  <div>
    <div className="fw-bold mb-1">Where will this model run?</div>
    <div className="text-muted mb-3">
      Pick a target to keep the options below to what can be deployed that way,
      or skip if you just want to try models and run them live on the server.
    </div>
    {GOALS.filter((g) => availableKeys.includes(g.key)).map((g) => (
      <div
        key={g.key}
        className="edgeml-border p-2 m-2 cursor-pointer hover-bigger"
        onClick={() => onSelect(g.key)}
      >
        <div className="fw-bold">{g.title}</div>
        <div>{g.desc}</div>
      </div>
    ))}
    <div className="mt-3 d-flex align-items-center">
      <Button color="secondary" outline size="sm" onClick={onBack}>
        Back to pipeline selection
      </Button>
      <Button color="link" size="sm" className="ms-2" onClick={onSkip}>
        Skip — I don't need to export this model
      </Button>
    </div>
  </div>
);

export default SelectExportGoal;
