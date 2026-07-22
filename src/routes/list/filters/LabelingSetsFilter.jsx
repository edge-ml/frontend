import React, { useState, useEffect } from "react";
import { Badge, List } from "@mantine/core";
import Checkbox from "../../../components/Common/Checkbox";

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
    if (isSelectedLabel(label._id)) {
      setTargetLabelIds(targetLabelIds.filter((id) => id != label._id));
    } else {
      setTargetLabelIds([...targetLabelIds, label._id]);
    }
  };

  const onSelectLabelingSet = (labelingSet) => {
    if (isSelectedLabeling(labelingSet._id)) {
      const labelingIdToRemove = labelingSet._id;
      setTargetLabelingIds(
        targetLabelingIds.filter((id) => id !== labelingIdToRemove)
      );
      const labelIdsToRemove = [];
      labelingSet.labels.map((label) => {
        labelIdsToRemove.push(label._id);
      });
      setTargetLabelIds(
        targetLabelIds.filter((id) => !labelIdsToRemove.includes(id))
      );
    } else {
      setTargetLabelingIds([...targetLabelingIds, labelingSet._id]);
      const labelIdsToAdd = [];
      labelingSet.labels.map((label) => {
        labelIdsToAdd.push(label._id);
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
        <div style={{ display: "flex", flexDirection: "row", paddingBottom: "0.5rem" }}>
          {labels.map((label) => {
            return (
              <div key={label._id} style={{ display: "flex", alignItems: "center" }}>
                <Checkbox
                  isSelected={isSelectedLabel(label._id)}
                  onClick={() => onSelectLabel(label)}
                />
                <Badge
                  style={{
                    backgroundColor: label.color,
                    border: "1px solid black",
                    margin: "0 0.25rem",
                  }}
                >
                  {label.name !== "" ? label.name : "Untitled"}{" "}
                </Badge>
              </div>
            );
          })}
        </div>
      );
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "1rem" }}>
        {"Select the labelings and/or labels of the datasets you want to display:\n"}
      </div>
      <div>
        <List style={{ maxHeight: "600px", overflowY: "auto" }}>
          {labelings.map((labeling, index) => (
            <List.Item key={index}>
              <div style={{ display: "flex", flexDirection: "row" }}>
                <div style={{ display: "flex", alignItems: "center", marginRight: "0.5rem" }}>
                  <Checkbox
                    isSelected={isSelectedLabeling(labeling._id)}
                    onClick={() => onSelectLabelingSet(labeling)}
                  />
                  <div style={{ marginLeft: "0.5rem" }}>
                    <b>{labeling.name}</b>
                  </div>
                </div>
                <div>{renderLabels(labeling.labels)}</div>
              </div>
            </List.Item>
          ))}
        </List>
      </div>
    </div>
  );
};

export default LabelingSetsFilter;
