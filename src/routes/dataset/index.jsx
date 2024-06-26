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
  const datasetUtils = useDataset(datasetId);
  const { labelings } = useLabelings();
  const datasetEdit = useEditDataset(datasetUtils, labelings);


  const { dataset, addLabel, deleteLabel } = datasetUtils


  // const {
  //   activeTimeSeries,
  //   setActiveTimeSeries,
  //   activeLabeling,
  //   setActiveLabeling,
  //   selectedLabelId,
  //   setStartEnd,
  //   setSelectedLabelId,
  //   onDeleteSelectedLabel,
  //   selectedLabelTypeId,
  //   setSelectedLabelTypeId,
  //   provisionalLabel,
  //   setProvisionalLabelEnd,
  //   setProvisionalLabelStart
  // } = datasetEdit;

  if (!dataset || !labelings) {
    return <Loader loading></Loader>;
  }

  return (
    <div>
      <DatasetProvider dataset={dataset} labelings={labelings} datasetEdit={datasetEdit}>
        <LabelingProvider labelings={labelings}>
          <div className="d-flex w-100 h-100">
            <div className="d-flex flex-column justify-content-between flex-grow-1" style={{ height: "100vh" }}>
              <LabelingSelectionPanel></LabelingSelectionPanel>
              <TimeSeriesSection></TimeSeriesSection>
              <LabelingPanel></LabelingPanel>
            </div>
            <MetadataSidebar></MetadataSidebar>
          </div>
        </LabelingProvider>
      </DatasetProvider>
      {/* </DatasetProvider> */}
    </div>
  );
};

export default Dataset;
