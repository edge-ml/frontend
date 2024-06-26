import React, { useState, useEffect } from "react";
import { updateDataset } from "../../services/ApiServices/DatasetServices";

const useEditDataset = (datasetUtils, labelings) => {

    const { dataset, deleteLabel, addLabel } = datasetUtils;

    console.log(datasetUtils)

    const getActivateLabeling = () => {

        if (labelings && dataset && dataset.labelings && dataset.labelings.length > 0) {
            const labelingId = dataset.labelings[0].labelingId;
            return labelings.find(elm => elm._id === labelingId);
        }

        if (labelings && labelings.length > 0) {
            return labelings[0];
        }
        return undefined;

    }

    const [activeTimeSeries, setActiveTimeSeries] = useState([]);
    const [activeLabeling, _setActiveLabeling] = useState(getActivateLabeling());
    const [selectedLabelId, setSelectedLabelId] = useState(undefined);
    const [start, setStart] = useState(undefined);
    const [end, setEnd] = useState(undefined);
    const [selectedLabelTypeId, setSelectedLabelTypeId] = useState(undefined);
    const [provisionalLabel, _setProvisionalLabel] = useState(undefined);

    useEffect(() => {
        if (dataset) {
            setActiveTimeSeries(dataset.timeSeries);
            const activeLabeling = getActivateLabeling();
            setActiveLabeling(activeLabeling);
            if (activeLabeling && activeLabeling.labels.length > 0) {
                setSelectedLabelTypeId(activeLabeling.labels[0]._id)
            }
        }
    }, [dataset]);

    useEffect(() => {
        if (labelings && labelings.length > 0) {
            const activeLabeling = getActivateLabeling();
            setActiveLabeling(activeLabeling)
            if (activeLabeling && activeLabeling.labels.length > 0) {
                setSelectedLabelTypeId(activeLabeling.labels[0]._id)
            }
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

    const setActiveLabeling = (labeling) => {
        _setActiveLabeling(labeling);
        if (labeling && labeling.labels.length > 0) {
            setSelectedLabelTypeId(labeling.labels[0]._id)
        }
    }


    const setProvisionalLabel = (label) => {
        if (provisionalLabel) {
            // Set label
            if (label) {
                const updatedLabel = {
                    ...provisionalLabel,
                    end: label.end
                }
                if (updatedLabel.start > updatedLabel.end) {
                    const temp = updatedLabel.start;
                    updatedLabel.start = updatedLabel.end;
                    updatedLabel.end = temp;
                }
                const labelToAdd = {
                    ...updatedLabel,
                    name: activeLabeling.labels.find(elm => elm._id === updatedLabel.type).name
                };
                addLabel(activeLabeling._id, labelToAdd);
            }
            _setProvisionalLabel(undefined)
            return;
        }

        _setProvisionalLabel(label);

    }

    return {
        activeTimeSeries,
        setActiveTimeSeries,
        activeLabeling,
        setActiveLabeling,
        selectedLabelId,
        setSelectedLabelId,
        setStartEnd,
        onDeleteSelectedLabel,
        selectedLabelTypeId,
        setSelectedLabelTypeId,
        provisionalLabel,
        setProvisionalLabel
    };
}

export default useEditDataset;
