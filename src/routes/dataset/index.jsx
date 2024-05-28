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

const Dataset = () => {
  const { datasetId } = useParams();
  const { dataset } = useDataset(datasetId);
  const { labelings } = useLabelings();

  if (!dataset || !labelings) {
    return <Loader loading></Loader>;
  }

  return (
    <div>
      <DatasetProvider dataset={dataset} labelings={labelings}>
        <LabelingProvider labelings={labelings}>
          <div className="d-flex w-100">
            <div className="d-flex flex-column justify-content-between flex-grow-1">
              <LabelingSelectionPanel
                dataset={dataset}
              ></LabelingSelectionPanel>
              <TimeSeriesSection></TimeSeriesSection>
              <LabelingPanel></LabelingPanel>
            </div>
            <MetadataSidebar></MetadataSidebar>
          </div>
        </LabelingProvider>
      </DatasetProvider>
    </div>
  );
};

export default Dataset;
