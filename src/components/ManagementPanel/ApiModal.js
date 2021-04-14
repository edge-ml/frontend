import React, { Component } from 'react';
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText
} from 'reactstrap';

import createApiKey from '../../services/ApiServices/DatasetServices';

class ApiModal extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <Modal isOpen={this.props.isOpen}>
        <ModalHeader>Dataset-API</ModalHeader>
        <ModalBody>
          <InputGroup>
            <InputGroupAddon addonType="prepend">
              <InputGroupText className="timeInputGroupText">
                Key
              </InputGroupText>
            </InputGroupAddon>
            <Input
              value={
                this.props.dataset.deviceApiKey
                  ? this.props.dataset.deviceApiKey
                  : 'Key not set'
              }
              readOnly
            />
          </InputGroup>
          <Button
            color="primary
          "
            onClick={this.props.createDeviceApiKey}
          >
            Generate API-Key
          </Button>
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

export default ApiModal;
