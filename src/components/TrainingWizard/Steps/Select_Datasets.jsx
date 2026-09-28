import React, { Fragment } from "react";
import Checkbox from "../../Common/Checkbox";
import {
  Badge,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import { humanDuration, intersect } from "../../../services/helpers";
import LabelBadge from "../../Common/LabelBadge";

const Wizard_SelectDataset = ({
  datasets,
  selectedLabeling,
  toggleSelectDataset,
  toggleDisableTimeseries,
  disabledTimeseriesNames,
  toggleAllDatasets,
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

  const selectedAllActive = datasets
    .filter((elm) => !checkUsable(elm))
    .every((elm) => elm.selected);

  const usableDatasets = datasets.filter((elm) => !checkUsable(elm));

  return (
    <div className="training-wizard-step">
      <div className="training-wizard-step-header">
        <Text fw={700} size="xl">
          Select datasets
        </Text>
        <Text c="dimmed">
          Select compatible datasets and review the time series and labels that
          will be included in training.
        </Text>
      </div>
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        <div>
          <Table>
            <Table.Thead>
              <Table.Tr
                style={{ borderBottom: "2px solid rgb(230, 230, 234)" }}
              >
                <Table.Th colSpan={2} p={0}>
                  <Group
                    justify="space-between"
                    style={{
                      background: "rgb(249, 251, 252)",
                      padding: "10px",
                    }}
                  >
                    <Group gap="xs" p="xs">
                      <Checkbox
                        isSelected={selectedAllActive}
                        onClick={() =>
                          toggleAllDatasets(usableDatasets, !selectedAllActive)
                        }
                      />
                      <Text size="sm" fw={600}>
                        Select all compatible datasets
                      </Text>
                    </Group>
                  </Group>
                </Table.Th>
              </Table.Tr>
              <Table.Tr>
                <Table.Th w={40}></Table.Th>
                <Table.Th>Dataset</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {usableDatasets.map((dataset) => (
                <Table.Tr key={dataset._id}>
                  <Table.Td>
                    <Checkbox
                      isSelected={dataset.selected}
                      onClick={() => toggleSelectDataset(dataset._id)}
                    />
                  </Table.Td>
                  <Table.Td>
                    <div>
                      <Text fw={700} size="lg" component="span">
                        {dataset.name}
                      </Text>
                    </div>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </div>
        <Paper className="training-wizard-summary">
          {datasets.filter((elm) => elm.selected).length ? (
            <Stack gap="lg">
              <div>
                <Text fw={700} size="lg" mb="xs">
                  Selected time series
                </Text>
                <div className="training-wizard-badges">
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
                    <Text size="sm" c="dimmed">
                      Selected datasets do not have any timeseries in common.
                    </Text>
                  )}
                  {intersectingTSNames.length !==
                  selectedDatasetTimeseriesNames.length ? (
                    <Fragment>
                      <Text size="sm" c="dimmed" mt="sm" mb={6}>
                        Following timeseries were filtered because they are
                        missing from at least one dataset.
                      </Text>
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
              </div>
              <Text size="sm" c="dimmed">
                For training, all time-series will be downsampled to{" "}
                {Math.round(1000 / minSamplingRate)} Hz
              </Text>
              <div>
                <Text fw={700} size="lg" mb="xs">
                  Covered labels
                </Text>
                <Table size="sm">
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
                            <LabelBadge color={label.color}>
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
              </div>
            </Stack>
          ) : (
            <Stack align="center" justify="center" mih={220} gap={4}>
              <Text fw={600}>No datasets selected</Text>
              <Text size="sm" c="dimmed" ta="center">
                Select at least one dataset to preview the training input.
              </Text>
            </Stack>
          )}
        </Paper>
      </SimpleGrid>
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
