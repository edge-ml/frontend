import { useContext, useEffect, useState } from 'react';
import useTimeSeriesApi from '../services/ApiServices/TimeSeriesService';
import useProjectStore from '../stores/projectStore';

const useTimeSeriesData = (dataset_id, timeSeries_id) => {
  const { currentProject } = useProjectStore();
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
    return res;
  };

  const updateTimeSeries = async (start, end) => {
    const res = await getTimeSeriesPatial(start, end);
    setTimeSeriesPartial(res);
  };

  useEffect(() => {
    updateTimeSeries();
  }, []);

  return {
    timeSeriesData: timeSeriesPartial,
    getTimeSeriesPatial: getTimeSeriesPatial,
  };
};

export default useTimeSeriesData;
