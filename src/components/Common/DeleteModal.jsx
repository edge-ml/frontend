import React from "react";
import { Button } from "@mantine/core";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "../Common/Modal";

const DeleteModal = ({ isOpen, children, onCancel, onDelete }) => {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} onConfirm={onDelete}>
      <ModalHeader>Are you sure to delete:</ModalHeader>
      <ModalBody>{children}</ModalBody>
      <ModalFooter>
        <Button variant="outline" color="gray" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="outline" color="red" onClick={onDelete}>
          Delete
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeleteModal;
