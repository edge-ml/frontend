import { Alert, TextInput } from "@mantine/core";
import React from "react";
import { mobileAndTabletCheck } from "../../services/helpers";
import {
  StartStopButton,
  any,
  starting,
  recording,
  stopping,
} from "./StartStopButton";

const disabledForm = any(starting, recording, stopping);

export const RecorderSettings = ({
  recorderState,
  datasetName,
  onClickRecordButton = () => {},
  onDatasetNameChanged = () => {},
  errors = {},
  selectedSensors,
}) => (
  <>
    <TextInput
      label="Dataset name"
      placeholder="dataset name"
      onChange={(e) => onDatasetNameChanged(e.target.value)}
      value={datasetName}
      disabled={disabledForm(recorderState)}
    />
    <hr />
    <StartStopButton
      variant="outline"
      selectedSensors={selectedSensors}
      datasetName={datasetName}
      recorderState={recorderState}
      onClickRecordButton={onClickRecordButton}
    />
    {mobileAndTabletCheck() ? null : (
      <Text size="sm" c="dimmed" ml={12}>
        <Text component="span" fw={700}>
          Note:
        </Text>{" "}
        Not running on a mobile browser. You may want to visit this page on your
        phone or tablet.
      </Text>
    )}
    {Object.keys(errors).length !== 0 ? (
      <>
        <hr />
        <h5>Warnings and Errors</h5>
        {Object.entries(errors).map(([comp, { error, isWarning }]) => (
          <Alert color={isWarning ? "yellow" : "red"}>
            <strong>{comp}</strong>: {error}
          </Alert>
        ))}
      </>
    ) : null}
  </>
);
