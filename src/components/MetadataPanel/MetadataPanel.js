import React, { Component } from 'react';
import {
  Card,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Input
} from 'reactstrap';
import './MetadataPanel.css';

class MetadataPanel extends Component {
  render() {
    return (
      <Card>
        <div className="selection-panel">
          <h5>Metadata</h5>
          <div>
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <InputGroupText className="timeInputGroupText">
                  Start
                </InputGroupText>
              </InputGroupAddon>
              <Input />
            </InputGroup>
          </div>
          <div>
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <InputGroupText className="timeInputGroupText">
                  End
                </InputGroupText>
              </InputGroupAddon>
              <Input />
            </InputGroup>
          </div>
          <div>
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <InputGroupText className="timeInputGroupText">
                  User
                </InputGroupText>
              </InputGroupAddon>
              <Input />
            </InputGroup>
          </div>
        </div>
      </Card>
    );
  }
}
export default MetadataPanel;
