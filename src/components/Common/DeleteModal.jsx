import React from "react";
import { Button, Group } from "@mantine/core";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "../Common/Modal";

const DeleteModal = ({ isOpen, children, onCancel, onDelete }) => {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} onConfirm={onDelete}>
      <ModalHeader>Are you sure to delete:</ModalHeader>
      <ModalBody>{children}</ModalBody>
      <ModalFooter>
        <Group justify="flex-end">
          <Button variant="outline" color="gray" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="outline" color="red" onClick={onDelete}>
            Delete
          </Button>
        </Group>
      </ModalFooter>
    </Modal>
  );
};

export default DeleteModal;
