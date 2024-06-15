import { useEffect, useState } from 'react';
import useLabelingAPI from '../services/ApiServices/LabelingServices';
import { useContext } from 'react';
import useProjectStore from '../stores/projectStore';

const useLabelings = () => {
  const { currentProject } = useProjectStore();
  const labelingAPI = useLabelingAPI(currentProject);

  const [labelings, setLabelings] = useState(undefined);

  const refreshLabelings = async () => {
    const data = await labelingAPI.getLabelingsAndLabels();
    setLabelings(data);
  };

  const updateLabeling = async (labeling) => {
    await labelingAPI.updateLabeling(labeling);
    refreshLabelings();
  }

  const addLabeling = async (labeling) => {
    await labelingAPI.addLabeling(labeling);
    refreshLabelings();
  }

  const deleteLabeling = async (labeling_id) => {
    await labelingAPI.deleteLabeling(labeling_id);
    refreshLabelings();
  }

  useEffect(() => {
    refreshLabelings();
  }, [currentProject]);

  return { labelings, updateLabeling, addLabeling, deleteLabeling };
};

export default useLabelings;
