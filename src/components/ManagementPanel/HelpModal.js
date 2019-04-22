import React, { Component } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Label,
  FormGroup,
  InputGroup
} from 'reactstrap';
import './ManagementPanel.css';

class HelpModal extends Component {
  render() {
    return (
      <Modal isOpen={this.props.isOpen}>
        <ModalHeader>{'Help'}</ModalHeader>
        <ModalBody>
          <div className="py-2">
            <h6>Shortcuts</h6>
            <span className="shortcut">
              <code>Ctrl + [0 - 9]</code>
            </span>
            Set active labeling
            <br />
            <span className="shortcut">
              <code>[0 - 9]</code>
            </span>
            Set active label type
            <br />
            <span className="shortcut">
              <code>L / l</code>
            </span>
            Lock or unlock active label editing
            <br />
            <span className="shortcut">
              <code>Backspace / Delete</code>
            </span>
            Delete current label
            <br />
          </div>
          <hr />
          <div className="py-2">
            <h6>API</h6>
            <code>
              curl -X PUT
              'http://localhost:3001/api/favouriteherring/plot?fuse=true' -H
              'Content-Type: application/x-www-form-urlencoded' -F
              'csv=@/Users/tobi/Downloads/example_1.csv' -F
              'csv=@/Users/tobi/Downloads/example_2.csv'{' '}
            </code>
          </div>
        </ModalBody>
        <ModalFooter>
          {' '}
          <Button
            color="secondary"
            className="m-1"
            onClick={this.props.onCloseModal}
          >
            Close
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}

export default HelpModal;
