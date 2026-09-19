import React from "react";
import "../index.css";
import Checkbox from "../../../components/Common/Checkbox";
import { Group, Stack, Table, Text } from "@mantine/core";
import { toggleElement } from "../../../services/helpers";
import LabelBadge from "../../Common/LabelBadge";

const Wizard_SelectLabeling = ({
  labelings,
  datasets,
  setLabeling,
  selectedLabeling,
  toggleZeroClass,
  zeroClass,
}) => {
  const countDatasets = (labeling) => {
    return datasets
      .map((elm) => elm.labelings.map((l) => l.labelingId))
      .flat()
      .filter((elm) => elm === labeling._id).length;
  };

  const usableLabelings = labelings.filter((elm) => countDatasets(elm));

  return (
    <div className="training-wizard-step">
      <div className="training-wizard-step-header">
        <Text fw={700} size="xl">
          Select a labeling
        </Text>
        <Text c="dimmed">
          Choose the target classes for the model. Individual labels can be
          excluded after selecting a labeling.
        </Text>
      </div>
      <Table>
        <Table.Thead>
          <Table.Tr style={{ borderBottom: "2px solid rgb(230, 230, 234)" }}>
            <Table.Th colSpan={3} p={0}>
              <Group
                justify="space-between"
                style={{
                  background: "rgb(249, 251, 252)",
                  padding: "10px",
                }}
              >
                <Group gap="sm" p="sm">
                  <Checkbox
                    onClick={() => toggleZeroClass(!zeroClass)}
                    isSelected={zeroClass}
                  />
                  <Stack gap={0}>
                    <Text size="sm" fw={600}>
                      Include zero class
                    </Text>
                    <Text size="xs" c="dimmed" fw={400}>
                      Train a fallback class for unlabeled windows
                    </Text>
                  </Stack>
                </Group>
              </Group>
            </Table.Th>
          </Table.Tr>
          <Table.Tr>
            <Table.Th w={40}></Table.Th>
            <Table.Th>Labeling</Table.Th>
            <Table.Th>Labels</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {usableLabelings.map((labeling) => (
            <Table.Tr key={labeling._id}>
              <Table.Td>
                <Checkbox
                  onClick={() =>
                    setLabeling({ ...labeling, disabledLabels: [] })
                  }
                  isSelected={
                    selectedLabeling
                      ? selectedLabeling._id === labeling._id
                      : false
                  }
                />
              </Table.Td>
              <Table.Td>
                <Stack gap={2} py={4}>
                  <Text fw={700} size="lg" component="span">
                    {labeling.name}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {countDatasets(labeling)}{" "}
                    {countDatasets(labeling) === 1 ? "dataset" : "datasets"}
                  </Text>
                </Stack>
              </Table.Td>
              <Table.Td>
                <Group gap={4}>
                  {labeling.labels.map((label) => (
                    <LabelBadge
                      key={label._id}
                      onClick={() =>
                        selectedLabeling?.disabledLabels &&
                        selectedLabeling._id === labeling._id &&
                        setLabeling({
                          ...selectedLabeling,
                          disabledLabels: toggleElement(
                            selectedLabeling.disabledLabels,
                            label._id
                          ),
                        })
                      }
                      style={{
                        ...(selectedLabeling?.disabledLabels.includes(label._id)
                          ? { textDecoration: "line-through", opacity: 0.65 }
                          : {}),
                        userSelect: "none",
                        cursor:
                          selectedLabeling?._id === labeling._id
                            ? "pointer"
                            : "default",
                      }}
                      color={
                        selectedLabeling?.disabledLabels.includes(label._id)
                          ? "gray"
                          : label.color
                      }
                      variant={
                        selectedLabeling?.disabledLabels.includes(label._id)
                          ? "outline"
                          : "light"
                      }
                    >
                      {label.name}
                    </LabelBadge>
                  ))}
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </div>
  );
};

Wizard_SelectLabeling.validate = ({
  selectedLabeling,
  labelings,
  zeroClass,
}) => {
  if (!selectedLabeling) {
    return "You need to select a labeling";
  }

  const labeling = labelings.find((l) => l._id === selectedLabeling._id);

  if (!labeling) {
    return "Selected labeling is erronous, an internal error has occured";
  }

  const remainingLabelsCount =
    labeling.labels.length -
    (selectedLabeling.disabledLabels
      ? selectedLabeling.disabledLabels.length
      : 0);

  if (remainingLabelsCount === 0) {
    return "At least one label must remain enabled in the selected labeling";
  }

  if (remainingLabelsCount === 1 && !zeroClass) {
    return "At least two labels must remain enabled if zero class is disabled";
  }
};

export default Wizard_SelectLabeling;
