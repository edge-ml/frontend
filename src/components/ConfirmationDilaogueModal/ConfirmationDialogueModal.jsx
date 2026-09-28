import React, { Component } from "react";
import { Modal, Button } from "@mantine/core";
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
          title={this.props.title}
        >
          <Modal.Body style={{ whiteSpace: "pre-wrap" }}>
            {this.props.confirmString}
          </Modal.Body>
          <Modal.Footer>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-end",
              }}
            >
              <Button
                variant="outline"
                color="red"
                style={{ margin: "0.25rem" }}
                onClick={this.props.onConfirm}
              >
                Confirm
              </Button>
              <Button
                variant="outline"
                color="gray"
                style={{ margin: "0.25rem" }}
                onClick={this.props.onCancel}
              >
                Cancel
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default ConfirmationDialogueModal;
