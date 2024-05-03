import { useEffect, useState } from 'react';
import useLabelingAPI from '../services/ApiServices/LabelingServices';

const useLabelings = (project) => {
  const labelingAPI = useLabelingAPI(project);

  const [labelings, setLabelings] = useState(undefined);

  const refreshLabelings = async () => {
    const data = await labelingAPI.getLabelingsAndLabels();
    setLabelings(data);
  };

  useEffect(() => {
    refreshLabelings();
  }, []);

  return { labelings };
};

export default useLabelings;
