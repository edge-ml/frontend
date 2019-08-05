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
import './MetadataPanel.css';

class MetadataPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: props.id,
      start: props.start,
      end: props.end,
      user: props.user
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
        <CardHeader>
          <b>Metadata</b>
        </CardHeader>
        <CardBody>
          <div>
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <InputGroupText className="timeInputGroupText">
                  Id
                </InputGroupText>
              </InputGroupAddon>
              <Input className="text-right" value={this.state.id} readOnly />
            </InputGroup>
          </div>
          <div>
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <InputGroupText className="timeInputGroupText">
                  Start
                </InputGroupText>
              </InputGroupAddon>
              <Input
                className="text-right"
                value={
                  this.state.start
                    ? new Date(this.state.start).toUTCString().split(' ')[4]
                    : ''
                }
                readOnly
              />
            </InputGroup>
          </div>
          <div>
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <InputGroupText className="timeInputGroupText">
                  End
                </InputGroupText>
              </InputGroupAddon>
              <Input
                className="text-right"
                value={
                  this.state.end
                    ? new Date(this.state.end).toUTCString().split(' ')[4]
                    : ''
                }
                readOnly
              />
            </InputGroup>
          </div>
          <div>
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <InputGroupText className="timeInputGroupText">
                  User
                </InputGroupText>
              </InputGroupAddon>
              <Input className="text-right" value={this.state.user} readOnly />
            </InputGroup>
          </div>
        </CardBody>
      </Card>
    );
  }
}
export default MetadataPanel;
