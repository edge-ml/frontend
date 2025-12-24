import React, { Component } from "react";
import { Button, Group, Modal, Stack, TextInput, Title } from "@mantine/core";
import CodeSnippet from "./CodeSnippet";
import CodeSettings from "./CodeSettings";

class CodeSnippetModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      platform: "Java",
      datasetName: undefined,
      servertime: false,
    };
    this.onPlatformChange = this.onPlatformChange.bind(this);
    this.onDatasetNameChanged = this.onDatasetNameChanged.bind(this);
    this.onServerTimeChange = this.onServerTimeChange.bind(this);
    this.onCancel = this.onCancel.bind(this);
  }

  onCancel() {
    this.setState({
      platform: "Java",
      datasetName: undefined,
      servertime: false,
    });
    this.props.onCancel();
  }

  onServerTimeChange(e) {
    const val = e.target.value === "Yes" ? true : false;
    this.setState({
      servertime: val,
    });
  }

  onDatasetNameChanged(e) {
    this.setState({
      datasetName: e.target.value,
    });
  }

  onPlatformChange(e) {
    this.setState({
      platform: e.target.value,
    });
  }

  render() {
    return (
      <Modal opened={this.props.isOpen} onClose={this.onCancel} size="xl">
        <Title order={4}>Generate code snippet</Title>
        <Stack mt="sm">
          <TextInput
            id="inputProjectName"
            label="Dataset-name"
            placeholder="Dataset-name"
            value={this.state.datasetName}
            onChange={this.onDatasetNameChanged}
          />
          <CodeSettings
            platform={this.state.platform}
            servertime={this.state.servertime}
            onPlatformChange={this.onPlatformChange}
            onServerTimeChange={this.onServerTimeChange}
          />
          <CodeSnippet
            backendUrl={this.props.backendUrl}
            platform={this.state.platform}
            datasetName={this.state.datasetName}
            useServertime={this.state.servertime}
            deviceApiKey={this.props.readApiKey} // TODO: FIX CODESNIPPET DEVICEAPIKEY
          />
        </Stack>
        <Group justify="flex-end" mt="md">
          <Button
            id="btnSaveProjectCancel"
            color="gray"
            onClick={this.onCancel}
          >
            Cancel
          </Button>
        </Group>
      </Modal>
    );
  }
}

export default CodeSnippetModal;
