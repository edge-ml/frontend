import React, { Component } from 'react';
import {
  Button,
  Modal,
  Card,
  ModalHeader,
  ModalBody,
  ModalFooter,
  CardBody,
  CardTitle,
  CardSubtitle,
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
        <Card className="my-2 p-2">
          <CardTitle className="text-left">
            <h5>{this.props.value.name}</h5>
          </CardTitle>
          <CardSubtitle className="text-left">
            {this.props.value.description}
          </CardSubtitle>
          <CardBody>
            <div className="d-flex justify-content-between">
              {this.props.component}
              <Button color="primary" onClick={this.toggleModal}>
                <FontAwesomeIcon
                  className="mr-2"
                  icon={faArrowRight}
                ></FontAwesomeIcon>
              </Button>
            </div>
          </CardBody>
        </Card>
        {this.state.modalOpen && (
          <Modal isOpen={this.state.modalOpen}>
            <ModalHeader>{this.props.value.name}</ModalHeader>
            <ModalBody>{this.props.component}</ModalBody>
            <ModalFooter>
              <Button color="primary">Save</Button>
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
