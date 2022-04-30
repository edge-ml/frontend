import React from 'react';

import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

export const DeleteConfirmationModalView = ({
  modelsToDelete,
  onDelete,
  onClosed,
  ...props
}) => {
  return (
    <Modal isOpen={modelsToDelete.length} size="l" {...props}>
      <ModalHeader>Delete Model</ModalHeader>
      <ModalBody>
        Are you sure to delete the following models?
        {modelsToDelete.map(id => {
          return (
            <React.Fragment key={id}>
              <br />
              <b>{id}</b>
            </React.Fragment>
          );
        })}
      </ModalBody>
      <ModalFooter>
        <Button
          id="deleteModelsButtonFinal"
          outline
          color="danger"
          onClick={e => {
            onDelete(modelsToDelete);
            onClosed();
          }}
        >
          Yes
        </Button>{' '}
        <Button outline color="secondary" onClick={onClosed}>
          No
        </Button>
      </ModalFooter>
    </Modal>
  );
};
