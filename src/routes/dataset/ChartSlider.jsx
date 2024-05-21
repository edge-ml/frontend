import { useContext, useRef } from 'react';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts/highstock';
import { DatasetContext } from './DatasetContext';

const ChartSlider = ({ start, end }) => {
  const chartRef = useRef();

  const { setStartEnd } = useContext(DatasetContext);

  const data = [];
  const step = (end - start) / (window.innerWidth - 1);
  for (var i = 0; i < window.innerWidth; i++) {
    data.push([start + step * i, 0]);
  }

  const generateState = () => {
    return {
      navigator: {
        maskFill: '#0080ff22',
        enabled: true,
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
      series: [
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
          data: data,
          enableMouseTracking: false,
        },
      ],
      xAxis: {
        lineWidth: 0,
        tickLength: 0,
        labels: {
          enabled: false,
        },
        type: 'datetime',
        ordinal: false,
        crosshair: false,
        min: start,
        max: end,
        // events: {
        //   afterSetExtremes: (e) => {
        //     const min = e.min;
        //     const max = e.max;
        //     // setStartEnd(min, max);
        //   },
        // },
        events: {
          afterSetExtremes: (e) => {
            console.log(e);
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
        height: 0,
        gridLineWidth: 0,
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
    };
  };

  return (
    <div style={{ height: '80px' }}>
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
