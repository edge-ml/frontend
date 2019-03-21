import React, { Component } from 'react';
import { Button, Card } from 'reactstrap';
import './ManagementPanel.css';

class ManagementPanel extends Component {
  render() {
    return (
      <Card>
        <div className="selection-panel">
          <h5>Management</h5>
          <Button block outline color="primary">
            Download as CSV
          </Button>
          <Button block outline color="danger">
            Delete Dataset
          </Button>
        </div>
      </Card>
    );
  }
}
export default ManagementPanel;
