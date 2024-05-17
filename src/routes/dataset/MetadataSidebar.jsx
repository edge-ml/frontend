import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { Fragment, Container } from 'react';
import MetadataContainer from '../../components/MetadataPanel/MetadataContainer';

const MetadataSidebar = () => {
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
                start={Math.min(
                  ...this.state.dataset.timeSeries.map((elm) => elm.start),
                )}
                end={Math.max(
                  ...this.state.dataset.timeSeries.map((elm) => elm.end),
                )}
                user={this.state.dataset.userId}
                name={this.state.dataset.name}
                handleDatasetNameChange={this.handleDatasetNameChange}
                metaData={this.state.dataset.metaData}
                onUpdateMetaData={this.onUpdateMetaData}
              ></MetadataContainer>
            </div>
          </div>
        </Container>
      </Fragment>
    );
  }
};

export default MetadataSidebar;
