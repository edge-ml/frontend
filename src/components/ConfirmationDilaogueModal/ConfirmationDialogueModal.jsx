import React, { Component } from "react";
import { Button, Group, Modal, Stack, Text } from "@mantine/core";
import "./ConfirmationDialogueModal.css";

class ConfirmationDialogueModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: this.props.isOpen,
    };
    this.onKeyPressed = this.onKeyPressed.bind(this);
  }

  componentDidMount() {
    document.addEventListener("keydown", this.onKeyPressed, false);
  }

  //important that this is called when modal is not shown! Modal has to be rendered conditionally.
  componentWillUnmount() {
    document.removeEventListener("keydown", this.onKeyPressed, false);
  }

  onKeyPressed(e) {
    switch (e.key) {
      case "Escape":
        this.props.onCancel();
        break;
      case "Enter":
        this.props.onConfirm();
        break;
    }
  }

  render() {
    return (
      <div>
        <Modal
          opened={this.props.isOpen}
          onClose={this.props.onCancel}
          className="modal-body-scrollable modal-l"
          title={this.props.title}
        >
          <Stack gap="md">
            <Text style={{ whiteSpace: "pre-wrap" }}>
              {this.props.confirmString}
            </Text>
            <Group justify="flex-end">
              <Button color="red" onClick={this.props.onConfirm}>
                Confirm
              </Button>
              <Button variant="outline" color="gray" onClick={this.props.onCancel}>
                Cancel
              </Button>
            </Group>
          </Stack>
        </Modal>
      </div>
    );
  }
}

export default ConfirmationDialogueModal;
