import React from "react";
import { createContext, useState } from "react";
import useLabelings from "../../Hooks/useLabelings";

const DatasetContext = createContext();

const DatasetProvider = ({ children, dataset, labelings, addLabel }) => {
  const [timeSeries, setTimeSeries] = useState(dataset.timeSeries);
  const [activeSeries, setActiveSeries] = useState(dataset.timeSeries);
  const [startEnd, _setStartEnd] = useState({
    start: undefined,
    end: undefined,
  });
  const [activeLabeling, _setActiveLabeling] = useState(labelings[0]);
  const [selectedLabelId, setSelectedLabelId] = useState(undefined);
  const [provisionalLabeling, setProvisionalLabeling] = useState(undefined);
  const [selectedLabelTypeId, setSelectedLabelTypeId] = useState(
    labelings[0].labels[0]._id
  );

  const setActiveLabeling = (labeling) => {
    _setActiveLabeling(labeling);
  };

  const generateDatasetLabels = () => {
    if (!labelings) return [];
    console.log(activeLabeling);
    const datasetLabeling = {
      ...dataset.labelings.find((elm) => elm.labelingId === activeLabeling._id),
    };
    if (!datasetLabeling) {
      return { labels: [] };
    }
    console.log(provisionalLabeling);
    const usedLabels = provisionalLabeling
      ? [...datasetLabeling.labels, provisionalLabeling]
      : datasetLabeling.labels;
    datasetLabeling.labels = usedLabels.map((elm) => {
      const label = activeLabeling.labels.find((l) => l._id === elm.type);
      return { ...label, ...elm };
    });

    return datasetLabeling;
  };

  const setStartEnd = (start, end) => {
    _setStartEnd({ start: start, end: end });
  };

  const activeDatasetLabels = generateDatasetLabels();

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
        selectedLabelId,
        setSelectedLabelId,
        selectedLabelTypeId,
        setSelectedLabelTypeId,
        setProvisionalLabeling,
        provisionalLabeling,
        addLabel,
      }}
    >
      {children}
    </DatasetContext.Provider>
  );
};

export { DatasetProvider, DatasetContext };
