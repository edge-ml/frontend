import React from 'react';
import {
  Row,
  Col,
  ListGroup,
  ListGroupItem,
  Card,
  CardHeader,
  CardBody
} from 'reactstrap';

export const ExportView = ({
  models, // {id: string, name: string, creation_date: number}[]
  deployments = [], // {key: string, name: string, creation_date: number}[]
  selectModel,
  selectDeployment,

  detail
}) => {
  return (
    <div>
      <Row>
        <Col xs={12} lg={12} className="pt-3">
          <Card className="text-left">
            <CardHeader>
              <h4>Overview</h4>
            </CardHeader>
            <CardBody>Overview</CardBody>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col xs={12} lg={4} className="pt-3">
          <Card className="text-left" style={{ maxHeight: '50vh' }}>
            <CardHeader>
              <h4>Models</h4>
            </CardHeader>
            <CardBody>
              <ListGroup>
                {models.map(m => (
                  <ListGroupItem
                    action
                    tag="button"
                    onClick={() => selectModel(m.id)}
                  >
                    {m.name}
                  </ListGroupItem>
                ))}
              </ListGroup>
            </CardBody>
          </Card>
          <Card className="text-left mt-3" style={{ maxHeight: '50vh' }}>
            <CardHeader>
              <h4>Deployments</h4>
            </CardHeader>
            <CardBody>
              <ListGroup>
                {deployments.map(m => (
                  <ListGroupItem
                    action
                    tag="button"
                    onClick={() => selectDeployment(m.key)}
                  >
                    {m.name}
                  </ListGroupItem>
                ))}
              </ListGroup>
            </CardBody>
          </Card>
        </Col>
        <Col xs={12} lg={8} className="pt-3">
          <Card className="text-left">
            <CardHeader>
              <h4>Deployment</h4>
            </CardHeader>
            <CardBody>{detail}</CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
