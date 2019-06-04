import React, { Component } from 'react';
import { Card, Button, CardBody } from 'reactstrap';
import './InteractionControlPanel.css';

class InteractionControlPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isPublished: props.isPublished
    };
  }

  componentWillReceiveProps(props) {
    this.setState(state => ({
      isPublished: props.isPublished
    }));
  }

  render() {
    return (
      <Card>
        <CardBody>
          <Button block outline color="primary" className="m-0">
            Save
          </Button>
          {!this.state.isPublished ? (
            <Button block outline color="success" className="mt-2 mb-0 hidden">
              Publish
            </Button>
          ) : null}
        </CardBody>
      </Card>
    );
  }
}
export default InteractionControlPanel;
