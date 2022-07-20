import {
  Alert,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
} from 'reactstrap';
import SpinnerButton from '../../components/Common/SpinnerButton';
import React from 'react';
import { mobileAndTabletCheck } from '../../services/helpers';

// const all = (...fns) => (...params) => fns.reduce((acc, cur) => acc && cur(...params), true)
const any =
  (...fns) =>
  (...params) =>
    fns.reduce((acc, cur) => acc || cur(...params), false);
const equal = (str) => (b) => b === str;

const recording = equal('recording');
const ready = equal('ready');
const starting = equal('starting');
const stopping = equal('stopping');

const primaryColor = any(ready);
const spin = any(starting, stopping);
const stopText = any(recording, stopping);
const disabledButton = any(starting, stopping);
const disabledForm = any(starting, recording, stopping);

export const RecorderSettings = ({
  recorderState, // ready, starting, recording, stopping
  datasetName,
  onClickRecordButton = () => {},
  onDatasetNameChanged = () => {},
  errors = {},
  selectedSensors,
}) => (
  <React.Fragment>
    <InputGroup>
      <InputGroupAddon addonType="prepend">
        <InputGroupText>Dataset name</InputGroupText>
      </InputGroupAddon>
      <Input
        id="datasetName"
        placeholder="dataset name"
        onChange={(e) => onDatasetNameChanged(e.target.value)}
        value={datasetName}
        disabled={disabledForm(recorderState)}
      />
    </InputGroup>
    <hr />
    <SpinnerButton
      color={primaryColor(recorderState) ? 'primary' : 'danger'}
      onClick={onClickRecordButton}
      loading={spin(recorderState)}
      loadingtext={
        stopText(recorderState) ? 'Stopping recording' : 'Starting recording'
      }
      disabled={
        disabledButton(recorderState) ||
        datasetName === '' ||
        selectedSensors.length === 0
      }
    >
      {stopText(recorderState) ? 'Stop recording' : 'Start recording'}
    </SpinnerButton>
    {mobileAndTabletCheck() ? null : (
      <small className="ml-3">
        <b>
          <i>Note:</i>
        </b>{' '}
        Not running on a mobile browser. You may want to visit this page on your
        phone or tablet.
      </small>
    )}
    {Object.keys(errors).length !== 0 ? (
      <React.Fragment>
        <hr />
        <h5>Errors</h5>
        {Object.entries(errors).map(([comp, err]) => (
          <Alert color="danger">
            {comp}: {err}
          </Alert>
        ))}
      </React.Fragment>
    ) : null}
  </React.Fragment>
);
