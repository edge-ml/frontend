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

  renderMetaData() {
    return this.state.metaData.map((elm, idx) => (
      <div key={idx}>
        <div style={{ display: 'flex', marginTop: '4px', marginBottom: '4px' }}>
          <Input
            style={{
              background: 'lightGrey',
              width: '33%',
              borderBottomRightRadius: 0,
              borderTopRightRadius: 0,
            }}
            value={elm.key}
            onChange={(e) => this.onEditKey(e, idx)}
          ></Input>
          <Input
            style={{ borderBottomLeftRadius: 0, borderTopLeftRadius: 0 }}
            value={elm.data}
            onChange={(e) => this.onEditValue(e, idx)}
          ></Input>
          <Button
            style={{ marginLeft: '8px' }}
            color="danger"
            onClick={this.onDeleteMetaData}
          >
            X
          </Button>
        </div>
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
