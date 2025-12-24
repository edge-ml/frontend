import React from "react";
import {
  Button,
  Card,
  Group,
  Select,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";

import { faCheck, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AdvancedHyperparameters } from "./AdvancedHyperparameters";

import { HyperparameterView } from "./HyperparameterView";

export const ClassifierView = ({
  models,
  modelSelection,
  changeModelSelection,
  modelName,
  changeModelName,
  hyperparameters,
  selectedModelId,
  handleHyperparameterChange,
  handleTrainButton,
  project,
  showAdvanced,
  toggleShowAdvanced,
  requestInProgress,
}) => {
  return (
    <Card>
      <Group justify="space-between" align="center">
        <Text fw={700} size="lg">
          Classifier
        </Text>
        <Select
          data={models.map((m) => ({ value: m.id, label: m.name }))}
          value={modelSelection?.value ?? null}
          onChange={(value) =>
            changeModelSelection(
              models
                .map((m) => ({ value: m.id, label: m.name }))
                .find((m) => String(m.value) === String(value))
            )
          }
          searchable={false}
        />
      </Group>
      <Stack align="flex-start" justify="space-between" mt="sm">
        <TextInput
          label="Model Name"
          value={modelName}
          onChange={changeModelName}
          error={!modelName ? "Model name cannot be blank" : null}
          style={{ maxWidth: "350px" }}
        />
        <Text fw={600} mt="sm">
          Hyperparameters
        </Text>
        <HyperparameterView
          model={models.find((m) => m.id === parseInt(selectedModelId, 10))}
          hyperparameters={hyperparameters}
          handleHyperparameterChange={handleHyperparameterChange}
          isAdvanced={false}
        />
        <AdvancedHyperparameters
          showAdvanced={showAdvanced}
          toggleShowAdvanced={toggleShowAdvanced}
          model={models.find((m) => m.id === parseInt(selectedModelId, 10))}
          hyperparameters={hyperparameters}
          handleHyperparameterChange={handleHyperparameterChange}
        />
        <Button
          disabled={!modelName || requestInProgress}
          onClick={handleTrainButton}
          project={project}
        >
          <Group gap={6}>
            <Text size="sm">Train Model</Text>
            <FontAwesomeIcon
              icon={requestInProgress ? faSpinner : faCheck}
              pulse={requestInProgress}
            />
          </Group>
        </Button>
      </Stack>
    </Card>
  );
};
