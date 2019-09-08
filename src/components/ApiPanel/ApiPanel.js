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

import {
  getClientName,
  subscribePlot,
  waitForEvent
} from '../../services/SocketService';
import { parseCSV } from '../../services/helpers.js';

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

    // subscribe to plot events
    subscribePlot(data => {
      switch (data.action) {
        case 'add':
          const { plots, fuse } = data;

          const ids = [];

          for (const plot of plots) {
            const obj = parseCSV(plot, this.props.startTime, true);

            if (obj.error) {
              alert(obj.message);
            } else {
              obj.error = undefined;
              obj.message = undefined;
              ids.push(obj.id);
              this.props.onUpload(obj);
            }
          }
          if (fuse && ids.length > 1) {
            this.props.onFuse(ids);
          }
          break;
        case 'getPlots':
          break;
      }
    });
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
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <InputGroupText className="timeInputGroupText">
                  Plot
                </InputGroupText>
              </InputGroupAddon>
              <Input
                className="text-right"
                value={
                  this.state.clientName
                    ? `${window.location.protocol}//${
                        window.location.hostname
                      }${
                        window.location.port
                          ? `:${
                              window.location.port === '3000'
                                ? '3001'
                                : window.location.port
                            }`
                          : ''
                      }/api/${this.state.clientName}/plot?fuse=true`
                    : 'loading...'
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