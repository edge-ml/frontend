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

class MetaDataEditModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      metaData: [],
    };
    this.onAddMetaData = this.onAddMetaData.bind(this);
    this.renderMetaData = this.renderMetaData.bind(this);
    this.onClose = this.onClose.bind(this);
    this.onEditKey = this.onEditKey.bind(this);
    this.onEditValue = this.onEditValue.bind(this);
    this.onDeleteMetaData = this.onDeleteMetaData.bind(this);
    this.checkError = this.checkError.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps !== this.props) {
      const metaData = Object.keys(this.props.metaData).map((elm) => {
        return { key: elm, data: this.props.metaData[elm] };
      });
      this.setState({
        metaData: metaData,
      });
    }
  }

  onEditKey(e, idx) {
    const value = e.target.value;
    const metaData = this.state.metaData;
    metaData[idx].key = value;
    this.setState({
      metaData: metaData,
    });
  }

  onEditValue(e, idx) {
    const value = e.target.value;
    const metaData = this.state.metaData;
    metaData[idx].data = value;
    this.setState({
      metaData: metaData,
    });
  }

  onClose() {
    this.setState({
      newMetaData: {},
    });
    this.props.onClose();
  }

  onAddMetaData() {
    var newMetaData = this.state.metaData;
    newMetaData.push({ key: undefined, data: undefined });
    this.setState({
      newMetaData: newMetaData,
    });
  }

  onDeleteMetaData(idx) {
    var newMetaData = this.state.metaData;
    newMetaData.splice(idx, 1);
    this.setState({
      metaData: newMetaData,
    });
  }

  checkError(elm) {
    const found = this.state.metaData.filter((d) => d.key == elm.key);
    return found.length > 1;
  }

  renderMetaData() {
    return this.state.metaData.map((elm, idx) => (
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
              invalid={this.checkError(elm)}
              placeholder="key"
            ></Input>
          </InputGroupAddon>
          <Input
            className="shadow-none"
            // style={{ borderBottomLeftRadius: 0, borderTopLeftRadius: 0 }}
            value={elm.data}
            onChange={(e) => this.onEditValue(e, idx)}
            invalid={this.checkError(elm)}
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

          <FormFeedback>Keys with the same name are not allowed.</FormFeedback>
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
          <Button color="primary" onClick={this.onAddMetaData}>
            + Add
          </Button>
        </ModalBody>
        <ModalFooter style={{ justifyContent: 'space-between' }}>
          <Button color="secondary" onClick={this.onClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            onClick={() => this.props.onSave(this.state.metaData)}
          >
            Save
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}
export default MetaDataEditModal;
