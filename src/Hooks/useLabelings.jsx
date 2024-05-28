import { useEffect, useState } from 'react';
import useLabelingAPI from '../services/ApiServices/LabelingServices';
import { useContext } from 'react';
import { ProjectContext } from '../ProjectProvider';

const useLabelings = () => {
  const { currentProject } = useContext(ProjectContext);
  const labelingAPI = useLabelingAPI(currentProject);

  const [labelings, setLabelings] = useState(undefined);

  const refreshLabelings = async () => {
    const data = await labelingAPI.getLabelingsAndLabels();
    setLabelings(data);
  };

  useEffect(() => {
    refreshLabelings();
  }, [currentProject]);

  return { labelings };
};

export default useLabelings;
