import {
  Alert,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
} from 'reactstrap';
import React from 'react';
import { mobileAndTabletCheck } from '../../services/helpers';
import {
  StartStopButton,
  any,
  starting,
  recording,
  stopping,
} from './StartStopButton';

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
    <StartStopButton
      selectedSensors={selectedSensors}
      datasetName={datasetName}
      recorderState={recorderState}
      onClickRecordButton={onClickRecordButton}
    />
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
        <h5>Warnings and Errors</h5>
        {Object.entries(errors).map(([comp, { error, isWarning }]) => (
          <Alert color={isWarning ? 'warning' : 'danger'}>
            <strong>{comp}</strong>: {error}
          </Alert>
        ))}
      </React.Fragment>
    ) : null}
  </React.Fragment>
);
