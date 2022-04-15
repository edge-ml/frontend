import React from 'react';
import { Input, FormGroup, Label, Row, Col } from 'reactstrap';

const CodeSettings = (props) => {
  return (
    <div>
      <Row>
        <Col className="col-3">
          <Label for="platformCheck" className="mr-sm-2">
            Platform:
          </Label>
        </Col>
        <Col>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <FormGroup className="mr-2" id="platformCheck" check>
              <Label check>
                <Input
                  value="Java"
                  type="radio"
                  checked={props.platform === 'Java'}
                  onChange={props.onPlatformChange}
                />
                Java
              </Label>
            </FormGroup>
            <FormGroup check>
              <Label check>
                <Input
                  type="radio"
                  value="Node.js"
                  checked={props.platform === 'Node.js'}
                  onChange={props.onPlatformChange}
                />
                Node.js
              </Label>
            </FormGroup>
            <FormGroup check>
              <Label check>
                <Input
                  type="radio"
                  value="Javascript"
                  checked={props.platform === 'Javascript'}
                  onChange={props.onPlatformChange}
                />
                Javascript
              </Label>
            </FormGroup>
            <FormGroup check>
              <Label check>
                <Input
                  type="radio"
                  value="Arduino"
                  checked={props.platform === 'Arduino'}
                  onChange={props.onPlatformChange}
                />
                Arduino
              </Label>
            </FormGroup>
          </div>
        </Col>
        <div className="w-100"></div>
        <Col className="col-3">
          <Label for="serverTimeCheck" className="mr-sm-2">
            Use deviceTime:
          </Label>
        </Col>
        <Col>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
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
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default CodeSettings;
