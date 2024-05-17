import { useContext, useRef } from 'react';
import useTimeSeriesData from '../../Hooks/useTimeSeriesData';
import { TimeSeriesContext } from './TimeSeriesContext';
import HighchartsReact from 'highcharts-react-official';
import { Highcharts } from 'highcharts/modules/stock';
import generateChartState from './chartState';

const TimeSeriesDisplay = ({ timeSeries }) => {
  const { dataset_id } = useContext(TimeSeriesContext);
  const timeSeriesData = useTimeSeriesData(dataset_id, timeSeries._id);

  const chartRef = useRef();

  return (
    <div>
      <div>{timeSeries.name}</div>
      <HighchartsReact
        ref={chartRef}
        highcharts={Highcharts}
        options={generateChartState()}
        onetoOne={true}
        constructorType={'stockChart'}
        containerProps={{ style: { height: '100%' } }}
      ></HighchartsReact>
    </div>
  );
};

export default TimeSeriesDisplay;
