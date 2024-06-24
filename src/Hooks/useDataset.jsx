import { useEffect, useState } from 'react';
import useDatasetAPI from '../services/ApiServices/DatasetServices';
import { updateDataset } from '../services/ApiServices/DatasetServices';
import { useContext } from 'react';
import useProjectAPI from '../services/ApiServices/ProjectService';

const useDataset = (dataset_id) => {
  const { currentProject } = useProjectAPI();
  const datasetAPI = useDatasetAPI(currentProject);

  const [dataset, setDataset] = useState(undefined);

  const refreshDataset = async () => {
    const dataset = await datasetAPI.getDataset(dataset_id);
    setDataset(dataset);
  };

  const addLabel = (newLabel) => {
    console.log("Creating label")
    const newDataset = { ...dataset };
    console.log(newDataset)
    newDataset.labelings = newDataset.labelings.map((labeling) => {
      if (labeling._id === newLabel.labelingId) {
        console.log("Pusing label")
        labeling.labels.push(newLabel);
      }
      return labeling;
    });
    console.log(newDataset);
    updateDataset(newDataset);
    refreshDataset();
  }

  useEffect(() => {
    refreshDataset();
  }, []);

  return {
    dataset: dataset,
    addLabel: addLabel,
  };
};

export default useDataset;
