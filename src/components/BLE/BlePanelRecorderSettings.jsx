import React, { useState } from "react";
import { Box, Group, Stack, Text, TextInput } from "@mantine/core";
import SpinnerButton from "../Common/SpinnerButton";
import classNames from "classnames";
import Checkbox from "../Common/Checkbox";
import "./BleActivated.css";

function BlePanelRecorderSettings({
  recorderState = "ready",
  disabled = false,
  sampleRate,
  sensorsSelected,
  onClickRecordButton,
  onDatasetNameChanged,
  datasetName,
  onToggleStream,
  onToggleSampleRate,
  fullSampleRate,
}) {
  const [samplingRateError, setSamplingRateError] = useState(false);
  const [sensorNotSelectedError, setSensorNotSelectedError] = useState(false);
  const [buttonErrorAnimate, setButtonErrorAnimate] = useState(false);

  const handleClickRecordButton = (e) => {
    const tmpSamplingRateError = sampleRate <= 0 || sampleRate > 50;

    setSamplingRateError(tmpSamplingRateError);
    setSensorNotSelectedError(!sensorsSelected);

    if (tmpSamplingRateError || !sensorsSelected) {
      setButtonErrorAnimate(true);
      return;
    }
    onClickRecordButton(e);
  };

  const buttonColor = ["ready", "startup"].includes(recorderState)
    ? "primary"
    : "danger";

  const buttonLoading = ["startup", "finalizing"].includes(recorderState);
  const buttonText =
    recorderState === "ready" ? "Start recording" : "Stop recording";
  const buttonLoadingText =
    recorderState === "startup" ? "Starting recording" : "Stopping recording";

  const handleDatasetNameChanged = (e) => {
    onDatasetNameChanged(e);
  };

  return (
    <Box
      m="sm"
      style={disabled ? { opacity: "0.4", pointerEvents: "none" } : null}
    >
      <Box className="header-wrapper">
        <Text fw={700} size="lg">
          3. Record dataset
        </Text>
      </Box>
      <Box className="body-wrapper" p="md">
        <TextInput
          id="bleDatasetName"
          label="Dataset name"
          placeholder="dataset name"
          onChange={handleDatasetNameChanged}
          value={datasetName}
          disabled={recorderState !== "ready"}
        />
        {/* TODO reenable this when sample rate issues have been resolved
        <InputGroup>
          <InputGroupText>
            <InputGroupText>{'SampleRate'}</InputGroupText>
          </InputGroupText>
          <Input
            invalid={samplingRateError}
            id="bleSampleRate"
            type="number"
            min={1}
            max={50}
            placeholder={'SampleRate'}
            onChange={onGlobalSampleRateChanged}
            value={sampleRate}
            disabled={recorderState !== 'ready'}
          />
          <FormFeedback
            className={classNames({ invalidFeedBack: samplingRateError })}
          >
            Samplerate must be between 0 and 50
          </FormFeedback>
        </InputGroup>*/}
        <Box mt="md">
          <Group justify="space-between" align="center">
          <SpinnerButton
            outline
            style={
              buttonErrorAnimate
                ? {
                    marginRight: "0.5rem",
                    animation: "hzejgT 0.3s ease 0s 1 normal none running",
                  }
                : { marginRight: "0.5rem" }
            }
            color={buttonColor}
            spinnercolor={buttonColor}
            onClick={handleClickRecordButton}
            loading={buttonLoading}
            loadingtext={buttonLoadingText}
            disabled={buttonLoading}
            onAnimationEnd={() => {
              setButtonErrorAnimate(false);
            }}
          >
            {buttonText}
          </SpinnerButton>
          <Text
            style={
              sensorNotSelectedError
                ? { color: "red", fontSize: "smaller" }
                : { display: "none" }
            }
          >
            Sensors need to be selected
          </Text>
          <Stack gap="xs">
            <Group align="center">
              <Checkbox
                onClick={onToggleStream}
                className="stream-check"
                id="stream-check"
              />
              <Text size="xs" ml="sm">
                Disable sensor streaming
              </Text>
            </Group>
            <Group align="center">
              <Checkbox
                onClick={onToggleSampleRate}
                className="sampleRate-check"
                id="sampleRate-check"
              />
              <Text size="xs" ml="sm">
                Show sensor data at full sampling rate
              </Text>
            </Group>
          </Stack>
        </Group>
        </Box>
        {fullSampleRate ? (
          <Text size="xs" c="red" mt="sm">
            <Text component="span" fw={700}>
              Warning:
            </Text>{" "}
            Showing sensor data at full sample rate can affect performance.
          </Text>
        ) : null}
      </Box>
    </Box>
  );
}

export default BlePanelRecorderSettings;
