import React from "react";
import { Modal, Button, Group, Text } from "@mantine/core";

export const DeleteConfirmationModalView = ({
  modelsToDelete,
  onDelete,
  onClosed,
  ...props
}) => {
  return (
    <Modal
      opened={modelsToDelete.length > 0}
      onClose={onClosed}
      title="Delete Model"
      {...props}
    >
      <Text mb="md">
        Are you sure to delete the following models?
        {modelsToDelete.map((id) => (
          <React.Fragment key={id}>
            <br />
            <b>{id}</b>
          </React.Fragment>
        ))}
      </Text>
      <Group justify="flex-end" gap="sm">
        <Button
          variant="outline"
          color="red"
          onClick={() => {
            onDelete(modelsToDelete);
            onClosed();
          }}
        >
          Yes
        </Button>
        <Button variant="outline" color="gray" onClick={onClosed}>
          No
        </Button>
      </Group>
    </Modal>
  );
};
