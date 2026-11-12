import { useEffect, useRef, useState } from "react";
import { getTimeSeriesDataPartial } from "../services/ApiServices/TimeSeriesService";

const useTimeSeriesData = (
  datasetId,
  timeSeriesId,
  visibleRange,
  resolution
) => {
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  // nothing to show yet: the first request has not come back
  const [loading, setLoading] = useState(true);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!datasetId || !timeSeriesId || !visibleRange) return;

    const requestId = ++requestIdRef.current;
    const timeout = window.setTimeout(async () => {
      try {
        const result = await getTimeSeriesDataPartial(
          datasetId,
          timeSeriesId,
          Math.floor(visibleRange.min),
          Math.ceil(visibleRange.max),
          Math.max(200, Math.floor(resolution || window.innerWidth))
        );

        if (requestId === requestIdRef.current) {
          setTimeSeriesData(Array.isArray(result) ? result : []);
          setLoading(false);
        }
      } catch (error) {
        if (requestId === requestIdRef.current) {
          console.error("Could not load time-series data", error);
          setLoading(false);
        }
      }
    }, 120);

    return () => window.clearTimeout(timeout);
  }, [
    datasetId,
    resolution,
    timeSeriesId,
    visibleRange?.max,
    visibleRange?.min,
  ]);

  return { timeSeriesData, loading };
};

export default useTimeSeriesData;
