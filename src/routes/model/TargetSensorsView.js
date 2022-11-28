import React from 'react';
import { Badge } from 'reactstrap';

import Loader from '../../modules/loader';

export const TargetSensorsView = ({
  sensorStreams,
  sensorSamplingRates,
  clickSampleRate,
  sensorSelectedMap,
  selectedSensorStreams,
  toggleSelectedSensorStreams,
  changeAllSelectedSensorStreams,
}) => {
  sensorSelectedMap = sensorSelectedMap ? sensorSelectedMap : [];
  const selectedSamplingRates = Object.keys(sensorSelectedMap)
    .map((elm) => sensorSelectedMap[elm])
    .flat();
  return (
    <div className="card h-100" style={{ border: '0px solid white' }}>
      <div className="card-body h-100 d-flex flex-column align-items-start flex-column justify-content-between">
        <div>
          <h4>Target Sensor Streams</h4>
        </div>
        <Loader loading={!sensorStreams}>
          {/* {sensorStreams && sensorStreams.length > 0 && (
            <fieldset>
              <input
                id="select-all"
                type="radio"
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
          )} */}
          <fieldset>
            {sensorStreams && sensorStreams.length
              ? sensorStreams.map((x) => {
                  return (
                    <div className="d-flex flex-row align-items-center mt-2">
                      {/* <input
                        id={x}
                        type="radio"
                        onClick={(y) => {
                          toggleSelectedSensorStreams(x);
                        }}
                        checked={selectedSensorStreams.includes(x)}
                      ></input> */}
                      <label className="mb-0 ml-1" for={x}>
                        {x}
                      </label>
                      <div className="">
                        {sensorSamplingRates[x].map((elm) => (
                          <Badge className="ml-1">
                            {elm + 'Hz'}
                            <input
                              type="checkbox"
                              disabled={
                                !selectedSamplingRates.includes(elm) &&
                                selectedSamplingRates.length > 0
                              }
                              className="ml-1 float-right"
                              onClick={(e) =>
                                clickSampleRate(x, elm, e.target.checked)
                              }
                            ></input>
                          </Badge>
                        ))}
                      </div>
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
      </div>
    </div>
  );
};
