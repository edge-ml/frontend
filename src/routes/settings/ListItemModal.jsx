import React, { Component } from "react";
import { Button } from "@mantine/core";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "../../components/Common/Modal";

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
        <div style={{ padding: "0.5rem" }}>
          <div>
            <h5>{this.props.value.name}</h5>
            <div>{this.props.value.description}</div>
          </div>
          <div style={{ padding: "0.5rem" }}>
            <div style={{ padding: "1rem" }}>
              <Button variant="outline" color="blue" onClick={this.toggleModal}>
                Edit
              </Button>
            </div>
          </div>
        </div>
        {this.state.modalOpen && (
          <Modal isOpen={this.state.modalOpen} onClose={this.toggleModal}>
            <ModalHeader>{this.props.value.name}</ModalHeader>
            <ModalBody>{this.props.component}</ModalBody>
            <ModalFooter>
              <Button color="red" onClick={this.toggleModal}>
                Cancel
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </div>
    );
  }
}

export default ListItemModal;
