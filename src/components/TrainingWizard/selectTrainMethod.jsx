import React from "react";
import {
  faGear,
  faGears,
  faSliders,
  faUserGear,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Fragment } from "react";
import PlatformList from "../Common/PlatformList";

const TrainingMethod = (pipeline, onSelectTrainingMethod) => {
  let platforms = new Set(
    pipeline.steps
      .filter((elm) => ["PRE", "EVAL"].includes(elm.type))[0]
      .options.map((elm) => elm.platforms)
      .flat()
  );

  pipeline.steps.forEach((step) => {
    if (step.type === "PRE" || step.type === "CORE") {
      const plf = new Set(step.options.map((elm) => elm.platforms).flat());
      platforms = new Set([...platforms].filter((elm) => plf.has(elm)));
    }
  });
  return (
    <div
      key={pipeline.name}
      className="edgeml-border"
      style={{ padding: "0.5rem", margin: "0.5rem", cursor: "pointer" }}
      onClick={() => onSelectTrainingMethod(pipeline)}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontWeight: 700 }}>{pipeline.name}</div>
          <div>{pipeline.description}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <PlatformList size="3rem" platforms={platforms} />
        </div>
      </div>
    </div>
  );
};

const SelectTrainMethod = ({ pipelines, onSelectTrainingMethod }) => {
  return (
    <Fragment>
      {pipelines.map((elm) => TrainingMethod(elm, onSelectTrainingMethod))}
    </Fragment>
  );
};

SelectTrainMethod.validate = () => {
  return false;
};

export default SelectTrainMethod;
