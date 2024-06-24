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
  const { dataset, activeDatasetLabels, startEnd, activeLabeling } =
    useContext(DatasetContext);

  const selectedDatasetLabeling = dataset.labelings.find(elm => elm.labelingId === activeLabeling._id);


  const { onMouseDown, onMouseMoved, onMouseUp, selectedLabelId } = useChartEvents(chartRef, selectedDatasetLabeling);


  useEffect(() => {
    document.addEventListener('mousemove', onMouseMoved);
    document.addEventListener('mouseup', onMouseUp);

    return () => {
      document.removeEventListener('mousemove', onMouseMoved);
      document.removeEventListener('mouseup', onMouseUp);
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
    onMouseDown
  );

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
