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
  deployments = [], // {key: string, name: string, creation_date: number}[]
  selectModel,
  selectedModel,
  selectDeployment,
  selectedDeployment,
  onClickDeployNew,

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
            <CardBody>
              [TODO: cue overall statistics like total number of deployments,
              most accessed deployments, platforms etc]
            </CardBody>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col xs={12} lg={4} className="pt-3">
          <Card className="text-left" style={{ maxHeight: '50vh' }}>
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
          <Card className="text-left mt-3" style={{ maxHeight: '50vh' }}>
            <CardHeader className="d-flex align-items-baseline">
              <h4>Deployments</h4>
              {selectedModel && deployments ? (
                <span className="ml-2">
                  {deployments.length} in total for model
                </span>
              ) : null}
              <Button
                disabled={!selectedModel}
                className="ml-auto"
                onClick={() => onClickDeployNew()}
              >
                New deployment
              </Button>
            </CardHeader>
            <CardBody className="overflow-auto">
              {!selectedModel ? (
                <Empty>Select a model above to see it's deployments</Empty>
              ) : deployments.length === 0 ? (
                <Empty>No deployments for this model</Empty>
              ) : (
                <ListGroup>
                  {console.log(deployments)}
                  {deployments.map(m => (
                    <ListGroupItem
                      key={m.key}
                      active={
                        selectedDeployment && m.key === selectedDeployment.key
                      }
                      action
                      tag="button"
                      onClick={() => selectDeployment(m.key)}
                    >
                      {m.name}
                    </ListGroupItem>
                  ))}
                </ListGroup>
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
