import React from "react";
import { Button, Group, Modal, Stack } from "@mantine/core";

const DeleteConfirmationModal = ({ isOpen, onCancel, onConfirm, children }) => {
  return (
    <Modal opened={isOpen} onClose={onCancel} title="Confirm Deletion">
      <Stack gap="md">
        <div>{children}</div>
        <Group justify="flex-end">
          <Button color="red" onClick={onConfirm}>
            Delete
          </Button>
          <Button variant="outline" color="gray" onClick={onCancel}>
            Cancel
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default DeleteConfirmationModal;
