import { useEffect, useState } from "react";
import useProjectStore from "../stores/projectStore";
import { getTimeSeriesDataPartial } from "../services/ApiServices/TimeSeriesService";

const useTimeSeriesData = (dataset_id, timeSeries_id) => {
  const { currentProject } = useProjectStore();

  const [timeSeriesPartial, setTimeSeriesPartial] = useState(undefined);

  const getTimeSeriesPatial = async (start, end) => { 
    const res = await getTimeSeriesDataPartial(
      dataset_id,
      timeSeries_id,
      start,
      end,
      window.innerWidth
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
