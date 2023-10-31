import { useEffect, useState, Fragment } from 'react';
import { getDatasets } from '../../../services/ApiServices/DatasetServices';
import Checkbox from '../../Common/Checkbox';
import classNames from 'classnames';
import {
  Badge,
  Button,
  ModalBody,
  ModalFooter,
  Table,
  Row,
  Col,
} from 'reactstrap';
import {
  unixTimeToString,
  humanDuration,
  intersect,
} from '../../../services/helpers';
import {
  EdgeMLTable,
  EdgeMLTableEntry,
  EdgeMLTableHeader,
} from '../../Common/EdgeMLTable';

const Wizard_SelectDataset = ({
  datasets,
  selectedLabeling,
  toggleSelectDataset,
  toggleDisableTimeseries,
  disabledTimeseriesNames,
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

  const minSamplingRate = Math.max(
    ...datasets
      .filter((elm) => elm.selected)
      .map((elm) =>
        elm.timeSeries.filter(
          (ts) => !disabledTimeseriesNames.includes(ts.name)
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

  const allDuplTimeseries = datasets
    .filter((e) => e.selected)
    .map((ds) => ds.timeSeries)
    .flat();
  const selectedIntersectionNames = intersect(
    ...datasets
      .filter((e) => e.selected)
      .map((e) => e.timeSeries.map((t) => t.name))
  );

  const selectedDatasetTimeseriesNames = [
    ...new Set(allDuplTimeseries.map(({ name }) => name)),
  ].map((name) => {
    return {
      name,
      disabled: disabledTimeseriesNames.includes(name),
      inIntersection: selectedIntersectionNames.includes(name),
    };
  });

  const intersectingTSNames = selectedDatasetTimeseriesNames.filter(
    (tno) => tno.inIntersection
  );
  const nonintersectingTSNames = selectedDatasetTimeseriesNames.filter(
    (tno) => !tno.inIntersection
  );

  return (
    <div className="p-2">
      <h3 className="font-weight-bold">2. Select datasets</h3>
      <Row className="mx-0">
        <Col>
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
                  </EdgeMLTableEntry>
                );
              })}
          </EdgeMLTable>
        </Col>
        <Col className="pt-3">
          {datasets.filter((elm) => elm.selected).length ? (
            <Fragment>
              <h5 className="font-weight-bold">Selected Timeseries</h5>
              <div style={{ overflow: 'auto' }}>
                {intersectingTSNames.length > 0 ? (
                  intersectingTSNames.map((tsNameObj) => (
                    <Badge
                      onClick={() => toggleDisableTimeseries(tsNameObj.name)}
                      style={{
                        ...(tsNameObj.disabled
                          ? { textDecoration: 'line-through' }
                          : {}),
                        userSelect: 'none',
                      }}
                      {...(tsNameObj.disabled ? { color: 'light' } : {})}
                    >
                      {`${tsNameObj.name}`}
                    </Badge>
                  ))
                ) : (
                  <div className="my-2">
                    Selected datasets do not have any timeseries in common.
                  </div>
                )}
                {intersectingTSNames.length !==
                selectedDatasetTimeseriesNames.length ? (
                  <Fragment>
                    <div className="my-2">
                      Following timeseries were filtered because they are
                      missing from at least one dataset.
                    </div>
                    {nonintersectingTSNames.map((tsNameObj) => (
                      <Badge
                        style={{
                          textDecoration: 'line-through',
                          userSelect: 'none',
                        }}
                        color="light"
                      >
                        {`${tsNameObj.name}`}
                      </Badge>
                    ))}
                  </Fragment>
                ) : null}
              </div>
              <div className="my-2">
                For training, all time-series will be downsampled to{' '}
                {Math.round(1000 / minSamplingRate)} Hz
              </div>
              <h5 className="font-weight-bold mt-4">Covered Labels</h5>
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
                    .filter(
                      (l) => !selectedLabeling.disabledLabels.includes(l._id)
                    )
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
                          {humanDuration(
                            coveredLabels[label._id]?.duration ?? 0
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            </Fragment>
          ) : null}
        </Col>
      </Row>
    </div>
  );
};

Wizard_SelectDataset.validate = ({
  datasets,
  selectedLabeling,
  zeroClass,
  disabledTimeseriesNames,
}) => {
  const selDS = datasets.filter((elm) => elm.selected);

  if (selDS.length === 0) {
    return 'You need to select at least one dataset';
  }

  const coveredLabels = selDS
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

  const coveredCount = Object.values(coveredLabels).filter(
    (elm) =>
      !selectedLabeling.disabledLabels.includes(elm.type) && elm.count > 0
  ).length;

  if (coveredCount < 1) {
    return 'Selected datasets do not contain any labels';
  }

  if (coveredCount === 1 && !zeroClass) {
    return 'Selected datasets contain only one label. At least two labels are needed with zero class disabled';
  }

  const allDuplTimeseries = selDS.map((ds) => ds.timeSeries).flat();
  const selectedIntersectionNames = intersect(
    ...datasets
      .filter((e) => e.selected)
      .map((e) => e.timeSeries.map((t) => t.name))
  );

  const selectedDatasetTimeseriesNames = [
    ...new Set(allDuplTimeseries.map(({ name }) => name)),
  ].map((name) => {
    return {
      name,
      disabled: disabledTimeseriesNames.includes(name),
      inIntersection: selectedIntersectionNames.includes(name),
    };
  });

  const intersectingTSNames = selectedDatasetTimeseriesNames.filter(
    (tno) => tno.inIntersection
  );

  if (intersectingTSNames.length === 0)
    return 'Selected datasets do not have any timeseries in common';
  if (intersectingTSNames.filter((tno) => !tno.disabled).length === 0)
    return 'At least one timeseries should remain enabled';
};

export default Wizard_SelectDataset;
