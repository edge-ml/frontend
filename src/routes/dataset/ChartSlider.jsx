import { useContext, useRef } from 'react';
import { TimeSeriesContext } from './TimeSeriesContext';
import HighchartsReact from 'highcharts-react-official';
import { Highcharts } from 'highcharts/modules/stock';
import generateChartState from './chartState';

const ChartSlider = () => {
  const chartRef = useRef();

  const generateState = () => {
    return {
      popupOpen: false,
      height: '200px',
      chartOptions: {
        height: '200px',
        navigator: {
          maskFill: '#0080ff22',
          enabled: this.props.index === 0,
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
        series:
          this.props.index === 0
            ? [
                {
                  lineWidth: 0,
                  marker: {
                    enabled: false,
                    states: {
                      hover: {
                        enabled: false,
                      },
                    },
                  },
                  data: props.data,
                  enableMouseTracking: false,
                },
              ]
            : !Array.isArray(props.name)
              ? [
                  {
                    showInLegend: false,
                    name:
                      props.unit === ''
                        ? props.name
                        : props.name + ' (' + props.unit + ')',
                    data: props.data,
                    lineWidth: 1.5,
                    enableMouseTracking: false,
                  },
                ]
              : props.data.map((dataItem, indexOuter) => {
                  return {
                    name:
                      props.name[indexOuter] +
                      ' (' +
                      props.unit[indexOuter] +
                      ')',
                    data: props.data,
                    lineWidth: 1.5,
                    enableMouseTracking: false,
                  };
                }),
        xAxis: {
          lineWidth: this.props.index === 0 ? 0 : 1,
          tickLength: this.props.index === 0 ? 0 : 10,
          labels: {
            enabled: this.props.index !== 0,
          },
          type: 'datetime',
          ordinal: false,
          plotBands:
            this.props.index === 0
              ? undefined
              : this.labelingToPlotBands(
                  props.labeling,
                  props.labelTypes,
                  props.selectedLabelId,
                ),
          plotLines:
            //state.chartOptions.xAxis.plotLines
            this.props.index === 0
              ? undefined
              : this.labelingToPlotLines(
                  props.labeling.labels,
                  props.labelTypes,
                  props.selectedLabelId,
                ),
          crosshair: false,
          min: props.start,
          max: props.end,
          events: {
            afterSetExtremes: (e) => {
              this.min = e.min;
              this.max = e.max;
              this.width = e.target.width;
              this.changeNavigator = true;
              Highcharts.charts.forEach((elm) => {
                if (elm) {
                  elm.xAxis[0].setExtremes(
                    e.min,
                    e.max,
                    e.target.width,
                    false,
                    false,
                  );
                }
              });
            },
          },
        },
        yAxis: {
          height: this.props.index === 0 ? 0 : undefined,
          gridLineWidth: this.props.index === 0 ? 0 : 1,
          labels: {
            enabled: this.props.index !== 0,
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
          enabled: this.props.index !== 0,
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
      controlStates: {
        activePlotLineId: !this.state
          ? undefined
          : this.state.controlStates.activePlotLineId,
      },
    };
  };

  return (
    <div>
      <HighchartsReact
        ref={chartRef}
        highcharts={Highcharts}
        options={generateState()}
        onetoOne={true}
        constructorType={'stockChart'}
        containerProps={{ style: { height: '100%' } }}
      ></HighchartsReact>
    </div>
  );
};

export default ChartSlider;
