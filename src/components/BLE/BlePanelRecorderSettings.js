import React from 'react';
import {
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Button,
  Spinner
} from 'reactstrap';
import SpinnerButton from '../Common/SpinnerButton';
import PropTypes from 'prop-types';

function BlePanelRecorderSettings(props) {
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

  return (
    <div
      style={props.disabled ? { opacity: '0.4', pointerEvents: 'none' } : null}
    >
      <div className="shadow p-3 mb-5 bg-white rounded">
        <div style={{ fontSize: 'x-large' }}>3. Record dataset</div>
        <div className="panelDivider"></div>
        <InputGroup>
          <InputGroupAddon addonType="prepend">
            <InputGroupText>{'Dataset name'}</InputGroupText>
          </InputGroupAddon>
          <Input
            id="bleDatasetName"
            placeholder={'dataset name'}
            onChange={props.onDatasetNameChanged}
            value={props.datasetName}
            disabled={props.recorderState !== 'ready'}
          />
        </InputGroup>
        <InputGroup>
          <InputGroupAddon addonType="prepend">
            <InputGroupText>{'SampleRate'}</InputGroupText>
          </InputGroupAddon>
          <Input
            id="bleSampleRate"
            placeholder={'SampleRate'}
            onChange={props.onGlobalSampleRateChanged}
            value={props.sampleRate}
            disabled={props.recorderState !== 'ready'}
          />
        </InputGroup>
        <SpinnerButton
          color={buttonColor}
          onClick={props.onClickRecordButton}
          loading={buttonLoading}
          loadingText={buttonLoadingText}
          disabled={buttonLoading}
        >
          {buttonText}
        </SpinnerButton>
      </div>
    </div>
  );
}

BlePanelRecorderSettings.defaultProps = {
  disabled: false
};

BlePanelRecorderSettings.propTypes = {
  recorderState: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.oneOf(['ready', 'startup', 'recording', 'finalizing'])
  ])
};

export default BlePanelRecorderSettings;
