import React, { useEffect, useState } from "react";
import { useContext } from "react";
import { DatasetContext } from "./DatasetContext";
import TimeSeriesDisplay from "./TimeSeriesDisplay";
import ChartSlider from "./ChartSlider";
import DeleteModal from "../../components/Common/DeleteModal";

const TimeSeriesSection = ({}) => {
  const {
    activeTimeSeries,
    onDeleteSelectedLabel,
    selectedLabel,
  } = useContext(DatasetContext);

  const globalStart = Math.min(...activeTimeSeries.map((elm) => elm.start));
  const globalEnd = Math.max(...activeTimeSeries.map((elm) => elm.end));

  return (
    <>
      <ChartSlider
        start={globalStart}
        end={globalEnd}
      ></ChartSlider>
      <div className="flex-grow-1 overflow-auto">
        {activeTimeSeries.map((elm, index) => (
          <TimeSeriesDisplay
            key={elm._id + index}
            timeSeries={elm}
          ></TimeSeriesDisplay>
        ))}
      </div>
    </>
  );
};

export default TimeSeriesSection;
