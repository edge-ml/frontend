import { Highcharts } from 'highcharts/modules/stock';

export const generateState = (
  props,
  labelingToPlotBands,
  labelingToPlotLines
) => {
  return {
    popupOpen: false,
    height: '200px',
    chartOptions: {
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
      series: {
        showInLegend: false,
        name:
          props.unit === '' ? props.name : props.name + ' (' + props.unit + ')',
        data: props.data,
        lineWidth: 1.5,
        enableMouseTracking: false,
      },
      xAxis: {
        lineWidth: 1,
        tickLength: 10,
        labels: {
          enabled: true,
        },
        type: 'datetime',
        ordinal: false,
        // plotBands:
        //     labelingToPlotBands(
        //         props.labeling,
        //         props.labelTypes,
        //         props.selectedLabelId
        //     ),
        // plotLines:
        //     labelingToPlotLines(
        //         props.labeling.labels,
        //         props.labelTypes,
        //         props.selectedLabelId
        //     ),
        crosshair: false,
        min: props.start,
        max: props.end,
        startOnTick: !props.isEmpty,
        endOnTick: !props.isEmpty,
        events: {
          afterSetExtremes: (e) => {
            Highcharts.charts.forEach((elm) => {
              if (elm) {
                elm.xAxis[0].setExtremes(
                  e.min,
                  e.max,
                  e.target.width,
                  false,
                  false
                );
              }
            });
          },
        },
      },
      yAxis: {
        gridLineWidth: 1,
        labels: {
          enabled: false,
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
        enabled: false,
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
    },
    labeling: props.labeling,
    labelTypes: props.labelTypes,
    selectedLabelId: props.selectedLabelId,
    onLabelClicked: props.onLabelClicked,
    onScrubbed: props.onScrubbed,
    // controlStates: {
    //     activePlotLineId: !this.state
    //         ? undefined
    //         : this.state.controlStates.activePlotLineId,
    // },
  };
};
