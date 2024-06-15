import { useEffect, useState } from 'react';
import useDatasetAPI from '../services/ApiServices/DatasetServices';
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

  useEffect(() => {
    refreshDataset();
  }, []);

  return {
    dataset: dataset,
  };
};

export default useDataset;
