import React, { useState } from 'react';
import { Input, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import SpinnerButton from '../Common/SpinnerButton';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import './BleActivated.css';

import { Card, CardBody, CardHeader } from 'reactstrap';

function BlePanelRecorderSettings(props) {
  const [samplingRateError, setSamplingRateError] = useState(false);
  const [sensorNotSelectedError, setSensorNotSelectedError] = useState(false);
  const [buttonErrorAnimate, setButtonErrorAnimate] = useState(false);

  const onClickRecordButton = (e) => {
    const tmpSamplingRateError = props.sampleRate <= 0 || props.sampleRate > 50;

    setSamplingRateError(tmpSamplingRateError);
    setSensorNotSelectedError(!props.sensorsSelected);

    if (tmpSamplingRateError || !props.sensorsSelected) {
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
    props.onDatasetNameChanged(e);
  };

  return (
    <Card
      className="text-left"
      style={props.disabled ? { opacity: '0.4', pointerEvents: 'none' } : null}
    >
      <CardHeader>
        <h4>3. Record dataset</h4>
      </CardHeader>
      <CardBody>
        <InputGroup>
          <InputGroupAddon addonType="prepend">
            <InputGroupText>{'Dataset name'}</InputGroupText>
          </InputGroupAddon>
          <Input
            id="bleDatasetName"
            placeholder={'dataset name'}
            onChange={onDatasetNameChanged}
            value={props.datasetName}
            disabled={props.recorderState !== 'ready'}
          />
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
            style={
              buttonErrorAnimate
                ? {
                    animation: 'hzejgT 0.3s ease 0s 1 normal none running',
                  }
                : null
            }
            color={buttonColor}
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
              <div>
                <Input
                  onChange={props.onToggleStream}
                  className="stream-check"
                  type="checkbox"
                  id="stream-check"
                />
                <label htmlFor="stream-check">Disable sensor streaming</label>
              </div>
              <div>
                <Input
                  onChange={props.onToggleSampleRate}
                  className="sampleRate-check"
                  type="checkbox"
                  id="sampleRate-check"
                />
                <label htmlFor="sampleRate-check">
                  Show sensor data at full sampling rate
                </label>
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
      </CardBody>
    </Card>
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
