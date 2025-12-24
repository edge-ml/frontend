import { Alert, Divider, Stack, Text, TextInput } from "@mantine/core";
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
  recorderState, // ready, starting, recording, stopping
  datasetName,
  onClickRecordButton = () => {},
  onDatasetNameChanged = () => {},
  errors = {},
  selectedSensors,
}) => (
  <Stack gap="sm">
    <TextInput
      id="datasetName"
      label="Dataset name"
      placeholder="dataset name"
      onChange={(e) => onDatasetNameChanged(e.target.value)}
      value={datasetName}
      disabled={disabledForm(recorderState)}
    />
    <Divider />
    <StartStopButton
      outline
      selectedSensors={selectedSensors}
      datasetName={datasetName}
      recorderState={recorderState}
      onClickRecordButton={onClickRecordButton}
    />
    {mobileAndTabletCheck() ? null : (
      <Text size="xs" ml="sm">
        <Text component="span" fw={700} fs="italic">
          Note:
        </Text>{" "}
        Not running on a mobile browser. You may want to visit this page on your
        phone or tablet.
      </Text>
    )}
    {Object.keys(errors).length !== 0 ? (
      <>
        <Divider />
        <Text fw={700}>Warnings and Errors</Text>
        {Object.entries(errors).map(([comp, { error, isWarning }]) => (
          <Alert key={comp} color={isWarning ? "yellow" : "red"}>
            <Text fw={700} component="span">
              {comp}
            </Text>
            : {error}
          </Alert>
        ))}
      </>
    ) : null}
  </Stack>
);
