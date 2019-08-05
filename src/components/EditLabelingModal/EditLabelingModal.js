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
  Input,
  UncontrolledTooltip
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

import {
  isValidColor,
  hexToForegroundColor,
  generateRandomColor
} from '../../services/ColorService';
import { uuidv4 } from '../../services/UUIDService';

import './EditLabelingModal.css';

class EditLabelingModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: props.name,
      types: props.types,
      id: props.id,
      isOpen: props.isOpen,
      onCloseModal: props.onCloseModal,
      onSave: props.onSave,
      onDeleteLabeling: props.onDeleteLabeling,
      isNewLabeling: props.isNewLabeling
    };

    this.onAddType = this.onAddType.bind(this);
    this.onDeleteType = this.onDeleteType.bind(this);
    this.onCloseModal = this.onCloseModal.bind(this);
    this.onSave = this.onSave.bind(this);
    this.onDeleteLabeling = this.onDeleteLabeling.bind(this);
    this.onNameChanged = this.onNameChanged.bind(this);
    this.onLabelNameChanged = this.onLabelNameChanged.bind(this);
    this.onLabelColorChanged = this.onLabelColorChanged.bind(this);
  }

  componentWillReceiveProps(props) {
    this.setState(state => ({
      name: props.name,
      types: props.types,
      id: props.id,
      isOpen: props.isOpen,
      onCloseModal: props.onCloseModal,
      onSave: props.onSave,
      onDeleteLabeling: props.onDeleteLabeling,
      isNewLabeling: props.isNewLabeling
    }));
  }

  onAddType() {
    let newLabel = {
      id: uuidv4(),
      name: '',
      color: generateRandomColor()
    };

    this.setState(state => ({
      name: this.state.name,
      types: [...this.state.types, newLabel],
      id: this.state.id,
      isOpen: this.state.isOpen,
      onCloseModal: this.state.onCloseModal,
      onSave: this.state.onSave,
      onDeleteLabeling: this.state.onDeleteLabeling,
      isNewLabeling: this.state.isNewLabeling
    }));
  }

  onDeleteType(id) {
    this.setState(state => ({
      id: this.state.id,
      name: this.state.name,
      types: this.state.types.filter(type => type.id !== id),
      isOpen: this.state.isOpen,
      onCloseModal: this.state.onCloseModal,
      onSave: this.state.onSave,
      onDeleteLabeling: this.state.onDeleteLabeling,
      isNewLabeling: this.state.isNewLabeling
    }));
  }

  onDeleteLabeling() {
    this.state.onDeleteLabeling(this.state.id);
    this.setState({
      isOpen: false,
      name: '',
      types: [],
      id: '',
      onCloseModal: undefined,
      onSave: undefined,
      onDeleteLabeling: undefined,
      isNewLabeling: false
    });
  }

  onCloseModal() {
    this.state.onCloseModal();
    this.setState({
      isOpen: false,
      name: '',
      types: undefined,
      id: '',
      onCloseModal: undefined,
      onSave: undefined,
      onDeleteLabeling: undefined,
      isNewLabeling: false
    });
  }

  onSave() {
    this.state.onSave(this.state.id, this.state.name, this.state.types);
    this.setState({
      isOpen: false,
      name: '',
      types: [],
      id: '',
      onCloseModal: undefined,
      onSave: undefined,
      onDeleteLabeling: undefined,
      isNewLabeling: false
    });
  }

  onNameChanged(name) {
    this.setState({
      isOpen: this.state.isOpen,
      name: name,
      types: this.state.types,
      id: this.state.id,
      onCloseModal: this.state.onCloseModal,
      onSave: this.state.onSave,
      onDeleteLabeling: this.state.onDeleteLabeling,
      isNewLabeling: this.state.isNewLabeling
    });
  }

  onLabelNameChanged(id, name) {
    this.setState({
      isOpen: this.state.isOpen,
      name: this.state.name,
      types: this.state.types.map(type =>
        type.id !== id ? type : Object.assign({}, type, { name: name })
      ),
      id: this.state.id,
      onCloseModal: this.state.onCloseModal,
      onSave: this.state.onSave,
      onDeleteLabeling: this.state.onDeleteLabeling,
      isNewLabeling: this.state.isNewLabeling
    });
  }

  onLabelColorChanged(id, color) {
    if (color === undefined || color.length > 6) return;
    this.setState({
      isOpen: this.state.isOpen,
      name: this.state.name,
      types: this.state.types.map(type =>
        type.id !== id ? type : Object.assign({}, type, { color: '#' + color })
      ),
      id: this.state.id,
      onCloseModal: this.state.onCloseModal,
      onSave: this.state.onSave,
      onDeleteLabeling: this.state.onDeleteLabeling,
      isNewLabeling: this.state.isNewLabeling
    });
  }

  render() {
    return (
      <Modal isOpen={this.state.isOpen}>
        <ModalHeader>{this.state.id ? this.state.id : ''}</ModalHeader>
        <ModalBody>
          <InputGroup>
            <InputGroupAddon addonType="prepend">
              <InputGroupText>Name</InputGroupText>
            </InputGroupAddon>
            <Input
              value={this.state.name ? this.state.name : ''}
              onChange={e => this.onNameChanged(e.target.value)}
            />
          </InputGroup>
          <hr />
          {this.state.types
            ? this.state.types.map(type => (
                <InputGroup>
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <FontAwesomeIcon
                        id={'type' + type.id}
                        style={{ color: '#8b8d8f' }}
                        icon={faInfoCircle}
                        className="mr-2 fa-s"
                      />
                      <UncontrolledTooltip
                        placement="top-start"
                        target={'type' + type.id}
                      >
                        <b>TypeId:</b> {type.id}
                      </UncontrolledTooltip>
                      Label
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    placeholder="Name"
                    value={type.name}
                    onChange={e =>
                      this.onLabelNameChanged(type.id, e.target.value)
                    }
                  />
                  <InputGroupAddon addonType="append">
                    <InputGroupText>Color</InputGroupText>
                  </InputGroupAddon>
                  <Input
                    placeholder="Color"
                    className={
                      isValidColor(type.color)
                        ? 'input-group-append is-valid'
                        : 'input-group-append clear is-invalid'
                    }
                    style={{
                      backgroundColor: isValidColor(type.color)
                        ? type.color
                        : 'white',
                      borderColor: isValidColor(type.color) ? type.color : null,
                      color: hexToForegroundColor(type.color)
                    }}
                    value={type.color.split('#')[1]}
                    onChange={e =>
                      this.onLabelColorChanged(type.id, e.target.value)
                    }
                  />
                  <InputGroupAddon addonType="append">
                    <Button
                      className="m-0"
                      color="danger"
                      outline
                      onClick={e => {
                        this.onDeleteType(type.id);
                      }}
                    >
                      ✕
                    </Button>
                  </InputGroupAddon>
                </InputGroup>
              ))
            : null}
          <Button
            className="m-0"
            color="secondary"
            outline
            block
            onClick={this.onAddType}
          >
            + Add
          </Button>
          {!this.state.isNewLabeling ? (
            <div>
              <hr />
              <Button
                color="danger"
                block
                className="m-0"
                outline
                onClick={this.onDeleteLabeling}
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
export default EditLabelingModal;
