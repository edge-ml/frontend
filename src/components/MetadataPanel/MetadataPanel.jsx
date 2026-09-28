import React, { Component } from "react";
import { TextInput } from "@mantine/core";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPen,
  faCheck,
  faTag,
  faCalendarDay,
  faUser,
  faFingerprint,
} from "@fortawesome/free-solid-svg-icons";

import { unixTimeToString } from "../../services/helpers";
import "./MetadataPanel.css";

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

  metaDataItem(icon, key, value) {
    return (
      <div className="metadata-row" key={key}>
        <div className="metadata-row-label">
          <FontAwesomeIcon icon={icon} />
          <span>{key}</span>
        </div>
        <div className="metadata-row-value">{value}</div>
      </div>
    );
  }

  handleNameEditButtonClick() {
    this.setState({ nameEditActive: true, editedName: this.state.datasetName });
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
      <div className="metadata-section">
        <div className="metadata-section-header">
          <h4 className="metadata-section-title">
            <FontAwesomeIcon
              className="metadata-section-icon"
              icon={faFingerprint}
            />
            Dataset Info
          </h4>
        </div>
        <div className="metadata-rows">
          <div className="metadata-row">
            <div className="metadata-row-label">
              <FontAwesomeIcon icon={faTag} />
              <span>Name</span>
            </div>
            <div className="metadata-row-value">
              {this.state.nameEditActive ? (
                <div style={{ display: "flex", gap: "4px" }}>
                  <TextInput
                    className="datasetNameChangeInput"
                    size="xs"
                    value={this.state.editedName}
                    onChange={this.handleNameInput}
                    autoFocus
                  />
                  <button
                    className="confirmDatasetNameButton"
                    title="Save name"
                    onClick={this.handleNameSave}
                  >
                    <FontAwesomeIcon icon={faCheck} />
                  </button>
                </div>
              ) : (
                <div className="metadata-name-display">
                  {this.state.datasetName}
                  <button
                    className="changeDatasetNameButton"
                    title="Rename dataset"
                    onClick={this.handleNameEditButtonClick}
                  >
                    <FontAwesomeIcon icon={faPen} size="xs" />
                  </button>
                </div>
              )}
            </div>
          </div>
          {this.metaDataItem(
            faCalendarDay,
            "Start",
            this.props.start !== undefined
              ? unixTimeToString(this.props.start)
              : ""
          )}
          {this.metaDataItem(
            faCalendarDay,
            "End",
            this.props.end != undefined ? unixTimeToString(this.props.end) : ""
          )}
          {this.metaDataItem(faUser, "User", this.props.user)}
        </div>
      </div>
    );
  }
}
export default MetadataPanel;
