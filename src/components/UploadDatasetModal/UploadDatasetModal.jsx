import React from "react";
import {
  Alert,
  Button,
  Group,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "../Common/Modal";
import DragDrop from "../Common/DragDrop";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faBan } from "@fortawesome/free-solid-svg-icons";

import { useFileUploads, FileStatus } from "./useFileUploads";
import { FileListItem } from "./FileListItem";
import { ACCEPTED_MEDIA } from "../../routes/dataset/media/mediaUtils";

import "./UploadDatasetModal.css";

const ACCEPT = `.csv,text/csv,${ACCEPTED_MEDIA}`;

// The one dialog for adding data: sensor data as edge-ml CSV files, and audio
// and video recordings. Without `targetDataset` it creates datasets (one for
// all files, or one per file); with it, it adds the files to that dataset.
export const UploadDatasetModal = ({
  isOpen,
  onCloseModal,
  onDatasetComplete,
  targetDataset,
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
    together,
    setTogether,
    datasetName,
    setDatasetName,
    running,
    canUpload,
  } = useFileUploads(onDatasetComplete, onCloseModal, targetDataset);

  const pending = files.filter((f) => f.status === FileStatus.CONFIGURATION);
  const csvs = pending.filter((f) => f.kind === "csv").length;
  const recordings = pending.length - csvs;

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
          <span className="upload-modal-header-text">
            {targetDataset ? `Add data to "${targetDataset.name}"` : "Upload data"}
          </span>
          <Text size="sm" c="dimmed">
            Sensor data as edge-ml CSV files, video (MP4, WebM) and audio (MP3,
            WAV, OGG, FLAC, M4A)
          </Text>
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
          <DragDrop onFileInput={onFileInput} accept={ACCEPT} />
          {!targetDataset && pending.length > 1 ? (
            <Stack gap="xs" mt="md" className="upload-grouping">
              <Group gap="md" wrap="wrap" align="center">
                <Text size="sm" fw={600}>
                  Datasets
                </Text>
                <SegmentedControl
                  size="xs"
                  value={together ? "one" : "each"}
                  onChange={(value) => setTogether(value === "one")}
                  data={[
                    { value: "one", label: "All files in one dataset" },
                    { value: "each", label: "One dataset per file" },
                  ]}
                />
                {together ? (
                  <TextInput
                    size="xs"
                    w={260}
                    aria-label="Name of the dataset"
                    placeholder="Name of the dataset"
                    value={datasetName}
                    onChange={(event) => setDatasetName(event.currentTarget.value)}
                  />
                ) : null}
              </Group>
              <Text size="xs" c="dimmed">
                {together
                  ? csvs > 0 && recordings > 0
                    ? "The recordings are placed next to the sensor data, at the time stored in each file."
                    : csvs > 1
                      ? "The time-series of all files go into one dataset."
                      : "The recordings share one timeline, each at the time stored in its file."
                  : "Each file becomes a dataset of its own."}
              </Text>
            </Stack>
          ) : null}
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
            loading={running}
            disabled={!canUpload}
            onClick={handleUploadAll}
          >
            {targetDataset
              ? "Add to dataset"
              : together && pending.length > 1
                ? "Upload as one dataset"
                : "Upload"}
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
};
