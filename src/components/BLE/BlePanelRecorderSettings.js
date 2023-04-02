import React, { useState } from 'react';
import {
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  FormFeedback,
} from 'reactstrap';
import SpinnerButton from '../Common/SpinnerButton';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Checkbox from '../Common/Checkbox';
import './BleActivated.css';

function BlePanelRecorderSettings(props) {
  const [nameError, setNameError] = useState(false);
  const [samplingRateError, setSamplingRateError] = useState(false);
  const [sensorNotSelectedError, setSensorNotSelectedError] = useState(false);
  const [buttonErrorAnimate, setButtonErrorAnimate] = useState(false);

  const onClickRecordButton = (e) => {
    const tmpNameError = props.datasetName === '';
    const tmpSamplingRateError = props.sampleRate <= 0 || props.sampleRate > 50;

    setNameError(tmpNameError);
    setSamplingRateError(tmpSamplingRateError);
    setSensorNotSelectedError(!props.sensorsSelected);

    if (tmpNameError || tmpSamplingRateError || !props.sensorsSelected) {
      setButtonErrorAnimate(true);
      return;
    }
    props.onClickRecordButton(e);
  };

  const buttonColor = ['ready', 'startup'].includes(props.recorderState)
    ? 'primary'
    : 'danger';

  const buttonLoading = ['startup', 'finalizing'].includes(props.recorderState);
  const buttonText =
    props.recorderState === 'ready' ? 'Start recording' : 'Stop recording';
  const buttonLoadingText =
    props.recorderState === 'startup'
      ? 'Starting recording'
      : 'Stopping recording';

  const onDatasetNameChanged = (e) => {
    setNameError(false);
    props.onDatasetNameChanged(e);
  };

  return (
    <div
      className="mr-2"
      style={props.disabled ? { opacity: '0.4', pointerEvents: 'none' } : null}
    >
      <div className="header-wrapper d-flex justify-content-flex-start align-content-center">
        <h4>3. Record dataset</h4>
      </div>
      <div className="body-wrapper p-3">
        <InputGroup>
          <InputGroupAddon addonType="prepend">
            <InputGroupText>{'Dataset name'}</InputGroupText>
          </InputGroupAddon>
          <Input
            invalid={nameError}
            id="bleDatasetName"
            placeholder={'dataset name'}
            onChange={onDatasetNameChanged}
            value={props.datasetName}
            disabled={props.recorderState !== 'ready'}
          />
          <FormFeedback className={classNames({ invalidFeedBack: nameError })}>
            A dataset needs a name
          </FormFeedback>
        </InputGroup>
        {/* TODO reenable this when sample rate issues have been resolved
        <InputGroup>
          <InputGroupAddon addonType="prepend">
            <InputGroupText>{'SampleRate'}</InputGroupText>
          </InputGroupAddon>
          <Input
            invalid={samplingRateError}
            id="bleSampleRate"
            type="number"
            min={1}
            max={50}
            placeholder={'SampleRate'}
            onChange={props.onGlobalSampleRateChanged}
            value={props.sampleRate}
            disabled={props.recorderState !== 'ready'}
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
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <SpinnerButton
            outline
            style={
              buttonErrorAnimate
                ? {
                    animation: 'hzejgT 0.3s ease 0s 1 normal none running',
                  }
                : null
            }
            color={buttonColor}
            spinnercolor={buttonColor}
            onClick={onClickRecordButton}
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
                ? { color: 'red', fontSize: 'smaller' }
                : { display: 'none' }
            }
          >
            Sensors need to be selected
          </div>
          <small>
            <div>
              <div className="d-flex flex-row">
                <Checkbox
                  onClick={props.onToggleStream}
                  className="stream-check"
                  id="stream-check"
                />
                <div className="ml-2">Disable sensor streaming</div>
              </div>
              <div className="d-flex flex-row mt-2">
                <Checkbox
                  onClick={props.onToggleSampleRate}
                  className="sampleRate-check"
                  id="sampleRate-check"
                />
                <div className="ml-2">
                  Show sensor data at full sampling rate
                </div>
              </div>
            </div>
          </small>
        </div>
        {props.fullSampleRate ? (
          <small className="text-danger">
            <strong>Warning: </strong>
            Showing sensor data at full sample rate can affect performance.
          </small>
        ) : null}
      </div>
    </div>
  );
}

BlePanelRecorderSettings.defaultProps = {
  disabled: false,
};

BlePanelRecorderSettings.propTypes = {
  recorderState: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.oneOf(['ready', 'startup', 'recording', 'finalizing']),
  ]),
};

export default BlePanelRecorderSettings;
