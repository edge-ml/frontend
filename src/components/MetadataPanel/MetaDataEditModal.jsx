import React, { Component } from "react";
import { Box, Button, Group, Modal, Stack, Text, TextInput, Title } from "@mantine/core";
import "./MetadataPanel.css";

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
      <Stack key={idx} gap="xs">
        <Group align="center" gap="xs">
          <TextInput
            value={elm.key}
            onChange={(e) => this.onEditKey(e, idx)}
            error={this.checkError(elm) ? "Duplicate key" : null}
            placeholder="key"
            styles={{
              input: { background: "lightGrey" },
            }}
            w={160}
          />
          <TextInput
            value={elm.data}
            onChange={(e) => this.onEditValue(e, idx)}
            error={this.checkError(elm) || elm.data == "" ? "Required" : null}
            placeholder="data"
            w={240}
          />
          <Button color="red" onClick={() => this.onDeleteMetaData(idx)}>
            X
          </Button>
        </Group>
        {(this.checkError(elm) || elm.data == "") && (
          <Text size="xs" c="red">
            {this.checkError(elm)
              ? "Keys with the same name are not allowed."
              : "Each key needs some data"}
          </Text>
        )}
      </Stack>
    ));
  }

  render() {
    return (
      <Modal
        size="lg"
        opened={this.props.isOpen}
        onClose={this.onClose}
        zIndex={2000}
      >
        <Title order={4}>Edit custom Metadata</Title>
        <Stack mt="sm">
          {this.renderMetaData()}
          <Button color="blue" onClick={this.onAddMetaData}>
            + Add
          </Button>
        </Stack>
        <Group justify="space-between" mt="md">
          <Button color="gray" onClick={this.onClose}>
            Cancel
          </Button>
          <Button
            color="blue"
            onClick={() => this.props.onSave(this.state.metaData)}
          >
            Save
          </Button>
        </Group>
      </Modal>
    );
  }
}
export default MetaDataEditModal;
