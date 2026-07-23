import React, { useContext, useEffect, useMemo, useState } from "react";
import { DatasetContext } from "./DatasetContext";
import TimeSeriesDisplay from "./TimeSeriesDisplay";
import ChartSlider from "./ChartSlider";

const TimeSeriesSection = () => {
  const { activeTimeSeries } = useContext(DatasetContext);

  const fullRange = useMemo(() => {
    const starts = activeTimeSeries
      .map((timeSeries) => Number(timeSeries.start))
      .filter(Number.isFinite);
    const ends = activeTimeSeries
      .map((timeSeries) => Number(timeSeries.end))
      .filter(Number.isFinite);

    return {
      min: starts.length > 0 ? Math.min(...starts) : 0,
      max: ends.length > 0 ? Math.max(...ends) : 1,
    };
  }, [activeTimeSeries]);

  const [visibleRange, setVisibleRange] = useState(fullRange);

  useEffect(() => {
    setVisibleRange(fullRange);
  }, [fullRange.max, fullRange.min]);

  return (
    <>
      <ChartSlider
        start={fullRange.min}
        end={fullRange.max}
        visibleRange={visibleRange}
        onRangeChange={setVisibleRange}
      />
      <div className="flex-grow-1 overflow-auto">
        {activeTimeSeries.map((timeSeries) => (
          <TimeSeriesDisplay
            key={timeSeries._id}
            timeSeries={timeSeries}
            fullRange={fullRange}
            visibleRange={visibleRange}
            onRangeChange={setVisibleRange}
          />
        ))}
      </div>
    </>
  );
};

export default TimeSeriesSection;
