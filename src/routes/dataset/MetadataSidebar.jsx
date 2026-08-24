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

const MetadataSidebar = () => {
  const { dataset, updateDataset } = useContext(DatasetContext);

  const [isExtended, setExtended] = useState(false);

  const toggleMetaData = (value) => {
    setExtended((prev) => (typeof value === "boolean" ? value : !prev));
  };

  if (!isExtended) {
    return (
      <button
        className="metadata-sidebar-handle"
        onClick={() => toggleMetaData(true)}
        title="Show metadata"
      >
        <FontAwesomeIcon icon={faChevronLeft} size="xs" />
        <span className="metadata-sidebar-handle-label">Metadata</span>
      </button>
    );
  }

  return (
    <Fragment>
      <div
        className="sidePanelBackdrop"
        onClick={() => toggleMetaData(false)}
      />
      <div className="dataset-side-panel">
        <button
          className="metadata-sidebar-close"
          onClick={() => toggleMetaData(false)}
          title="Hide metadata"
        >
          <FontAwesomeIcon icon={faChevronRight} size="sm" />
        </button>
        <MetadataContainer
          start={Math.min(...dataset.timeSeries.map((elm) => elm.start))}
          end={Math.max(...dataset.timeSeries.map((elm) => elm.end))}
          user={dataset.userId}
          name={dataset.name}
          handleDatasetNameChange={() => {}}
          metaData={dataset.metaData}
          onUpdateMetaData={({ metaData }) =>
            updateDataset({ ...dataset, metaData: metaData ?? {} })
          }
        />
      </div>
    </Fragment>
  );
};

export default MetadataSidebar;
