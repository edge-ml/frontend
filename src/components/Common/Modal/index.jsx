import React from "react";
import { Modal as MantineModal, Group } from "@mantine/core";

export const Modal = ({ isOpen, onClose, children, ...props }) => {
  return (
    <MantineModal opened={isOpen} onClose={onClose} {...props}>
      {children}
    </MantineModal>
  );
};

export const ModalHeader = ({ children }) => {
  return <MantineModal.Header>{children}</MantineModal.Header>;
};

export const ModalBody = ({ children, ...props }) => {
  return <MantineModal.Body {...props}>{children}</MantineModal.Body>;
};

export const ModalFooter = ({ children, className }) => {
  return (
    <Group justify="flex-end" gap="sm" mt="md" className={className}>
      {children}
    </Group>
  );
};
