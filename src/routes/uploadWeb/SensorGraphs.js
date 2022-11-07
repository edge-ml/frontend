import React from 'react';
import { Row } from 'reactstrap';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';

export const SensorGraphs = ({ sensorStore }) => (
  <React.Fragment>
    {Object.entries(sensorStore).map(([sensor, value]) => (
      <Row className="mt-3">
        <HighchartsReact
          highcharts={Highcharts}
          containerProps={{ style: { width: 'calc(95%)', margin: 'auto' } }}
          options={{
            chart: {
              animation: Highcharts.svg, // don't animate in old IE
            },
            boost: {
              // chart-level boost when there are more than 1 series in the chart
              useGPUTranslations: true,
              seriesThreshold: 1,
            },
            series: Object.entries(value).map(([component, data]) => ({
              name: component,
              data: data.map(({ timestamp, datapoint }) => [
                timestamp,
                datapoint,
              ]),
              marker: {
                enabled: false,
              },
            })),
            title: {
              text: sensor,
            },
            xAxis: {
              labels: {
                enabled: true,
                rotation: 20,
                overflow: 'allow',
              },
            },
            yAxis: {
              title: false,
              labels: {
                enabled: true,
              },
            },
          }}
        />
      </Row>
    ))}
  </React.Fragment>
);
