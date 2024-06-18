import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

const DeleteConfirmationModal = ({ isOpen, onCancel, onConfirm, children }) => {
  return (
    <Modal isOpen={isOpen}>
      <ModalHeader>Confirm Deletion</ModalHeader>
      <ModalBody>
        {children}
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={onConfirm}>Delete</Button>
        <Button color="secondary" onClick={onCancel}>Cancel</Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeleteConfirmationModal;
