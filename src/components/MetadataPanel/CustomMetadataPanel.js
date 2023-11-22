import React, { Component, Fragment } from 'react';
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
} from 'reactstrap';
import MetaDataEditModal from './MetaDataEditModal';
import './MetadataPanel.css';

class CustomMetadataPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editModalOpen: false,
    };
    this.additionalMetadata = this.additionalMetaData.bind(this);
    this.onEdit = this.onEdit.bind(this);
    this.onCancelEdit = this.onCancelEdit.bind(this);
    this.onSave = this.onSave.bind(this);
  }

  onCancelEdit() {
    console.log('cancel edit');
    this.setState({
      editModalOpen: false,
    });
  }

  onEdit() {
    this.setState({
      editModalOpen: true,
    });
  }

  onSave(newMetaData) {
    console.log('ONSAVE');
    const metaDataAsObj = {};
    newMetaData
      .filter((elm) => elm.key !== '')
      .forEach((elm) => {
        metaDataAsObj[elm.key] = elm.data;
      });
    console.log(newMetaData);
    this.props.onUpdateMetaData({ metaData: metaDataAsObj });
    this.setState({
      editModalOpen: false,
    });
  }
  //
  additionalMetaData() {
    return Object.keys(this.props.metaData).map((key) => (
      <div className="customMetaDataItem mx-2">
        <div className="customMetaDataItem_key">{key}</div>
        <div className="customMetaDataItem_value">
          {this.props.metaData[key]}
        </div>
      </div>
    ));
  }

  render() {
    return (
      <>
        <div className="sidepanel-heading mt-5">
          <h4>Custom Metadata</h4>
        </div>
        <div style={{ overflowY: 'auto' }}>
          {Object.keys(this.props.metaData).length ? (
            this.additionalMetaData()
          ) : (
            <div className="m-2">No custom metadata</div>
          )}
        </div>
        <div className="m-2 d-flex justify-content-end">
          <Button color="primary" size="sm" onClick={this.onEdit}>
            + Edit
          </Button>
        </div>
        <MetaDataEditModal
          onClose={this.onCancelEdit}
          onSave={this.onSave}
          isOpen={this.state.editModalOpen}
          metaData={this.props.metaData}
        ></MetaDataEditModal>
      </>
    );
  }
}
export default CustomMetadataPanel;
