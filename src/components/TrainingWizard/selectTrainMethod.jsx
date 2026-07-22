import React from "react";
import {
  faGear,
  faGears,
  faSliders,
  faUserGear,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Fragment } from "react";
import { Button } from "reactstrap";

// Export capability depends on the classifier and steps the user picks inside
// the pipeline, so it is shown as a live "Export target" once selections are
// made (see TrainingWizard) rather than as a misleading badge on the picker.
const TrainingMethod = (pipeline, onSelectTrainingMethod) => {
  return (
    <div
      key={pipeline.name}
      className="edgeml-border p-2 m-2 cursor-pointer hover-bigger"
      onClick={() => onSelectTrainingMethod(pipeline)}
    >
      <div className="d-flex justify-content-between">
        <div>
          <div className="fw-bold">{pipeline.name}</div>
          <div>{pipeline.description}</div>
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
