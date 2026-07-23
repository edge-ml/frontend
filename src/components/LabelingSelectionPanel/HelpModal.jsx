import React from "react";
import { Button } from "@mantine/core";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "../Common/Modal";

const HelpModal = ({ isOpen, onCloseModal }) => {
  return (
    <Modal isOpen={isOpen} onClose={onCloseModal}>
      <ModalHeader>{"Help"}</ModalHeader>
      <ModalBody>
        <div style={{ padding: "0.5rem 0" }}>
          <h6>Shortcuts</h6>
          <table>
            <tbody>
              <tr>
                <td>
                  <kbd>Ctrl</kbd> + <kbd>[Number]</kbd>
                </td>
                <td>Set active label type</td>
              </tr>
              <tr>
                <td>
                  <kbd>Backspace</kbd> / <kbd>Delete</kbd>
                </td>
                <td>Delete current label</td>
              </tr>
              <tr>
                <td>
                  <kbd>Escape</kbd>
                </td>
                <td>Cancel the current label or selection</td>
              </tr>
            </tbody>
          </table>
        </div>
        <hr />
        <div style={{ padding: "0.5rem 0" }}>
          <h6>Create a label</h6>
          <p>
            Select a label type, click once on a chart to set the start, then
            click again to set the end. Select an existing label to drag either
            boundary.
          </p>
        </div>
        <hr />
        <h6>Upload CSV</h6>
        <a href="/example_file.csv" download="example_file.csv">
          Click here
        </a>{" "}
        to download an example CSV file.
      </ModalBody>
      <ModalFooter>
        <Button
          variant="outline"
          color="gray"
          style={{ margin: "0.25rem" }}
          onClick={onCloseModal}
        >
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default HelpModal;
