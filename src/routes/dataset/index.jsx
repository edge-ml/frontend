import React from 'react';
import { useParams } from 'react-router-dom';
import useDataset from '../../Hooks/useDataset';
import useProjectAPI from '../../services/ApiServices/ProjectService';
import LabelingSelectionPanel from '../../components/LabelingSelectionPanel/LabelingSelectionPanel';
import { DatasetContext, DatasetProvider } from './DatasetContext';
import Loader from '../../modules/loader';
import { LabelingProvider } from './LabelingContext';
import useLabelings from '../../Hooks/useLabelings';
import LabelingPanel from '../../components/LabelingPanel/LabelingPanel';
import MetadataSidebar from './MetadataSidebar';
import TimeSeriesSection from './TimeSeriesSection';

import './index.css';
import useEditDataset from './useEditDataset';

const Dataset = () => {
  const { datasetId } = useParams();
  const { dataset, addLabel, deleteLabel } = useDataset(datasetId);
  const { labelings } = useLabelings();
  const datasetEdit = useEditDataset(dataset, labelings, deleteLabel);



  const {
    activeTimeSeries,
    setActiveTimeSeries,
    activeLabeling,
    setActiveLabeling,
    selectedLabelId,
    setStartEnd,
    setSelectedLabelId,
    onDeleteSelectedLabel
  } = datasetEdit;

  if (!dataset || !labelings) {
    return <Loader loading></Loader>;
  }

  console.log(setSelectedLabelId)

  return (
    <div>
      {/* <DatasetProvider dataset={dataset} addLabel={addLabel} labelings={labelings}> */}
      <LabelingProvider labelings={labelings}>
        <div className="d-flex w-100 h-100">
          <div className="d-flex flex-column justify-content-between flex-grow-1" style={{ height: "100vh" }}>
            <LabelingSelectionPanel
              activeTimeSeries={activeTimeSeries}
              setActiveTimeSeries={setActiveTimeSeries}
              activeLabeling={activeLabeling}
              selectedLabelId={selectedLabelId}
              setActiveLabeling={setActiveLabeling}
              labelings={labelings}
              dataset={dataset}
            ></LabelingSelectionPanel>
            <TimeSeriesSection
              labelings={labelings}
              dataset={dataset}
              activeTimeSeries={activeTimeSeries}
              setStartEnd={setStartEnd}
              activeLabeling={activeLabeling}
              selectedLabelId={selectedLabelId}
              setSelectedLabelId={setSelectedLabelId}
            ></TimeSeriesSection>
            <LabelingPanel
              activeLabeling={activeLabeling}
              selectedLabelId={selectedLabelId}
              onDeleteSelectedLabel={onDeleteSelectedLabel}
            ></LabelingPanel>
          </div>
          <MetadataSidebar
            dataset={dataset}
          >
          </MetadataSidebar>
        </div>
      </LabelingProvider>
      {/* </DatasetProvider> */}
    </div>
  );
};

export default Dataset;
