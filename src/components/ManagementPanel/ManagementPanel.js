import React, { Component } from 'react';
import {
  Button,
  Card,
  InputGroup,
  InputGroupText,
  InputGroupAddon,
  Input
} from 'reactstrap';
import './ManagementPanel.css';

class ManagementPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      from: props.from,
      to: props.to,
      labelTypes: props.labelTypes
    };
  }

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
