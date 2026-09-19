import React from "react";
import { Modal as MantineModal, Group } from "@mantine/core";

export const Modal = ({ isOpen, onClose, title, children, ...props }) => {
  let headerContent = title;

  // Extract <ModalHeader> content so it can be rendered by Mantine on the
  // same line as the close button instead of a separate header element.
  const remainingChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child) && child.type === ModalHeader) {
      headerContent = child.props.children;
      return null;
    }
    return child;
  });

  return (
    <MantineModal opened={isOpen} onClose={onClose} title={headerContent} {...props}>
      {remainingChildren}
    </MantineModal>
  );
};

/**
 * Deprecated: use the `title` prop of <Modal> instead.
 * Its content is extracted by <Modal> and rendered in the native header,
 * keeping the heading on the same line as the close button.
 */
export const ModalHeader = () => null;

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
