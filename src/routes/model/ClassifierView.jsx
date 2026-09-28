import React from "react";
import Select from "react-select";

import { Button, TextInput, Card } from "@mantine/core";

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
    <Card shadow="sm" padding="md" radius="md" withBorder>
      <Card.Section
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          width: "100%",
          padding: "1rem",
        }}
      >
        <h4 style={{ marginRight: "0.5rem" }}>Classifier</h4>
        <Select
          options={models.map((m) => {
            return { value: m.id, label: m.name };
          })}
          value={modelSelection}
          onChange={changeModelSelection}
          isSearchable={false}
        />
      </Card.Section>
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          padding: "1rem",
        }}
      >
        <TextInput
          label="Model Name"
          value={modelName}
          onChange={changeModelName}
          error={!modelName ? "Model name is required" : undefined}
          style={{ maxWidth: "350px" }}
        />
        <h6 style={{ marginTop: "1rem" }}>Hyperparameters</h6>
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
        >
          <div>
            <span style={{ marginRight: "0.25rem" }}>Train Model</span>
            <FontAwesomeIcon
              icon={requestInProgress ? faSpinner : faCheck}
              pulse={requestInProgress}
            />
          </div>
        </Button>
      </div>
    </Card>
  );
};
