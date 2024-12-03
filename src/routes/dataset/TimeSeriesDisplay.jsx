import React, { useEffect, useRef, useContext } from "react";
import useTimeSeriesData from "../../Hooks/useTimeSeriesData";
import { DatasetContext } from "./DatasetContext";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts/highstock";
import generateChartState from "./chartState";
import useChartEvents from "./useChartEvents";

import "./index.css";

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
  const mouseDownRef = useRef(false); // Use a ref to track mouseDown state

  let selectedDatasetLabeling = undefined;
  if (dataset && dataset.labelings && activeLabeling) {
    selectedDatasetLabeling = dataset.labelings.find(
      (elm) => elm.labelingId === activeLabeling._id
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
      onMouseUp();
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
    dataset._id,
    timeSeries._id
  );

  const refreshData = async (start, end) => {
    console.log(mouseDownRef.current); // Access ref value
    if (mouseDownRef.current) return;
    const res = await getTimeSeriesPatial(Math.floor(start), Math.ceil(end));
    const chart = chartRef.current.chart;
    chart.series[0].setData(res, false, false);
    chart.redraw(true);
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
    onMouseMoved
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
        ></HighchartsReact>
      </div>
    </div>
  );
};

export default TimeSeriesDisplay;