import { useEffect, useState } from 'react';
import useDatasetAPI from '../services/ApiServices/DatasetServices';
import { updateDataset as updateDataset_api } from '../services/ApiServices/DatasetServices';
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

  const updateDataset = async (newDataset) => {
    console.log(newDataset);
    await updateDataset_api(newDataset);
    await refreshDataset();
  }


  const addLabel = async (labelingId, newLabel) => {
    const newDataset = { ...dataset };
  
    const labeling = newDataset.labelings.find(labeling => labeling.labelingId === labelingId);
  
    if (labeling) {
      labeling.labels = [...labeling.labels, newLabel];
    } else {
      const newLabeling = {
        labelingId: labelingId,
        labels: [newLabel]
      };
      newDataset.labelings = [...newDataset.labelings, newLabeling];
    }
  
    await updateDataset_api(newDataset);
    await refreshDataset();
  }

  const updateLabel = async (labelingId, label) => {
    const newDataset = { ...dataset };
    const labeling = newDataset.labelings.find(labeling => labeling.labelingId === labelingId);
    if (labeling) {
      labeling.labels = labeling.labels.map(elm => {
        if (elm._id === label._id) {
          return label;
        }
        return elm;
      });
    }
    await updateDataset_api(newDataset);
    await refreshDataset();
  }
  

  const deleteLabel = async (labelId) => {
    if (labelId) {
      const newDataset = {...dataset};
      newDataset.labelings = newDataset.labelings.map(labeling => {
        labeling.labels = labeling.labels.filter(label => label._id !== labelId);
        return labeling;
      });
      await updateDataset_api(newDataset);
      await refreshDataset();
    }
  }


  useEffect(() => {
    refreshDataset();
  }, []);

  return {
    dataset: dataset,
    addLabel: addLabel,
    deleteLabel: deleteLabel,
    updateLabel: updateLabel,
    updateDataset: updateDataset
  };
};

export default useDataset;
