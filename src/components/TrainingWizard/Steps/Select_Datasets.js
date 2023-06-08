import { useEffect, useState, Fragment } from 'react';
import { getDatasets } from '../../../services/ApiServices/DatasetServices';
import Checkbox from '../../Common/Checkbox';
import classNames from 'classnames';
import { Badge, Button, ModalBody, ModalFooter, Table } from 'reactstrap';
import { unixTimeToString, humanDuration } from '../../../services/helpers';
import {
  EdgeMLTable,
  EdgeMLTableEntry,
  EdgeMLTableHeader,
} from '../../Common/EdgeMLTable';

const Wizard_SelectDataset = ({
  datasets,
  selectedLabeling,
  toggleSelectDataset,
  toggleDatasetDisableTimeseries,
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
      .map((elm) =>
        elm.timeSeries.filter(
          (ts) => !elm.disabledTimeseriesIDs.includes(ts._id)
        )
      )
      .flat()
      .map((elm) => elm.samplingRate.mean)
  );

  const coveredLabels = datasets
    .filter((elm) => elm.selected)
    .map((e) =>
      e.labelings.find((ls) => ls.labelingId === selectedLabeling._id)
    )
    .filter((x) => x)
    .map((ls) => ls.labels)
    .flat()
    .reduce((acc, cur) => {
      acc[cur.type] = acc[cur.type] ?? {
        count: 0,
        duration: 0,
        type: cur.type,
      };
      acc[cur.type].count += 1;
      acc[cur.type].duration += cur.end - cur.start;
      return acc;
    }, {});

  // const unionTimeseriesIDs = [...new Set(allDuplTimeseries.map(({name}) => name))]
  // const intersectTimeseriesIDs = intersect(unionTimeseriesIDs, ...selectedTimeseries.map(({name}) => name))
  // const unionTimeseries = unionTimeseriesIDs.map(name => allDuplTimeseries.find(ts => ts.name === name));
  return (
    <Fragment>
      <h3 className="font-weight-bold">2. Select datasets</h3>
      <EdgeMLTable>
        <EdgeMLTableHeader>
          <h4>
            <b>Datasets</b>
          </h4>
        </EdgeMLTableHeader>
        {datasets
          .filter((elm) => !checkUsable(elm))
          .map((dataset) => {
            return (
              <EdgeMLTableEntry
                className={classNames('datasetRow', {
                  disabled: checkUsable(dataset),
                })}
              >
                <Checkbox
                  isSelected={dataset.selected}
                  onClick={() => toggleSelectDataset(dataset._id)}
                ></Checkbox>
                <div className="datasetName">{dataset.name}</div>
                <div style={{ overflow: 'auto' }}>
                  {dataset.timeSeries.map((ts) => (
                    <Badge
                      onClick={() =>
                        toggleDatasetDisableTimeseries(ts._id, dataset._id)
                      }
                      style={{
                        ...(dataset.disabledTimeseriesIDs.includes(ts._id)
                          ? { textDecoration: 'line-through' }
                          : {}),
                        userSelect: 'none',
                      }}
                      {...(dataset.disabledTimeseriesIDs.includes(ts._id)
                        ? { color: 'light' }
                        : {})}
                    >
                      {`${ts.name} (${
                        Math.round(ts.samplingRate.mean * 100) / 100
                      } Hz)`}
                    </Badge>
                  ))}
                </div>
              </EdgeMLTableEntry>
            );
          })}
      </EdgeMLTable>

      {datasets.filter((elm) => elm.selected).length ? (
        <Fragment>
          <div className="m-2">
            For training, all time-series will be downsampled to{' '}
            {Math.round(minSamplingRate * 100) / 100}
          </div>
          <h5 className="font-weight-bold">Covered Labels</h5>
          <Table size="sm" borderless style={{ width: 'unset' }}>
            <thead>
              <tr>
                <th scope="col"></th>
                <th scope="col">Count</th>
                <th scope="col">Duration</th>
              </tr>
            </thead>
            <tbody>
              {selectedLabeling.labels
                .filter((l) => !selectedLabeling.disabledLabels.includes(l._id))
                .map((label) => (
                  <tr>
                    <th scope="row">
                      <Badge
                        className="badge"
                        style={{
                          backgroundColor: label.color,
                          userSelect: 'none',
                        }}
                      >
                        {label.name}
                      </Badge>
                    </th>
                    <td>{coveredLabels[label._id]?.count ?? 0}</td>
                    <td>
                      {humanDuration(coveredLabels[label._id]?.duration ?? 0)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </Table>
        </Fragment>
      ) : null}
    </Fragment>
  );
};

export default Wizard_SelectDataset;
