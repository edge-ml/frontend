import React from 'react';
import { Input, FormGroup, Label, Row, Col } from 'reactstrap';

const CodeSettings = props => {
  return (
    <div>
      <Row>
        <Col>
          <Label for="platformCheck" className="mr-sm-2">
            Platform:
          </Label>
        </Col>
        <Col>
          <FormGroup className="mr-2" id="platformCheck" check>
            <Label check>
              <Input
                value="java"
                type="radio"
                checked={props.platform === 'java'}
                onChange={props.onPlatformChange}
              />
              Java
            </Label>
          </FormGroup>
        </Col>
        <Col>
          <FormGroup check>
            <Label check>
              <Input
                type="radio"
                value="node"
                checked={props.platform === 'node'}
                onChange={props.onPlatformChange}
              />
              Node.js
            </Label>
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col>
          <Label for="serverTimeCheck" className="mr-sm-2">
            Use deviceTime:
          </Label>
        </Col>
        <Col>
          <FormGroup className="mr-2" id="serverTimeCheck" check>
            <Label check>
              <Input
                type="radio"
                value="Yes"
                checked={props.servertime}
                onChange={props.onServerTimeChange}
              />
              Yes
            </Label>
          </FormGroup>
        </Col>
        <Col>
          <FormGroup check>
            <Label check>
              <Input
                type="radio"
                value="No"
                checked={!props.servertime}
                onChange={props.onServerTimeChange}
              />
              No
            </Label>
          </FormGroup>
        </Col>
      </Row>
    </div>
  );
};

export default CodeSettings;
