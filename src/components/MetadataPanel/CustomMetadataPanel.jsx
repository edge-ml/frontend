import React, { Component } from "react";
import { Button } from "@mantine/core";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSlidersH, faTags } from "@fortawesome/free-solid-svg-icons";

import MetaDataEditModal from "./MetaDataEditModal";
import "./MetadataPanel.css";

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
    newMetaData
      .filter((elm) => elm.key !== "")
      .forEach((elm) => {
        metaDataAsObj[elm.key] = elm.data;
      });

    this.props.onUpdateMetaData({ metaData: metaDataAsObj });
    this.setState({
      editModalOpen: false,
    });
  }

  additionalMetaData() {
    return Object.keys(this.props.metaData).map((key) => (
      <div className="customMetaDataItem" key={key}>
        <div className="customMetaDataItem_key">{key}</div>
        <div className="customMetaDataItem_value">
          {this.props.metaData[key]}
        </div>
      </div>
    ));
  }

  render() {
    const count = Object.keys(this.props.metaData).length;

    return (
      <div className="metadata-section">
        <div className="metadata-section-header">
          <h4 className="metadata-section-title">
            <FontAwesomeIcon
              className="metadata-section-icon"
              icon={faSlidersH}
            />
            Custom Metadata
            {count > 0 && (
              <span className="metadata-count-badge">{count}</span>
            )}
          </h4>
          <Button
            color="blue"
            size="xs"
            variant="light"
            leftIcon={<FontAwesomeIcon icon={faTags} size="xs" />}
            onClick={this.onEdit}
          >
            Edit
          </Button>
        </div>
        {count ? (
          <div className="custom-metadata-list">{this.additionalMetadata()}</div>
        ) : (
          <div className="custom-metadata-empty">
            <FontAwesomeIcon icon={faTags} />
            <span>No custom metadata yet</span>
            <span style={{ fontSize: "0.78rem" }}>
              Use “Edit” to add your own key/value pairs.
            </span>
          </div>
        )}
        <MetaDataEditModal
          onClose={this.onCancelEdit}
          onSave={this.onSave}
          isOpen={this.state.editModalOpen}
          metaData={this.props.metaData}
        />
      </div>
    );
  }
}
export default CustomMetadataPanel;
