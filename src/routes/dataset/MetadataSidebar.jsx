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
  const { dataset } = useContext(DatasetContext);

  const [isExtended, setExtended] = useState(false);

  const toggleMetaData = (value) => {
    setExtended((prev) => (typeof value === "boolean" ? value : !prev));
  };

  if (!isExtended) {
    return (
      <div
        className="metaDataCollapseButton"
        onClick={() => toggleMetaData(true)}
        style={{ cursor: "pointer" }}
      >
        <FontAwesomeIcon size="1x" icon={faChevronLeft} />
      </div>
    );
  }

  return (
    <Fragment>
      <div className="sidePanelBackdrop" onClick={() => toggleMetaData(false)} />
      <div className="dataset-side-panel">
        <div style={{ display: "flex" }}>
          <div
            className="metaDataCollapseButton"
            onClick={() => toggleMetaData(false)}
            style={{ cursor: "pointer" }}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </div>
          <MetadataContainer
            start={Math.min(...dataset.timeSeries.map((elm) => elm.start))}
            end={Math.max(...dataset.timeSeries.map((elm) => elm.end))}
            user={dataset.userId}
            name={dataset.name}
            handleDatasetNameChange={() => {}}
            metaData={dataset.metaData}
            onUpdateMetaData={() => {}}
          />
        </div>
      </div>
    </Fragment>
  );
};

export default MetadataSidebar;
