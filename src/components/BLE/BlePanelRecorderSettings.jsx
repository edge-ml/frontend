import React, { useState } from "react";
import { Input, InputGroup, InputGroupText } from "reactstrap";
import SpinnerButton from "../Common/SpinnerButton";
import "./BleActivated.css";

function BlePanelRecorderSettings({ bleRecorder, bleDeviceHandler }) {
  const [buttonErrorAnimate, setButtonErrorAnimate] = useState(false);

  const {
    onClickRecord,
    recorderState,
    datasetName,
    selectedSensors,
    onDatasetNameChanged,
  } = bleRecorder;

  const handleClickRecordButton = (e) => {
    const sampleRate = 1; // Placeholder, adjust if sampleRate is needed
    const tmpSamplingRateError = sampleRate <= 0 || sampleRate > 50;

    setButtonErrorAnimate(false);

    setButtonErrorAnimate(tmpSamplingRateError || selectedSensors.size === 0);

    if (tmpSamplingRateError || selectedSensors.size === 0) {
      return;
    }
    onClickRecord(e);
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
    <div className="m-2">
      <div className="header-wrapper d-flex justify-content-flex-start align-content-center">
        <h4>3. Record dataset</h4>
      </div>
      <div className="body-wrapper p-3">
        <InputGroup>
          <InputGroupText>{"Dataset name"}</InputGroupText>
          <Input
            id="bleDatasetName"
            placeholder={"dataset name"}
            onChange={handleDatasetNameChanged}
            value={datasetName}
            disabled={recorderState !== "ready"}
          />
        </InputGroup>
        <hr />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <SpinnerButton
            className="me-2"
            outline
            style={
              buttonErrorAnimate
                ? {
                    animation: "hzejgT 0.3s ease 0s 1 normal none running",
                  }
                : null
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
          <div
            style={
              selectedSensors.size === 0
                ? { color: "red", fontSize: "smaller" }
                : { display: "none" }
            }
          >
            Sensors need to be selected
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlePanelRecorderSettings;
