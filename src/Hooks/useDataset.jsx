import { useEffect, useState } from "react";
import {
  updateDataset as updateDataset_api,
  getDataset as getDataset_api,
} from "../services/ApiServices/DatasetServices";
import {
  createDatasetLabel,
  deleteDatasetLabel,
} from "../services/ApiServices/DatasetLabelService";

const useDataset = (dataset_id) => {
  const [dataset, setDataset] = useState(undefined);

  const refreshDataset = async () => {
    const dataset = await getDataset_api(dataset_id);
    setDataset(dataset);
  };

  const updateDataset = async (newDataset) => {
    console.log(newDataset);
    try {
      await updateDataset_api(newDataset);
    } catch (e) {
      console.log(e);
    }
    await refreshDataset();
  };

  const addLabel = async (labelingId, newLabel) => {
    if (!dataset) {
      return undefined;
    }

    const datasetId = dataset.id || dataset._id;
    if (!datasetId || !labelingId) {
      return undefined;
    }

    const createdLabel = await createDatasetLabel(
      datasetId,
      labelingId,
      newLabel
    );
    await refreshDataset();
    return createdLabel || newLabel;
  };

  const updateLabel = async (labelingId, label) => {
    const newDataset = { ...dataset };
    const labeling = newDataset.labelings.find(
      (labeling) => labeling.labelingId === labelingId
    );
    if (labeling) {
      labeling.labels = labeling.labels.map((elm) => {
        if (elm.id === label.id) {
          return label;
        }
        return elm;
      });
    }
    await updateDataset_api(newDataset);
    await refreshDataset();
  };

  const deleteLabel = async (labelId) => {
    if (!labelId || !dataset) {
      return;
    }

    const datasetId = dataset.id || dataset._id;
    const labeling = dataset.labelings?.find((labelingEntry) =>
      labelingEntry.labels?.some((label) => label.id === labelId)
    );
    const labelingId = labeling?.labelingId;

    if (!datasetId || !labelingId) {
      return;
    }

    await deleteDatasetLabel(datasetId, labelingId, labelId);
    await refreshDataset();
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
  };
};

export default useDataset;
