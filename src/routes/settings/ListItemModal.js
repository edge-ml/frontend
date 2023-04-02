import React, { Component } from 'react';
import {
  Button,
  Modal,
  Card,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

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
          <div className="header-wrapper d-flex flex-column align-content-center">
            <h5>{this.props.value.name}</h5>
            <div>{this.props.value.description}</div>
          </div>
          <div className="body-wrapper p-2">
            <div className="p-3">
              <Button outline color="primary" onClick={this.toggleModal}>
                <FontAwesomeIcon icon={faArrowRight}></FontAwesomeIcon>
              </Button>
            </div>
          </div>
        </div>
        {this.state.modalOpen && (
          <Modal isOpen={this.state.modalOpen}>
            <ModalHeader>{this.props.value.name}</ModalHeader>
            <ModalBody>{this.props.component}</ModalBody>
            <ModalFooter>
              <Button color="danger" onClick={this.toggleModal}>
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
