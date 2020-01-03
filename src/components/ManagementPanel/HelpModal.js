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
            <table>
              <tr>
                <td>
                  <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>[Number]</kbd>
                </td>
                <td>Set active labeling</td>
              </tr>
              <tr>
                <td>
                  <kbd>Ctrl</kbd> + <kbd>[Number]</kbd>
                </td>
                <td>Set active label type</td>
              </tr>
              <tr>
                <td>
                  <kbd>L</kbd> / <kbd>l</kbd>
                </td>
                <td>Lock or unlock active label editing</td>
              </tr>
              <tr>
                <td>
                  <kbd>Backspace</kbd> / <kbd>Delete</kbd>
                </td>
                <td>Delete current label</td>
              </tr>
            </table>
          </div>

          {/**
            (
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
            )
          */}
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
