import React from 'react';
import { Card, CardBody, CardHeader, Col, Container, Row } from 'reactstrap';

export const UploadWebView = ({ sensorList, datasetSettings, graph }) => {
  return (
    <Container>
      {sensorList || datasetSettings ? (
        <Row>
          {sensorList ? (
            <Col className="pt-3">
              <Card className="text-left">
                <CardHeader>
                  <h4>Configure sensors</h4>
                </CardHeader>
                <CardBody>{sensorList}</CardBody>
              </Card>
            </Col>
          ) : null}
          {datasetSettings ? (
            <Col className="pt-3">
              <Card className="text-left">
                <CardHeader>
                  <h4>Record dataset</h4>
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
                <h4>Recording</h4>
              </CardHeader>
              <CardBody>{graph}</CardBody>
            </Card>
          </Col>
        </Row>
      ) : null}
    </Container>
  );
};
