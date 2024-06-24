import { generatePlotBands, generatePlotLines } from "./chartUtils";

const generateChartState = (
  ts,
  ts_data,
  labelings,
  selectedLabelId,
  refreshData,
  onChartClick
) => {
  const { name, unit, start, end } = ts;

  const plotBands = generatePlotBands(labelings, selectedLabelId);
  const plotLines = generatePlotLines(labelings, selectedLabelId);

  return {
    height: "200px",
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
        lineColor: "#000000", // Added line color
      },
      yAxis: {
        isInternal: true,
        lineColor: "#000000", // Added line color
        gridLineColor: "#000000", // Added grid line color
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
            color: "black", // Updated series line color
            enableMouseTracking: false,
          },
        ]
      : ts_data.map((dataItem, indexOuter) => {
          return {
            name: name[indexOuter] + " (" + unit[indexOuter] + ")",
            data: ts_data,
            lineWidth: 1.5,
            color: "black", // Updated series line color
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
      lineColor: "#000000", // Added line color
      tickColor: "#000000", // Added tick color
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
      lineColor: "rgb(233,233,233)", // Added line color
      gridLineColor: "rgb(233,233,233)", // Added grid line color
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
      buttonArrowColor: "rgb(233,233,233)", // Updated scrollbar arrow color
    },
    chart: {
      events: {
        click: (event) => {
          const xValue = event.xAxis[0];
          onChartClick(xValue);
        },
      },
    },
  };
};

export default generateChartState;
