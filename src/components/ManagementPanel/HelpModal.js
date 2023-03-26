import React, { Component } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import './ManagementPanel.css';

class HelpModal extends Component {
  constructor(props) {
    super(props);
    this.onKeyPressed = this.onKeyPressed.bind(this);
  }

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyPressed, false);
  }

  //important that this is called when modal is not shown! Modal has to be rendered conditionally.
  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyPressed, false);
  }

  onKeyPressed(e) {
    switch (e.code) {
      case 'Escape':
        this.props.onCloseModal();
        break;
    }
  }

  render() {
    return (
      <Modal isOpen={this.props.isOpen}>
        <ModalHeader>{'Help'}</ModalHeader>
        <ModalBody>
          <div className="py-2">
            <h6>Shortcuts</h6>
            <table>
              <tbody>
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
              </tbody>
            </table>
          </div>
          <hr />
          <h6>Upload CSV</h6>
          <a href="/example_file.csv" download="example_file.csv">
            Click here
          </a>{' '}
          to download an example CSV file.
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
