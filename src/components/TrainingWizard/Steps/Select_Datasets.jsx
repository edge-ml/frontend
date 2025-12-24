import React, { Fragment } from "react";
import Checkbox from "../../Common/Checkbox";
import classNames from "classnames";
import { Badge, Box, Grid, Group, Stack, Table, Text, Title } from "@mantine/core";
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
      dataset.labelings.filter((elm) => elm.labelingId === selectedLabeling.id)
        .length <= 0
    );
  };

  // useEffect(() => {
  //   validateInput();
  // }, [datasets])

  // useEffect(() => {
  //
  //   validateInput();
  // },[])

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
      e.labelings.find((ls) => ls.labelingId === selectedLabeling.id)
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
    <Box p="sm">
      <Title order={3}>2. Select datasets</Title>
      <Grid mt="sm">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <EdgeMLTable>
            <EdgeMLTableHeader>
              <Group align="center">
                <Checkbox
                  isSelected={selectedAllActive}
                  onClick={() =>
                    toggleAllDatasets(
                      datasets.filter((elm) => !checkUsable(elm)),
                      !selectedAllActive
                    )
                  }
                />
                <Text ml="sm">Select all</Text>
              </Group>
            </EdgeMLTableHeader>
            {datasets
              .filter((elm) => !checkUsable(elm))
              .map((dataset) => {
                return (
                  <EdgeMLTableEntry
                    className={classNames("datasetRow", {
                      disabled: checkUsable(dataset),
                    })}
                    key={dataset.id}
                  >
                    <Box mr="sm">
                      <Checkbox
                        isSelected={dataset.selected}
                        onClick={() => toggleSelectDataset(dataset.id)}
                      />
                    </Box>
                    <div className="datasetName">{dataset.name}</div>
                  </EdgeMLTableEntry>
                );
              })}
          </EdgeMLTable>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }} pt="md">
          {datasets.filter((elm) => elm.selected).length ? (
            <Fragment>
              <Title order={5}>Selected Timeseries</Title>
              <Box style={{ overflow: "auto" }}>
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
                      }}
                      color={tsNameObj.disabled ? "gray" : "blue"}
                      mr="xs"
                    >
                      {`${tsNameObj.name}`}
                    </Badge>
                  ))
                ) : (
                  <Text my="sm">
                    Selected datasets do not have any timeseries in common.
                  </Text>
                )}
                {intersectingTSNames.length !==
                selectedDatasetTimeseriesNames.length ? (
                  <Fragment>
                    <Text my="sm">
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
                        color="gray"
                        mr="xs"
                      >
                        {`${tsNameObj.name}`}
                      </Badge>
                    ))}
                  </Fragment>
                ) : null}
              </Box>
              <Text my="sm">
                For training, all time-series will be downsampled to{" "}
                {Math.round(1000 / minSamplingRate)} Hz
              </Text>
              <Title order={5} mt="md">
                Covered Labels
              </Title>
              <Table withRowBorders={false} style={{ width: "unset" }} mt="xs">
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
                      (l) => !selectedLabeling.disabledLabels.includes(l.id)
                    )
                    .map((label) => (
                      <Table.Tr key={label.id}>
                        <Table.Td>
                          <LabelBadge color={label.color}>
                            {label.name}
                          </LabelBadge>
                        </Table.Td>
                        <Table.Td>
                          {coveredLabels[label.id]?.count ?? 0}
                        </Table.Td>
                        <Table.Td>
                          {humanDuration(
                            coveredLabels[label.id]?.duration ?? 0
                          )}
                        </Table.Td>
                      </Table.Tr>
                    ))}
                </Table.Tbody>
              </Table>
            </Fragment>
          ) : null}
        </Grid.Col>
      </Grid>
    </Box>
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
      e.labelings.find((ls) => ls.labelingId === selectedLabeling.id)
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
