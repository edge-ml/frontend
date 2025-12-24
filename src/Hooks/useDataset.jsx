import { useEffect, useState } from "react";
import {
  updateDataset as updateDataset_api,
  getDataset as getDataset_api,
} from "../services/ApiServices/DatasetServices";
import {
  createDatasetLabel,
  deleteDatasetLabel,
  changeDatasetLabel,
} from "../services/ApiServices/DatasetLabelService";
import useProjectStore from "../stores/projectStore";

const useDataset = (dataset_id) => {
  const [dataset, setDataset] = useState(undefined);
  const { currentProject } = useProjectStore();

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
    if (!dataset) {
      return;
    }
    const datasetId = dataset.id || dataset._id;
    if (!datasetId || !labelingId || !label?.id) {
      return;
    }
    await changeDatasetLabel(datasetId, labelingId, label);
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
    if (!dataset_id || !currentProject?.id) {
      return;
    }
    refreshDataset();
  }, [dataset_id, currentProject?.id]);

  return {
    dataset: dataset,
    addLabel: addLabel,
    deleteLabel: deleteLabel,
    updateLabel: updateLabel,
    updateDataset: updateDataset,
  };
};

export default useDataset;
