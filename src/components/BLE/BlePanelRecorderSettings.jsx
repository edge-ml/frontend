import React, { useState } from "react";
import { Alert, Checkbox, Group, Stack, Text, TextInput } from "@mantine/core";
import {
  IconAlertCircle,
  IconPlayerRecordFilled,
  IconPlayerStopFilled,
} from "@tabler/icons-react";
import SpinnerButton from "../Common/SpinnerButton";
import "./BleActivated.css";

const BlePanelRecorderSettings = ({
  recorderState = "ready",
  sensorsSelected,
  onClickRecordButton,
  onDatasetNameChanged,
  datasetName,
  onToggleStream,
  onToggleSampleRate,
  stream,
  fullSampleRate,
  recordingError,
}) => {
  const [validationError, setValidationError] = useState("");
  const isReady = recorderState === "ready";
  const isRecording = recorderState === "recording";
  const isChanging = ["startup", "finalizing"].includes(recorderState);

  const handleRecordClick = (event) => {
    if (isReady && !sensorsSelected) {
      setValidationError("Select at least one sensor before recording.");
      return;
    }
    setValidationError("");
    onClickRecordButton(event);
  };

  return (
    <Stack gap="md">
      <TextInput
        label="Dataset name"
        description="Leave empty to generate a name automatically."
        id="bleDatasetName"
        placeholder="e.g. walking-session-01"
        onChange={onDatasetNameChanged}
        value={datasetName}
        disabled={!isReady}
      />

      <Stack gap="xs">
        <Checkbox
          checked={stream}
          onChange={onToggleStream}
          disabled={!isReady}
          label="Show a live sensor preview"
          description="Recording continues even when the preview is hidden."
        />
        <Checkbox
          checked={fullSampleRate}
          onChange={onToggleSampleRate}
          disabled={!isReady || !stream}
          label="Render every sample"
          description="Use only when you need full visual fidelity; it can reduce performance."
        />
      </Stack>

      {(validationError || recordingError) && (
        <Alert color="red" variant="light" icon={<IconAlertCircle size={17} />}>
          {validationError || recordingError}
        </Alert>
      )}

      <Group justify="space-between" align="center" mt="xs">
        <Text size="sm" c="dimmed">
          {isRecording
            ? "Data is being saved continuously."
            : `${sensorsSelected ? "Sensors configured" : "No sensors selected"}`}
        </Text>
        <SpinnerButton
          className="ble-record-button"
          variant="outline"
          color={isRecording ? "red" : "blue"}
          onClick={handleRecordClick}
          loading={isChanging}
          loadingtext={
            recorderState === "startup" ? "Starting" : "Saving dataset"
          }
          leftSection={
            isRecording ? (
              <IconPlayerStopFilled size={17} />
            ) : (
              <IconPlayerRecordFilled size={17} />
            )
          }
        >
          {isRecording ? "Stop & save" : "Start recording"}
        </SpinnerButton>
      </Group>
    </Stack>
  );
};

export default BlePanelRecorderSettings;
