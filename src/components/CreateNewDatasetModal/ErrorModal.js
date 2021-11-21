import React, { useState } from 'react';
import {
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  FormFeedback,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button
} from 'reactstrap';

function ErrorModal(props) {
  const errors = props.errors
    .map((elm, index) => {
      return { errors: elm, fileName: props.files[index].name };
    })
    .filter(elm => elm.errors.length !== 0);

  const renderFileError = elm => {
    return (
      <div
        key={elm.fileName}
        style={{
          marginBottom: '4px',
          paddingBottom: '12px',
          borderBottom: '1px solid gray'
        }}
      >
        <div style={{ fontSize: 'larger', fontWeight: 'bold' }}>
          {elm.fileName}
        </div>
        {elm.errors.map((error, index) => (
          <div key={elm.fileName + index} style={{ marginLeft: '8px' }}>
            {index + ': ' + error.error}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <Modal isOpen={props.isOpen}>
        <ModalHeader>Errors</ModalHeader>
        <ModalBody>
          <div>{errors.map(elm => renderFileError(elm))}</div>
          <div className="mt-2">
            {' '}
            <a href="/example_file.csv" download="example_file.csv">
              Click here
            </a>{' '}
            to download an example CSV file.
          </div>
        </ModalBody>
        <ModalFooter>
          <Button onClick={props.onClose}>OK</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default ErrorModal;
