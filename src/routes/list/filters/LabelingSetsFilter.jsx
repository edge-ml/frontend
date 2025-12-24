import React, { useState, useEffect } from "react";
import { Badge, Checkbox, Group, ScrollArea, Stack, Text } from "@mantine/core";

const LabelingSetsFilter = ({
  selectedFilter,
  selectedFilterParams,
  labelings,
  currentFilterParams,
  setCurrentFilterParams,
}) => {
  const [targetLabelingIds, setTargetLabelingIds] = useState([]);
  const [targetLabelIds, setTargetLabelIds] = useState([]);

  useEffect(() => {
    if (selectedFilter && selectedFilter.value === "labelings") {
      setTargetLabelIds(selectedFilterParams.target_label_ids);
      setTargetLabelingIds(selectedFilterParams.target_labeling_ids);
    } else {
      const _currentFilterParams = {};
      _currentFilterParams.target_label_ids = [];
      _currentFilterParams.target_labeling_ids = [];
      setCurrentFilterParams(_currentFilterParams);
    }
    return () => {};
  }, []);

  useEffect(() => {
    setCurrentFilterParams((prevParams) => ({
      ...prevParams,
      target_labeling_ids: targetLabelingIds,
    }));
  }, [targetLabelingIds]);

  useEffect(() => {
    setCurrentFilterParams((prevParams) => ({
      ...prevParams,
      target_label_ids: targetLabelIds,
    }));
  }, [targetLabelIds]);

  const onSelectLabel = (label) => {
    if (isSelectedLabel(label.id)) {
      setTargetLabelIds(targetLabelIds.filter((id) => id != label.id));
    } else {
      setTargetLabelIds([...targetLabelIds, label.id]);
    }
  };

  const onSelectLabelingSet = (labelingSet) => {
    if (isSelectedLabeling(labelingSet.id)) {
      const labelingIdToRemove = labelingSet.id;
      setTargetLabelingIds(
        targetLabelingIds.filter((id) => id !== labelingIdToRemove)
      );
      const labelIdsToRemove = [];
      labelingSet.labels.map((label) => {
        labelIdsToRemove.push(label.id);
      });
      setTargetLabelIds(
        targetLabelIds.filter((id) => !labelIdsToRemove.includes(id))
      );
    } else {
      setTargetLabelingIds([...targetLabelingIds, labelingSet.id]);
      const labelIdsToAdd = [];
      labelingSet.labels.map((label) => {
        labelIdsToAdd.push(label.id);
      });
      const labelIdsToAddFiltered = labelIdsToAdd.filter(
        (id) => !targetLabelIds.includes(id)
      );
      setTargetLabelIds([...targetLabelIds, ...labelIdsToAddFiltered]);
    }
  };

  const isSelectedLabeling = (labelingId) => {
    return targetLabelingIds.includes(labelingId);
  };

  const isSelectedLabel = (labelId) => {
    return targetLabelIds.includes(labelId);
  };

  const renderLabels = (labels) => {
    if (labels.length === 0) {
      return null;
    } else {
      return (
        <Group className="me-2 badgeSize pb-2" gap="xs">
          {labels.map((label, index) => {
            return (
              <Group key={label.id} gap="xs" align="center">
                <Checkbox
                  checked={isSelectedLabel(label.id)}
                  onChange={() => onSelectLabel(label)}
                />
                <Badge
                  className={
                    label.name === ""
                      ? "font-italic font-weight-normal badgeSize mx-1 border border-dark"
                      : "badgeSize mx-1 my-1 border border-dark"
                  }
                  style={{ backgroundColor: label.color }}
                >
                  {label.name !== "" ? label.name : "Untitled"}
                </Badge>
              </Group>
            );
          })}
        </Group>
      );
    }
  };

  return (
    <div>
      <div className="mb-4">
        {
          "Select the labelings and/or labels of the datasets you want to display:\n"
        }
      </div>
      <div>
        <ScrollArea h={600}>
          <Stack gap="sm">
            {labelings.map((labeling, index) => (
              <Group key={index} align="flex-start" wrap="nowrap">
                <Group align="center" gap="xs" wrap="nowrap">
                  <Checkbox
                    checked={isSelectedLabeling(labeling.id)}
                    onChange={() => onSelectLabelingSet(labeling)}
                  />
                  <Text fw={600}>{labeling.name}</Text>
                </Group>
                <div>{renderLabels(labeling.labels)}</div>
              </Group>
            ))}
          </Stack>
        </ScrollArea>
      </div>
    </div>
  );
};

export default LabelingSetsFilter;
