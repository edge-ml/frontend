import React, { useState, useEffect } from "react";
import { updateDataset } from "../../services/ApiServices/DatasetServices";

const useEditDataset = (dataset, labelings, deleteLabel) => {

    const getActivateLabeling = () => {

        if (labelings && dataset && dataset.labelings) {
            const labelingId = dataset.labelings[0].labelingId;
            return labelings.find(elm => elm._id === labelingId);
        }

        if (labelings && labelings.length > 0) {
            return labelings[0];
        }
        return undefined;

    }

    const [activeTimeSeries, setActiveTimeSeries] = useState([]);
    const [activeLabeling, setActiveLabeling] = useState(getActivateLabeling());
    const [selectedLabelId, setSelectedLabelId] = useState(undefined);
    const [start, setStart] = useState(undefined);
    const [end, setEnd] = useState(undefined);


    useEffect(() => {
        if (dataset) {
            setActiveTimeSeries(dataset.timeSeries);
            setActiveLabeling(getActivateLabeling())
        }
    }, [dataset]);

    useEffect(() => {
        if (labelings && labelings.length > 0) {
            setActiveLabeling(getActivateLabeling())
        }
    }, [labelings]);

    const setStartEnd = (start, end) => {
        setStart(start);
        setEnd(end);
    }

    const onDeleteSelectedLabel = () => {
        if (selectedLabelId) {
            deleteLabel(selectedLabelId);
            setSelectedLabelId(undefined);
        }
    }

    return {
        activeTimeSeries,
        setActiveTimeSeries,
        activeLabeling,
        setActiveLabeling,
        selectedLabelId,
        setSelectedLabelId,
        setStartEnd,
        onDeleteSelectedLabel
    };
}

export default useEditDataset;
