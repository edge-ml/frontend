import React, { Component } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  InputGroup,
  Input,
  InputGroupAddon,
  InputGroupText,
  FormGroup,
  Label,
  Row,
  Col
} from 'reactstrap';
import CodeSnippet from './CodeSnippet';
import CodeSettings from './CodeSettings';

class CodeSnippetModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      platform: 'Java',
      datasetName: undefined,
      servertime: false
    };
    this.onPlatformChange = this.onPlatformChange.bind(this);
    this.onDatasetNameChanged = this.onDatasetNameChanged.bind(this);
    this.onServerTimeChange = this.onServerTimeChange.bind(this);
    this.onCancel = this.onCancel.bind(this);
  }

  onCancel() {
    this.setState({
      platform: 'Java',
      datasetName: undefined,
      servertime: false
    });
    this.props.onCancel();
  }

  onServerTimeChange(e) {
    const val = e.target.value === 'Yes' ? true : false;
    this.setState({
      servertime: val
    });
  }

  onDatasetNameChanged(e) {
    this.setState({
      datasetName: e.target.value
    });
  }

  onPlatformChange(e) {
    this.setState({
      platform: e.target.value
    });
  }

  render() {
    return (
      <Modal className="modal-xl" isOpen={this.props.isOpen}>
        <ModalHeader>Generate code snippet</ModalHeader>
        <ModalBody>
          <InputGroup>
            <InputGroupAddon addonType="prepend">
              <InputGroupText>{'Dataset-name'}</InputGroupText>
            </InputGroupAddon>
            <Input
              id="inputProjectName"
              placeholder={'Dataset-name'}
              value={this.state.datasetName}
              onChange={this.onDatasetNameChanged}
            />
          </InputGroup>
          <CodeSettings
            platform={this.state.platform}
            servertime={this.state.servertime}
            onPlatformChange={this.onPlatformChange}
            onServerTimeChange={this.onServerTimeChange}
          />
          <CodeSnippet
            backendUrl={this.props.backendUrl}
            platform={this.state.platform}
            datasetName={this.state.datasetName}
            useServertime={this.state.servertime}
            deviceApiKey={this.props.readApiKey} // TODO: FIX CODESNIPPET DEVICEAPIKEY
          ></CodeSnippet>
        </ModalBody>
        <ModalFooter>
          <Button
            id="btnSaveProjectCancel"
            color="secondary"
            className="m-1"
            onClick={this.onCancel}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}

export default CodeSnippetModal;
