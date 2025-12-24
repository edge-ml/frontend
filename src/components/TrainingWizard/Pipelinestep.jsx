import React, { useState } from "react";

import { Box, Collapse, Group, Select, Text, Title } from "@mantine/core";
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
    <Box p="sm">
      <Group justify="space-between">
        <Box>
          <Title order={3}>{stepNum + 1 + ". " + step.name}</Title>
          <Text size="sm">{step.description}</Text>
        </Box>
      </Group>
      <Box mt="sm">
        <Group align="center" gap="sm">
          <Text fw={700}>Method:</Text>
          <Select
            value={selectedPipelineStep.name}
            onChange={(value) => {
              const next = step.options.find((option) => option.name === value);
              if (next) onSelectStepOption(next);
            }}
            data={step.options.map((option) => option.name)}
            size="sm"
          />
        </Group>
        <Text mt="sm">
          <Text component="span" fw={700}>
            Description:
          </Text>{" "}
          {selectedPipelineStep.description}
        </Text>
        {selectedPipelineStep.type !== "EVAL" && (
          <Group mt="sm" align="center">
            <Text fw={700}>Platforms:</Text>
            <PlatformList
              platforms={selectedPipelineStep.platforms}
              size="2rem"
              color="black"
            />
          </Group>
        )}
      </Box>
      {selectedPipelineStep.parameters.filter((elm) => !elm.is_advanced)
        .length > 0 ? (
        <Box mt="md">
          <Text fw={700}>Parameters:</Text>
          <HyperparameterView
            handleHyperparameterChange={onHandleHyperparameterChange}
            isAdvanced={false}
            hyperparameters={selectedPipelineStep.parameters}
          />
        </Box>
      ) : null}
      {selectedPipelineStep.parameters.filter((elm) => elm.is_advanced).length >
        0 && (
        <Box mt="md">
          <Group align="center" gap="xs">
            <Text fw={700}>Advanced parameters</Text>
            <FontAwesomeIcon
              size="1x"
              icon={isOpen ? faCaretDown : faCaretRight}
              onClick={toggleCollapse}
            />
          </Group>
          <Text size="sm" mt="xs">
            You do not need to change the advanced parameters. Leave the fields
            empty to use default values.
          </Text>
          <Collapse in={isOpen}>
            <HyperparameterView
              handleHyperparameterChange={onHandleHyperparameterChange}
              isAdvanced={true}
              hyperparameters={selectedPipelineStep.parameters}
            />
          </Collapse>
        </Box>
      )}
    </Box>
  );
};

export default Pipelinestep;
