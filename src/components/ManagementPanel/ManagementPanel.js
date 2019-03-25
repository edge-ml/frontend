import React, { Component } from 'react';
import { Button, Card, CardHeader, CardBody } from 'reactstrap';
import './ManagementPanel.css';

class ManagementPanel extends Component {
  render() {
    return (
      <Card>
        <CardHeader>
          <b>Management</b>
        </CardHeader>
        <CardBody>
          <Button block outline color="primary">
            Upload CSV
          </Button>
          <hr />
          <Button block outline color="primary">
            Download as CSV
          </Button>
          <Button block outline color="danger">
            Delete Dataset
          </Button>
        </CardBody>
      </Card>
    );
  }
}
export default ManagementPanel;
