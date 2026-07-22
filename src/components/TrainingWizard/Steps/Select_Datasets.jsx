import React, { Fragment } from "react";
import Checkbox from "../../Common/Checkbox";
import classNames from "classnames";
import { Badge, Table } from "@mantine/core";
import { humanDuration, intersect } from "../../../services/helpers";
import {
  EdgeMLTable,
  EdgeMLTableEntry,
  EdgeMLTableHeader,
} from "../../Common/EdgeMLTable";
import LabelBadge from "../../Common/LabelBadge";

const Wizard_SelectDataset = ({
  datasets,
  selectedLabeling,
  toggleSelectDataset,
  toggleDisableTimeseries,
  disabledTimeseriesNames,
  toggleAllDatasets,
  onNext,
  onBack,
  footer,
  validate,
}) => {
  const checkUsable = (dataset) => {
    return (
      selectedLabeling &&
      dataset.labelings.filter((elm) => elm.labelingId === selectedLabeling._id)
        .length <= 0
    );
  };

  const validateInput = () => {
    validate(selectedLabeling);
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

  const selectedAllActive = datasets
    .filter((elm) => !checkUsable(elm))
    .every((elm) => elm.selected);
  return (
    <div style={{ padding: "0.5rem" }}>
      <h3 style={{ fontWeight: 700 }}>2. Select datasets</h3>
      <div style={{ display: "flex", flexWrap: "wrap", margin: "0 -0.75rem" }}>
        <div style={{ flex: 1, padding: "0 0.75rem" }}>
          <EdgeMLTable>
            <EdgeMLTableHeader>
              <div style={{ display: "flex" }}>
                <Checkbox
                  isSelected={selectedAllActive}
                  onClick={() =>
                    toggleAllDatasets(
                      datasets.filter((elm) => !checkUsable(elm)),
                      !selectedAllActive
                    )
                  }
                />
                <div style={{ marginLeft: "0.5rem", alignSelf: "center" }}>Select all</div>
              </div>
            </EdgeMLTableHeader>
            {datasets
              .filter((elm) => !checkUsable(elm))
              .map((dataset) => {
                return (
                  <EdgeMLTableEntry
                    key={dataset._id}
                    className={classNames("datasetRow", {
                      disabled: checkUsable(dataset),
                    })}
                  >
                    <div style={{ display: "flex", marginRight: "0.5rem" }}>
                      <Checkbox
                        isSelected={dataset.selected}
                        onClick={() => toggleSelectDataset(dataset._id)}
                      />
                    </div>
                    <div className="datasetName">{dataset.name}</div>
                  </EdgeMLTableEntry>
                );
              })}
          </EdgeMLTable>
        </div>
        <div style={{ flex: 1, padding: "0.75rem 0.75rem 0" }}>
          {datasets.filter((elm) => elm.selected).length ? (
            <Fragment>
              <h5 style={{ fontWeight: 700 }}>Selected Timeseries</h5>
              <div style={{ overflow: "auto" }}>
                {intersectingTSNames.length > 0 ? (
                  intersectingTSNames.map((tsNameObj) => (
                    <Badge
                      key={tsNameObj.name}
                      onClick={() => toggleDisableTimeseries(tsNameObj.name)}
                      style={{
                        ...(tsNameObj.disabled
                          ? { textDecoration: "line-through" }
                          : {}),
                        userSelect: "none",
                        cursor: "pointer",
                      }}
                      variant={tsNameObj.disabled ? "outline" : "filled"}
                      color="blue"
                    >
                      {`${tsNameObj.name}`}
                    </Badge>
                  ))
                ) : (
                  <div style={{ margin: "0.5rem 0" }}>
                    Selected datasets do not have any timeseries in common.
                  </div>
                )}
                {intersectingTSNames.length !==
                selectedDatasetTimeseriesNames.length ? (
                  <Fragment>
                    <div style={{ margin: "0.5rem 0" }}>
                      Following timeseries were filtered because they are
                      missing from at least one dataset.
                    </div>
                    {nonintersectingTSNames.map((tsNameObj) => (
                      <Badge
                        key={tsNameObj.name}
                        style={{
                          textDecoration: "line-through",
                          userSelect: "none",
                        }}
                        variant="outline"
                        color="gray"
                      >
                        {`${tsNameObj.name}`}
                      </Badge>
                    ))}
                  </Fragment>
                ) : null}
              </div>
              <div style={{ margin: "0.5rem 0" }}>
                For training, all time-series will be downsampled to{" "}
                {Math.round(1000 / minSamplingRate)} Hz
              </div>
              <h5 style={{ fontWeight: 700, marginTop: "1rem" }}>Covered Labels</h5>
              <Table size="sm" style={{ width: "auto" }}>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th></Table.Th>
                    <Table.Th>Count</Table.Th>
                    <Table.Th>Duration</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {selectedLabeling.labels
                    .filter(
                      (l) => !selectedLabeling.disabledLabels.includes(l._id)
                    )
                    .map((label) => (
                      <Table.Tr key={label._id}>
                        <Table.Th>
                          <LabelBadge className="badge" color={label.color}>
                            {label.name}
                          </LabelBadge>
                        </Table.Th>
                        <Table.Td className="align-middle">
                          {coveredLabels[label._id]?.count ?? 0}
                        </Table.Td>
                        <Table.Td>
                          {humanDuration(
                            coveredLabels[label._id]?.duration ?? 0
                          )}
                        </Table.Td>
                      </Table.Tr>
                    ))}
                </Table.Tbody>
              </Table>
            </Fragment>
          ) : null}
        </div>
      </div>
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
    return "You need to select at least one dataset";
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
    return "Selected datasets do not contain any labels";
  }

  if (coveredCount === 1 && !zeroClass) {
    return "Selected datasets contain only one label. At least two labels are needed with zero class disabled";
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
    return "Selected datasets do not have any timeseries in common";
  if (intersectingTSNames.filter((tno) => !tno.disabled).length === 0)
    return "At least one timeseries should remain enabled";
};

export default Wizard_SelectDataset;
