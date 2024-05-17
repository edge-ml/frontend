import { createContext, useState } from 'react';

const TimeSeriesContext = createContext();

const TimeSeriesProvider = ({ children, dataset }) => {
  const dataset_id = dataset._id;
  const [timeSeries, setTimeSeries] = useState(dataset.timeSeries);
  const [activeSeries, setActiveSeries] = useState(dataset.timeSeries);

  return (
    <TimeSeriesContext.Provider
      value={{ activeSeries, timeSeries, dataset_id }}
    >
      {children}
    </TimeSeriesContext.Provider>
  );
};

export { TimeSeriesProvider, TimeSeriesContext };
