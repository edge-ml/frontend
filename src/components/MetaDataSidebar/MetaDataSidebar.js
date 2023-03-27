import React from 'react'
import './MetaDataSidebar.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import TSSelectionPanel from '../TSSelectionPanel';
import MetadataPanel from '../MetadataPanel/MetadataPanel';
import CustomMetadataPanel from '../MetadataPanel/CustomMetadataPanel';

export const MetaDataSidebar = ({
  metaDataExtended,
  toggleMetaData,
  onClickSelectSeries,
  timeSeries,
  activeSeries,
  start,
  end,
  user,
  name,
  metaData,
  onUpdateMetaData,
}) => {
  return (
      <div className={metaDataExtended ? "dataset-side-panel open" : "dataset-side-panel"}>
        <div
          className="dataset-side-panel-close cursor-pointer"
          onClick={() => toggleMetaData(false)}
        >
          <FontAwesomeIcon
            size="lg"
            icon={faTimes}
            inverse
          ></FontAwesomeIcon>
        </div>
        <div className="mt-2">
          <TSSelectionPanel
            onClickSelectSeries={onClickSelectSeries}
            timeSeries={timeSeries}
            activeSeries={activeSeries}
          ></TSSelectionPanel>
        </div>
        <div className="mt-2">
          <MetadataPanel
            start={start}
            end={end}
            user={user}
            name={name}
          />
        </div>
        <div className="mt-2">
          <CustomMetadataPanel
            metaData={metaData}
            onUpdateMetaData={onUpdateMetaData}
          ></CustomMetadataPanel>
        </div>
      </div>
  )
}