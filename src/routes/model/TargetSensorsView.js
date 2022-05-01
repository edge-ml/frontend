import React from 'react';

import Loader from '../../modules/loader';

export const TargetSensorsView = ({
  sensorStreams,
  changeSelectedSensorStreams
}) => {
  return (
    <div className="card h-100" style={{ border: '0px solid white' }}>
      <div className="card-body h-100 d-flex flex-column align-items-start flex-column justify-content-between">
        <div>
          <h4>Target Sensor Streams</h4>
        </div>
        <Loader loading={!sensorStreams}>
          <fieldset>
            {sensorStreams && sensorStreams.length
              ? sensorStreams.map(x => {
                  return (
                    <div className="d-flex flex-row align-items-center mt-2">
                      <input
                        id={x}
                        type="checkbox"
                        onClick={y => {
                          changeSelectedSensorStreams(x);
                        }}
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
            Datasets that do not have all selected sensor streams will be
            dropped.
          </small>
        </div>
      </div>
    </div>
  );
};
