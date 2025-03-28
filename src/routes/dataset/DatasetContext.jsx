import React from "react";
import { createContext, useState } from "react";
import useLabelings from "../../Hooks/useLabelings";

const DatasetContext = createContext();

const DatasetProvider = ({ children, dataset, labelings, datasetEdit }) => {
  // const setActiveLabeling = (labeling) => {
  //   _setActiveLabeling(labeling);
  // };

  // const generateDatasetLabels = () => {
  //   if (!labelings) return [];
  //
  //   const datasetLabeling = {
  //     ...dataset.labelings.find((elm) => elm.labelingId === activeLabeling._id),
  //   };
  //   if (!datasetLabeling) {
  //     return { labels: [] };
  //   }
  //
  //   const usedLabels = provisionalLabeling
  //     ? [...datasetLabeling.labels, provisionalLabeling]
  //     : datasetLabeling.labels;
  //   if (!usedLabels) {
  //     return { labels: [] };
  //   }
  //   datasetLabeling.labels = usedLabels.map((elm) => {
  //     const label = activeLabeling.labels.find((l) => l._id === elm.type);
  //     return { ...label, ...elm };
  //   });

  //   return datasetLabeling;
  // };

  // const setStartEnd = (start, end) => {
  //   _setStartEnd({ start: start, end: end });
  // };

  return (
    <DatasetContext.Provider
      value={{
        dataset,
        labelings,
        ...datasetEdit,
      }}
    >
      {children}
    </DatasetContext.Provider>
  );
};

export { DatasetProvider, DatasetContext };
