import React from "react";
import { Modal, Button } from "@mantine/core";

const DeleteConfirmationModal = ({ isOpen, onCancel, onConfirm, children }) => {
  return (
    <Modal opened={isOpen} onClose={onCancel} title="Confirm Deletion">
      <Modal.Body>{children}</Modal.Body>
      <Modal.Footer>
        <Button color="red" onClick={onConfirm}>
          Delete
        </Button>
        <Button variant="outline" color="gray" onClick={onCancel}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteConfirmationModal;
