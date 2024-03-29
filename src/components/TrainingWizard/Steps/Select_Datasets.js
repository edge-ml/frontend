import { useEffect, useState, Fragment } from 'react';
import { getDatasets } from '../../../services/ApiServices/DatasetServices';
import Checkbox from '../../Common/Checkbox';
import classNames from 'classnames';
import { Badge, Button, ModalBody, ModalFooter } from 'reactstrap';
import { unixTimeToString } from '../../../services/helpers';
import {
  EdgeMLTable,
  EdgeMLTableBody,
  EdgeMLTableHeader,
} from '../../Common/EdgeMLTable';

const Wizard_SelectDataset = ({
  datasets,
  selectedLabeling,
  toggleSelectDataset,
  onNext,
  onBack,
  footer,
}) => {
  const checkUsable = (dataset) => {
    return (
      selectedLabeling &&
      dataset.labelings.filter((elm) => elm.labelingId === selectedLabeling._id)
        .length <= 0
    );
  };

  const minSamplingRate = Math.min(
    ...datasets
      .filter((elm) => elm.selected)
      .map((elm) => elm.timeSeries)
      .flat()
      .map((elm) => elm.samplingRate.mean)
  );

  return (
    <Fragment>
      <h3>2. Select datasets</h3>
      <div>
        {datasets
          .filter((elm) => !checkUsable(elm))
          .map((dataset) => {
            return (
              <div
                className={classNames('datasetRow', {
                  disabled: checkUsable(dataset),
                })}
              >
                <Checkbox
                  isSelected={dataset.selected}
                  onClick={() => toggleSelectDataset(dataset._id)}
                ></Checkbox>
                <div className="datasetName">{dataset.name}</div>
                <div>
                  {dataset.timeSeries.map((ts) => (
                    <Badge>
                      {ts.name}, {ts.length},{' '}
                      {unixTimeToString(ts.end - ts.start)}{' '}
                      {Math.round(ts.samplingRate.mean * 100) / 100},{' '}
                      {Math.round(ts.samplingRate.var * 100) / 100}
                    </Badge>
                  ))}
                </div>
              </div>
            );
          })}
      </div>
      {datasets.filter((elm) => elm.selected).length ? (
        <div>
          <h3>2. Select datasets</h3>
          <div>
            <EdgeMLTable>
              <EdgeMLTableHeader>
                <h4>
                  <b>Dataset</b>
                </h4>
              </EdgeMLTableHeader>
              <EdgeMLTableBody>
                {datasets
                  .filter((elm) => !checkUsable(elm))
                  .map((dataset) => {
                    return (
                      <div
                        className={classNames('datasetRow d-flex', {
                          disabled: checkUsable(dataset),
                        })}
                      >
                        <Checkbox
                          isSelected={dataset.selected}
                          onClick={() => toggleSelectDataset(dataset._id)}
                        ></Checkbox>
                        <div className="datasetName">{dataset.name}</div>
                        <div>
                          {dataset.timeSeries.map((ts) => (
                            // <Badge>
                            //   {ts.name}, {ts.length},{' '}
                            //   {unixTimeToString(ts.end - ts.start)}{' '}
                            //   {Math.round(ts.samplingRate.mean * 100) / 100},{' '}
                            //   {Math.round(ts.samplingRate.var * 100) / 100}
                            // </Badge>
                            <Badge>{`${ts.name} (${
                              Math.round(ts.samplingRate.mean * 100) / 100
                            })`}</Badge>
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </EdgeMLTableBody>
            </EdgeMLTable>
          </div>
          {datasets.filter((elm) => elm.selected).length ? (
            <div>
              For training, all time-series will be downsampled to{' '}
              {Math.round(minSamplingRate * 100) / 100}
            </div>
          ) : null}
        </div>
      ) : null}
    </Fragment>
  );
};

export default Wizard_SelectDataset;
