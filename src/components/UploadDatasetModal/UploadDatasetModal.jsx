import React, { useState } from "react";
import {
  ActionIcon,
  Alert,
  Anchor,
  Box,
  Button,
  Group,
  Modal,
  Progress,
  Stack,
  Text,
} from "@mantine/core";
import DragDrop from "../Common/DragDrop";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faTrashAlt,
  faCog,
  faCheckCircle,
  faCheck,
  faBan,
} from "@fortawesome/free-solid-svg-icons";
import { faFile } from "@fortawesome/free-regular-svg-icons";

import { processCSVBackend } from "../../services/ApiServices/CSVServices";
import { DatasetConfigView } from "./DatasetConfigView";

import "./UploadDatasetModal.css";

import {
  getUploadProcessingProgress,
  updateDataset,
} from "../../services/ApiServices/DatasetServices";
import { useInterval } from "../../services/ReactHooksService";

export const UploadDatasetModal = ({
  isOpen,
  onCloseModal,
  onDatasetComplete,
}) => {
  const [files, setFiles] = useState([]);
  const [count, setCount] = useState(0); // used to create fileId for input files
  const [showWarning, setShowWarning] = useState(false);
  const [consecutiveNoUpdateCount, setConsecutiveNoUpdateCount] = useState(0);
  const MAXIMUM_POLLING_INTERVAL = 60 * 1000; // 60 seconds

  const FileStatus = Object.freeze({
    CONFIGURATION: "Configuration",
    UPLOADING: "Uploading",
    PROCESSING: "Processing",
    COMPLETE: "Complete",
    ERROR: "Error",
    CANCELLED: "Cancelled",
  });

  const addFiles = (inputFiles) => {
    const formatted = [...inputFiles].map((f, idx) => ({
      name: f.name,
      progress: 0,
      status: FileStatus.CONFIGURATION,
      id: count + idx,
      csv: inputFiles[idx],
      error: undefined,
      datasetId: undefined,
      processingStep: undefined,
      processedTimeseries: [undefined, undefined],
    }));
    setFiles([...files, ...formatted]);
    setCount(count + inputFiles.length);
    return formatted.map((f) => f.id);
  };

  const setController = (fileId, cancellationHandler) => {
    setFiles((prevState) =>
      prevState.map((file) => {
        if (file.id === fileId) {
          return {
            ...file,
            cancellationHandler: cancellationHandler,
          };
        }
        return file;
      })
    );
  };

  const handleProgress = (fileId, progress) => {
    setFiles((prevState) =>
      prevState.map((file) => {
        if (file.id === fileId) {
          return {
            ...file,
            progress,
          };
        }
        return file;
      })
    );
  };

  const handleStatus = (fileId, status) => {
    setFiles((prevState) =>
      prevState.map((file) => {
        if (file.id === fileId) {
          return {
            ...file,
            status: status,
            progress: status === FileStatus.ERROR ? 100 : file.progress,
          };
        }
        return file;
      })
    );
  };

  const handleCancel = (cancelledFile) => {
    cancelledFile.cancellationHandler();
  };

  const handleDelete = (fileId) => {
    setFiles((prevState) => prevState.filter((file) => file.id !== fileId));
  };

  const initConfig = (fileId, timeSeries, labelings) => {
    setFiles((prevState) =>
      prevState.map((file) => {
        if (file.id === fileId) {
          return {
            ...file,
            config: {
              timeSeries: timeSeries,
              labelings: labelings,
              name: file.name.endsWith(".csv")
                ? file.name.substring(0, file.name.length - 4)
                : file.name,
              editingModeActive: false,
            },
          };
        }
        return file;
      })
    );
  };

  const changeConfig = (fileId, newConfig) => {
    setFiles((prevState) =>
      prevState.map((file) => {
        if (file.id === fileId) {
          return {
            ...file,
            config: newConfig,
          };
        }
        return file;
      })
    );
  };

  const extractHeader = (fileId, file) => {
    return new Promise((resolve, reject) => {
      const CHUNK_SIZE = 128;
      const decoder = new TextDecoder();
      let offset = 0;
      let results = "";
      const fr = new FileReader();

      fr.onload = function () {
        results += decoder.decode(fr.result, { stream: true });
        const lines = results.split("\n");
        if (lines.length > 1) {
          resolve(lines[0]);
        }
        results = lines.pop();
        offset += CHUNK_SIZE;
        seek();
      };

      fr.onerror = function () {
        setFiles((prevFiles) =>
          prevFiles.map((f) =>
            f.id === fileId ? { ...f, error: fr.error } : f
          )
        );
        reject(fr.error);
      };

      seek();

      function seek() {
        if (offset >= file.size) {
          resolve(results);
          return;
        }
        const slice = file.slice(offset, offset + CHUNK_SIZE);
        fr.readAsArrayBuffer(slice);
      }
    });
  };

  const parseHeader = (header) => {
    const fields = header.split(",").map((f) => f.trim());
    const invalid = fields.find(
      (f) => !f.startsWith("sensor_") && !f.startsWith("label_") && f != "time"
    );
    if (invalid || fields.length < 2) {
      return [undefined, undefined];
    }
    const unitPattern = /\[([^\[\]]*)\]$/;
    const timeSeries = fields
      .filter((f) => f.startsWith("sensor_"))
      .map((f, idx) => {
        const match = f.match(unitPattern);
        const name = match ? f.slice(7, match.index) : f.slice(7);
        const unit = match ? match[1] : "";
        return {
          name: name,
          originalName: name,
          unit: unit,
          originalUnit: unit,
          removed: false,
          index: idx,
          scale: 1,
          offset: 0,
        };
      });
    const labelings = fields
      .filter((f) => f.startsWith("label_"))
      .map((f) => {
        const [, labeling, label] = f.split("_");
        return {
          name: label,
          labelingItBelongs: labeling,
        };
      })
      .reduce((acc, label, index) => {
        // reduce over labels
        const idx = acc.findIndex(
          (labeling) => labeling.name === label.labelingItBelongs
        );
        if (idx >= 0) {
          acc[idx].labels.push(label.name);
          acc[idx].indices.push(index);
        } else {
          acc.push({
            // push resulting labelings
            name: label.labelingItBelongs,
            originalName: label.labelingItBelongs,
            removed: false,
            labels: [label.name],
            indices: [index],
          });
        }
        return acc;
      }, [])
      .map((labeling, index) => ({ ...labeling, index: index }));
    return [timeSeries, labelings];
  };

  const onFileInput = async (inputFiles) => {
    const fileIds = addFiles(inputFiles);
    for (let i = 0; i < inputFiles.length; ++i) {
      const header = await extractHeader(fileIds[i], inputFiles[i]);
      const [timeSeries, labelings] = parseHeader(header);
      if (!timeSeries || !labelings) {
        setFiles((prevFiles) =>
          prevFiles.map((f) =>
            f.id === fileIds[i]
              ? {
                  ...f,
                  error: "Invalid format, parsing failed",
                  status: FileStatus.ERROR,
                  progress: 100,
                }
              : f
          )
        );
        continue;
      }
      initConfig(fileIds[i], timeSeries, labelings);
    }
  };

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append("CSVFile", file.csv);
    formData.append("CSVConfig", JSON.stringify(file.config));
    handleStatus(file.id, FileStatus.UPLOADING);
    setConsecutiveNoUpdateCount(0);
    const [cancellationHandler, response] = processCSVBackend(
      formData,
      file.id,
      handleProgress
    );
    setController(file.id, cancellationHandler);
    try {
      const result = await response;
      setFiles((prevFiles) =>
        prevFiles.map((f) =>
          f.id === file.id
            ? {
                ...f,
                datasetId: result.data.datasetId,
                status: FileStatus.PROCESSING,
                processingStep: "Started processing",
              }
            : f
        )
      );
      onDatasetComplete();
    } catch (err) {
      const message = err?.response?.data?.detail || err.message;
      setFiles((prevFiles) =>
        prevFiles.map((f) => (f.id === file.id ? { ...f, error: message } : f))
      );
      handleStatus(file.id, FileStatus.ERROR);
      return false;
    }
    return true;
  };

  useInterval(
    async () => {
      let pollResultedInUpdate = false;
      let allComplete = true;
      for (const file of files) {
        // if the file is uploading, skip polling but not count it as complete
        allComplete = allComplete && file.status !== FileStatus.UPLOADING;
        // processing not started yet / already done, skip
        if (
          file.datasetId === undefined ||
          file.status === FileStatus.COMPLETE
        ) {
          continue;
        }
        const [
          step,
          progress,
          currentTimeseries = undefined,
          totalTimeseries = undefined,
        ] = await getUploadProcessingProgress(file.datasetId);
        if (
          step !== file.processingStep ||
          file.processedTimeseries[0] !== currentTimeseries
        ) {
          pollResultedInUpdate = true;
          if (progress === 100) {
            handleStatus(file.id, FileStatus.COMPLETE);
          }
          setFiles((prevFiles) =>
            prevFiles.map((f) =>
              f.id === file.id
                ? {
                    ...f,
                    processingStep: step,
                    processedTimeseries: [currentTimeseries, totalTimeseries],
                  }
                : f
            )
          );
          allComplete = allComplete && progress === 100;
        }
      }
      if (allComplete) {
        setConsecutiveNoUpdateCount(null); // stop polling
        if (files.length > 0) {
          handleModalClose();
        }
      } else if (!pollResultedInUpdate) {
        setConsecutiveNoUpdateCount((prevCount) => prevCount + 1);
      } else {
        setConsecutiveNoUpdateCount(0);
      }
    },
    consecutiveNoUpdateCount === null
      ? null
      : Math.min(
          MAXIMUM_POLLING_INTERVAL,
          1.5 ** consecutiveNoUpdateCount * 1000 + Math.random() * 100
        )
  );

  const handleUploadAll = async () => {
    setFiles((prevFiles) =>
      prevFiles.map((f) => ({
        ...f,
        config: { ...f.config, editingModeActive: false },
      }))
    );
    await Promise.all(
      files
        .filter((elm) => elm.status === FileStatus.CONFIGURATION)
        .map((elm) => handleUpload(elm))
    );
  };

  const handleModalClose = () => {
    const anyOngoing = files.find((f) => f.status === FileStatus.UPLOADING);
    if (anyOngoing) {
      setShowWarning(true);
    } else {
      handleConfirmClose();
    }
  };

  const handleConfirmClose = () => {
    const anyComplete = files.find((f) => f.status === FileStatus.COMPLETE);
    for (const file of files) {
      if (file.status === FileStatus.UPLOADING) {
        handleCancel(file);
      }
    }
    setCount(0);
    setFiles([]);
    if (anyComplete) {
      onCloseModal(true);
    } else {
      onCloseModal(false);
    }
    setShowWarning(false);
  };

  const handleCancelClose = () => {
    setShowWarning(false);
  };

  const getStatusText = (file) => {
    if (file.status === FileStatus.ERROR) {
      return `Error: ${file.error}`;
    }
    if (file.status === FileStatus.PROCESSING) {
      return `${file.status} ${
        file.processedTimeseries[0]
          ? `: ${file.processingStep} - Timeseries Processed: ${file.processedTimeseries[0]}/${file.processedTimeseries[1]} `
          : `: ${file.processingStep} `
      }${file.progress.toFixed(2)}%`;
    }
    return `${file.status} ${file.progress.toFixed(2)}%`;
  };

  return (
    <Modal
      className="modal-xl"
      data-testid="modal"
      opened={isOpen}
      onClose={handleModalClose}
      size="xl"
      title="Create new dataset"
      closeOnClickOutside={!showWarning}
      closeOnEscape={!showWarning}
    >
      <Stack gap="md">
        {showWarning ? (
          <Alert color="red" title="Warning">
            <Group justify="space-between" align="center">
              <Text size="sm">
                Ongoing uploads will be cancelled if you close the menu! Are you
                sure?
              </Text>
              <Group gap="xs">
                <Button color="gray" variant="light" onClick={handleCancelClose}>
                  <FontAwesomeIcon icon={faBan} />
                </Button>
                <Button color="red" onClick={handleConfirmClose}>
                  <FontAwesomeIcon icon={faCheck} />
                </Button>
              </Group>
            </Group>
          </Alert>
        ) : null}
        <DragDrop
          onClick={() => {}}
          style={{ height: "100px" }}
          className="my-2"
          onFileInput={onFileInput}
        />
        {files ? (
          <Stack gap="md" mt="xs">
            {files.map((f) =>
              !f.config || !f.config.editingModeActive ? (
                <Group key={f.id} align="center" wrap="nowrap" gap="md">
                  <Stack align="center" gap={4} style={{ width: 120 }}>
                    <FontAwesomeIcon icon={faFile} size="2x" />
                    <Text size="xs" ta="center">
                      {f.name}
                    </Text>
                  </Stack>
                  <Stack gap={4} style={{ flex: 1 }}>
                    <Progress
                      id={`progress-bar-${f.id}`}
                      value={f.progress}
                      color={
                        f.status === FileStatus.COMPLETE
                          ? "green"
                          : f.status === FileStatus.ERROR ||
                              f.status === FileStatus.CANCELLED
                            ? "red"
                            : "blue"
                      }
                    />
                    <Text size="xs">{getStatusText(f)}</Text>
                  </Stack>
                  <Group gap="xs" wrap="nowrap">
                    {f.status === FileStatus.COMPLETE && (
                      <ActionIcon
                        size="lg"
                        className="modal-icon-button"
                        variant="subtle"
                        color="green"
                        onClick={() => handleDelete(f.id)}
                        title="Removes item from list"
                      >
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          style={{ fontSize: "1.1em" }}
                        />
                      </ActionIcon>
                    )}
                    {f.status === FileStatus.CONFIGURATION && (
                      <Group gap="xs" wrap="nowrap">
                        <ActionIcon
                          variant="subtle"
                          color="blue"
                          onClick={() =>
                            changeConfig(f.id, {
                              ...f.config,
                              editingModeActive: true,
                            })
                          }
                          title="Opens configuration menu"
                        >
                          <FontAwesomeIcon icon={faCog} />
                        </ActionIcon>
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          size="lg"
                          onClick={() => handleDelete(f.id)}
                          title="Removes item from list"
                        >
                          <FontAwesomeIcon icon={faTrashAlt} />
                        </ActionIcon>
                      </Group>
                    )}
                    {f.status === FileStatus.UPLOADING && (
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        title="Cancels ongoing upload"
                        onClick={() => handleCancel(f)}
                      >
                        <FontAwesomeIcon icon={faBan} />
                      </ActionIcon>
                    )}
                    {(f.status === FileStatus.CANCELLED ||
                      f.status === FileStatus.ERROR) && (
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        title="Removes item from list"
                        onClick={() => handleDelete(f.id)}
                      >
                        <FontAwesomeIcon icon={faTrashAlt} />
                      </ActionIcon>
                    )}
                    {f.status === FileStatus.PROCESSING && (
                      <Box>
                        <FontAwesomeIcon
                          spin
                          size="lg"
                          className="me-2"
                          icon={faSpinner}
                        />
                      </Box>
                    )}
                  </Group>
                </Group>
              ) : (
                <DatasetConfigView
                  key={f.id}
                  fileId={f.id}
                  fileConfig={f.config}
                  changeConfig={changeConfig}
                  backendId={f.backendId}
                />
              )
            )}
          </Stack>
        ) : null}
        <Group justify="space-between" align="center">
          <Text size="sm">
            <Anchor href="/example_file.csv" download="example_file.csv">
              Click here
            </Anchor>{" "}
            to download an example CSV file.
          </Text>
          <Button
            color="blue"
            variant="outline"
            disabled={!files.find((f) => f.status === FileStatus.CONFIGURATION)}
            onClick={handleUploadAll}
          >
            Upload All
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
