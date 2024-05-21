import { createContext, useState } from 'react';
import useLabelings from '../../Hooks/useLabelings';

const DatasetContext = createContext();

const DatasetProvider = ({ children, dataset, labelings }) => {
  const [timeSeries, setTimeSeries] = useState(dataset.timeSeries);
  const [activeSeries, setActiveSeries] = useState(dataset.timeSeries);
  const [startEnd, _setStartEnd] = useState({
    start: undefined,
    end: undefined,
  });
  const [activeLabeling, _setActiveLabeling] = useState(labelings[0]);

  const setActiveLabeling = (labeling) => {
    _setActiveLabeling(labeling);
  };

  const generateDatasetLabels = () => {
    if (!labelings) return [];
    console.log(activeLabeling);
    const datasetLabeling = dataset.labelings.find(
      (elm) => elm.labelingId === activeLabeling._id,
    );
    if (!datasetLabeling) {
      return { labels: [] };
    }
    datasetLabeling.labels = datasetLabeling.labels.map((elm) => {
      const label = activeLabeling.labels.find((l) => l._id === elm.type);
      return { ...label, ...elm };
    });

    return datasetLabeling;
  };

  const setStartEnd = (start, end) => {
    _setStartEnd({ start: start, end: end });
  };

  const activeDatasetLabels = generateDatasetLabels();

  console.log();

  return (
    <DatasetContext.Provider
      value={{
        dataset,
        labelings,
        activeSeries,
        timeSeries,
        setActiveSeries,
        activeDatasetLabels,
        // selectedLabelId,
        startEnd,
        setStartEnd,
        setActiveLabeling,
        activeLabeling,
      }}
    >
      {children}
    </DatasetContext.Provider>
  );
};

export { DatasetProvider, DatasetContext };
