import React from 'react';
import { useContext, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { Fragment } from 'react';
import MetadataContainer from '../../components/MetadataPanel/MetadataContainer';
import { DatasetContext } from './DatasetContext';
import { Container } from 'reactstrap';

const MetadataSidebar = ({ }) => {

  const { dataset } = useContext(DatasetContext);

  const [isExtended, setExtendend] = useState(false);

  const toggleMetaData = () => {
    setExtendend(!isExtended);
  };

  if (!isExtended) {
    return (
      <div
        className="d-flex justify-content-center align-items-center cursor-pointer metaDataCollapseButton"
        onClick={() => toggleMetaData(true)}
      >
        <div>
          <FontAwesomeIcon size="1x" icon={faChevronLeft}></FontAwesomeIcon>
        </div>
      </div>
    );
  }

  if (isExtended) {
    return (
      <Fragment>
        <div
          className="sidePanelBackdrop"
          onClick={() => toggleMetaData(false)}
        ></div>
        <Container>
          <div className="dataset-side-panel">
            <div className="d-flex">
              <div
                onClick={() => toggleMetaData(false)}
                className="d-flex justify-content-center align-items-center cursor-pointer metaDataCollapseButton"
              >
                <FontAwesomeIcon icon={faChevronRight}></FontAwesomeIcon>
              </div>
              <MetadataContainer
                start={Math.min(...dataset.timeSeries.map((elm) => elm.start))}
                end={Math.max(...dataset.timeSeries.map((elm) => elm.end))}
                user={dataset.userId}
                name={dataset.name}
                handleDatasetNameChange={() => { }}
                metaData={dataset.metaData}
                onUpdateMetaData={() => { }}
              ></MetadataContainer>
            </div>
          </div>
        </Container>
      </Fragment>
    );
  }
};

export default MetadataSidebar;
