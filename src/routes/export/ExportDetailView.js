import React from 'react';
import { Row, Col, Button } from 'reactstrap';
import Select from 'react-select';
import PrismCode from 'react-prism';

export const ExportDetailView = ({
  model,
  deployment,
  onModelDetails = () => {},

  platform,
  onPlatform,
  onGetLink,
  onDownloadModel
}) => {
  const platforms = [
    // this should come with model
    {
      value: 'python',
      label: 'Python',
      code: `
    const id = x => x
    `
    }
  ];

  console.log(platform);
  const nPlatform = platform || platforms[0];

  return (
    <div>
      <Row>
        <Col>
          <div className="pb-2">
            <b>Model name: </b>
            <span>{model.name}</span>
            <Button onClick={onModelDetails} className="float-right">
              See Model Details
            </Button>
          </div>
          <div className="pb-2">
            <b>Deployment key: </b>
            <code>{deployment.key}</code>
          </div>

          <hr />

          <div className="pb-2">
            <h5>Export model</h5>
          </div>
          <div className="pb-2">
            <b>Platform: </b>
            <span className="float-right" style={{ minWidth: '200px' }}>
              <Select
                value={nPlatform}
                onChange={x => onPlatform(x)}
                options={platforms}
              />
            </span>
          </div>
          <div className="pb-2">
            <Button onClick={onDownloadModel} className="mr-3">
              Download model
            </Button>
            <Button onClick={onGetLink}>Get public link</Button>
          </div>
          <div className="pb-2">
            <b>Usage: </b>
            <PrismCode component="pre" className="language-javascript">
              {nPlatform.code}
            </PrismCode>
          </div>

          <hr />
          <div className="pb-2">
            <h5>Administration</h5>
          </div>
        </Col>
      </Row>
    </div>
  );
};
