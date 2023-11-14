import React, { Component } from 'react';
import {
  CardBody,
  Form,
  FormGroup,
  Input,
  InputGroup,
  InputGroupAddon,
} from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faCheck } from '@fortawesome/free-solid-svg-icons'; // Added faCheck icon

import { unixTimeToString } from '../../services/helpers';
import './MetadataPanel.css';

class MetadataPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nameEditActive: false,
      datasetName: this.props.name,
      editedName: this.props.name,
    };
    this.handleNameEditButtonClick = this.handleNameEditButtonClick.bind(this);
    this.handleNameInput = this.handleNameInput.bind(this);
    this.handleNameSave = this.handleNameSave.bind(this);
  }

  metaDataItem(key, value) {
    return (
      <div className="customMetaDataItem">
        <div className="customMetaDataItem_key">{key}</div>
        <div className="customMetaDataItem_value">{value}</div>
      </div>
    );
  }

  handleNameEditButtonClick() {
    this.setState({ nameEditActive: true });
  }

  handleNameInput(event) {
    this.setState({ editedName: event.target.value });
  }

  async handleNameSave() {
    this.setState({ nameEditActive: false });
    const nameChangeSuccessful = await this.props.handleDatasetNameChange(
      this.state.editedName
    );
    if (nameChangeSuccessful) {
      this.setState({ datasetName: this.state.editedName });
    }
  }

  render() {
    return (
      <div className="sidepanel-card h-100">
        <div className="sidepanel-heading">
          <h5>Metadata</h5>
        </div>
        <div className="m-2">
          <div className="customMetaDataItem">
            <div className="customMetaDataItem_key">Name</div>
            <div
              className={`customMetaDataItem_value ${
                this.state.nameEditActive ? 'editing' : ''
              }`}
            >
              {this.state.nameEditActive ? (
                <Form>
                  <FormGroup>
                    <InputGroup className="datasetNameChangeInputArea">
                      <Input
                        className="datasetNameChangeInput"
                        type="text"
                        value={this.state.editedName}
                        onChange={this.handleNameInput}
                      />
                      <InputGroupAddon addonType="append">
                        <button
                          className="confirmDatasetNameButton"
                          onClick={this.handleNameSave}
                        >
                          <FontAwesomeIcon icon={faCheck} />
                        </button>
                      </InputGroupAddon>
                    </InputGroup>
                  </FormGroup>
                </Form>
              ) : (
                <>
                  {this.state.datasetName}
                  <button
                    className="changeDatasetNameButton"
                    onClick={this.handleNameEditButtonClick}
                  >
                    <FontAwesomeIcon icon={faPen} />
                  </button>
                </>
              )}
            </div>
          </div>
          {this.metaDataItem(
            'Start',
            this.props.start !== undefined
              ? unixTimeToString(this.props.start)
              : ''
          )}
          {this.metaDataItem(
            'End',
            this.props.end != undefined ? unixTimeToString(this.props.end) : ''
          )}
          {this.metaDataItem('User', this.props.user)}
        </div>
      </div>
    );
  }
}
export default MetadataPanel;
