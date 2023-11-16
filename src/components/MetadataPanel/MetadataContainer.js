import MetadataPanel from './MetadataPanel';
import CustomMetadataPanel from './CustomMetadataPanel';

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
    <div
      className="m-2"
      style={{ backgroundColor: 'lightgreen', height: '100vh', width: '100%' }}
    >
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
      ></CustomMetadataPanel>
    </div>
  );
};

export default MetadataContainer;
