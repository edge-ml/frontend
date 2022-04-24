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
    const metaDataAsObj = {};
    newMetaData.forEach((elm) => {
      metaDataAsObj[elm.key] = elm.data;
    });
    this.props.onUpdateMetaData({ metaData: metaDataAsObj });
    this.setState({
      editModalOpen: false,
    });
  }

  additionalMetaData() {
    return Object.keys(this.props.metaData).map((key) => (
      <div>
        <InputGroup>
          <InputGroupAddon addonType="prepend">
            <InputGroupText className="timeInputGroupText">
              {key}
            </InputGroupText>
          </InputGroupAddon>
          <Input
            className="text-right"
            value={this.props.metaData[key]}
            readOnly
          />
        </InputGroup>
      </div>
    ));
  }

  render() {
    return (
      <div>
        <Card>
          <CardHeader>
            <b>Custom Metadata</b>
          </CardHeader>
          <CardBody>
            {Object.keys(this.props.metaData).length ? (
              <div>
                <div>{this.additionalMetaData()}</div>
              </div>
            ) : (
              <div>No custom metadata</div>
            )}
          </CardBody>
          <CardFooter>
            <div className="text-right">
              <Button color="primary" size="sm" onClick={this.onEdit}>
                + Edit
              </Button>
            </div>
          </CardFooter>
        </Card>
        <MetaDataEditModal
          onClose={this.onCancelEdit}
          onSave={this.onSave}
          isOpen={this.state.editModalOpen}
          metaData={this.props.metaData}
        ></MetaDataEditModal>
      </div>
    );
  }
}
export default CustomMetadataPanel;
