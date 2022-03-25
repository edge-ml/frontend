import React from 'react';
import {
  Row,
  Col,
  ListGroup,
  ListGroupItem,
  Card,
  CardHeader,
  CardBody,
  Button
} from 'reactstrap';

import { Empty } from './components/Empty';

export const ExportView = ({
  models, // {id: string, name: string, creation_date: number}[]
  selectModel,
  selectedModel,

  detail
}) => {
  return (
    <div>
      <Row>
        <Col xs={12} lg={4} className="pt-3">
          <Card className="text-left" style={{ maxHeight: '80vh' }}>
            <CardHeader>
              <h4>Models</h4>
            </CardHeader>
            <CardBody className="overflow-auto">
              {models.length ? (
                <ListGroup>
                  {models.map(m => (
                    <ListGroupItem
                      key={m.id}
                      active={selectedModel && m.id === selectedModel.id}
                      action
                      tag="button"
                      onClick={() => selectModel(m.id)}
                    >
                      {m.name}
                    </ListGroupItem>
                  ))}
                </ListGroup>
              ) : (
                <Empty>No models available</Empty>
              )}
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
