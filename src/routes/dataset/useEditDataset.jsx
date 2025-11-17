import React, { useState, useEffect } from "react";

const useEditDataset = (datasetUtils, labelings) => {
  const { dataset, deleteLabel, addLabel, updateLabel, updateDataset } =
    datasetUtils;

  const getActivateLabeling = () => {
    if (
      labelings &&
      dataset &&
      dataset.labelings &&
      dataset.labelings.length > 0
    ) {
      const labelingId = dataset.labelings[0].labelingId;
      return labelings.find((elm) => elm._id === labelingId);
    }

    if (labelings && labelings.length > 0) {
      return labelings[0];
    }
    return undefined;
  };

  const [activeTimeSeries, _setActiveTimeSeries] = useState([]);
  const [activeLabeling, _setActiveLabeling] = useState(getActivateLabeling());
  const [selectedLabel, _setSelectedLabel] = useState(undefined);
  const [selectedLabelTypeId, _setSelectedLabelTypeId] = useState(undefined);
  const [provisionalLabel, _setProvisionalLabel] = useState(undefined);

  useEffect(() => {
    if (dataset) {
      _setActiveTimeSeries(dataset.timeSeries);
      const activeLabeling = getActivateLabeling();
      _setActiveLabeling(activeLabeling);
      if (activeLabeling && activeLabeling.labels.length > 0) {
        const activeLabelType = activeLabeling.labels.find(
          (elm) => elm._id === selectedLabelTypeId
        );
        if (activeLabelType) {
          _setSelectedLabelTypeId(activeLabelType._id);
          return;
        }
        _setSelectedLabelTypeId(activeLabeling.labels[0]._id);
      }
    }
  }, [dataset]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        event.ctrlKey &&
        event.key >= "0" &&
        event.key <= "9" &&
        event.key <= activeLabeling.labels.length
      ) {
        const index = parseInt(event.key, 10);
        setSelectedLabelTypeId(activeLabeling.labels[index - 1]._id);
        return;
      }

      switch (event.key) {
        case "Delete":
        case "Backspace":
          if (selectedLabel) {
            event.preventDefault();
            onDeleteSelectedLabel();
          }
          break;
        case "Escape":
          if (selectedLabel) {
            event.preventDefault();
            _setSelectedLabel(undefined);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedLabel, provisionalLabel]);

  useEffect(() => {
    if (labelings && labelings.length > 0) {
      const activeLabeling = getActivateLabeling();
      _setActiveLabeling(activeLabeling);
      if (activeLabeling && activeLabeling.labels.length > 0) {
        const activeLabelType = activeLabeling.labels.find(
          (elm) => elm._id === selectedLabelTypeId
        );
        if (activeLabelType) {
          _setSelectedLabelTypeId(activeLabelType._id);
          return;
        }
        _setSelectedLabelTypeId(activeLabeling.labels[0]._id);
      }
    }
  }, [labelings]);

  const setSelectedLabelTypeId = async (labelTypeId) => {
    _setSelectedLabelTypeId(labelTypeId);
    _setProvisionalLabel(undefined);
    if (selectedLabel) {
      selectedLabel.type = labelTypeId;
      const newDataset = { ...dataset };
      const labeling = newDataset.labelings.map((elm) => {
        if (elm.labelingId === activeLabeling._id) {
          elm.labels = elm.labels.map((label) => {
            if (label._id === selectedLabel._id) {
              return { ...label, type: labelTypeId };
            }
            return label;
          });
        }
        return elm;
      });
      newDataset.labelings = labeling;
      await updateDataset(newDataset);
    }
  };

  const onDeleteSelectedLabel = async () => {
    if (selectedLabel && selectedLabel._id) {
      await deleteLabel(selectedLabel._id);
      _setSelectedLabel(undefined);
    }
  };

  const setActiveLabeling = (labeling) => {
    _setActiveLabeling(labeling);
    if (labeling && labeling.labels.length > 0) {
      _setSelectedLabelTypeId(labeling.labels[0]._id);
    }
    _setProvisionalLabel(undefined);
  };

  const setSelectedLabel = (label) => {
    _setSelectedLabel(label);
    _setProvisionalLabel(undefined);
    _setSelectedLabelTypeId(label && label.type);
  };

  const updateLabelStartEnd = async (labelId, start, end) => {
    const newDataset = { ...dataset };
    const labeling = newDataset.labelings.map((elm) => {
      if (elm.labelingId === activeLabeling._id) {
        elm.labels = elm.labels.map((label) => {
          if (label._id === labelId) {
            return { ...label, start: Math.ceil(start), end: Math.floor(end) };
          }
          return label;
        });
      }
      return elm;
    });
    newDataset.labelings = labeling;
    await updateDataset(newDataset);
  };

  const setProvisionalLabel = async (label) => {
    if (provisionalLabel) {
      // Set label
      if (label) {
        const updatedLabel = {
          ...provisionalLabel,
          end: label.end,
        };
        if (updatedLabel.start > updatedLabel.end) {
          const temp = updatedLabel.start;
          updatedLabel.start = updatedLabel.end;
          updatedLabel.end = temp;
        }
        const labelToAdd = {
          ...updatedLabel,
          name: activeLabeling.labels.find(
            (elm) => elm._id === updatedLabel.type
          ).name,
        };
        const newlabel = await addLabel(activeLabeling._id, labelToAdd);
        _setSelectedLabel(newlabel);
      }
      _setProvisionalLabel(undefined);
      return;
    }

    _setProvisionalLabel(label);
  };

  let labelsToShow = undefined;
  if (dataset && dataset.labelings && activeLabeling) {
    const datasetLabeling = dataset.labelings.find(
      (elm) => elm.labelingId === activeLabeling._id
    );

    if (datasetLabeling) {
      const labelsToUse = provisionalLabel
        ? [...datasetLabeling.labels, provisionalLabel]
        : datasetLabeling.labels;
      labelsToShow = labelsToUse.map((elm) => {
        const label = activeLabeling.labels.find((l) => l._id === elm.type);
        return { ...label, ...elm };
      });
    }
  }

  return {
    activeTimeSeries,
    setActiveTimeSeries: _setActiveTimeSeries,
    activeLabeling,
    setActiveLabeling,
    selectedLabel,
    setSelectedLabel,
    onDeleteSelectedLabel,
    selectedLabelTypeId,
    setSelectedLabelTypeId,
    provisionalLabel,
    setProvisionalLabel,
    labelsToShow,
    updateLabelStartEnd,
  };
};

export default useEditDataset;
