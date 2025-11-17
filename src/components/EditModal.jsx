import React, { useState } from "react";
import {
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Button,
} from "reactstrap";

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
    <Modal isOpen={isOpen}>
      <ModalHeader>{headerText}</ModalHeader>
      <ModalBody>
        <Input
          type="text"
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
        />
      </ModalBody>
      <ModalFooter>
        <Button outline color="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button outline color="primary" onClick={() => onSave(text)}>
          Save
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default EditModal;
