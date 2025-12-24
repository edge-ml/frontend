import React from "react";
import { Button, Group, Modal, Stack, Text } from "@mantine/core";

export const DeleteConfirmationModalView = ({
  modelsToDelete,
  onDelete,
  onClosed,
  ...props
}) => {
  return (
    <Modal
      opened={modelsToDelete.length > 0}
      size="lg"
      onClose={onClosed}
      title="Delete Model"
      {...props}
    >
      <Stack gap="md">
        <Text>Are you sure to delete the following models?</Text>
        <Stack gap={4}>
          {modelsToDelete.map((id) => (
            <Text key={id} fw={600}>
              {id}
            </Text>
          ))}
        </Stack>
        <Group justify="flex-end">
          <Button
            id="deleteModelsButtonFinal"
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
      </Stack>
    </Modal>
  );
};
