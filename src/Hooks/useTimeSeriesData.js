import { useContext, useEffect, useState } from 'react';
import { ProjectContext } from '../ProjectProvider';
import useTimeSeriesApi from '../services/ApiServices/TimeSeriesService';

const useTimeSeriesData = (dataset_id, timeSeries_id) => {
  const { currentProject } = useContext(ProjectContext);
  const api = useTimeSeriesApi(currentProject);

  const [timeSeriesPartial, setTimeSeriesPartial] = useState(undefined);

  const getTimeSeriesPatial = async (start, end) => {
    const res = await api.getTimeSeriesPartial(
      dataset_id,
      timeSeries_id,
      start,
      end,
      window.innerWidth,
    );
    setTimeSeriesPartial(res);
  };

  useEffect(() => {
    getTimeSeriesPatial();
  }, []);

  return {
    timeSeriesData: timeSeriesPartial,
  };
};

export default useTimeSeriesData;
