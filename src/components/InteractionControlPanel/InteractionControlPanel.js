import React, { Component } from 'react';
import { Card, Button } from 'reactstrap';
import './InteractionControlPanel.css';

class InteractionControlPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <Card>
        <div className="interaction-control-panel">
          <Button block outline color="primary" className="m-0">
            Save
          </Button>
          <Button block outline color="success" className="mt-2 mb-0">
            Publish
          </Button>
        </div>
      </Card>
    );
  }
}
export default InteractionControlPanel;
