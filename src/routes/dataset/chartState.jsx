import { useContext } from "react";
import { generatePlotBands, generatePlotLines } from "./chartUtils";
import { DatasetContext } from "./DatasetContext";

const generateChartState = (
  ts,
  ts_data,
  dataset,
  activeLabeling,
  selectedLabelId,
  refreshData,
  onChartClick,
  onClickLabel
) => {
  const { name, unit, start, end } = ts;

  let plotBands = [];
  let plotLines = [];

  const { labelsToShow } = useContext(DatasetContext);


  plotBands = generatePlotBands(labelsToShow, selectedLabelId, onClickLabel);
  plotLines = generatePlotLines(labelsToShow, selectedLabelId, onClickLabel);






  return {
    chart: {
      zooming: {
        mouseWheel: {
          enabled: false
        }
      },
      events: {
        click: (event) => {
          const xValue = event.xAxis[0];
          onChartClick(xValue);
        },
      },
    },
    navigator: {
      maskFill: "#0080ff22",
      enabled: false,
      series: {
        color: "#000000",
        lineWidth: 0,
      },
      xAxis: {
        crosshair: false,
        isInternal: true,
        lineColor: "#000000",
      },
      yAxis: {
        isInternal: true,
        lineColor: "#000000",
        gridLineColor: "#000000",
      },
      stickyTracking: false,
    },
    rangeSelector: {
      enabled: false,
    },
    panning: false,
    title: null,
    series: !Array.isArray(name)
      ? [
        {
          showInLegend: false,
          name: unit === "" ? name : name + " (" + unit + ")",
          data: ts_data,
          lineWidth: 1.5,
          color: "black",
          enableMouseTracking: false,
        },
      ]
      : ts_data.map((dataItem, indexOuter) => {
        return {
          name: name[indexOuter] + " (" + unit[indexOuter] + ")",
          data: ts_data,
          lineWidth: 1.5,
          color: "black",
          enableMouseTracking: false,
        };
      }),
    xAxis: {
      lineWidth: 1,
      tickLength: 10,
      labels: {
        enabled: true,
      },
      type: "datetime",
      ordinal: false,
      plotBands: plotBands,
      plotLines: plotLines,
      crosshair: false,
      min: start,
      max: end,
      events: {
        afterSetExtremes: (e) => {
          refreshData(e.min, e.max);
        },
      },
      lineColor: "#000000",
      tickColor: "#000000",
    },
    yAxis: {
      height: undefined,
      gridLineWidth: 1,
      labels: {
        enabled: true,
        align: "left",
        x: 0,
        y: -2,
      },
      title: {
        enabled: false,
      },
      opposite: false,
      lineColor: "rgb(233,233,233)",
      gridLineColor: "rgb(233,233,233)",
    },
    legend: {
      align: "left",
      verticalAlign: "center",
      layout: "vertical",
      x: 45,
      y: 0,
      enabled: true,
    },
    tooltip: {
      enabled: false,
    },
    credits: {
      enabled: false,
    },
    scrollbar: {
      height: 0,
      buttonArrowColor: "rgb(233,233,233)",
    },
  };
};

export default generateChartState;
