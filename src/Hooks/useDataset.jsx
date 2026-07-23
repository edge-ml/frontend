import { useEffect, useState } from "react";
import {
  updateDataset as updateDataset_api,
  getDataset as getDataset_api,
} from "../services/ApiServices/DatasetServices";

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
    const labelingExists = dataset.labelings.some(
      (labeling) => labeling.labelingId === labelingId
    );
    const labelings = labelingExists
      ? dataset.labelings.map((labeling) =>
          labeling.labelingId === labelingId
            ? { ...labeling, labels: [...labeling.labels, newLabel] }
            : labeling
        )
      : [...dataset.labelings, { labelingId, labels: [newLabel] }];
    const newDataset = { ...dataset, labelings };

    await updateDataset_api(newDataset);
    await refreshDataset();
  };

  const updateLabel = async (labelingId, label) => {
    const newDataset = {
      ...dataset,
      labelings: dataset.labelings.map((labeling) =>
        labeling.labelingId === labelingId
          ? {
              ...labeling,
              labels: labeling.labels.map((candidate) =>
                candidate._id === label._id ? label : candidate
              ),
            }
          : labeling
      ),
    };
    await updateDataset_api(newDataset);
    await refreshDataset();
  };

  const deleteLabel = async (labelId) => {
    if (labelId) {
      const newDataset = {
        ...dataset,
        labelings: dataset.labelings.map((labeling) => ({
          ...labeling,
          labels: labeling.labels.filter((label) => label._id !== labelId),
        })),
      };
      await updateDataset_api(newDataset);
      await refreshDataset();
    }
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
