import React, { Component } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

class HelpModal extends Component {
  constructor(props) {
    super(props);
    this.onKeyPressed = this.onKeyPressed.bind(this);
  }

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyPressed, false);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyPressed, false);
  }

  onKeyPressed(e) {
    switch (e.key) {
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
                    <kbd>Ctrl</kbd> + <kbd>[Number]</kbd>
                  </td>
                  <td>Set active label type</td>
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
