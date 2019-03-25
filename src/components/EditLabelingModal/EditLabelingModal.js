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
      isNewLabeling: props.isNewLabeling
    };

    this.onAddType = this.onAddType.bind(this);
    this.generateRandomColor = this.generateRandomColor.bind(this);
    this.uuidv4 = this.uuidv4.bind(this);
    this.onDeleteType = this.onDeleteType.bind(this);
    this.hexToRgb = this.hexToRgb.bind(this);
    this.hexToForegroundColor = this.hexToForegroundColor.bind(this);
    this.onCloseModal = this.onCloseModal.bind(this);
    this.onSave = this.onSave.bind(this);
    this.onDeleteLabeling = this.onDeleteLabeling.bind(this);
    this.onNameChanged = this.onNameChanged.bind(this);
    this.onLabelNameChanged = this.onLabelNameChanged.bind(this);
    this.onLabelColorChanged = this.onLabelColorChanged.bind(this);
    this.isValidColor = this.isValidColor.bind(this);
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
      id: this.uuidv4(),
      name: '',
      color: this.generateRandomColor()
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

  generateRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  hexToRgb(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        }
      : null;
  }

  hexToForegroundColor(hex) {
    let color = this.hexToRgb(hex);
    if (!color) return '#000000';

    if (color.r * 0.299 + color.g * 0.587 + color.b * 0.114 > 186) {
      return '#000000';
    } else {
      return '#ffffff';
    }
  }

  uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (Math.random() * 16) | 0,
        v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  isValidColor(color) {
    return /(^#[0-9A-F]{6}$)/i.test(color);
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
                    <InputGroupText>Label</InputGroupText>
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
                      this.isValidColor(type.color)
                        ? 'input-group-append is-valid'
                        : 'input-group-append clear is-invalid'
                    }
                    style={{
                      backgroundColor: this.isValidColor(type.color)
                        ? type.color
                        : 'white',
                      borderColor: this.isValidColor(type.color)
                        ? type.color
                        : null,
                      color: this.hexToForegroundColor(type.color)
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
