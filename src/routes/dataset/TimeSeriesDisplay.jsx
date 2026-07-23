import React, { useContext, useState } from "react";
import useTimeSeriesData from "../../Hooks/useTimeSeriesData";
import { DatasetContext } from "./DatasetContext";
import TimeSeriesChart from "./TimeSeriesChart";

const TimeSeriesDisplay = ({
  timeSeries,
  fullRange,
  visibleRange,
  onRangeChange,
}) => {
  const {
    dataset,
    labelsToShow,
    selectedLabel,
    setSelectedLabel,
    onPlotClick,
    updateLabelStartEnd,
  } = useContext(DatasetContext);
  const [chartWidth, setChartWidth] = useState(window.innerWidth);
  const { timeSeriesData } = useTimeSeriesData(
    dataset._id,
    timeSeries._id,
    visibleRange,
    chartWidth
  );

  return (
    <section className="m-2">
      <h4 className="fw-bold">{timeSeries.name}</h4>
      <TimeSeriesChart
        name={timeSeries.name}
        unit={timeSeries.unit}
        points={timeSeriesData}
        fullRange={fullRange}
        visibleRange={visibleRange}
        labels={labelsToShow}
        selectedLabel={selectedLabel}
        onPlotClick={onPlotClick}
        onRangeChange={onRangeChange}
        onLabelSelect={setSelectedLabel}
        onBoundaryCommit={updateLabelStartEnd}
        onWidthChange={setChartWidth}
      />
    </section>
  );
};

export default TimeSeriesDisplay;
