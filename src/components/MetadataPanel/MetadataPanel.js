import React, { Component } from 'react';
import { Card, CardBody, CardHeader, Table } from 'reactstrap';
import { unixTimeToString } from '../../services/helpers';
import './MetadataPanel.css';

class MetadataPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.renderMetadata = this.renderMetadata.bind(this);
  }

  renderMetadata(metaData) {
    return Object.keys(metaData).map((metaDataEntry) => (
      <tr>
        <td>{metaDataEntry}</td>
        <td>{this.props.metaData[metaDataEntry]}</td>
      </tr>
    ));
  }

  render() {
    return (
      <Card>
        <CardHeader>
          <b>Metadata</b>
        </CardHeader>
        <CardBody>
          <Table striped bordered responsive size="sm">
            <thead>
              <tr>
                <th>Attribute</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Name</td>
                <td>{this.props.name}</td>
              </tr>
              <tr>
                <td>Start</td>
                <td>
                  {this.props.start ? unixTimeToString(this.props.start) : ''}
                </td>
              </tr>
              <tr>
                <td>End</td>
                <td>
                  {this.props.end ? unixTimeToString(this.props.end) : ''}
                </td>
              </tr>
              {this.renderMetadata(this.props.metaData)}
            </tbody>
          </Table>
        </CardBody>
      </Card>
    );
  }
}
export default MetadataPanel;
