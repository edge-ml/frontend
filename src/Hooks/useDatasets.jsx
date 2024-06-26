import React, { useState, useEffect } from "react";

import useDatasetAPI from "../services/ApiServices/DatasetServices";


const useDatasets = () => {
    const [datasets, setDatasets] = useState(undefined);

    const datasetAPI = useDatasetAPI();

    const refreshDatasets = async () => {
        const res = await datasetAPI.getDatasets();
        
        setDatasets(res);
    };


    useEffect(() => {
        refreshDatasets();
    }, []);

    return { datasets };
}

export default useDatasets;