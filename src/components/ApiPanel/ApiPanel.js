import React, { Component } from 'react';
import {
  Card,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Input,
  CardBody,
  CardHeader
} from 'reactstrap';

import { getClientName } from '../../services/SocketService';

import './ApiPanel.css';

class ApiPanel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      clientName: undefined
    };

    // get client name
    getClientName().then(name =>
      this.setState(state => ({
        clientName: name
      }))
    );
  }

  render() {
    return (
      <Card>
        <CardHeader>
          <b>API</b>
        </CardHeader>
        <CardBody>
          <div>
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <InputGroupText className="timeInputGroupText">
                  Id
                </InputGroupText>
              </InputGroupAddon>
              <Input
                className="text-right"
                value={
                  this.state.clientName ? this.state.clientName : 'loading...'
                }
                readOnly
              />
            </InputGroup>
          </div>
        </CardBody>
      </Card>
    );
  }
}
export default ApiPanel;
