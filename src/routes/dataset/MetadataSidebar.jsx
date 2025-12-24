import React from "react";
import { useContext, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { Fragment } from "react";
import MetadataContainer from "../../components/MetadataPanel/MetadataContainer";
import { DatasetContext } from "./DatasetContext";
import { Box, Group } from "@mantine/core";

const MetadataSidebar = ({}) => {
  const { dataset, updateDatasetMetadata } = useContext(DatasetContext);

  const [isExtended, setExtendend] = useState(false);

  const toggleMetaData = () => {
    setExtendend(!isExtended);
  };

  if (!isExtended) {
    return (
      <Group
        className="metaDataCollapseButton"
        justify="center"
        align="center"
        onClick={() => toggleMetaData(true)}
        style={{ cursor: "pointer" }}
      >
        <FontAwesomeIcon size="1x" icon={faChevronLeft} />
      </Group>
    );
  }

  if (isExtended) {
    return (
      <Fragment>
        <Box
          className="sidePanelBackdrop"
          onClick={() => toggleMetaData(false)}
        />
        <div className="dataset-side-panel">
          <Group align="flex-start" gap="sm" style={{ width: "100%" }}>
            <Group
              onClick={() => toggleMetaData(false)}
              className="metaDataCollapseButton"
              justify="center"
              align="center"
              style={{ cursor: "pointer" }}
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </Group>
            <Box style={{ flex: 1, minWidth: 0 }}>
              <MetadataContainer
                start={Math.min(...dataset.timeSeries.map((elm) => elm.start))}
                end={Math.max(...dataset.timeSeries.map((elm) => elm.end))}
                user={dataset.userId}
                name={dataset.name}
                handleDatasetNameChange={() => {}}
                metaData={dataset.metaData}
                onUpdateMetaData={(metaData) => updateDatasetMetadata(metaData)}
              />
            </Box>
          </Group>
        </div>
      </Fragment>
    );
  }
};

export default MetadataSidebar;
