import React from "react";
import { Button } from "reactstrap";

// Shown right after the pipeline is picked. Choosing an export target filters the
// options in every later step so the trained model can actually be exported that
// way. Keys must match the values used in the TrainingWizard.
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

const SelectExportGoal = ({ availableKeys, onSelect, onBack }) => (
  <div>
    <div className="fw-bold mb-1">Where will this model run?</div>
    <div className="text-muted mb-3">
      This keeps the options below to the ones that can be deployed the way you
      choose, so the trained model can actually be exported.
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
    <div className="mt-3">
      <Button color="secondary" outline size="sm" onClick={onBack}>
        Back to pipeline selection
      </Button>
    </div>
  </div>
);

export default SelectExportGoal;
