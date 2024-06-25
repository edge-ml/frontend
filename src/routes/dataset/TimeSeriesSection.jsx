import React from "react";
import { useContext } from "react";
import { DatasetContext } from "./DatasetContext";
import TimeSeriesDisplay from "./TimeSeriesDisplay";
import ChartSlider from "./ChartSlider";

const TimeSeriesSection = ({
  activeTimeSeries,
  activeLabeling,
  lableings,
  dataset,
  selectedLabelId,
  setSelectedLabelId,
  setStartEnd }) => {

    console.log(selectedLabelId)

  const globalStart = Math.min(...activeTimeSeries.map((elm) => elm.start));
  const globalEnd = Math.max(...activeTimeSeries.map((elm) => elm.end));

  return (
    <>
      <ChartSlider start={globalStart} end={globalEnd} setStartEnd={setStartEnd}></ChartSlider>
      <div className="flex-grow-1 overflow-auto">
        {activeTimeSeries.map((elm, index) => (
          <TimeSeriesDisplay
            key={activeTimeSeries.name + index}
            timeSeries={elm}
            labelings={lableings}
            dataset={dataset}
            activeLabeling={activeLabeling}
            selectedLabelId={selectedLabelId}
            setSelectedLabelId={setSelectedLabelId}
          ></TimeSeriesDisplay>
        ))}
      </div>
    </>
  );
};

export default TimeSeriesSection;
