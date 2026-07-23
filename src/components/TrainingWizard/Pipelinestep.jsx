import React, { useState } from "react";
import {
  Button,
  Collapse,
  Divider,
  Group,
  Paper,
  Select,
  Stack,
  Text,
} from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { HyperparameterView } from "../Hyperparameters/HyperparameterView";
import PlatformList from "../Common/PlatformList";

const Pipelinestep = ({
  step,
  selectedPipelineStep,
  setPipelineStep,
  stepNum,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const onHandleHyperparameterChange = ({ parameter_name, state }) => {
    setPipelineStep({
      ...selectedPipelineStep,
      parameters: selectedPipelineStep.parameters.map((parameter) =>
        parameter.parameter_name === parameter_name
          ? { ...parameter, value: state }
          : parameter
      ),
    });
  };

  const basicParameters = selectedPipelineStep.parameters.filter(
    (parameter) => !parameter.is_advanced
  );
  const advancedParameters = selectedPipelineStep.parameters.filter(
    (parameter) => parameter.is_advanced
  );

  return (
    <div className="training-wizard-step">
      <div className="training-wizard-step-header">
        <Text fw={700} size="xl">
          {stepNum + 1}. {step.name}
        </Text>
        <Text c="dimmed">{step.description}</Text>
      </div>

      <Paper withBorder radius="md" p="lg">
        <Stack gap="md">
          <Select
            label="Method"
            description="Choose the implementation used for this pipeline step"
            value={selectedPipelineStep.name}
            data={step.options.map((option) => option.name)}
            onChange={(name) =>
              setPipelineStep(
                step.options.find((option) => option.name === name)
              )
            }
            allowDeselect={false}
          />
          <div>
            <Text size="sm" fw={600} mb={3}>
              Description
            </Text>
            <Text size="sm" c="dimmed" lh={1.5}>
              {selectedPipelineStep.description}
            </Text>
          </div>
          {selectedPipelineStep.type !== "EVAL" && (
            <Group gap="sm">
              <Text size="sm" fw={600}>
                Platforms
              </Text>
              <PlatformList
                platforms={selectedPipelineStep.platforms}
                size="1.75rem"
                color="black"
              />
            </Group>
          )}
        </Stack>
      </Paper>

      {basicParameters.length > 0 && (
        <Stack gap="sm">
          <div>
            <Text fw={700} size="lg">
              Parameters
            </Text>
            <Text size="sm" c="dimmed">
              Configure the values used during this step.
            </Text>
          </div>
          <HyperparameterView
            handleHyperparameterChange={onHandleHyperparameterChange}
            isAdvanced={false}
            hyperparameters={selectedPipelineStep.parameters}
          />
        </Stack>
      )}

      {advancedParameters.length > 0 && (
        <Stack gap="sm">
          <Divider />
          <Group justify="space-between" align="center">
            <div>
              <Text fw={700}>Advanced parameters</Text>
              <Text size="sm" c="dimmed">
                Leave these unchanged to use the recommended defaults.
              </Text>
            </div>
            <Button
              variant="subtle"
              color="gray"
              size="sm"
              onClick={() => setShowAdvanced((open) => !open)}
              rightSection={
                <FontAwesomeIcon
                  icon={showAdvanced ? faChevronDown : faChevronRight}
                />
              }
            >
              {showAdvanced ? "Hide" : "Show"}
            </Button>
          </Group>
          <Collapse in={showAdvanced}>
            <HyperparameterView
              handleHyperparameterChange={onHandleHyperparameterChange}
              isAdvanced={true}
              hyperparameters={selectedPipelineStep.parameters}
            />
          </Collapse>
        </Stack>
      )}
    </div>
  );
};

export default Pipelinestep;
