import React, { useEffect } from 'react';
import { useContext, useRef } from 'react';
import useTimeSeriesData from '../../Hooks/useTimeSeriesData';
import { DatasetContext } from './DatasetContext';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts/highstock';
import generateChartState from './chartState';
import useChartEvents from './useChartEvents'

import './index.css';

const TimeSeriesDisplay = ({ timeSeries }) => {

  const chartRef = useRef();
  const { dataset, activeDatasetLabels, selectedLabelId, startEnd, activeLabeling } =
    useContext(DatasetContext);

  const selectedDatasetLabeling = dataset.labelings.find(elm => elm.labelingId === activeLabeling._id);
  console.log(dataset)
  console.log(activeLabeling)
  console.log(selectedDatasetLabeling)

  const { onMouseDown, onMouseMoved, onMouseUp } = useChartEvents(chartRef, selectedDatasetLabeling);


  useEffect(() => {
    document.addEventListener('mousemove', onMouseMoved);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mousedown', onMouseDown)

    return () => {
      document.removeEventListener('mousemove', onMouseMoved);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mousedown', onMouseDown)
    }
  }, []);



  const { timeSeriesData, getTimeSeriesPatial } = useTimeSeriesData(
    dataset._id,
    timeSeries._id,
  );

  const refreshData = async (start, end) => {
    const res = await getTimeSeriesPatial(Math.floor(start), Math.ceil(end));
    const chart = chartRef.current.chart;
    chart.series[0].setData(res, false, false);
    chart.redraw(true)
  };

  const chartOptions = generateChartState(
    timeSeries,
    timeSeriesData,
    activeDatasetLabels,
    selectedLabelId,
    refreshData,
  );

  console.log(startEnd);

  return (
    <div className="m-2">
      <h4 className="fw-bold">{timeSeries.name}</h4>
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
