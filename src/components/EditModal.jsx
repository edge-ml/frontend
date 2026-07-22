import React, { useState } from "react";
import { TextInput, Button, Group } from "@mantine/core";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "./Common/Modal";

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
    <Modal isOpen={isOpen} onClose={onCancel} title={headerText}>
      <ModalBody>
        <TextInput
          onChange={(e) => setText(e.currentTarget.value)}
          placeholder={placeholder}
        />
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" color="gray" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSave(text)}>Save</Button>
      </ModalFooter>
    </Modal>
  );
};

export default EditModal;
