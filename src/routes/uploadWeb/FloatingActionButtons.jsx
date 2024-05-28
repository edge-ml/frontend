import React, { Fragment } from 'react';
import { StartStopButton, negativeState } from './StartStopButton';

export const FloatingActionButtons = ({
  recorderState,
  onClickRecordButton,
  datasetName,
  selectedSensors,
}) => (
  <Fragment>
    <div className={negativeState(recorderState) ? 'd-block' : 'd-none'}>
      <StartStopButton
        recorderState={recorderState}
        onClickRecordButton={onClickRecordButton}
        datasetName={datasetName}
        selectedSensors={selectedSensors}
        stoppingText="Stopping Recording"
        stopText="Stop Recording"
        startingText="Starting Recording"
        startText="Start Recording"
        className="px-3 py-2"
        style={{ borderRadius: '500px' }} // https://stackoverflow.com/questions/18794947/capsule-shape-using-border-radius-without-a-set-width-or-height
      />
    </div>
  </Fragment>
);
