import React from "react";
import { useParams } from "react-router-dom";
import useDataset from "../../Hooks/useDataset";
import LabelingSelectionPanel from "../../components/LabelingSelectionPanel/LabelingSelectionPanel";
import { DatasetProvider } from "./DatasetContext";
import { Center, Stack, Text } from "@mantine/core";
import LogoLoader from "../../modules/LogoLoader";
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

  const { dataset } = datasetUtils;

  if (!dataset || !labelings) {
    return (
      <Center h="100vh" role="status">
        <Stack align="center" gap="sm">
          <LogoLoader size={56} />
          <Text size="sm" c="dimmed">
            Opening the dataset…
          </Text>
        </Stack>
      </Center>
    );
  }

  return (
    <div>
      <DatasetProvider
        dataset={dataset}
        labelings={labelings}
        datasetEdit={{
          ...datasetEdit,
          updateDataset: datasetUtils.updateDataset,
          refreshDataset: datasetUtils.refreshDataset,
        }}
      >
        <LabelingProvider labelings={labelings}>
          <div className="d-flex w-100 h-100">
            <div
              className="d-flex flex-column justify-content-between flex-grow-1"
              // minWidth 0: a long row of label buttons must scroll inside its
              // bar instead of making the whole page wider than the window
              style={{ height: "100vh", minWidth: 0 }}
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
