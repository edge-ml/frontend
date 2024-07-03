import React, { useState } from "react";
import { Input, InputGroup, InputGroupText } from "reactstrap";
import SpinnerButton from "../Common/SpinnerButton";
import PropTypes from "prop-types";
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
  onGlobalSampleRateChanged,
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
    <div
      className="m-2"
      style={disabled ? { opacity: "0.4", pointerEvents: "none" } : null}
    >
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
              sensorNotSelectedError
                ? { color: "red", fontSize: "smaller" }
                : { display: "none" }
            }
          >
            Sensors need to be selected
          </div>
          <small>
            <div>
              <div className="d-flex flex-row">
                <Checkbox
                  onClick={onToggleStream}
                  className="stream-check"
                  id="stream-check"
                />
                <div className="ms-2">Disable sensor streaming</div>
              </div>
              <div className="d-flex flex-row mt-2">
                <Checkbox
                  onClick={onToggleSampleRate}
                  className="sampleRate-check"
                  id="sampleRate-check"
                />
                <div className="ms-2">
                  Show sensor data at full sampling rate
                </div>
              </div>
            </div>
          </small>
        </div>
        {fullSampleRate ? (
          <small className="text-danger">
            <strong>Warning: </strong>
            Showing sensor data at full sample rate can affect performance.
          </small>
        ) : null}
      </div>
    </div>
  );
}

BlePanelRecorderSettings.propTypes = {
  recorderState: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.oneOf(["ready", "startup", "recording", "finalizing"]),
  ]),
  disabled: PropTypes.bool,
  sampleRate: PropTypes.number,
  sensorsSelected: PropTypes.bool,
  onClickRecordButton: PropTypes.func.isRequired,
  onDatasetNameChanged: PropTypes.func.isRequired,
  datasetName: PropTypes.string.isRequired,
  onGlobalSampleRateChanged: PropTypes.func,
  onToggleStream: PropTypes.func,
  onToggleSampleRate: PropTypes.func,
  fullSampleRate: PropTypes.bool,
};

export default BlePanelRecorderSettings;
