import React from 'react';

import { Card, CardBody, CardHeader } from 'reactstrap';

import Loader from '../../modules/loader';

export const TargetSensorsView = ({
  sensorStreams,
  selectedSensorStreams,
  toggleSelectedSensorStreams,
  changeAllSelectedSensorStreams,
}) => {
  return (
    <Card className="text-left">
      <CardHeader>
        <h4>Target Sensor Streams</h4>
      </CardHeader>
      <CardBody className="d-flex flex-column align-items-start flex-column justify-content-between">
        <Loader loading={!sensorStreams}>
          {sensorStreams && sensorStreams.length > 0 && (
            <fieldset>
              <input
                id="select-all"
                type="checkbox"
                onClick={(y) => {
                  changeAllSelectedSensorStreams(
                    !sensorStreams ||
                      !sensorStreams.every((x) =>
                        selectedSensorStreams.includes(x)
                      )
                  );
                }}
                checked={
                  sensorStreams &&
                  sensorStreams.length &&
                  sensorStreams.every((x) => selectedSensorStreams.includes(x))
                }
              ></input>
              <label className="mb-0 ml-1 font-italic" for="select-all">
                Select All
              </label>
            </fieldset>
          )}
          <fieldset>
            {sensorStreams && sensorStreams.length
              ? sensorStreams.map((x) => {
                  return (
                    <div className="d-flex flex-row align-items-center mt-2">
                      <input
                        id={x}
                        type="checkbox"
                        onClick={(y) => {
                          toggleSelectedSensorStreams(x);
                        }}
                        checked={selectedSensorStreams.includes(x)}
                      ></input>
                      <label className="mb-0 ml-1" for={x}>
                        {x}
                      </label>
                    </div>
                  );
                })
              : 'There are no sensor streams defined'}
          </fieldset>
        </Loader>
        <div className="mt-3 text-left">
          <small>
            <b>
              <i>Note:</i>
            </b>{' '}
            Datasets that do not have all selected sensor streams or the target
            labeling will be dropped.
          </small>
        </div>
      </CardBody>
    </Card>
  );
};
