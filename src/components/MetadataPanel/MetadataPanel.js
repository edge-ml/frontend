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
  constructor(props) {
    super(props);
    this.state = {
      id: props.id,
      start: props.start,
      end: props.end,
      email: props.email
    };
  }

  componentWillReceiveProps(props) {
    this.setState(state => ({
      id: props.id,
      start: props.start,
      end: props.end,
      user: props.user
    }));
  }

  render() {
    return (
      <Card>
        <div className="selection-panel">
          <h5>Metadata</h5>
          <div>
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <InputGroupText className="timeInputGroupText">
                  Id
                </InputGroupText>
              </InputGroupAddon>
              <Input value={this.state.id} readOnly />
            </InputGroup>
          </div>
          <div>
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <InputGroupText className="timeInputGroupText">
                  Start
                </InputGroupText>
              </InputGroupAddon>
              <Input value={this.state.start} readOnly />
            </InputGroup>
          </div>
          <div>
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <InputGroupText className="timeInputGroupText">
                  End
                </InputGroupText>
              </InputGroupAddon>
              <Input value={this.state.end} readOnly />
            </InputGroup>
          </div>
          <div>
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <InputGroupText className="timeInputGroupText">
                  User
                </InputGroupText>
              </InputGroupAddon>
              <Input value={this.state.email} readOnly />
            </InputGroup>
          </div>
        </div>
      </Card>
    );
  }
}
export default MetadataPanel;
