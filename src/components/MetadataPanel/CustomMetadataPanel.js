import React, { Component } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  CardFooter,
  Table,
} from 'reactstrap';
import MetaDataEditModal from './MetaDataEditModal';
import './MetadataPanel.css';

class CustomMetadataPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editModalOpen: false,
    };
    this.additionalMetaDataTable = this.additionalMetaDataTable.bind(this);
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

  onSave(editableMetaData) {
    const metaDataAsObj = {};
    editableMetaData.forEach((elm) => {
      metaDataAsObj[elm.key] = elm.value;
    });
    this.props.onUpdateMetaData(metaDataAsObj);
    this.setState({
      editModalOpen: false,
    });
  }

  additionalMetaDataTable() {
    return (
      <Table striped bordered responsive size="sm">
        <thead>
          <tr>
            <th>Attribute</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(this.props.metaData).map((key, index) => (
            <tr>
              <td>{key}</td>
              <td>{this.props.metaData[key]}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
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
                <div>{this.additionalMetaDataTable()}</div>
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
        {this.state.editModalOpen && (
          <MetaDataEditModal
            onClose={this.onCancelEdit}
            onSave={this.onSave}
            isOpen={this.state.editModalOpen}
            metaData={this.props.metaData}
          ></MetaDataEditModal>
        )}
      </div>
    );
  }
}
export default CustomMetadataPanel;
