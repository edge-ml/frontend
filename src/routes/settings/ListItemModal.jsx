import React, { Component } from "react";
import { Button, Modal, Stack, Text, Title } from "@mantine/core";

class ListItemModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalOpen: false,
    };
    this.toggleModal = this.toggleModal.bind(this);
  }

  toggleModal = () => {
    this.setState({ modalOpen: !this.state.modalOpen });
  };

  render() {
    return (
      <div>
        <div className="p-2">
          <Stack gap="xs">
            <Title order={5}>{this.props.value.name}</Title>
            <Text c="dimmed">{this.props.value.description}</Text>
            <div>
              <Button variant="outline" onClick={this.toggleModal}>
                Edit
              </Button>
            </div>
          </Stack>
        </div>
        {this.state.modalOpen && (
          <Modal
            opened={this.state.modalOpen}
            onClose={this.toggleModal}
            title={this.props.value.name}
          >
            <Stack gap="md">
              {this.props.component}
              <Button color="red" variant="outline" onClick={this.toggleModal}>
                Cancel
              </Button>
            </Stack>
          </Modal>
        )}
      </div>
    );
  }
}

export default ListItemModal;
