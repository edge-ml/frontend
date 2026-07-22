import React, { useState } from "react";

import {
  Collapse,
  Button,
  Menu,
  Group,
  Text,
} from "@mantine/core";
import { HyperparameterView } from "../Hyperparameters/HyperparameterView";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PlatformList from "../Common/PlatformList";
import { faCaretDown, faCaretRight } from "@fortawesome/free-solid-svg-icons";

const Pipelinestep = ({
  step,
  selectedPipelineStep,
  setPipelineStep,
  stepNum,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleCollapse = () => {
    setIsOpen(!isOpen);
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
    <div style={{ padding: "0.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <h3 style={{ fontWeight: 700 }}>{stepNum + 1 + ". " + step.name}</h3>
          <h5>{step.description}</h5>
        </div>
      </div>
      <hr></hr>
      <div style={{ marginBottom: "0.5rem" }}>
        <div>
          <Group align="center" gap="xs">
            <b>Method: </b>
            <Menu>
              <Menu.Target>
                <Button variant="outline" color="blue">
                  {selectedPipelineStep.name}
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                {step.options.map((option) => (
                  <Menu.Item key={option.name} onClick={() => onSelectStepOption(option)}>
                    {option.name}
                  </Menu.Item>
                ))}
              </Menu.Dropdown>
            </Menu>
          </Group>
          <div style={{ margin: "0.5rem 0" }}>
            <b>Description: </b>
            {selectedPipelineStep.description}
          </div>
          {selectedPipelineStep.type !== "EVAL" && (
            <div style={{ margin: "0.5rem 0" }}>
              <b>Platforms: </b>
              <PlatformList
                platforms={selectedPipelineStep.platforms}
                size="2rem"
                color="black"
              />
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
          />
        </div>
      ) : null}
      {selectedPipelineStep.parameters.filter((elm) => elm.is_advanced).length >
        0 && (
        <div>
          <Group align="center" gap="xs">
            <Text fw={700}>Advanced parameters</Text>
            <FontAwesomeIcon
              size="1x"
              icon={isOpen ? faCaretDown : faCaretRight}
              onClick={toggleCollapse}
              style={{ cursor: "pointer" }}
            />
          </Group>
          <div>
            You do not need to change the advanced parameters. Leave the fields
            empty to use default values.
          </div>
          <Collapse in={isOpen}>
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

export default Pipelinestep;
