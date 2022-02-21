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
  models,
  selectModel,

  detail
}) => {
  return (
    <Row className="pt-3">
      <Col xs={12} lg={3}>
        <Card>
          <CardHeader>Models</CardHeader>
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
      </Col>
      <Col xs={12} lg={9}>
        <Card>
          <CardHeader>Details</CardHeader>
          <CardBody>{detail}</CardBody>
        </Card>
      </Col>
    </Row>
  );
};
