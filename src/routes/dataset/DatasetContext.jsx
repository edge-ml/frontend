import React from "react";
import { createContext, useState } from "react";
import useLabelings from "../../Hooks/useLabelings";

const DatasetContext = createContext();

const DatasetProvider = ({ children, dataset, labelings, datasetEdit }) => {
  
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
