import React, { useCallback, useEffect } from "react";
import { ActionIcon, Box, Group, Modal as MantineModal } from "@mantine/core";

import "./index.css";

export const Modal = (props) => {
  const { isOpen, onClose, onConfirm, children, ...rest } = props;

  const handleKeyDown = useCallback(
    (e) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose && onClose();
      } else if (e.key === "Enter" && onConfirm) {
        e.preventDefault();
        e.stopPropagation();
        onConfirm();
      }
    },
    [isOpen, onClose, onConfirm]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <MantineModal
      opened={isOpen}
      onClose={onClose}
      withCloseButton={false}
      {...rest}
    >
      {React.Children.map(children, (child) =>
        React.cloneElement(child, {
          onClose: onClose,
          onConfirm: onConfirm,
        })
      )}
    </MantineModal>
  );
};

export const ModalHeader = (props) => {
  return (
    <Group
      {...props}
      className="modal-header"
      justify="space-between"
      align="center"
    >
      <Box>{props.children}</Box>
      <div className="modal-close-button">
        <ActionIcon size="sm" variant="subtle" onClick={props.onClose}>
          ×
        </ActionIcon>
      </div>
    </Group>
  );
};

export const ModalBody = (props) => {
  return <Box {...props}>{props.children}</Box>;
};

export const ModalFooter = (props) => {
  return <Box {...props}>{props.children}</Box>;
};
