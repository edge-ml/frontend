import React, { Component } from 'react';
import {
  Card,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Input,
  CardBody,
  CardHeader,
} from 'reactstrap';
import './MetadataPanel.css';

class CustomMetadataPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.additionalMetadata = this.additionalMetaData.bind(this);
  }

  additionalMetaData() {
    return Object.keys(this.props.metaData).map((key) => (
      <div>
        <InputGroup>
          <InputGroupAddon addonType="prepend">
            <InputGroupText className="timeInputGroupText">
              {key}
            </InputGroupText>
          </InputGroupAddon>
          <Input
            className="text-right"
            value={this.props.metaData[key]}
            readOnly
          />
        </InputGroup>
      </div>
    ));
  }

  render() {
    if (!this.props.metaData) {
      return null;
    }
    return (
      <Card>
        <CardHeader>
          <b>Custom Metadata</b>
        </CardHeader>
        <CardBody>
          {this.props.metaData ? (
            <div>
              <div>{this.additionalMetaData()}</div>
            </div>
          ) : null}
        </CardBody>
      </Card>
    );
  }
}
export default CustomMetadataPanel;
