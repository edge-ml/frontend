import React from "react";
import MetadataPanel from "./MetadataPanel";
import CustomMetadataPanel from "./CustomMetadataPanel";

const MetadataContainer = ({
  start,
  end,
  user,
  name,
  handleDatasetNameChange,
  metaData,
  onUpdateMetaData,
}) => {
  return (
    <div className="metadata-container">
      <MetadataPanel
        start={start}
        end={end}
        user={user}
        name={name}
        handleDatasetNameChange={handleDatasetNameChange}
      />
      <CustomMetadataPanel
        metaData={metaData}
        onUpdateMetaData={onUpdateMetaData}
      />
    </div>
  );
};

export default MetadataContainer;
