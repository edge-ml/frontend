import React from 'react';
import { Card, CardBody, CardHeader, Col, Container, Row } from 'reactstrap';

export const UploadWebView = ({ sensorList, datasetSettings, graph, fabs }) => {
  return (
    <Container>
      {sensorList || datasetSettings ? (
        <Row>
          {sensorList ? (
            <Col md={6} className="pt-3">
              <div className="p-2">
                <div className="header-wrapper d-flex flex-column justify-content-flex-start align-content-center">
                  <h4>Sensor Selection</h4>
                  <span>Select sensors you want to record in a dataset.</span>
                </div>
                <div className="body-wrapper">{sensorList}</div>
              </div>
            </Col>
          ) : null}
          {datasetSettings ? (
            <Col md={6} className="pt-3">
              <div className="p-2">
                <div className="header-wrapper d-flex justify-content-flex-start align-content-center">
                  <h4>Dataset Configuration</h4>
                </div>
                <div className="body-wrapper p-3">{datasetSettings}</div>
              </div>
            </Col>
          ) : null}
        </Row>
      ) : null}
      {graph ? (
        <Row>
          <Col className="pt-3">
            <div className="p-2">
              <div className="header-wrapper d-flex justify-content-flex-start align-content-center">
                <h4>Data Preview</h4>
              </div>
              <div className="body-wrapper p-3">{graph}</div>
            </div>
          </Col>
        </Row>
      ) : null}
      <div className="pb-3" />
      <div className="position-fixed" style={{ bottom: '24px', right: '24px' }}>
        {fabs}
      </div>
    </Container>
  );
};
