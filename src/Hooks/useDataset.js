import { useEffect, useState } from 'react';
import useDatasetAPI from '../services/ApiServices/DatasetServices';
import { useContext } from 'react';
import { ProjectContext } from '../ProjectProvider';

const useDataset = (dataset_id) => {
  const { currentProject } = useContext(ProjectContext);
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
