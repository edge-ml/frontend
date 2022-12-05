import React from 'react';
import SpinnerButton from '../../components/Common/SpinnerButton';

// const all = (...fns) => (...params) => fns.reduce((acc, cur) => acc && cur(...params), true)
export const any =
  (...fns) =>
  (...params) =>
    fns.reduce((acc, cur) => acc || cur(...params), false);
const equal = (str) => (b) => b === str;

export const recording = equal('recording');
export const ready = equal('ready');
export const starting = equal('starting');
export const stopping = equal('stopping');

const primaryColor = any(ready);
const spin = any(starting, stopping);
export const negativeState = any(recording, stopping);
const disabledButton = any(starting, stopping);

export const StartStopButton = ({
  recorderState,
  onClickRecordButton,
  datasetName,
  selectedSensors,
  stoppingText = 'Stopping recording',
  stopText = 'Stop recording',
  startingText = 'Starting recording',
  startText = 'Start recording',
  ...rest
}) => (
  <SpinnerButton
    {...rest}
    color={primaryColor(recorderState) ? 'primary' : 'danger'}
    onClick={onClickRecordButton}
    loading={spin(recorderState)}
    loadingtext={negativeState(recorderState) ? stoppingText : startingText}
    disabled={
      disabledButton(recorderState) ||
      datasetName === '' ||
      selectedSensors.length === 0
    }
  >
    {negativeState(recorderState) ? stopText : startText}
  </SpinnerButton>
);
