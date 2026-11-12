import { useEffect, useRef, useState } from "react";
import { notifications } from "@mantine/notifications";
import {
  updateDataset as updateDataset_api,
  getDataset as getDataset_api,
} from "../services/ApiServices/DatasetServices";

// How many label changes can be taken back.
const HISTORY_LIMIT = 50;

const useDataset = (dataset_id) => {
  const [dataset, setDataset] = useState(undefined);
  // The latest dataset, also between renders: label changes that follow each
  // other quickly must build on one another.
  const latest = useRef(undefined);
  // Labels as they were before each change (undo) and before each undo (redo).
  const history = useRef({ undo: [], redo: [] });
  const [historySize, setHistorySize] = useState({ undo: 0, redo: 0 });

  const show = (next) => {
    latest.current = next;
    setDataset(next);
  };

  const syncHistorySize = () =>
    setHistorySize({
      undo: history.current.undo.length,
      redo: history.current.redo.length,
    });

  const refreshDataset = async () => {
    show(await getDataset_api(dataset_id));
  };

  const updateDataset = async (newDataset) => {
    try {
      await updateDataset_api(newDataset);
    } catch (e) {
      console.error(e);
    }
    await refreshDataset();
  };

  // Saves changed labels. With `optimistic` the change shows at once and is
  // taken back if the server refuses it; otherwise it shows once saved (a new
  // label only gets its id from the server).
  const saveLabelings = async (labelings, { optimistic, record = true }) => {
    const before = latest.current;
    const next = { ...before, labelings };
    if (record) {
      history.current.undo.push(before.labelings);
      if (history.current.undo.length > HISTORY_LIMIT) history.current.undo.shift();
      history.current.redo = [];
      syncHistorySize();
    }
    if (optimistic) show(next);
    try {
      await updateDataset_api(next);
    } catch (error) {
      if (record) {
        history.current.undo.pop();
        syncHistorySize();
      }
      notifications.show({
        color: "red",
        title: "The label could not be saved",
        message: error.message || "The request failed",
      });
      await refreshDataset();
      throw error;
    }
    await refreshDataset();
  };

  const addLabel = (labelingId, newLabel) => {
    const current = latest.current.labelings;
    const labelingExists = current.some(
      (labeling) => labeling.labelingId === labelingId
    );
    const labelings = labelingExists
      ? current.map((labeling) =>
          labeling.labelingId === labelingId
            ? { ...labeling, labels: [...labeling.labels, newLabel] }
            : labeling
        )
      : [...current, { labelingId, labels: [newLabel] }];
    return saveLabelings(labelings, { optimistic: false });
  };

  const updateLabel = (labelingId, label) =>
    saveLabelings(
      latest.current.labelings.map((labeling) =>
        labeling.labelingId === labelingId
          ? {
              ...labeling,
              labels: labeling.labels.map((candidate) =>
                candidate._id === label._id ? label : candidate
              ),
            }
          : labeling
      ),
      { optimistic: true }
    );

  const deleteLabel = async (labelId) => {
    if (!labelId) return;
    await saveLabelings(
      latest.current.labelings.map((labeling) => ({
        ...labeling,
        labels: labeling.labels.filter((label) => label._id !== labelId),
      })),
      { optimistic: true }
    );
  };

  // Takes the last label change back (or, with "redo", an undo).
  const stepHistory = async (from, to) => {
    const labelings = history.current[from].pop();
    if (!labelings) return false;
    history.current[to].push(latest.current.labelings);
    syncHistorySize();
    try {
      await saveLabelings(labelings, { optimistic: true, record: false });
    } catch {
      // the server kept what it had: the step did not happen
      history.current[to].pop();
      history.current[from].push(labelings);
      syncHistorySize();
      return false;
    }
    return true;
  };

  useEffect(() => {
    refreshDataset();
  }, []);

  return {
    dataset: dataset,
    addLabel: addLabel,
    deleteLabel: deleteLabel,
    updateLabel: updateLabel,
    updateDataset: updateDataset,
    refreshDataset: refreshDataset,
    undoLabelChange: () => stepHistory("undo", "redo"),
    redoLabelChange: () => stepHistory("redo", "undo"),
    canUndo: historySize.undo > 0,
    canRedo: historySize.redo > 0,
  };
};

export default useDataset;
