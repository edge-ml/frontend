import React, { Component } from 'react';
import {
  Card,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Input,
  CardBody,
  CardHeader,
  Button,
  CardFooter,
  FormFeedback,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';
import './MetadataPanel.css';
import cloneDeep from 'lodash/cloneDeep';

class MetaDataEditModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editableMetaData: [],
      nonEditableMetaData: [],
    };
    this.onAddMetaData = this.onAddMetaData.bind(this);
    this.renderMetaData = this.renderMetaData.bind(this);
    this.onClose = this.onClose.bind(this);
    this.onEditKey = this.onEditKey.bind(this);
    this.onEditValue = this.onEditValue.bind(this);
    this.onDeleteMetaData = this.onDeleteMetaData.bind(this);
    this.checkError = this.checkError.bind(this);
    this.checkAllValid = this.checkAllValid.bind(this);
  }

  componentDidMount() {
    const metaDataDeepCopy = cloneDeep(this.props.metaData);

    const editableMetaData = Object.keys(
      this.props.filterMetaData(metaDataDeepCopy, true)
    ).map((elm) => {
      return {
        key: elm,
        data: {
          value: metaDataDeepCopy[elm].value,
          deleteableByUser: metaDataDeepCopy[elm].deleteableByUser,
        },
      };
    });
    const nonEditableMetaData = Object.keys(
      this.props.filterMetaData(metaDataDeepCopy, false)
    ).map((elm) => {
      return {
        key: elm,
        data: {
          value: metaDataDeepCopy[elm].value,
          deleteableByUser: metaDataDeepCopy[elm].deleteableByUser,
        },
      };
    });

    this.setState({
      editableMetaData: editableMetaData,
      nonEditableMetaData: nonEditableMetaData,
    });
  }

  onEditKey(e, idx) {
    const value = e.target.value;
    this.setState({
      editableMetaData: this.state.editableMetaData.map(
        (metaDataEntry, index) => {
          if (index === idx) {
            return { ...metaDataEntry, key: value };
          } else {
            return metaDataEntry;
          }
        }
      ),
    });
  }

  onEditValue(e, idx) {
    const value = e.target.value;
    this.setState({
      editableMetaData: this.state.editableMetaData.map(
        (metaDataEntry, index) => {
          if (index === idx) {
            return {
              ...metaDataEntry,
              data: {
                ...metaDataEntry.data,
                value: value,
              },
            };
          } else {
            return metaDataEntry;
          }
        }
      ),
    });
  }

  onClose() {
    this.props.onClose();
  }

  onAddMetaData() {
    const newMetaData = [
      { key: '', data: { value: undefined, deleteableByUser: true } },
    ];
    this.setState({
      editableMetaData: this.state.editableMetaData.concat(newMetaData),
    });
  }

  onDeleteMetaData(idx) {
    this.setState({
      editableMetaData: this.state.editableMetaData.filter((_, index) => {
        return idx != index;
      }),
    });
  }

  checkError(elm, index) {
    if (elm.key === '') {
      return true;
    }
    //create new array without el[index] without mutation and test if key is already in use in metadata
    const start = this.state.editableMetaData.slice(0, index);
    const end = this.state.editableMetaData.slice(index + 1);

    const found =
      [...start, ...end].filter((d) => d.key == elm.key).length +
      this.state.nonEditableMetaData.filter((d) => d.key == elm.key).length;
    return found > 0;
  }

  checkAllValid() {
    let containsErrors = false;
    this.state.editableMetaData.forEach((metaDataEntry, index) => {
      if (this.checkError(metaDataEntry, index)) {
        containsErrors = true;
      }
    });
    return containsErrors;
  }

  renderMetaData() {
    return this.state.editableMetaData.map((elm, idx) => (
      <div key={idx}>
        <InputGroup>
          <InputGroupAddon addonType="prepend">
            <Input
              style={{
                background: 'lightGrey',
                borderBottomRightRadius: 0,
                borderTopRightRadius: 0,
              }}
              value={elm.key}
              onChange={(e) => this.onEditKey(e, idx)}
              invalid={this.checkError(elm, idx)}
              placeholder="key"
            ></Input>
          </InputGroupAddon>
          <Input
            className="shadow-none"
            // style={{ borderBottomLeftRadius: 0, borderTopLeftRadius: 0 }}
            value={elm.data.value}
            onChange={(e) => this.onEditValue(e, idx)}
            invalid={this.checkError(elm, idx)}
            placeholder="data"
          ></Input>
          <InputGroupAddon addonType="prepend">
            <Button
              style={{
                borderBottomRightRadius: '0.25rem',
                borderTopRightRadius: '0.25rem',
              }}
              color="danger"
              onClick={(e) => this.onDeleteMetaData(idx)}
            >
              X
            </Button>
          </InputGroupAddon>

          <FormFeedback>
            Keys with the same name or empty names are not allowed.
          </FormFeedback>
        </InputGroup>
      </div>
    ));
  }

  render() {
    return (
      <Modal size="lg" isOpen={this.props.isOpen}>
        <ModalHeader>Edit custom Metadata</ModalHeader>
        <ModalBody>
          <div>{this.renderMetaData()}</div>
          <Button color="primary" onClick={() => this.onAddMetaData()}>
            + Add
          </Button>
        </ModalBody>
        <ModalFooter style={{ justifyContent: 'space-between' }}>
          <Button color="secondary" onClick={() => this.onClose()}>
            Cancel
          </Button>
          <Button
            color="primary"
            disabled={this.checkAllValid()}
            onClick={() =>
              this.props.onSave(
                this.state.editableMetaData,
                this.state.nonEditableMetaData
              )
            }
          >
            Save
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}
export default MetaDataEditModal;
