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
                  <kbd>Ctrl</kbd> / <kbd>⌘</kbd> + <kbd>[Key]</kbd>
                </td>
                <td>
                  Set active label type. The first 10 labels use the number
                  row (1–9, 0); labels 11+ use the next rows of keys
                  (Q–P, A–L, Z–M).
                </td>
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
              <tr>
                <td>
                  <kbd>Space</kbd>
                </td>
                <td>Play or pause audio and video</td>
              </tr>
              <tr>
                <td>
                  <kbd>←</kbd> / <kbd>→</kbd>
                </td>
                <td>
                  Move the playhead by 1 s (with <kbd>Shift</kbd> 5 s, with{" "}
                  <kbd>Alt</kbd> 0.1 s)
                </td>
              </tr>
              <tr>
                <td>
                  <kbd>Enter</kbd>
                </td>
                <td>Start or end a label at the playhead</td>
              </tr>
              <tr>
                <td>
                  <kbd>+</kbd> / <kbd>−</kbd>
                </td>
                <td>Zoom the timeline in or out (with recordings)</td>
              </tr>
              <tr>
                <td>
                  <kbd>Ctrl</kbd> / <kbd>⌘</kbd> + wheel
                </td>
                <td>
                  Zoom a chart around the pointer; <kbd>Shift</kbd> + wheel or
                  a sideways swipe moves along it
                </td>
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
        <div style={{ padding: "0.5rem 0" }}>
          <h6>Audio and video</h6>
          <p>
            Add recordings with the button at the top right (MP4 or WebM
            video; MP3, WAV, OGG, FLAC or M4A audio). They appear on the same
            timeline as the sensor data, so labels apply to both. Move the
            playhead with the grey strip at the bottom of a recording, or
            press <b>Label here</b> to set a label boundary while watching. If
            a recording is offset from the sensor data, use <b>Align</b> in
            its menu to slide it into place.
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
