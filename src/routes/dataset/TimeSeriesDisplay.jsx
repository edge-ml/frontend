import React, { useEffect, useRef, useContext } from "react";
import useTimeSeriesData from "../../Hooks/useTimeSeriesData";
import { DatasetContext } from "./DatasetContext";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts/highstock";
import generateChartState from "./chartState";
import useChartEvents from "./useChartEvents";

import "./index.css";
import { use } from "react";

const TimeSeriesDisplay = ({ timeSeries }) => {
  const {
    dataset,
    activeDatasetLabels,
    activeLabeling,
    selectedLabel,
    setSelectedLabelId,
    provisonalLabel,
    setProvisionalLabelStart,
    setProvisionalLabelEnd,
  } = useContext(DatasetContext);

  const chartRef = useRef();
  const mouseDownRef = useRef(false);
  const minViewRef = useRef(0);
  const maxViewRef = useRef(0);

  let selectedDatasetLabeling = undefined;
  if (dataset?.labelings && activeLabeling) {
    selectedDatasetLabeling = dataset.labelings.find(
      (elm) => elm.labelingId === activeLabeling.id
    );
  }

  const { onMouseDown, onMouseMoved, onMouseUp, onClickPlotLine } =
    useChartEvents(chartRef, selectedDatasetLabeling);


  useEffect(() => {
    const mouseUpHandler = () => {
      console.log("mouse up");
      if (mouseDownRef.current) {
        mouseDownRef.current = false;
        refreshData();
      }
      onMouseUp(undefined, chartRef);
    };

    const mouseDownHandler = () => {
      console.log("mouse down");
      mouseDownRef.current = true;
    };

    document.addEventListener("mouseup", mouseUpHandler);
    document.addEventListener("mousedown", mouseDownHandler);

    return () => {
      document.removeEventListener("mouseup", mouseUpHandler);
      document.removeEventListener("mousedown", mouseDownHandler);
    };
  }, [onMouseUp]);

  const { timeSeriesData, getTimeSeriesPatial } = useTimeSeriesData(
    dataset.id,
    timeSeries.id
  );

  const refreshData = async () => {
    console.log(mouseDownRef.current);
    if (mouseDownRef.current) return;
    const res = await getTimeSeriesPatial(
      Math.floor(minViewRef.current),
      Math.ceil(maxViewRef.current)
    );
    const chart = chartRef.current.chart;
    chart.series[0].setData(res, false, false);
    chart.redraw(true);
  };

  const setExtremes = (min, max) => {
    minViewRef.current = min;
    maxViewRef.current = max;
  };

  const chartOptions = generateChartState(
    timeSeries,
    timeSeriesData,
    dataset,
    activeLabeling,
    selectedLabel,
    refreshData,
    onMouseDown,
    onClickPlotLine,
    onMouseMoved,
    setExtremes
  );

  return (
    <div className="m-2">
      <h4 className="fw-bold">{timeSeries.name}</h4>
      <div
        style={{ height: "200px" }}
        onMouseMove={(e) => onMouseMoved(e, chartRef)}
        onMouseUp={(e) => onMouseUp(e, chartRef)}
      >
        <HighchartsReact
          ref={chartRef}
          highcharts={Highcharts}
          options={chartOptions}
          onetoOne={true}
          constructorType={"stockChart"}
          containerProps={{ style: { height: "100%" } }}
        />
      </div>
    </div>
  );
};

export default TimeSeriesDisplay;
