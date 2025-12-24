import React, { useState } from "react";
import { Button, Group, Modal, Stack, TextInput } from "@mantine/core";

const EditModal = ({
  isOpen,
  headerText,
  value,
  placeholder,
  onSave,
  onCancel,
}) => {
  const [text, setText] = useState(value);
  return (
    <Modal opened={isOpen} onClose={onCancel} title={headerText}>
      <Stack gap="md">
        <TextInput
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
        />
        <Group justify="flex-end">
          <Button variant="outline" color="gray" onClick={onCancel}>
            Cancel
          </Button>
          <Button color="blue" onClick={() => onSave(text)}>
            Save
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default EditModal;
