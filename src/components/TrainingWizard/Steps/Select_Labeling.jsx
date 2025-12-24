import React from "react";
import { Box, Group, Text, Title } from "@mantine/core";
import "../index.css";
import Checkbox from "../../../components/Common/Checkbox";
import classNames from "classnames";
import {
  EdgeMLTable,
  EdgeMLTableHeader,
  EdgeMLTableEntry,
} from "../../Common/EdgeMLTable";
import { toggleElement } from "../../../services/helpers";
import { useEffect } from "react";
import LabelBadge from "../../Common/LabelBadge";

const Wizard_SelectLabeling = ({
  labelings,
  datasets,
  setLabeling,
  selectedLabeling,
  toggleZeroClass,
  zeroClass,
  validate,
}) => {
  const countDatasets = (labeling) => {
    return datasets
      .map((elm) => elm.labelings.map((l) => l.labelingId))
      .flat()
      .filter((elm) => elm === labeling.id).length;
  };

  useEffect(() => {
    validateInput();
  }, [selectedLabeling, zeroClass]);

  useEffect(() => {
    validateInput();
  }, []);

  const validateInput = () => {
    validate(selectedLabeling);
  };

  return (
    <Box p="sm">
      <Title order={3}>1. Select Labeling</Title>
      <EdgeMLTable>
        <EdgeMLTableHeader>
          <Title order={4}>Labeling</Title>
          <Group justify="center" align="center">
            <Checkbox
              onClick={() => toggleZeroClass(!zeroClass)}
              isSelected={zeroClass}
            />
            <Text ml="sm">Use 0-Class</Text>
          </Group>
        </EdgeMLTableHeader>
        {labelings
          .filter((elm) => countDatasets(elm))
          .map((labeling) => (
            <EdgeMLTableEntry
              className={classNames("labelingRow", {
                disabled: countDatasets(labeling) === 0,
              })}
            >
              <Box mr="sm">
                <Checkbox
                  onClick={() =>
                    setLabeling({ ...labeling, disabledLabels: [] })
                  }
                  isSelected={
                    selectedLabeling
                      ? selectedLabeling.id === labeling.id
                      : false
                  }
                />
              </Box>
              <div className="labelingName">{labeling.name} </div>
              <div>
                {labeling.labels.map((label) => (
                  <LabelBadge
                    onClick={() =>
                      selectedLabeling?.disabledLabels &&
                      selectedLabeling.id === labeling.id &&
                      setLabeling({
                        ...selectedLabeling,
                        disabledLabels: toggleElement(
                          selectedLabeling.disabledLabels,
                          label.id
                        ),
                      })
                    }
                    style={{
                      ...(selectedLabeling?.disabledLabels.includes(label.id)
                        ? { textDecoration: "line-through" }
                        : { backgroundColor: label.color }),
                      userSelect: "none",
                    }}
                    // {...(selectedLabeling?.disabledLabels.includes(label.id)
                    //   ? { color: 'light' }
                    //   : {})}
                    color={
                      selectedLabeling?.disabledLabels.includes(label.id)
                        ? "light"
                        : ""
                    }
                  >
                    {label.name}
                  </LabelBadge>
                ))}
              </div>
              <div>{`(${countDatasets(labeling)} ${
                countDatasets(labeling) === 1 ? "dataset" : "datasets"
              })`}</div>
            </EdgeMLTableEntry>
          ))}
      </EdgeMLTable>
    </Box>
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

  const labeling = labelings.find((l) => l.id === selectedLabeling.id);

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
