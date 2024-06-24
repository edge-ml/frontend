import React from "react";
import { useContext } from "react";
import { DatasetContext } from "./DatasetContext";
import TimeSeriesDisplay from "./TimeSeriesDisplay";
import ChartSlider from "./ChartSlider";

const TimeSeriesSection = ({ selectedLabeling }) => {
  const { activeSeries } = useContext(DatasetContext);

  const globalStart = Math.min(...activeSeries.map((elm) => elm.start));
  const globalEnd = Math.max(...activeSeries.map((elm) => elm.end));

  return (
    <>
      <ChartSlider start={globalStart} end={globalEnd}></ChartSlider>
      <div className="flex-grow-1 overflow-auto">
        {activeSeries.map((elm, index) => (
          <TimeSeriesDisplay
            key={activeSeries.name + index}
            timeSeries={elm}
          ></TimeSeriesDisplay>
        ))}
      </div>
    </>
  );
};

export default TimeSeriesSection;
