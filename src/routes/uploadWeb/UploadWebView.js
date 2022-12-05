import React from 'react';
import { Card, CardBody, CardHeader, Col, Container, Row } from 'reactstrap';

export const UploadWebView = ({ sensorList, datasetSettings, graph, fabs }) => {
  return (
    <Container>
      {sensorList || datasetSettings ? (
        <Row>
          {sensorList ? (
            <Col md={6} className="pt-3">
              <Card className="text-left">
                <CardHeader>
                  <h4>Sensor Selection</h4>
                  <span>Select sensors you want to record in a dataset.</span>
                </CardHeader>
                <CardBody>{sensorList}</CardBody>
              </Card>
            </Col>
          ) : null}
          {datasetSettings ? (
            <Col md={6} className="pt-3">
              <Card className="text-left">
                <CardHeader>
                  <h4>Dataset Configuration</h4>
                </CardHeader>
                <CardBody>{datasetSettings}</CardBody>
              </Card>
            </Col>
          ) : null}
        </Row>
      ) : null}
      {graph ? (
        <Row>
          <Col className="pt-3">
            <Card className="text-left">
              <CardHeader>
                <h4>Data Preview</h4>
              </CardHeader>
              <CardBody>{graph}</CardBody>
            </Card>
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
