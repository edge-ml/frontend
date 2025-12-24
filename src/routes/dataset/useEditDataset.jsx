import React, { useState, useEffect } from "react";

const useEditDataset = (datasetUtils, labelings) => {
  const { dataset, deleteLabel, addLabel, updateLabel } = datasetUtils;

  const getActivateLabeling = () => {
    if (
      labelings &&
      dataset &&
      dataset.labelings &&
      dataset.labelings.length > 0
    ) {
      const labelingId = dataset.labelings[0].labelingId;
      return labelings.find((elm) => elm.id === labelingId);
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
          (elm) => elm.id === selectedLabelTypeId
        );
        if (activeLabelType) {
          _setSelectedLabelTypeId(activeLabelType.id);
          return;
        }
        _setSelectedLabelTypeId(activeLabeling.labels[0].id);
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
        setSelectedLabelTypeId(activeLabeling.labels[index - 1].id);
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
          (elm) => elm.id === selectedLabelTypeId
        );
        if (activeLabelType) {
          _setSelectedLabelTypeId(activeLabelType.id);
          return;
        }
        _setSelectedLabelTypeId(activeLabeling.labels[0].id);
      }
    }
  }, [labelings]);

  const setSelectedLabelTypeId = async (labelTypeId) => {
    _setSelectedLabelTypeId(labelTypeId);
    _setProvisionalLabel(undefined);
    if (selectedLabel) {
      await updateLabel(activeLabeling.id, {
        ...selectedLabel,
        type: labelTypeId,
      });
    }
  };

  const onDeleteSelectedLabel = async () => {
    if (selectedLabel && selectedLabel.id) {
      await deleteLabel(selectedLabel.id);
      _setSelectedLabel(undefined);
    }
  };

  const setActiveLabeling = (labeling) => {
    _setActiveLabeling(labeling);
    if (labeling && labeling.labels.length > 0) {
      _setSelectedLabelTypeId(labeling.labels[0].id);
    }
    _setProvisionalLabel(undefined);
  };

  const setSelectedLabel = (label) => {
    _setSelectedLabel(label);
    _setProvisionalLabel(undefined);
    _setSelectedLabelTypeId(label && label.type);
  };

  const updateLabelStartEnd = async (labelId, start, end) => {
    const datasetLabeling = dataset?.labelings?.find(
      (elm) => elm.labelingId === activeLabeling.id
    );
    const label = datasetLabeling?.labels?.find((elm) => elm.id === labelId);
    if (!label) {
      return;
    }
    await updateLabel(activeLabeling.id, {
      ...label,
      start: Math.ceil(start),
      end: Math.floor(end),
    });
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
        _setProvisionalLabel(updatedLabel);
        const labelToAdd = {
          ...updatedLabel,
          name: activeLabeling.labels.find(
            (elm) => elm.id === updatedLabel.type
          ).name,
        };
        const newlabel = await addLabel(activeLabeling.id, labelToAdd);
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
      (elm) => elm.labelingId === activeLabeling.id
    );

    if (datasetLabeling) {
      const labelsToUse = provisionalLabel
        ? [...datasetLabeling.labels, provisionalLabel]
        : datasetLabeling.labels;
      labelsToShow = labelsToUse.map((elm) => {
        const label = activeLabeling.labels.find((l) => l.id === elm.type);
        const labelId = elm.id ?? elm._id ?? "provisional";
        return { ...label, ...elm, id: labelId };
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
