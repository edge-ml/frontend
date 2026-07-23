import { useEffect, useMemo, useReducer, useState } from "react";

const initialEditorState = {
  draft: undefined,
  selectedLabelId: undefined,
  saving: false,
};

export const labelingEditorReducer = (state, action) => {
  switch (action.type) {
    case "start":
      return {
        draft: {
          start: action.timestamp,
          end: undefined,
          type: action.labelTypeId,
        },
        selectedLabelId: undefined,
        saving: false,
      };
    case "saving":
      return { ...state, saving: true };
    case "select":
      return {
        draft: undefined,
        selectedLabelId:
          state.selectedLabelId === action.labelId ? undefined : action.labelId,
        saving: false,
      };
    case "clear":
      return initialEditorState;
    default:
      return state;
  }
};

const useEditDataset = (datasetUtils, labelings) => {
  const { dataset, deleteLabel, addLabel, updateLabel } = datasetUtils;

  const getActiveLabeling = () => {
    if (
      labelings &&
      dataset &&
      dataset.labelings &&
      dataset.labelings.length > 0
    ) {
      const labelingId = dataset.labelings[0].labelingId;
      return labelings.find((labeling) => labeling._id === labelingId);
    }

    return labelings?.[0];
  };

  const [activeTimeSeries, setActiveTimeSeries] = useState([]);
  const [activeLabeling, setActiveLabelingState] =
    useState(getActiveLabeling());
  const [selectedLabelTypeId, setSelectedLabelTypeIdState] =
    useState(undefined);
  const [editor, dispatch] = useReducer(
    labelingEditorReducer,
    initialEditorState
  );

  const datasetLabeling = useMemo(
    () =>
      dataset?.labelings?.find(
        (labeling) => labeling.labelingId === activeLabeling?._id
      ),
    [activeLabeling?._id, dataset?.labelings]
  );

  const selectedLabel = useMemo(
    () =>
      datasetLabeling?.labels?.find(
        (label) => label._id === editor.selectedLabelId
      ),
    [datasetLabeling?.labels, editor.selectedLabelId]
  );

  useEffect(() => {
    if (!dataset) return;

    setActiveTimeSeries(dataset.timeSeries);
  }, [dataset?._id]);

  useEffect(() => {
    const nextActiveLabeling = getActiveLabeling();
    setActiveLabelingState(nextActiveLabeling);
    setSelectedLabelTypeIdState((currentTypeId) => {
      if (
        nextActiveLabeling?.labels.some((label) => label._id === currentTypeId)
      ) {
        return currentTypeId;
      }
      return nextActiveLabeling?.labels?.[0]?._id;
    });
    dispatch({ type: "clear" });
  }, [dataset?._id, labelings]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const shortcutIndex = Number(event.key) - 1;
      if (
        event.ctrlKey &&
        Number.isInteger(shortcutIndex) &&
        shortcutIndex >= 0 &&
        shortcutIndex < (activeLabeling?.labels.length ?? 0)
      ) {
        event.preventDefault();
        setSelectedLabelTypeId(activeLabeling.labels[shortcutIndex]._id);
        return;
      }

      if (event.key === "Escape") {
        dispatch({ type: "clear" });
        return;
      }

      if (
        (event.key === "Delete" || event.key === "Backspace") &&
        selectedLabel
      ) {
        event.preventDefault();
        onDeleteSelectedLabel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeLabeling, selectedLabel]);

  const setSelectedLabelTypeId = async (labelTypeId) => {
    setSelectedLabelTypeIdState(labelTypeId);

    if (selectedLabel && activeLabeling) {
      await updateLabel(activeLabeling._id, {
        ...selectedLabel,
        type: labelTypeId,
      });
    } else {
      dispatch({ type: "clear" });
    }
  };

  const setActiveLabeling = (labeling) => {
    setActiveLabelingState(labeling);
    setSelectedLabelTypeIdState(labeling?.labels?.[0]?._id);
    dispatch({ type: "clear" });
  };

  const setSelectedLabel = (label) => {
    if (label?.type) {
      setSelectedLabelTypeIdState(label.type);
    }
    dispatch({ type: "select", labelId: label?._id });
  };

  const onPlotClick = async (timestamp) => {
    if (
      !activeLabeling ||
      !selectedLabelTypeId ||
      editor.saving ||
      !Number.isFinite(timestamp)
    ) {
      return;
    }

    const roundedTimestamp = Math.round(timestamp);
    if (!editor.draft) {
      dispatch({
        type: "start",
        timestamp: roundedTimestamp,
        labelTypeId: selectedLabelTypeId,
      });
      return;
    }

    const labelType = activeLabeling.labels.find(
      (label) => label._id === editor.draft.type
    );
    const start = Math.min(editor.draft.start, roundedTimestamp);
    const end = Math.max(editor.draft.start, roundedTimestamp);

    dispatch({ type: "saving" });
    try {
      await addLabel(activeLabeling._id, {
        start,
        end,
        type: editor.draft.type,
        name: labelType?.name,
      });
    } finally {
      dispatch({ type: "clear" });
    }
  };

  const onDeleteSelectedLabel = async () => {
    if (!selectedLabel?._id) return;

    await deleteLabel(selectedLabel._id);
    dispatch({ type: "clear" });
  };

  const updateLabelStartEnd = async (labelId, start, end) => {
    if (!activeLabeling) return;

    const label = datasetLabeling?.labels.find(
      (candidate) => candidate._id === labelId
    );
    if (!label) return;

    await updateLabel(activeLabeling._id, {
      ...label,
      start: Math.round(Math.min(start, end)),
      end: Math.round(Math.max(start, end)),
    });
  };

  const labelsToShow = useMemo(() => {
    if (!activeLabeling) return [];

    const persistedLabels = datasetLabeling?.labels ?? [];
    const labels = editor.draft
      ? [...persistedLabels, { ...editor.draft, _id: "draft" }]
      : persistedLabels;

    return labels.map((label) => {
      const labelType = activeLabeling.labels.find(
        (candidate) => candidate._id === label.type
      );
      return { ...labelType, ...label };
    });
  }, [activeLabeling, datasetLabeling?.labels, editor.draft]);

  return {
    activeTimeSeries,
    setActiveTimeSeries,
    activeLabeling,
    setActiveLabeling,
    selectedLabel,
    setSelectedLabel,
    onDeleteSelectedLabel,
    selectedLabelTypeId,
    setSelectedLabelTypeId,
    provisionalLabel: editor.draft,
    labelsToShow,
    onPlotClick,
    updateLabelStartEnd,
    isSavingLabel: editor.saving,
  };
};

export default useEditDataset;
