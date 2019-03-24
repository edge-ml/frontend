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
      labeling: props.labeling,
      isOpen: props.isOpen
    };

    this.onAddType = this.onAddType.bind(this);
    this.generateRandomColor = this.generateRandomColor.bind(this);
    this.uuidv4 = this.uuidv4.bind(this);
    this.onDeleteType = this.onDeleteType.bind(this);
    this.hexToRgb = this.hexToRgb.bind(this);
    this.hexToForegroundColor = this.hexToForegroundColor.bind(this);
    this.onCloseModal = this.onCloseModal.bind(this);
  }

  componentWillReceiveProps(props) {
    this.setState(state => ({
      labeling: props.labeling,
      isOpen: props.isOpen
    }));
  }

  onAddType() {
    if (!this.state.labeling) return;

    this.state.labeling.types.push({
      id: this.uuidv4(),
      name: '',
      color: this.generateRandomColor()
    });

    this.setState(state => ({
      labeling: this.state.labeling,
      isOpen: this.state.isOpen
    }));
  }

  onDeleteType(id) {
    if (!this.state.labeling) return;

    this.setState(state => ({
      labeling: {
        id: this.state.labeling.id,
        name: this.state.labeling.name,
        types: this.state.labeling.types.filter(type => type.id !== id)
      },
      isOpen: this.state.isOpen
    }));
  }

  onCloseModal() {
    this.setState({
      isOpen: false
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

  render() {
    return (
      <Modal isOpen={this.state.isOpen}>
        <ModalHeader>
          {this.state.labeling ? this.state.labeling.id : null}
        </ModalHeader>
        <ModalBody>
          <InputGroup>
            <InputGroupAddon addonType="prepend">
              <InputGroupText>Name</InputGroupText>
            </InputGroupAddon>
            <Input
              value={this.state.labeling ? this.state.labeling.name : null}
            />
          </InputGroup>
          <hr />
          {this.state.labeling && this.state.labeling.types
            ? this.state.labeling.types.map(type => (
                <InputGroup>
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>Label</InputGroupText>
                  </InputGroupAddon>
                  <Input value={type.name} />
                  <InputGroupAddon addonType="append">
                    <InputGroupText>Color</InputGroupText>
                  </InputGroupAddon>
                  <Input
                    className="input-group-append"
                    style={{
                      backgroundColor: type.color,
                      borderColor: type.color,
                      color: this.hexToForegroundColor(type.color)
                    }}
                    value={type.color.split('#')[1]}
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
          <Button className="btn-light m-0" block onClick={this.onAddType}>
            + Add
          </Button>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" className="m-1 mr-auto">
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
