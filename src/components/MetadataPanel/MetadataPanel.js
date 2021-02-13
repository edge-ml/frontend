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
    this.state = {};
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
              <Input className="text-right" value={this.props.id} readOnly />
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
                  this.props.start
                    ? new Date(this.props.start).toUTCString().split(' ')[4]
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
                  this.props.end
                    ? new Date(this.props.end).toUTCString().split(' ')[4]
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
              <Input className="text-right" value={this.props.user} readOnly />
            </InputGroup>
          </div>
        </CardBody>
      </Card>
    );
  }
}
export default MetadataPanel;
