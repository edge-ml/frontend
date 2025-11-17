import React, { useState, useEffect } from "react";
import { getDatasets } from "../services/ApiServices/DatasetServices";

const useDatasets = () => {
  const [datasets, setDatasets] = useState(undefined);

  const refreshDatasets = async () => {
    const res = await getDatasets();

    setDatasets(res);
  };

  useEffect(() => {
    refreshDatasets();
  }, []);

  return { datasets };
};

export default useDatasets;
