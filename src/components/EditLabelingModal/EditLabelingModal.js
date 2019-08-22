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

import './EditLabelingModal.css';

class EditLabelingModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      labeling: props.labeling,
      labels: props.labels,
      isOpen: props.isOpen,
      onCloseModal: props.onCloseModal,
      onSave: props.onSave,
      onDeleteLabeling: props.onDeleteLabeling,
      isNewLabeling: props.isNewLabeling,
      deletedLabels: []
    };

    this.onAddLabel = this.onAddLabel.bind(this);
    this.onDeleteLabel = this.onDeleteLabel.bind(this);
    this.onLabelingNameChanged = this.onLabelingNameChanged.bind(this);
    this.onLabelNameChanged = this.onLabelNameChanged.bind(this);
    this.onLabelColorChanged = this.onLabelColorChanged.bind(this);
  }

  componentWillReceiveProps(props) {
    this.setState({
      labeling: props.labeling,
      labels: props.labels,
      isOpen: props.isOpen,
      onCloseModal: props.onCloseModal,
      onSave: props.onSave,
      onDeleteLabeling: props.onDeleteLabeling,
      isNewLabeling: props.isNewLabeling
    });
  }

  onLabelingNameChanged(name) {
    if (this.state.isNewLabeling) {
      this.setState({
        labeling: Object.assign({}, this.state.labeling, { name })
      });
    } else {
      this.setState({
        labeling: Object.assign({}, this.state.labeling, {
          name,
          updated: true
        })
      });
    }
  }

  onAddLabel() {
    let newLabel = {
      name: '',
      color: generateRandomColor(),
      isNewLabel: true
    };

    this.setState({
      labels: [...this.state.labels, newLabel]
    });
  }

  onDeleteLabel(labelToDelete) {
    let labels = this.state.labels.filter(label => label !== labelToDelete);
    let labeling = this.state.labeling;
    labeling.labels = labeling.labels.filter(
      label => label !== labelToDelete['_id']
    );

    if (labelToDelete.isNewLabel) {
      this.setState({ labels, labeling });
    } else {
      this.setState({
        labels,
        labeling,
        deletedLabels: [...this.state.deletedLabels, labelToDelete['_id']]
      });
    }
  }

  onLabelNameChanged(labelToChange, name) {
    if (labelToChange.isNewLabel) {
      this.setState({
        labels: this.state.labels.map(label =>
          label !== labelToChange ? label : Object.assign({}, label, { name })
        )
      });
    } else {
      this.setState({
        labels: this.state.labels.map(label =>
          label !== labelToChange
            ? label
            : Object.assign({}, label, { name, updated: true })
        )
      });
    }
  }

  onLabelColorChanged(labelToChange, color) {
    if (color === undefined || color.length > 6) return;

    if (labelToChange.isNewLabel) {
      this.setState({
        labels: this.state.labels.map(label =>
          label !== labelToChange
            ? label
            : Object.assign({}, label, { color: '#' + color })
        )
      });
    } else {
      this.setState({
        labels: this.state.labels.map(label =>
          label !== labelToChange
            ? label
            : Object.assign({}, label, { color: '#' + color, updated: true })
        )
      });
    }
  }

  render() {
    return (
      <Modal isOpen={this.state.isOpen}>
        <ModalHeader>
          {this.state.labeling && this.state.labeling['_id']
            ? this.state.labeling['_id']
            : 'Add labeling'}
        </ModalHeader>
        <ModalBody>
          <InputGroup>
            <InputGroupAddon addonType="prepend">
              <InputGroupText>Name</InputGroupText>
            </InputGroupAddon>
            <Input
              value={
                this.state.labeling && this.state.labeling.name
                  ? this.state.labeling.name
                  : ''
              }
              onChange={e => this.onLabelingNameChanged(e.target.value)}
            />
          </InputGroup>
          <hr />
          {this.state.labels
            ? this.state.labels.map((label, index) => (
                <InputGroup key={'label' + index}>
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      {!label.isNewLabel && (
                        <React.Fragment>
                          <FontAwesomeIcon
                            id={'label' + label['_id']}
                            style={{ color: '#8b8d8f' }}
                            icon={faInfoCircle}
                            className="mr-2 fa-s"
                          />
                          <UncontrolledTooltip
                            placement="top-start"
                            target={'label' + label['_id']}
                          >
                            <b>LabelID:</b> {label['_id']}
                          </UncontrolledTooltip>
                        </React.Fragment>
                      )}
                      Label
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    placeholder="Name"
                    value={label.name}
                    onChange={e =>
                      this.onLabelNameChanged(label, e.target.value)
                    }
                  />
                  <InputGroupAddon addonType="append">
                    <InputGroupText>Color</InputGroupText>
                  </InputGroupAddon>
                  <Input
                    placeholder="Color"
                    className={
                      isValidColor(label.color)
                        ? 'input-group-append is-valid'
                        : 'input-group-append clear is-invalid'
                    }
                    style={{
                      backgroundColor: isValidColor(label.color)
                        ? label.color
                        : 'white',
                      borderColor: isValidColor(label.color)
                        ? label.color
                        : null,
                      color: hexToForegroundColor(label.color)
                    }}
                    value={label.color.split('#')[1]}
                    onChange={e =>
                      this.onLabelColorChanged(label, e.target.value)
                    }
                  />
                  <InputGroupAddon addonType="append">
                    <Button
                      className="m-0"
                      color="danger"
                      outline
                      onClick={e => {
                        this.onDeleteLabel(label);
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
            onClick={this.onAddLabel}
          >
            + Add
          </Button>
          {this.state.labeling && !this.state.isNewLabeling ? (
            <div>
              <hr />
              <Button
                color="danger"
                block
                className="m-0"
                outline
                onClick={e =>
                  this.state.onDeleteLabeling(this.state.labeling['_id'])
                }
              >
                Delete
              </Button>
            </div>
          ) : null}
        </ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            className="m-1 mr-auto"
            onClick={e => {
              this.state.onSave(
                this.state.labeling,
                this.state.labels,
                this.state.deletedLabels
              );
            }}
          >
            Save
          </Button>{' '}
          <Button
            color="secondary"
            className="m-1"
            onClick={this.state.onCloseModal}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}
export default EditLabelingModal;
