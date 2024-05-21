import { useContext, useRef } from 'react';
import useTimeSeriesData from '../../Hooks/useTimeSeriesData';
import { DatasetContext } from './DatasetContext';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts/highstock';
import generateChartState from './chartState';

import './index.css';

const TimeSeriesDisplay = ({ timeSeries }) => {
  const { dataset, activeDatasetLabels, selectedLabelId, startEnd } =
    useContext(DatasetContext);
  const { timeSeriesData } = useTimeSeriesData(dataset._id, timeSeries._id);

  const chartRef = useRef();
  const chartOptions = generateChartState(
    timeSeries,
    timeSeriesData,
    activeDatasetLabels,
    selectedLabelId,
  );

  console.log(startEnd);

  return (
    <div className="m-2">
      <h4 className="font-weight-bold">{timeSeries.name}</h4>
      <div style={{ height: '200px' }}>
        <HighchartsReact
          ref={chartRef}
          highcharts={Highcharts}
          options={chartOptions}
          onetoOne={true}
          constructorType={'stockChart'}
          containerProps={{ style: { height: '100%' } }}
        ></HighchartsReact>
      </div>
    </div>
  );
};

export default TimeSeriesDisplay;
