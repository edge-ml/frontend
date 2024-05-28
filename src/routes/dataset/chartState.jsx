import useTimeSeriesData from '../../Hooks/useTimeSeriesData';
import { generatePlotBands, generatePlotLines } from './chartUtils';
import Highcharts from 'highcharts/highstock';

const generateChartState = (
  ts,
  ts_data,
  labelings,
  selectedLabelId,
  refreshData,
) => {
  const { name, unit, start, end } = ts;

  const plotBands = generatePlotBands(labelings, selectedLabelId);

  const plotLines = generatePlotLines(labelings, selectedLabelId);
  console.log(plotLines);

  return {
    height: '200px',
    navigator: {
      maskFill: '#0080ff22',
      enabled: false,
      series: {
        color: '#ffffff',
        lineWidth: 0,
      },
      xAxis: {
        crosshair: false,
        isInternal: true,
      },
      yAxis: {
        isInternal: true,
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
            name: unit === '' ? name : name + ' (' + unit + ')',
            data: ts_data,
            lineWidth: 1.5,
            enableMouseTracking: false,
          },
        ]
      : ts_data.map((dataItem, indexOuter) => {
          return {
            name: name[indexOuter] + ' (' + unit[indexOuter] + ')',
            data: ts_data,
            lineWidth: 1.5,
            enableMouseTracking: false,
          };
        }),
    xAxis: {
      lineWidth: false ? 0 : 1,
      tickLength: false ? 0 : 10,
      labels: {
        enabled: true,
      },
      type: 'datetime',
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
    },
    yAxis: {
      height: false ? 0 : undefined,
      gridLineWidth: false ? 0 : 1,
      labels: {
        enabled: true,
        align: 'left',
        x: 0,
        y: -2,
      },
      title: {
        enabled: false,
      },
      opposite: false,
    },
    legend: {
      align: 'left',
      verticalAlign: 'center',
      layout: 'vertical',
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
      buttonArrowColor: '#fff',
    },
  };
};

export default generateChartState;
