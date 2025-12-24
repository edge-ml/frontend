import React, { Component } from "react";
import { Box, Button, Group, Text, Title } from "@mantine/core";
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
  //
  additionalMetaData() {
    return Object.keys(this.props.metaData).map((key) => (
      <Box className="customMetaDataItem" mx="sm" key={key}>
        <div className="customMetaDataItem_key">{key}</div>
        <div className="customMetaDataItem_value">
          {this.props.metaData[key]}
        </div>
      </Box>
    ));
  }

  render() {
    return (
      <>
        <Box className="sidepanel-heading" mt="xl">
          <Title order={4}>Custom Metadata</Title>
        </Box>
        <div style={{ overflowY: "auto" }}>
          {Object.keys(this.props.metaData).length ? (
            this.additionalMetaData()
          ) : (
            <Text m="sm">No custom metadata</Text>
          )}
        </div>
        <Group justify="flex-end" m="sm">
          <Button color="blue" size="sm" onClick={this.onEdit}>
            + Edit
          </Button>
        </Group>
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
