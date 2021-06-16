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
import { unixTimeToString } from '../../services/helpers';
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
                  Name
                </InputGroupText>
              </InputGroupAddon>
              <Input className="text-right" value={this.props.name} readOnly />
            </InputGroup>
          </div>
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
                  this.props.start ? unixTimeToString(this.props.start) : ''
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
                value={this.props.end ? unixTimeToString(this.props.end) : ''}
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
