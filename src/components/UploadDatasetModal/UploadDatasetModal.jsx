import React from "react";
import { Button, Alert } from "@mantine/core";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "../Common/Modal";
import DragDrop from "../Common/DragDrop";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faBan } from "@fortawesome/free-solid-svg-icons";

import { useFileUploads, FileStatus } from "./useFileUploads";
import { FileListItem } from "./FileListItem";

import "./UploadDatasetModal.css";

export const UploadDatasetModal = ({
  isOpen,
  onCloseModal,
  onDatasetComplete,
}) => {
  const {
    files,
    showWarning,
    onFileInput,
    handleUploadAll,
    handleModalClose,
    handleDelete,
    handleCancel,
    handleConfirmClose,
    handleCancelClose,
    changeConfig,
  } = useFileUploads(onDatasetComplete, onCloseModal);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      size="min(1100px, calc(100vw - 2rem))"
      centered
      styles={{
        body: { overflow: "visible" },
      }}
    >
      <ModalHeader>
        <div className="upload-modal-header" style={{ width: "100%" }}>
          <span className="upload-modal-header-text">Create new dataset</span>
        </div>
      </ModalHeader>
      <ModalBody>
        <div className="upload-modal-body">
          {showWarning && (
            <Alert color="red" mb="md">
              <div className="warning-alert-content">
                <span>
                  Ongoing uploads will be cancelled if you close the menu! Are
                  you sure?
                </span>
                <div className="warning-alert-actions">
                  <Button color="green" onClick={handleCancelClose}>
                    <FontAwesomeIcon icon={faBan} />
                  </Button>
                  <Button color="red" onClick={handleConfirmClose}>
                    <FontAwesomeIcon icon={faCheck} />
                  </Button>
                </div>
              </div>
            </Alert>
          )}
          <DragDrop onFileInput={onFileInput} />
          {files.length > 0 && (
            <div style={{ marginTop: "1rem" }}>
              {files.map((f) => (
                <FileListItem
                  key={f.id}
                  file={f}
                  onDelete={handleDelete}
                  onCancel={handleCancel}
                  changeConfig={changeConfig}
                  FileStatus={FileStatus}
                />
              ))}
            </div>
          )}
        </div>
      </ModalBody>
      <ModalFooter>
        <div className="upload-modal-footer" style={{ width: "100%" }}>
          <div>
            <a href="/example_file.csv" download="example_file.csv">
              Click here
            </a>{" "}
            to download an example CSV file.
          </div>
          <Button
            variant="filled"
            color="green"
            disabled={!files.some((f) => f.status === FileStatus.CONFIGURATION)}
            onClick={handleUploadAll}
          >
            Upload All
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
};
