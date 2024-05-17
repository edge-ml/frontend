import { useContext } from 'react';
import { TimeSeriesContext } from './TimeSeriesContext';
import TimeSeriesDisplay from './TimeSeriesDisplay';
import ChartSlider from './ChartSlider';

const TimeSeriesSection = () => {
  const { activeSeries } = useContext(TimeSeriesContext);

  return (
    <div>
      <ChartSlider></ChartSlider>
      {activeSeries.map((elm) => (
        <TimeSeriesDisplay timeSeries={elm}></TimeSeriesDisplay>
      ))}
    </div>
  );
};

export default TimeSeriesSection;
