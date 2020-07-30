import React, { Component } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Input
} from 'reactstrap';
import isURL from 'validator/lib/isURL';

import './EditSourceModal.css';

class EditSourceModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      source: props.source,
      isNewSource: props.isNewSource,
      onCloseModal: props.onCloseModal,
      inputVariables: {
        name: props.source ? props.source.name : '',
        url: props.source ? props.source.url : '',
        enabled: props.source ? props.source.enabled : false
      },
      modalState: {
        isOpen: props.isOpen
      },
      onSave: props.onSave,
      onDeleteSource: props.onDeleteSource,
      onAddSource: props.onAddSource
    };

    this.onCloseModal = this.onCloseModal.bind(this);
    this.onNameChanged = this.onNameChanged.bind(this);
    this.onUrlChanged = this.onUrlChanged.bind(this);
    this.onEnabledChanged = this.onEnabledChanged.bind(this);
    this.onSave = this.onSave.bind(this);
    this.onDeleteSource = this.onDeleteSource.bind(this);
  }

  componentWillReceiveProps(props) {
    this.setState(state => ({
      source: props.source,
      isNewSource: props.isNewSource,
      onCloseModal: props.onCloseModal,
      modalState: {
        isOpen: props.isOpen
      },
      onSave: props.onSave,
      onDeleteSource: props.onDeleteSource,
      onAddSource: props.onAddSource,
      inputVariables: {
        name: props.source ? props.source.name : '',
        url: props.source ? props.source.url : '',
        enabled: props.source ? props.source.enabled : false
      }
    }));
  }

  onNameChanged(name) {
    let inputVariables = { ...this.state.inputVariables };
    inputVariables.name = name;
    this.setState({ inputVariables });
  }

  onUrlChanged(url) {
    let inputVariables = { ...this.state.inputVariables };
    inputVariables.url = url;
    this.setState({ inputVariables });
  }

  onEnabledChanged(enabled) {
    let inputVariables = { ...this.state.inputVariables };
    inputVariables.enabled = enabled;
    this.setState({ inputVariables });
  }

  onDeleteSource() {
    if (window.confirm('Are you sure to delete this source?')) {
      this.state.onDeleteSource(this.state.source.name);
      this.onCloseModal();
    }
  }

  onCloseModal() {
    this.state.onCloseModal();
    this.setState({
      isNewSource: false,
      source: undefined,
      onCloseModal: undefined,
      modalState: {
        isOpen: false
      },
      inputVariables: {
        name: '',
        url: '',
        enabled: false
      },
      onSave: undefined,
      onDeleteSource: undefined
    });
  }

  onSave() {
    if (!this.state.inputVariables.name || !this.state.inputVariables.url) {
      window.alert('Name and URL cannot be empty.');
      return;
    }

    if (!isURL(this.state.inputVariables.url)) {
      window.alert('Please enter a valid URL.');
      return;
    }

    if (this.state.isNewSource) {
      this.state.onAddSource(
        this.state.inputVariables.name,
        this.state.inputVariables.url,
        this.state.inputVariables.enabled
      );
    } else {
      this.state.onSave(
        this.state.source.name,
        this.state.inputVariables.name,
        this.state.inputVariables.url,
        this.state.inputVariables.enabled
      );
    }

    this.onCloseModal();
  }

  render() {
    let name = this.state.source ? this.state.source.name : '';

    return (
      <Modal isOpen={this.state.modalState.isOpen}>
        <ModalHeader>
          {this.state.isNewSource ? 'Add Source' : 'Edit Source: ' + name}
        </ModalHeader>
        <ModalBody>
          <InputGroup className="m-0">
            <InputGroupAddon addonType="prepend">
              <InputGroupText>{'Name'}</InputGroupText>
            </InputGroupAddon>
            <Input
              placeholder={'Name'}
              value={this.state.inputVariables.name}
              onChange={e => this.onNameChanged(e.target.value)}
            />
          </InputGroup>

          <InputGroup>
            <InputGroupAddon addonType="prepend">
              <InputGroupText>{'URL'}</InputGroupText>
            </InputGroupAddon>
            <Input
              placeholder={'URL'}
              value={this.state.inputVariables.url}
              onChange={e => this.onUrlChanged(e.target.value)}
            />
          </InputGroup>

          <InputGroup>
            <InputGroupAddon addonType="prepend">
              <InputGroupText>
                <Input
                  addon
                  type="checkbox"
                  checked={this.state.inputVariables.enabled}
                  onChange={e => this.onEnabledChanged(e.target.checked)}
                />
              </InputGroupText>
            </InputGroupAddon>
            <Input
              defaultValue="Enabled"
              className={
                this.state.inputVariables.enabled
                  ? 'inputChecked'
                  : 'inputNotChecked'
              }
            />
          </InputGroup>

          {!this.state.isNewSource ? (
            <div>
              <hr />
              <Button
                color="danger"
                block
                className="m-0"
                outline
                onClick={this.onDeleteSource}
              >
                Delete
              </Button>
            </div>
          ) : null}
        </ModalBody>
        <ModalFooter>
          <Button color="primary" className="m-1 mr-auto" onClick={this.onSave}>
            Save
          </Button>{' '}
          <Button color="secondary" className="m-1" onClick={this.onCloseModal}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}
export default EditSourceModal;
