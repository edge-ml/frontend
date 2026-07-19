import React, { useState } from "react";

import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Collapse,
  Button,
} from "reactstrap";
import { HyperparameterView } from "../Hyperparameters/HyperparameterView";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ExportTarget from "../Common/ExportTarget";
import { faCaretDown, faCaretRight } from "@fortawesome/free-solid-svg-icons";

const Pipelinestep = ({
  step,
  selectedPipelineStep,
  setPipelineStep,
  stepNum,
  exportTargets,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [isOpen, setIsOpen] = useState(false);

  const toggleCollapse = () => {
    setIsOpen(!isOpen);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const onSelectStepOption = (option) => {
    setPipelineStep(option);
  };

  const onHandleHyperparameterChange = ({ parameter_name, state }) => {
    const tmpSelectedPipelineStep = selectedPipelineStep;
    const idx = tmpSelectedPipelineStep.parameters.findIndex(
      (elm) => elm.parameter_name == parameter_name
    );
    tmpSelectedPipelineStep.parameters[idx].value = state;
    setPipelineStep(tmpSelectedPipelineStep);
  };

  return (
    <div className="p-2">
      <div className="d-flex justify-content-between">
        <div>
          <h3 className="fw-bold">{stepNum + 1 + ". " + step.name}</h3>
          <h5>{step.description}</h5>
        </div>
      </div>
      <hr></hr>
      <div className="mb-2">
        <div className="">
          <div className="d-flex justify-content-start align-items-center">
            <b>Method: </b>
            <div>
              <Dropdown
                className="ms-2"
                style={{ position: "unset", padding: "unset" }}
                isOpen={dropdownOpen}
                toggle={toggleDropdown}
              >
                <DropdownToggle caret outline color="primary">
                  {selectedPipelineStep.name}
                </DropdownToggle>
                <DropdownMenu>
                  {step.options.map((option) => (
                    <DropdownItem onClick={() => onSelectStepOption(option)}>
                      {option.name}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
          <div className="my-2">
            <b>Description: </b>
            {selectedPipelineStep.description}
          </div>
          {selectedPipelineStep.type !== "EVAL" && (
            <div className="my-2 d-flex align-items-center">
              <b className="me-2">Deployment: </b>
              <ExportTarget targets={exportTargets} />
            </div>
          )}
        </div>
      </div>
      <hr></hr>
      {selectedPipelineStep.parameters.filter((elm) => !elm.is_advanced)
        .length > 0 ? (
        <div>
          <b>Parameters:</b>
          <HyperparameterView
            handleHyperparameterChange={onHandleHyperparameterChange}
            isAdvanced={false}
            hyperparameters={selectedPipelineStep.parameters}
          ></HyperparameterView>
        </div>
      ) : null}
      {selectedPipelineStep.parameters.filter((elm) => elm.is_advanced).length >
        0 && (
        <div>
          <div className="d-flex align-items-center">
            <div className="me-2 fw-bold">Advanced parameters</div>
            <FontAwesomeIcon
              size="1x"
              icon={isOpen ? faCaretDown : faCaretRight}
              onClick={toggleCollapse}
            ></FontAwesomeIcon>
          </div>
          <div>
            You do not need to change the advanced parameters. Leave the fields
            empty to use default values.
          </div>
          <Collapse isOpen={isOpen}>
            <HyperparameterView
              handleHyperparameterChange={onHandleHyperparameterChange}
              isAdvanced={true}
              hyperparameters={selectedPipelineStep.parameters}
            />
          </Collapse>
        </div>
      )}
    </div>
  );
};

Pipelinestep.validate = ({ step }) => {
  if (!step || !step.parameters) return undefined;
  for (const p of step.parameters) {
    // Empty value = use the option's default, which is allowed.
    if (p.value === null || p.value === undefined || p.value === "") continue;
    const val = Number(p.value);
    if (Number.isNaN(val)) continue;
    if (typeof p.number_min === "number" && val < p.number_min)
      return `${p.parameter_name} must be at least ${p.number_min}`;
    if (typeof p.number_max === "number" && val > p.number_max)
      return `${p.parameter_name} must be at most ${p.number_max}`;
  }
  return undefined;
};

export default Pipelinestep;
