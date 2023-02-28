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
import { unixTimeToString } from '../../services/helpers';
import './MetadataPanel.css';

class MetadataPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  metaDataItem(key, value) {
    return (
      <div className="customMetaDataItem">
        <div className="customMetaDataItem_key">{key}</div>
        <div className="customMetaDataItem_value">{value}</div>
      </div>
    );
  }

  render() {
    return (
      <div className="sidepanel-card">
        <div className="sidepanel-heading">
          <h5>Metadata</h5>
        </div>
        <CardBody>
          {this.metaDataItem('Name', this.props.name)}
          {this.metaDataItem(
            'Start',
            this.props.start ? unixTimeToString(this.props.start) : ''
          )}
          {this.metaDataItem(
            'End',
            this.props.end ? unixTimeToString(this.props.end) : ''
          )}
          {this.metaDataItem('User', this.props.user)}
        </CardBody>
      </div>
    );
  }
}
export default MetadataPanel;
