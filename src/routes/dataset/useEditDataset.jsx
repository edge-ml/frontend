import React, { useState, useEffect } from "react";

const useEditDataset = (dataset, labelings) => {
    const [activeTimeSeries, setActiveTimeSeries] = useState([]);
    const [activeLabeling, setActiveLabeling] = useState(undefined);
    const [selectedLabelId, setSelectedLabelId] = useState(undefined);
    const [start, setStart] = useState(undefined);
    const [end, setEnd] = useState(undefined);

    useEffect(() => {
        if (dataset) {
            setActiveTimeSeries(dataset.timeSeries);
        }
    }, [dataset]);

    useEffect(() => {
        if (labelings && labelings.length > 0) {
            setActiveLabeling(labelings[0]);
        }
    }, [labelings]);

    const setStartEnd = (start, end) => {
        setStart(start);
        setEnd(end);
    }

    return {
        activeTimeSeries,
        setActiveTimeSeries,
        activeLabeling,
        setActiveLabeling,
        selectedLabelId,
        setStartEnd
    };
}

export default useEditDataset;
