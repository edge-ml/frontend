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
  Label
} from 'reactstrap';
import CodeSnippet from './CodeSnippet';

class CodeSnippetModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      platform: 'node',
      datasetName: undefined,
      servertime: false
    };
    this.onPlatformChange = this.onPlatformChange.bind(this);
    this.onDatasetNameChanged = this.onDatasetNameChanged.bind(this);
    this.onServerTimeChange = this.onServerTimeChange.bind(this);
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

          <div style={{ display: 'flex' }}>
            <Label for="platformCheck" className="mr-sm-2">
              Platform:
            </Label>
            <FormGroup className="mr-2" id="platformCheck" check>
              <Label check>
                <Input
                  value="java"
                  type="radio"
                  checked={this.state.platform === 'java'}
                  onChange={this.onPlatformChange}
                />
                Java
              </Label>
            </FormGroup>
            <FormGroup check>
              <Label check>
                <Input
                  type="radio"
                  value="node"
                  checked={this.state.platform === 'node'}
                  onChange={this.onPlatformChange}
                />
                Node.js
              </Label>
            </FormGroup>
          </div>

          <div style={{ display: 'flex' }}>
            <Label for="serverTimeCheck" className="mr-sm-2">
              Use servertime:
            </Label>
            <FormGroup className="mr-2" id="serverTimeCheck" check>
              <Label check>
                <Input
                  type="radio"
                  value="Yes"
                  checked={this.state.servertime}
                  onChange={this.onServerTimeChange}
                />
                Yes
              </Label>
            </FormGroup>
            <FormGroup check>
              <Label check>
                <Input
                  type="radio"
                  value="No"
                  checked={!this.state.servertime}
                  onChange={this.onServerTimeChange}
                />
                No
              </Label>
            </FormGroup>
          </div>

          <CodeSnippet
            backendUrl={this.props.backendUrl}
            platform={this.state.platform}
            datasetName={this.state.datasetName}
            useServertime={this.state.servertime}
            deviceApiKey={this.props.deviceApiKey}
          ></CodeSnippet>
        </ModalBody>
        <ModalFooter>
          <Button
            id="btnSaveProjectCancel"
            color="secondary"
            className="m-1"
            onClick={this.props.onCancel}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}

export default CodeSnippetModal;
