import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import useDataset from "../../Hooks/useDataset";
import LabelingSelectionPanel from "../../components/LabelingSelectionPanel/LabelingSelectionPanel";
import { DatasetProvider } from "./DatasetContext";
import Loader from "../../modules/loader";
import { LabelingProvider } from "./LabelingContext";
import useLabelings from "../../Hooks/useLabelings";
import LabelingPanel from "../../components/LabelingPanel/LabelingPanel";
import MetadataSidebar from "./MetadataSidebar";
import TimeSeriesSection from "./TimeSeriesSection";

import "./index.css";
import useEditDataset from "./useEditDataset";

const Dataset = () => {
  const { datasetId } = useParams();
  const datasetUtils = useDataset(datasetId);
  const { labelings } = useLabelings();
  const datasetEdit = useEditDataset(datasetUtils, labelings);

  const handleResize = () => {
    window.location.reload();
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { dataset } = datasetUtils;

  if (!dataset || !labelings) {
    return <Loader loading></Loader>;
  }

  return (
    <div>
      <DatasetProvider
        dataset={dataset}
        labelings={labelings}
        datasetEdit={datasetEdit}
      >
        <LabelingProvider labelings={labelings}>
          <div className="d-flex w-100 h-100">
            <div
              className="d-flex flex-column justify-content-between flex-grow-1"
              style={{ height: "100vh" }}
            >
              <LabelingSelectionPanel></LabelingSelectionPanel>
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
